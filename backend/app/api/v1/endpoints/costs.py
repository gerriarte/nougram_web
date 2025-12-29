"""
Cost management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import get_tenant_context, TenantContext
from app.core.calculations import calculate_blended_cost_rate
from app.core.exceptions import ResourceNotFoundError, BusinessLogicError
from app.core.permissions import can_create, can_edit, can_delete, PermissionError, PERM_VIEW_SENSITIVE_DATA, PERM_MODIFY_COSTS, PERM_DELETE_RESOURCES
from app.core.permission_middleware import require_view_sensitive_data, require_modify_costs, require_delete_resources
from app.models.user import User
from app.models.cost import CostFixed
from app.models.role import DeleteRequest, DeleteRequestStatus
from app.repositories.factory import RepositoryFactory
from app.schemas.cost import (
    CostFixedCreate,
    CostFixedUpdate,
    CostFixedResponse,
    CostFixedListResponse,
)
from app.schemas.quote import BlendedCostRateResponse

router = APIRouter()


@router.get("/costs/fixed", response_model=CostFixedListResponse)
async def list_fixed_costs(
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_view_sensitive_data),  # Require permission to view sensitive data (costs)
    db: AsyncSession = Depends(get_db),
    include_deleted: bool = False,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)")
):
    """
    List all fixed costs with pagination
    By default, excludes soft-deleted items (deleted_at IS NULL)
    
    **Permissions:**
    - Requires `can_view_sensitive_data` permission (costs are sensitive data)
    - Allowed roles: owner, admin_financiero, super_admin
    - Denied roles: product_manager, collaborator (data leakage prevention)
    """
    from app.core.logging import get_logger
    logger = get_logger(__name__)
    
    cost_repo = RepositoryFactory.create_cost_repository(db, tenant.organization_id)
    
    # Get total count
    total = await cost_repo.count(include_deleted=include_deleted)
    
    # Get paginated results
    offset = (page - 1) * page_size
    costs = await cost_repo.get_all(
        include_deleted=include_deleted,
        order_by=CostFixed.created_at.desc(),
        limit=page_size,
        offset=offset
    )
    
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    
    logger.info(
        f"User {current_user.email} listed fixed costs (page {page}, size {page_size})",
        extra={"user_id": current_user.id, "page": page, "page_size": page_size, "total": total}
    )
    
    return CostFixedListResponse(
        items=[CostFixedResponse.model_validate(cost) for cost in costs],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/costs/fixed", response_model=CostFixedResponse, status_code=status.HTTP_201_CREATED)
async def create_fixed_cost(
    cost_data: CostFixedCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_modify_costs),  # Require permission to modify costs
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new fixed cost
    
    **Permissions:**
    - Requires `can_modify_costs` permission
    - Allowed roles: owner, admin_financiero, super_admin
    - Denied roles: product_manager, collaborator
    """
    try:
        # Ensure all required fields have values
        cost_dict = cost_data.model_dump()
        
        # Set defaults for optional fields
        if not cost_dict.get('currency'):
            cost_dict['currency'] = 'USD'
        
        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.info("Creating fixed cost", cost_data=cost_dict, user_id=current_user.id)
        
        cost_dict['organization_id'] = tenant.organization_id
        
        new_cost = CostFixed(**cost_dict)
        cost_repo = RepositoryFactory.create_cost_repository(db, tenant.organization_id)
        new_cost = await cost_repo.create(new_cost)
        
        # Invalidate blended cost rate cache
        from app.core.cache import get_cache
        cache = get_cache()
        cache.invalidate_pattern("blended_cost_rate:")
        
        logger.info("Fixed cost created successfully", cost_id=new_cost.id, user_id=current_user.id)
        return CostFixedResponse.model_validate(new_cost)
    except Exception as e:
        await db.rollback()
        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.error(
            "Error creating fixed cost",
            error=str(e),
            user_id=current_user.id,
            cost_data=cost_data.model_dump() if hasattr(cost_data, 'model_dump') else str(cost_data),
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create fixed cost: {str(e)}"
        )


@router.put("/costs/fixed/{cost_id}", response_model=CostFixedResponse)
async def update_fixed_cost(
    cost_id: int,
    cost_data: CostFixedUpdate,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_modify_costs),  # Require permission to modify costs
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing fixed cost
    Cannot update soft-deleted costs
    
    **Permissions:**
    - Requires `can_modify_costs` permission
    - Allowed roles: owner, admin_financiero, super_admin
    - Denied roles: product_manager, collaborator
    """
    try:
        cost_repo = RepositoryFactory.create_cost_repository(db, tenant.organization_id)
        cost = await cost_repo.get_by_id(cost_id, include_deleted=False)
        
        if not cost:
            raise ResourceNotFoundError("Fixed cost", cost_id)
        
        update_data = cost_data.model_dump(exclude_unset=True)
        
        # Ensure currency has a value if provided
        if 'currency' in update_data and not update_data['currency']:
            update_data['currency'] = 'USD'
        
        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.info("Updating fixed cost", cost_id=cost_id, update_data=update_data, user_id=current_user.id)
        
        for field, value in update_data.items():
            setattr(cost, field, value)
        
        cost = await cost_repo.update(cost)
        
        # Invalidate blended cost rate cache
        from app.core.cache import get_cache
        cache = get_cache()
        cache.invalidate_pattern("blended_cost_rate:")
        
        logger.info("Fixed cost updated successfully", cost_id=cost_id, user_id=current_user.id)
        return CostFixedResponse.model_validate(cost)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.error(
            "Error updating fixed cost",
            cost_id=cost_id,
            error=str(e),
            user_id=current_user.id,
            update_data=cost_data.model_dump(exclude_unset=True) if hasattr(cost_data, 'model_dump') else str(cost_data),
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update fixed cost: {str(e)}"
        )


@router.delete("/costs/fixed/{cost_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fixed_cost(
    cost_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),  # Permission check inside due to complex logic
    db: AsyncSession = Depends(get_db)
):
    """
    Soft delete a fixed cost (move to trash)
    Fixed costs are used in calculations, so deletion will affect the blended cost rate.
    
    **Permissions:**
    - Requires `can_delete_resources` permission
    - Allowed roles: owner, super_admin (can delete immediately)
    - Admin Financiero: Not allowed (only owner can delete)
    - Denied roles: product_manager, collaborator
    """
    # Check permissions - use require_delete_resources dependency logic
    from app.core.permissions import check_permission, PERM_DELETE_RESOURCES
    try:
        check_permission(current_user, PERM_DELETE_RESOURCES)
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete costs"
        )
    
    # Check if deletion requires approval (currently only owner and super_admin can delete)
    # For now, all users with PERM_DELETE_RESOURCES can delete immediately
    requires_approval = False
    
    # Verify if the cost exists and is not already deleted
    cost_repo = RepositoryFactory.create_cost_repository(db, tenant.organization_id)
    cost = await cost_repo.get_by_id(cost_id, include_deleted=False)
    
    if not cost:
        raise ResourceNotFoundError("Fixed cost", cost_id)
    
    if requires_approval:
        # Create delete request instead of deleting immediately
        delete_request = DeleteRequest(
            resource_type="cost",
            resource_id=cost_id,
            requested_by_id=current_user.id,
            status="pending"  # Use string instead of enum
        )
        db.add(delete_request)
        await db.commit()
        await db.refresh(delete_request)
        
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail={
                "message": "Delete request created and pending approval",
                "request_id": delete_request.id
            }
        )
    
    # Super Admin can delete immediately
    cost.deleted_at = datetime.utcnow()
    cost.deleted_by_id = current_user.id
    await cost_repo.update(cost)
    
    # Invalidate blended cost rate cache
    from app.core.cache import get_cache
    cache = get_cache()
    cache.invalidate_pattern("blended_cost_rate:")
    
    return None


@router.post("/costs/fixed/{cost_id}/restore", response_model=CostFixedResponse)
async def restore_fixed_cost(
    cost_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Restore a soft-deleted fixed cost from trash
    """
    cost_repo = RepositoryFactory.create_cost_repository(db, tenant.organization_id)
    cost = await cost_repo.get_by_id(cost_id, include_deleted=True)
    
    if not cost or cost.deleted_at is None:
        raise ResourceNotFoundError("Fixed cost", cost_id)
    
    # Restore: clear deleted fields
    cost.deleted_at = None
    cost.deleted_by_id = None
    cost = await cost_repo.update(cost)
    
    # Invalidate blended cost rate cache
    from app.core.cache import get_cache
    cache = get_cache()
    cache.invalidate_pattern("blended_cost_rate:")
    
    return CostFixedResponse.model_validate(cost)


@router.get("/costs/fixed/trash/list", response_model=CostFixedListResponse)
async def list_deleted_fixed_costs(
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all soft-deleted fixed costs (trash)
    """
    from sqlalchemy.orm import selectinload
    
    query = select(CostFixed).where(
        CostFixed.deleted_at.isnot(None)
    ).options(selectinload(CostFixed.deleted_by)).order_by(CostFixed.deleted_at.desc())
    
    result = await db.execute(query)
    costs = result.scalars().all()
    
    # Build response with user info
    items = []
    for cost in costs:
        cost_dict = {
            "id": cost.id,
            "name": cost.name,
            "amount_monthly": cost.amount_monthly,
            "currency": cost.currency,
            "category": cost.category,
            "description": cost.description,
            "created_at": cost.created_at,
            "updated_at": cost.updated_at,
            "deleted_at": cost.deleted_at,
            "deleted_by_id": cost.deleted_by_id,
            "deleted_by_name": cost.deleted_by.name if cost.deleted_by else None,
            "deleted_by_email": cost.deleted_by.email if cost.deleted_by else None,
        }
        items.append(CostFixedResponse.model_validate(cost_dict))
    
    return CostFixedListResponse(
        items=items,
        total=len(costs)
    )


@router.delete("/costs/fixed/{cost_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanently_delete_fixed_cost(
    cost_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete a soft-deleted fixed cost (hard delete)
    This action cannot be undone. Only soft-deleted costs can be permanently deleted.
    """
    # Verify if the cost exists and is soft-deleted
    result = await db.execute(
        select(CostFixed).where(
            CostFixed.id == cost_id,
            CostFixed.deleted_at.isnot(None)
        )
    )
    cost = result.scalar_one_or_none()
    
    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fixed cost with id {cost_id} not found in trash. Only soft-deleted costs can be permanently deleted."
        )
    
    # Hard delete: permanently remove from database
    await db.delete(cost)
    await db.commit()
    
    return None


@router.get("/calculations/agency-cost-hour", response_model=BlendedCostRateResponse)
async def calculate_agency_cost_hour(
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate blended cost rate (agency cost per hour)
    This is the core calculation for Module 1
    All costs are normalized to the primary currency before calculation
    """
    from app.models.cost import CostFixed
    from app.models.team import TeamMember
    from app.models.settings import AgencySettings
    from app.core.currency import normalize_to_primary_currency
    
    try:
        # Get primary currency from settings (default to USD if not found)
        try:
            result = await db.execute(select(AgencySettings).where(AgencySettings.id == 1))
            settings = result.scalar_one_or_none()
            primary_currency = settings.primary_currency if settings else "USD"
        except Exception:
            # If table doesn't exist or query fails, use default
            primary_currency = "USD"
        
        # Calculate blended cost rate (normalized to primary currency)
        blended_rate = await calculate_blended_cost_rate(db, primary_currency)
        
        # Get additional details for response (normalized to primary currency)
        # Exclude soft-deleted costs from calculations
        cost_repo = RepositoryFactory.create_cost_repository(db, tenant.organization_id)
        fixed_costs = await cost_repo.get_all_active(include_deleted=False)
        total_fixed_costs = 0.0
        for cost in fixed_costs:
            normalized = normalize_to_primary_currency(
                cost.amount_monthly,
                cost.currency or "USD",
                primary_currency
            )
            total_fixed_costs += normalized
        
        from app.repositories.team_repository import TeamRepository
        team_repo = TeamRepository(db)
        team_members = await team_repo.get_all_active()
        total_salaries = 0.0
        for member in team_members:
            normalized = normalize_to_primary_currency(
                member.salary_monthly_brute,
                member.currency or "USD",
                primary_currency
            )
            total_salaries += normalized
        
        total_hours = sum(member.billable_hours_per_week * 4.33 for member in team_members)
        
        # Collect currency information
        from app.core.currency import EXCHANGE_RATES_TO_USD, CURRENCY_INFO
        from collections import defaultdict
        from datetime import datetime
        
        currency_counts = defaultdict(lambda: {"count": 0, "total_amount": 0.0})
        
        # Count currencies in fixed costs
        for cost in fixed_costs:
            cost_currency = cost.currency or "USD"
            currency_counts[cost_currency]["count"] += 1
            currency_counts[cost_currency]["total_amount"] += cost.amount_monthly
        
        # Count currencies in team member salaries
        for member in team_members:
            member_currency = member.currency or "USD"
            currency_counts[member_currency]["count"] += 1
            currency_counts[member_currency]["total_amount"] += member.salary_monthly_brute
        
        # Build currency info list
        currencies_used = []
        primary_rate = EXCHANGE_RATES_TO_USD.get(primary_currency, 1.0)
        
        for currency_code, info in currency_counts.items():
            if currency_code in EXCHANGE_RATES_TO_USD:
                currency_rate = EXCHANGE_RATES_TO_USD[currency_code]
                
                # Calculate exchange rate to primary currency
                # EXCHANGE_RATES_TO_USD stores: 1 USD = X currency
                # So: 1 currency = 1/currency_rate USD
                # Then: 1 currency = (1/currency_rate) * primary_rate primary_currency
                if currency_code == primary_currency:
                    exchange_rate_to_primary = 1.0
                else:
                    # Convert: currency -> USD -> primary
                    # currency_rate is: 1 USD = X currency (e.g., 1 USD = 4000 COP)
                    # So: 1 currency = 1/currency_rate USD
                    # Then: 1 currency = (1/currency_rate) * primary_rate primary_currency
                    exchange_rate_to_primary = primary_rate / currency_rate
                
                currencies_used.append({
                    "code": currency_code,
                    "count": info["count"],
                    "exchange_rate_to_primary": round(exchange_rate_to_primary, 6),
                    "total_amount": round(info["total_amount"], 2)
                })
        
        # Sort by count (most used first)
        currencies_used.sort(key=lambda x: x["count"], reverse=True)
        
        return BlendedCostRateResponse(
            blended_cost_rate=round(blended_rate, 2),
            total_monthly_costs=round(total_fixed_costs + total_salaries, 2),
            total_monthly_hours=round(total_hours, 2),
            active_team_members=len(team_members),
            primary_currency=primary_currency,
            currencies_used=currencies_used,
            exchange_rates_date=datetime.now().isoformat()
        )
    except Exception as e:
        # Log error and return default values
        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.error("Error calculating blended cost rate", error=str(e), user_id=current_user.id, exc_info=True)
        return BlendedCostRateResponse(
            blended_cost_rate=0.0,
            total_monthly_costs=0.0,
            total_monthly_hours=0.0,
            active_team_members=0,
            primary_currency="USD",
            currencies_used=[],
            exchange_rates_date=datetime.now().isoformat()
        )
