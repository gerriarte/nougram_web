"""
Business logic for cost and pricing calculations
"""
from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.cost import CostFixed
from app.models.team import TeamMember
from app.models.service import Service
from app.models.settings import AgencySettings
from app.core.currency import normalize_to_primary_currency


async def calculate_blended_cost_rate(db: AsyncSession, primary_currency: str = "USD", use_cache: bool = True, tenant_id: Optional[int] = None) -> float:
    """
    Calculate the blended cost rate (cost per hour) for the agency.
    
    Formula: Total Monthly Costs / Total Billable Hours Available
    
    All costs are normalized to the primary currency before calculation.
    
    Args:
        db: Database session
        primary_currency: Primary currency for normalization (default: USD)
        use_cache: Whether to use cache (default: True)
    
    Returns:
        float: Cost per hour in the primary currency
    """
    from app.core.cache import get_cache
    
    # Check cache first
    if use_cache:
        cache = get_cache()
        cache_key = f"blended_cost_rate:{primary_currency}"
        cached_value = cache.get(cache_key)
        if cached_value is not None:
            return cached_value
    
    # Get primary currency from settings
    try:
        result = await db.execute(select(AgencySettings).where(AgencySettings.id == 1))
        settings = result.scalar_one_or_none()
        if settings:
            primary_currency = settings.primary_currency
    except Exception:
        pass  # Use default if settings not found
    
    # Get all fixed costs (excluding soft-deleted) and normalize to primary currency
    # Filter by tenant if tenant_id is provided
    query = select(CostFixed).where(CostFixed.deleted_at.is_(None))
    if tenant_id is not None:
        query = query.where(CostFixed.organization_id == tenant_id)
    result = await db.execute(query)
    fixed_costs = result.scalars().all()
    fixed_costs = result.scalars().all()
    total_monthly_costs = 0.0
    for cost in fixed_costs:
        # Ensure currency has a value (default to USD if None)
        cost_currency = cost.currency or "USD"
        normalized = normalize_to_primary_currency(
            cost.amount_monthly,
            cost_currency,
            primary_currency
        )
        total_monthly_costs += normalized
    
    # Get all active team members and normalize their salaries
    # Filter by tenant if tenant_id is provided
    query = select(TeamMember).where(TeamMember.is_active == True)
    if tenant_id is not None:
        query = query.where(TeamMember.organization_id == tenant_id)
    result = await db.execute(query)
    team_members = result.scalars().all()
    team_members = result.scalars().all()
    
    total_monthly_salaries = 0.0
    for member in team_members:
        # Ensure currency has a value (default to USD if None)
        member_currency = member.currency or "USD"
        normalized = normalize_to_primary_currency(
            member.salary_monthly_brute,
            member_currency,
            primary_currency
        )
        total_monthly_salaries += normalized
    
    # Calculate total billable hours per month (assuming 4.33 weeks per month)
    hours_per_month = sum(
        member.billable_hours_per_week * 4.33 for member in team_members
    )
    
    # Total monthly costs (normalized to primary currency)
    total_monthly_costs = total_monthly_costs + total_monthly_salaries
    
    # Calculate cost per hour
    if hours_per_month > 0:
        cost_per_hour = total_monthly_costs / hours_per_month
    else:
        cost_per_hour = 0.0
    
    # Cache the result (5 minutes TTL)
    if use_cache:
        cache = get_cache()
        cache_key = f"blended_cost_rate:{primary_currency}:{tenant_id or 'all'}"
        cache.set(cache_key, cost_per_hour, ttl_seconds=300)
    
    return cost_per_hour


async def calculate_quote_totals(
    db: AsyncSession,
    items: List[Dict],
    blended_cost_rate: float,
    tax_ids: List[int] = None
) -> Dict:
    """
    Calculate total internal cost, client price, taxes, and margin for a quote.
    
    Args:
        db: Database session
        items: List of items with service_id and estimated_hours
        blended_cost_rate: Current blended cost rate
        tax_ids: List of tax IDs to apply (optional)
        
    Returns:
        Dict with total_internal_cost, total_client_price, total_taxes, total_with_taxes, margin_percentage, taxes
    """
    from app.models.tax import Tax
    
    total_internal_cost = 0.0
    total_client_price = 0.0
    
    for item in items:
        service_id = item.get("service_id")
        estimated_hours = item.get("estimated_hours", 0)
        
        # Get service details (excluding soft-deleted services)
        result = await db.execute(
            select(Service).where(
                Service.id == service_id,
                Service.deleted_at.is_(None)
            )
        )
        service = result.scalar_one_or_none()
        
        if service:
            # Calculate internal cost
            internal_cost = blended_cost_rate * estimated_hours
            total_internal_cost += internal_cost
            
            # Calculate client price (with margin)
            client_price = internal_cost / (1 - service.default_margin_target)
            total_client_price += client_price
    
    # Calculate taxes if provided
    total_taxes = 0.0
    taxes_breakdown = []
    
    if tax_ids:
        result = await db.execute(
            select(Tax).where(
                Tax.id.in_(tax_ids),
                Tax.is_active == True,
                Tax.deleted_at.is_(None)
            )
        )
        taxes = result.scalars().all()
        
        for tax in taxes:
            tax_amount = total_client_price * (tax.percentage / 100)
            total_taxes += tax_amount
            taxes_breakdown.append({
                "id": tax.id,
                "name": tax.name,
                "code": tax.code,
                "percentage": tax.percentage,
                "amount": tax_amount,
            })
    
    total_with_taxes = total_client_price + total_taxes
    
    # Calculate margin percentage (based on price before taxes)
    if total_client_price > 0:
        margin_percentage = (
            (total_client_price - total_internal_cost) / total_client_price
        )
    else:
        margin_percentage = 0.0
    
    return {
        "total_internal_cost": total_internal_cost,
        "total_client_price": total_client_price,
        "total_taxes": total_taxes,
        "total_with_taxes": total_with_taxes,
        "margin_percentage": margin_percentage,
        "taxes": taxes_breakdown,
    }



