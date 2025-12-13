"""
Project management endpoints
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from io import BytesIO
from datetime import datetime

logger = logging.getLogger(__name__)

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import get_tenant_context, TenantContext
from app.core.calculations import calculate_blended_cost_rate, calculate_quote_totals
from app.core.pdf_generator import generate_quote_pdf
from app.core.exceptions import ResourceNotFoundError
from app.core.permissions import can_create, can_edit, can_delete, PermissionError
from app.models.role import DeleteRequest, DeleteRequestStatus
from app.models.project import Project, Quote, QuoteItem, project_taxes
from app.models.service import Service
from app.models.tax import Tax
from app.models.user import User
from sqlalchemy import insert, delete as sql_delete
from app.schemas.project import (
    ProjectCreate,
    ProjectCreateWithQuote,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    QuoteResponse,
    QuoteResponseWithItems,
    QuoteItemResponse,
    QuoteItemCreate,
    QuoteUpdate,
    QuoteCreateNewVersion,
)
from app.schemas.quote import QuoteEmailRequest, QuoteEmailResponse

router = APIRouter()


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status_filter: str = None,
    include_deleted: bool = False,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)")
):
    """
    List all projects with pagination
    Optionally filter by status (Draft, Sent, Won, Lost)
    By default, excludes soft-deleted items (deleted_at IS NULL)
    """
    from fastapi import Query as FastAPIQuery
    
    # Build base query with eager loading and tenant filter
    query = select(Project).options(selectinload(Project.taxes)).where(
        Project.organization_id == tenant.organization_id
    ).order_by(Project.created_at.desc())
    
    # Filter out soft-deleted items by default
    if not include_deleted:
        query = query.where(Project.deleted_at.is_(None))
    
    if status_filter:
        query = query.where(Project.status == status_filter)
    
    # Get total count
    count_query = select(func.count(Project.id)).where(Project.organization_id == tenant.organization_id)
    if not include_deleted:
        count_query = count_query.where(Project.deleted_at.is_(None))
    if status_filter:
        count_query = count_query.where(Project.status == status_filter)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.limit(page_size).offset(offset)
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    # Build response with taxes
    items = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "name": project.name,
            "client_name": project.client_name,
            "client_email": project.client_email,
            "status": project.status,
            "currency": project.currency,
            "tax_ids": [tax.id for tax in project.taxes],
            "taxes": [{"id": tax.id, "name": tax.name, "code": tax.code, "percentage": tax.percentage} for tax in project.taxes],
            "created_at": project.created_at,
            "updated_at": project.updated_at,
        }
        items.append(ProjectResponse.model_validate(project_dict))
    
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    
    return ProjectListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/", response_model=QuoteResponseWithItems, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreateWithQuote,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new project with initial quote
    
    Permissions:
    - Super Admin: Allowed
    - Admin Financiero: Allowed
    - Product Manager: Not allowed (can only work with quotes within existing projects)
    """
    if not can_create(current_user, "project"):
        raise PermissionError("You don't have permission to create projects")
    try:
        logger.info(f"Creating project with data: name={project_data.name}, client={project_data.client_name}")
        
        # Validate all services exist, are active, and not deleted
        service_ids = [item.service_id for item in project_data.quote_items]
        logger.info(f"Service IDs to validate: {service_ids}")
        
        if not service_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one quote item is required"
            )
        
        result = await db.execute(
            select(Service).where(
                Service.id.in_(service_ids),
                Service.is_active == True,
                Service.deleted_at.is_(None),
                Service.organization_id == tenant.organization_id
            )
        )
        services = {service.id: service for service in result.scalars().all()}
        logger.info(f"Found {len(services)} valid services out of {len(service_ids)} requested")
        
        if len(services) != len(service_ids):
            missing = set(service_ids) - set(services.keys())
            logger.warning(f"Missing services: {list(missing)}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Services with ids {list(missing)} not found, inactive, or deleted"
            )
        
        # Calculate blended cost rate
        logger.info("Calculating blended cost rate...")
        blended_rate = await calculate_blended_cost_rate(db, tenant_id=tenant.organization_id)
        logger.info(f"Blended cost rate: {blended_rate}")
        
        # Calculate quote totals (with taxes if provided)
        items_dict = [
            {"service_id": item.service_id, "estimated_hours": item.estimated_hours}
            for item in project_data.quote_items
        ]
        tax_ids = project_data.tax_ids or []
        logger.info(f"Calculating quote totals with {len(tax_ids)} taxes...")
        totals = await calculate_quote_totals(db, items_dict, blended_rate, tax_ids)
        logger.info(f"Quote totals calculated: {totals}")
        
        # Create project
        logger.info("Creating project...")
        project = Project(
            name=project_data.name,
            client_name=project_data.client_name,
            client_email=project_data.client_email,
            currency=project_data.currency,
            status="Draft",
            organization_id=tenant.organization_id
        )
        db.add(project)
        await db.flush()  # Get project ID
        logger.info(f"Project created with ID: {project.id}")
        
        # Associate taxes if provided (exclude deleted taxes)
        if tax_ids:
            logger.info(f"Associating {len(tax_ids)} taxes...")
            result = await db.execute(
                select(Tax).where(
                    Tax.id.in_(tax_ids),
                    Tax.is_active == True,
                    Tax.deleted_at.is_(None)
                )
            )
            taxes = result.scalars().all()
            if len(taxes) != len(tax_ids):
                missing = set(tax_ids) - {tax.id for tax in taxes}
                logger.warning(f"Missing taxes: {list(missing)}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Taxes with ids {list(missing)} not found, inactive, or deleted"
                )
            # Use association table directly to avoid async relationship issues
            if taxes:
                await db.execute(
                    insert(project_taxes).values([
                        {"project_id": project.id, "tax_id": tax.id}
                        for tax in taxes
                    ])
                )
            logger.info(f"Associated {len(taxes)} taxes to project")
        
        # Create quote
        logger.info("Creating quote...")
        quote = Quote(
            project_id=project.id,
            version=1,
            total_internal_cost=totals["total_internal_cost"],
            total_client_price=totals["total_client_price"],
            margin_percentage=totals["margin_percentage"]
        )
        db.add(quote)
        await db.flush()  # Get quote ID
        logger.info(f"Quote created with ID: {quote.id}")
        
        # Create quote items
        logger.info(f"Creating {len(project_data.quote_items)} quote items...")
        quote_items = []
        for item_data in project_data.quote_items:
            service = services[item_data.service_id]
            internal_cost = blended_rate * item_data.estimated_hours
            # Prevent division by zero
            if service.default_margin_target >= 1.0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Service '{service.name}' has invalid margin target (must be < 1.0)"
                )
            client_price = internal_cost / (1 - service.default_margin_target)
            margin_pct = ((client_price - internal_cost) / client_price) if client_price > 0 else 0
            
            quote_item = QuoteItem(
                quote_id=quote.id,
                service_id=item_data.service_id,
                estimated_hours=item_data.estimated_hours,
                internal_cost=internal_cost,
                client_price=client_price,
                margin_percentage=margin_pct
            )
            quote_items.append(quote_item)
        
        db.add_all(quote_items)
        logger.info("Committing transaction...")
        await db.commit()
        logger.info("Project created successfully")
        
        # Refresh to get relationships
        await db.refresh(quote)
        await db.refresh(project)
        
        # Load items with service names
        result = await db.execute(
            select(QuoteItem)
            .where(QuoteItem.quote_id == quote.id)
            .options(selectinload(QuoteItem.service))
        )
        items = result.scalars().all()
        
        # Build response
        items_response = []
        for item in items:
            items_response.append(QuoteItemResponse(
                id=item.id,
                service_id=item.service_id,
                service_name=item.service.name if item.service else None,
                estimated_hours=item.estimated_hours,
                internal_cost=item.internal_cost,
                client_price=item.client_price,
                margin_percentage=item.margin_percentage
            ))
        
        return QuoteResponseWithItems(
            id=quote.id,
            project_id=quote.project_id,
            version=quote.version,
            total_internal_cost=quote.total_internal_cost,
            total_client_price=quote.total_client_price,
            margin_percentage=quote.margin_percentage,
            notes=quote.notes,
            created_at=quote.created_at,
            updated_at=quote.updated_at,
            items=items_response
        )
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating project: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    include_deleted: bool = False
):
    """
    Get a specific project by ID (with tenant scoping)
    By default, excludes soft-deleted items
    """
    query = select(Project).where(
        Project.id == project_id,
        Project.organization_id == tenant.organization_id
    ).options(selectinload(Project.taxes))
    
    if not include_deleted:
        query = query.where(Project.deleted_at.is_(None))
    
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    
    if not project:
        raise ResourceNotFoundError("Project", project_id)
    
    # Build response with taxes
    project_dict = {
        "id": project.id,
        "name": project.name,
        "client_name": project.client_name,
        "client_email": project.client_email,
        "status": project.status,
        "currency": project.currency,
        "tax_ids": [tax.id for tax in project.taxes],
        "taxes": [{"id": tax.id, "name": tax.name, "code": tax.code, "percentage": tax.percentage} for tax in project.taxes],
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }
    
    return ProjectResponse.model_validate(project_dict)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing project (with tenant scoping)
    Cannot update soft-deleted projects
    """
    result = await db.execute(
        select(Project)
        .where(
            Project.id == project_id,
            Project.deleted_at.is_(None),
            Project.organization_id == tenant.organization_id
        )
        .options(selectinload(Project.taxes))
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise ResourceNotFoundError("Project", project_id)
    
    update_data = project_data.model_dump(exclude_unset=True)
    
    # Handle tax_ids separately
    tax_ids = update_data.pop("tax_ids", None)
    
    for field, value in update_data.items():
        setattr(project, field, value)
    
    # Update taxes if provided
    if tax_ids is not None:
        result = await db.execute(
            select(Tax).where(
                Tax.id.in_(tax_ids),
                Tax.is_active == True,
                Tax.deleted_at.is_(None)
            )
        )
        taxes = result.scalars().all()
        if len(taxes) != len(tax_ids):
            missing = set(tax_ids) - {tax.id for tax in taxes}
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Taxes with ids {list(missing)} not found, inactive, or deleted"
            )
        # Remove existing tax associations
        await db.execute(
            sql_delete(project_taxes).where(project_taxes.c.project_id == project_id)
        )
        # Add new tax associations using association table directly
        if taxes:
            await db.execute(
                insert(project_taxes).values([
                    {"project_id": project_id, "tax_id": tax.id}
                    for tax in taxes
                ])
            )
    
    await db.commit()
    await db.refresh(project)
    
    # Build response with taxes
    project_dict = {
        "id": project.id,
        "name": project.name,
        "client_name": project.client_name,
        "client_email": project.client_email,
        "status": project.status,
        "currency": project.currency,
        "tax_ids": [tax.id for tax in project.taxes],
        "taxes": [{"id": tax.id, "name": tax.name, "code": tax.code, "percentage": tax.percentage} for tax in project.taxes],
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }
    
    return ProjectResponse.model_validate(project_dict)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Soft delete a project (move to trash)
    Projects are not permanently deleted, allowing restoration
    """
    # Verify if the project exists and is not already deleted
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.deleted_at.is_(None),
            Project.organization_id == tenant.organization_id
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise ResourceNotFoundError("Project", project_id)
    
    # Soft delete: mark as deleted
    project.deleted_at = datetime.utcnow()
    project.deleted_by_id = current_user.id
    await db.commit()
    
    return None


@router.post("/{project_id}/restore", response_model=ProjectResponse)
async def restore_project(
    project_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Restore a soft-deleted project from trash
    """
    result = await db.execute(
        select(Project)
        .where(
            Project.id == project_id,
            Project.deleted_at.isnot(None),
            Project.organization_id == tenant.organization_id
        )
        .options(selectinload(Project.taxes))
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise ResourceNotFoundError("Project", project_id)
    
    # Restore: clear deleted fields
    project.deleted_at = None
    project.deleted_by_id = None
    await db.commit()
    await db.refresh(project)
    
    # Build response
    project_dict = {
        "id": project.id,
        "name": project.name,
        "client_name": project.client_name,
        "client_email": project.client_email,
        "status": project.status,
        "currency": project.currency,
        "tax_ids": [tax.id for tax in project.taxes],
        "taxes": [{"id": tax.id, "name": tax.name, "code": tax.code, "percentage": tax.percentage} for tax in project.taxes],
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }
    
    return ProjectResponse.model_validate(project_dict)


@router.get("/trash/list", response_model=ProjectListResponse)
async def list_deleted_projects(
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all soft-deleted projects (trash)
    """
    query = select(Project).options(
        selectinload(Project.taxes),
        selectinload(Project.deleted_by)
    ).where(
        Project.deleted_at.isnot(None),
        Project.organization_id == tenant.organization_id
    ).order_by(Project.deleted_at.desc())
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    # Build response with taxes and user info
    items = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "name": project.name,
            "client_name": project.client_name,
            "client_email": project.client_email,
            "status": project.status,
            "currency": project.currency,
            "tax_ids": [tax.id for tax in project.taxes],
            "taxes": [{"id": tax.id, "name": tax.name, "code": tax.code, "percentage": tax.percentage} for tax in project.taxes],
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "deleted_at": project.deleted_at,
            "deleted_by_id": project.deleted_by_id,
            "deleted_by_name": project.deleted_by.name if project.deleted_by else None,
            "deleted_by_email": project.deleted_by.email if project.deleted_by else None,
        }
        items.append(ProjectResponse.model_validate(project_dict))
    
    return ProjectListResponse(
        items=items,
        total=len(projects)
    )


@router.delete("/{project_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanently_delete_project(
    project_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete a soft-deleted project (hard delete)
    This action cannot be undone. Only soft-deleted projects can be permanently deleted.
    This will cascade delete all quotes and quote items associated with the project.
    """
    # Verify if the project exists and is soft-deleted
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.deleted_at.isnot(None)
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found in trash. Only soft-deleted projects can be permanently deleted."
        )
    
    # Hard delete: permanently remove from database (cascades to quotes and quote items)
    await db.delete(project)
    await db.commit()
    
    return None


@router.get("/{project_id}/quotes/{quote_id}", response_model=QuoteResponseWithItems)
async def get_quote(
    project_id: int,
    quote_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific quote with all items
    """
    # Verify project belongs to tenant first
    project_check = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == tenant.organization_id
        )
    )
    if not project_check.scalar_one_or_none():
        raise ResourceNotFoundError("Project", project_id)
    
    result = await db.execute(
        select(Quote)
        .where(Quote.id == quote_id, Quote.project_id == project_id)
        .options(selectinload(Quote.items).selectinload(QuoteItem.service))
    )
    quote = result.scalar_one_or_none()
    
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote with id {quote_id} for project {project_id} not found"
        )
    
    # Build items response with service names
    items_response = []
    for item in quote.items:
        items_response.append(QuoteItemResponse(
            id=item.id,
            service_id=item.service_id,
            service_name=item.service.name if item.service else None,
            estimated_hours=item.estimated_hours,
            internal_cost=item.internal_cost,
            client_price=item.client_price,
            margin_percentage=item.margin_percentage
        ))
    
    return QuoteResponseWithItems(
        id=quote.id,
        project_id=quote.project_id,
        version=quote.version,
        total_internal_cost=quote.total_internal_cost,
        total_client_price=quote.total_client_price,
        margin_percentage=quote.margin_percentage,
        notes=quote.notes,
        created_at=quote.created_at,
        updated_at=quote.updated_at,
        items=items_response
    )


@router.get("/{project_id}/quotes", response_model=list[QuoteResponse])
async def list_project_quotes(
    project_id: int,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all quotes for a project (with tenant scoping)
    """
    # Verify project belongs to tenant first
    project_check = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == tenant.organization_id
        )
    )
    if not project_check.scalar_one_or_none():
        raise ResourceNotFoundError("Project", project_id)
    
    result = await db.execute(
        select(Quote)
        .where(Quote.project_id == project_id)
        .order_by(Quote.version.desc())
    )
    quotes = result.scalars().all()
    
    return [QuoteResponse.model_validate(quote) for quote in quotes]


@router.put("/{project_id}/quotes/{quote_id}", response_model=QuoteResponseWithItems)
async def update_quote(
    project_id: int,
    quote_id: int,
    quote_data: QuoteUpdate,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing quote (modifies current version)
    """
    try:
        # Verify project exists
        project_result = await db.execute(select(Project).where(Project.id == project_id))
        project = project_result.scalar_one_or_none()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with id {project_id} not found"
            )
        
        # Get existing quote
        quote_result = await db.execute(
            select(Quote).where(Quote.id == quote_id, Quote.project_id == project_id)
        )
        quote = quote_result.scalar_one_or_none()
        if not quote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quote with id {quote_id} not found"
            )
        
        # Validate services (filter by tenant)
        service_ids = [item.service_id for item in quote_data.items]
        services_result = await db.execute(
            select(Service).where(
                Service.id.in_(service_ids),
                Service.is_active == True,
                Service.deleted_at.is_(None),
                Service.organization_id == tenant.organization_id
            )
        )
        services = {service.id: service for service in services_result.scalars().all()}
        
        if len(services) != len(service_ids):
            missing = set(service_ids) - set(services.keys())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Services with ids {list(missing)} not found or inactive"
            )
        
        # Calculate blended cost rate
        blended_rate = await calculate_blended_cost_rate(db, project.currency)
        
        # Get project taxes
        project_result = await db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.taxes))
        )
        project_with_taxes = project_result.scalar_one_or_none()
        tax_ids = [tax.id for tax in project_with_taxes.taxes] if project_with_taxes else []
        
        # Calculate new totals
        items_dict = [
            {"service_id": item.service_id, "estimated_hours": item.estimated_hours}
            for item in quote_data.items
        ]
        totals = await calculate_quote_totals(db, items_dict, blended_rate, tax_ids)
        
        # Delete old items
        old_items_result = await db.execute(select(QuoteItem).where(QuoteItem.quote_id == quote_id))
        old_items = old_items_result.scalars().all()
        for item in old_items:
            await db.delete(item)
        
        # Update quote totals
        quote.total_internal_cost = totals["total_internal_cost"]
        quote.total_client_price = totals["total_client_price"]
        quote.margin_percentage = totals["margin_percentage"]
        if quote_data.notes is not None:
            quote.notes = quote_data.notes
        
        # Create new items
        quote_items = []
        for item_data in quote_data.items:
            service = services[item_data.service_id]
            internal_cost = blended_rate * item_data.estimated_hours
            client_price = internal_cost / (1 - service.default_margin_target)
            margin_pct = ((client_price - internal_cost) / client_price) if client_price > 0 else 0
            
            quote_item = QuoteItem(
                quote_id=quote.id,
                service_id=item_data.service_id,
                estimated_hours=item_data.estimated_hours,
                internal_cost=internal_cost,
                client_price=client_price,
                margin_percentage=margin_pct
            )
            quote_items.append(quote_item)
        
        db.add_all(quote_items)
        await db.commit()
        await db.refresh(quote)
        
        # Build response
        quote_result = await db.execute(
            select(Quote)
            .where(Quote.id == quote_id)
            .options(selectinload(Quote.items).selectinload(QuoteItem.service))
        )
        updated_quote = quote_result.scalar_one()
        
        items_response = []
        for item in updated_quote.items:
            items_response.append(QuoteItemResponse(
                id=item.id,
                service_id=item.service_id,
                service_name=item.service.name if item.service else None,
                estimated_hours=item.estimated_hours,
                internal_cost=item.internal_cost,
                client_price=item.client_price,
                margin_percentage=item.margin_percentage
            ))
        
        return QuoteResponseWithItems(
            id=updated_quote.id,
            project_id=updated_quote.project_id,
            version=updated_quote.version,
            total_internal_cost=updated_quote.total_internal_cost,
            total_client_price=updated_quote.total_client_price,
            margin_percentage=updated_quote.margin_percentage,
            notes=updated_quote.notes,
            created_at=updated_quote.created_at,
            updated_at=updated_quote.updated_at,
            items=items_response
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import logging
        import traceback
        logging.error(f"Error updating quote {quote_id}: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update quote: {str(e)}"
        )


@router.post("/{project_id}/quotes/{quote_id}/new-version", response_model=QuoteResponseWithItems, status_code=status.HTTP_201_CREATED)
async def create_new_quote_version(
    project_id: int,
    quote_id: int,
    quote_data: QuoteCreateNewVersion,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new version of an existing quote
    Increments version number and creates a new quote record
    """
    try:
        # Verify project exists
        project_result = await db.execute(select(Project).where(Project.id == project_id))
        project = project_result.scalar_one_or_none()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with id {project_id} not found"
            )
        
        # Get existing quote to determine next version
        quote_result = await db.execute(
            select(Quote).where(Quote.id == quote_id, Quote.project_id == project_id)
        )
        existing_quote = quote_result.scalar_one_or_none()
        if not existing_quote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quote with id {quote_id} not found"
            )
        
        # Get max version for this project
        max_version_result = await db.execute(
            select(func.max(Quote.version)).where(Quote.project_id == project_id)
        )
        max_version = max_version_result.scalar() or 0
        new_version = max_version + 1
        
        # Validate services (filter by tenant)
        service_ids = [item.service_id for item in quote_data.items]
        services_result = await db.execute(
            select(Service).where(
                Service.id.in_(service_ids),
                Service.is_active == True,
                Service.deleted_at.is_(None),
                Service.organization_id == tenant.organization_id
            )
        )
        services = {service.id: service for service in services_result.scalars().all()}
        
        if len(services) != len(service_ids):
            missing = set(service_ids) - set(services.keys())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Services with ids {list(missing)} not found or inactive"
            )
        
        # Calculate blended cost rate
        blended_rate = await calculate_blended_cost_rate(db, project.currency)
        
        # Get project taxes
        project_result = await db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.taxes))
        )
        project_with_taxes = project_result.scalar_one_or_none()
        tax_ids = [tax.id for tax in project_with_taxes.taxes] if project_with_taxes else []
        
        # Calculate totals
        items_dict = [
            {"service_id": item.service_id, "estimated_hours": item.estimated_hours}
            for item in quote_data.items
        ]
        totals = await calculate_quote_totals(db, items_dict, blended_rate, tax_ids)
        
        # Create new quote version
        new_quote = Quote(
            project_id=project_id,
            version=new_version,
            total_internal_cost=totals["total_internal_cost"],
            total_client_price=totals["total_client_price"],
            margin_percentage=totals["margin_percentage"],
            notes=quote_data.notes
        )
        db.add(new_quote)
        await db.flush()
        
        # Create quote items
        quote_items = []
        for item_data in quote_data.items:
            service = services[item_data.service_id]
            internal_cost = blended_rate * item_data.estimated_hours
            client_price = internal_cost / (1 - service.default_margin_target)
            margin_pct = ((client_price - internal_cost) / client_price) if client_price > 0 else 0
            
            quote_item = QuoteItem(
                quote_id=new_quote.id,
                service_id=item_data.service_id,
                estimated_hours=item_data.estimated_hours,
                internal_cost=internal_cost,
                client_price=client_price,
                margin_percentage=margin_pct
            )
            quote_items.append(quote_item)
        
        db.add_all(quote_items)
        await db.commit()
        await db.refresh(new_quote)
        
        # Build response
        quote_result = await db.execute(
            select(Quote)
            .where(Quote.id == new_quote.id)
            .options(selectinload(Quote.items).selectinload(QuoteItem.service))
        )
        final_quote = quote_result.scalar_one()
        
        items_response = []
        for item in final_quote.items:
            items_response.append(QuoteItemResponse(
                id=item.id,
                service_id=item.service_id,
                service_name=item.service.name if item.service else None,
                estimated_hours=item.estimated_hours,
                internal_cost=item.internal_cost,
                client_price=item.client_price,
                margin_percentage=item.margin_percentage
            ))
        
        return QuoteResponseWithItems(
            id=final_quote.id,
            project_id=final_quote.project_id,
            version=final_quote.version,
            total_internal_cost=final_quote.total_internal_cost,
            total_client_price=final_quote.total_client_price,
            margin_percentage=final_quote.margin_percentage,
            notes=final_quote.notes,
            created_at=final_quote.created_at,
            updated_at=final_quote.updated_at,
            items=items_response
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import logging
        import traceback
        logging.error(f"Error creating new quote version: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create new quote version: {str(e)}"
        )


@router.get("/{project_id}/quotes/{quote_id}/pdf")
async def download_quote_pdf(
    project_id: int,
    quote_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate and download a PDF version of a quote
    """
    # Verify project belongs to tenant first
    project_check = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == tenant.organization_id
        )
    )
    if not project_check.scalar_one_or_none():
        raise ResourceNotFoundError("Project", project_id)
    
    # Get quote with all relationships
    result = await db.execute(
        select(Quote)
        .where(Quote.id == quote_id, Quote.project_id == project_id)
        .options(
            selectinload(Quote.items).selectinload(QuoteItem.service),
            selectinload(Quote.project).selectinload(Project.taxes)
        )
    )
    quote = result.scalar_one_or_none()
    
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote with id {quote_id} for project {project_id} not found"
        )
    
    # Get project
    project = quote.project
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    # Generate PDF
    try:
        pdf_buffer = generate_quote_pdf(project, quote)
        
        # Generate filename
        safe_project_name = "".join(c for c in project.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"cotizacion_{safe_project_name}_v{quote.version}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        import logging
        import traceback
        logging.error(f"Error generating PDF for quote {quote_id}: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )


@router.get("/{project_id}/quotes/{quote_id}/docx")
async def download_quote_docx(
    project_id: int,
    quote_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate and download a DOCX version of a quote
    """
    from app.core.docx_generator import generate_quote_docx
    
    # Verify project belongs to tenant first
    project_check = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == tenant.organization_id
        )
    )
    if not project_check.scalar_one_or_none():
        raise ResourceNotFoundError("Project", project_id)
    
    # Get quote with all relationships
    result = await db.execute(
        select(Quote)
        .where(Quote.id == quote_id, Quote.project_id == project_id)
        .options(
            selectinload(Quote.items).selectinload(QuoteItem.service),
            selectinload(Quote.project).selectinload(Project.taxes)
        )
    )
    quote = result.scalar_one_or_none()
    
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote with id {quote_id} for project {project_id} not found"
        )
    
    # Get project
    project = quote.project
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    # Generate DOCX
    try:
        docx_buffer = generate_quote_docx(project, quote)
        
        # Generate filename
        safe_project_name = "".join(c for c in project.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"cotizacion_{safe_project_name}_v{quote.version}.docx"
        
        return StreamingResponse(
            docx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.error(f"Error generating DOCX for quote {quote_id}", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate DOCX: {str(e)}"
        )


@router.post("/{project_id}/quotes/{quote_id}/send-email", response_model=QuoteEmailResponse)
async def send_quote_email(
    project_id: int,
    quote_id: int,
    email_data: QuoteEmailRequest,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send quote by email
    
    Requires SMTP configuration in environment variables.
    """
    from app.core.email import send_email, generate_quote_email_html, generate_quote_email_text
    from app.core.logging import get_logger
    
    logger = get_logger(__name__)
    
    # Verify project belongs to tenant first
    project_check = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == tenant.organization_id
        )
    )
    if not project_check.scalar_one_or_none():
        raise ResourceNotFoundError("Project", project_id)
    
    # Get quote with all relationships
    result = await db.execute(
        select(Quote)
        .where(Quote.id == quote_id, Quote.project_id == project_id)
        .options(
            selectinload(Quote.items).selectinload(QuoteItem.service),
            selectinload(Quote.project).selectinload(Project.taxes)
        )
    )
    quote = result.scalar_one_or_none()
    
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote with id {quote_id} for project {project_id} not found"
        )
    
    # Get project
    project = quote.project
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    try:
        # Calculate totals
        total_client_price = quote.total_client_price or 0
        taxes = []
        total_taxes = 0
        if hasattr(project, 'taxes') and project.taxes:
            for tax in project.taxes:
                tax_amount = (total_client_price * tax.percentage / 100) if tax.percentage else 0
                taxes.append(tax_amount)
                total_taxes += tax_amount
        
        total_with_taxes = total_client_price + total_taxes
        
        # Generate email subject
        subject = email_data.subject or f"Quote for {project.name} - Version {quote.version}"
        
        # Generate email body
        html_body = generate_quote_email_html(
            project_name=project.name,
            client_name=project.client_name,
            quote_version=quote.version,
            total_with_taxes=total_with_taxes,
            currency=project.currency,
            notes=quote.notes or email_data.message
        )
        
        text_body = generate_quote_email_text(
            project_name=project.name,
            client_name=project.client_name,
            quote_version=quote.version,
            total_with_taxes=total_with_taxes,
            currency=project.currency,
            notes=quote.notes or email_data.message
        )
        
        # Prepare attachments
        attachments = []
        
        if email_data.include_pdf:
            pdf_buffer = generate_quote_pdf(project, quote)
            safe_project_name = "".join(c for c in project.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            pdf_filename = f"cotizacion_{safe_project_name}_v{quote.version}.pdf"
            attachments.append({
                'filename': pdf_filename,
                'content': pdf_buffer
            })
        
        if email_data.include_docx:
            from app.core.docx_generator import generate_quote_docx
            docx_buffer = generate_quote_docx(project, quote)
            safe_project_name = "".join(c for c in project.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            docx_filename = f"cotizacion_{safe_project_name}_v{quote.version}.docx"
            attachments.append({
                'filename': docx_filename,
                'content': docx_buffer
            })
        
        # Send email
        success = await send_email(
            to_email=email_data.to_email,
            subject=subject,
            body_html=html_body,
            body_text=text_body,
            attachments=attachments if attachments else None,
            cc=email_data.cc if email_data.cc else None,
            bcc=email_data.bcc if email_data.bcc else None
        )
        
        if success:
            logger.info(
                f"Quote {quote_id} sent by email to {email_data.to_email}",
                user_id=current_user.id,
                project_id=project_id
            )
            return QuoteEmailResponse(
                success=True,
                message=f"Quote sent successfully to {email_data.to_email}"
            )
        else:
            logger.error(
                f"Failed to send quote {quote_id} by email",
                user_id=current_user.id,
                project_id=project_id,
                to_email=email_data.to_email
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email. Please check SMTP configuration."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error sending quote {quote_id} by email",
            error=str(e),
            user_id=current_user.id,
            project_id=project_id,
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )



