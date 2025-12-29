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
from app.core.pricing_strategies import PricingStrategyFactory


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
    
    # Check cache first (include tenant_id and social charges in cache key)
    if use_cache:
        cache = get_cache()
        cache_key = f"blended_cost_rate:{primary_currency}:tenant_{tenant_id}"
        # Add social charges config to cache key if tenant_id is provided
        if tenant_id is not None:
            try:
                from app.models.organization import Organization
                org_result = await db.execute(select(Organization).where(Organization.id == tenant_id))
                org = org_result.scalar_one_or_none()
                if org and org.settings and org.settings.get('social_charges_config'):
                    social_config = org.settings.get('social_charges_config', {})
                    if social_config.get('enable_social_charges', False):
                        total_percentage = social_config.get('total_percentage', 0)
                        cache_key += f":social_{total_percentage}"
            except Exception:
                pass
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
    
    # Get organization settings for social charges (Sprint 18)
    social_charges_multiplier = 1.0
    if tenant_id is not None:
        try:
            from app.models.organization import Organization
            org_result = await db.execute(select(Organization).where(Organization.id == tenant_id))
            org = org_result.scalar_one_or_none()
            if org and org.settings and org.settings.get('social_charges_config'):
                social_config = org.settings.get('social_charges_config', {})
                if social_config.get('enable_social_charges', False):
                    # Calculate multiplier: 1 + (total_percentage / 100)
                    total_percentage = social_config.get('total_percentage', 0)
                    if total_percentage:
                        social_charges_multiplier = 1.0 + (total_percentage / 100.0)
        except Exception:
            # If there's an error getting org settings, use default multiplier
            pass
    
    total_monthly_salaries = 0.0
    for member in team_members:
        # Ensure currency has a value (default to USD if None)
        member_currency = member.currency or "USD"
        normalized = normalize_to_primary_currency(
            member.salary_monthly_brute,
            member_currency,
            primary_currency
        )
        # Apply social charges multiplier (Sprint 18)
        normalized_with_charges = normalized * social_charges_multiplier
        total_monthly_salaries += normalized_with_charges
    
    # Calculate total billable hours per month (assuming 4.33 weeks per month)
    # Adjust for non-billable hours percentage (Sprint 14)
    hours_per_month = sum(
        member.billable_hours_per_week * 4.33 * (1 - (getattr(member, 'non_billable_hours_percentage', 0.0) or 0.0))
        for member in team_members
    )
    
    # Total monthly costs (normalized to primary currency)
    total_monthly_costs = total_monthly_costs + total_monthly_salaries
    
    # Calculate cost per hour
    if hours_per_month > 0:
        cost_per_hour = total_monthly_costs / hours_per_month
    else:
        cost_per_hour = 0.0
    
    # Cache the result (5 minutes TTL) - use same cache key format as above
    if use_cache:
        cache = get_cache()
        # Reconstruct cache key same way as above (including social charges)
        cache_key = f"blended_cost_rate:{primary_currency}:tenant_{tenant_id}"
        if tenant_id is not None:
            try:
                from app.models.organization import Organization
                org_result = await db.execute(select(Organization).where(Organization.id == tenant_id))
                org = org_result.scalar_one_or_none()
                if org and org.settings and org.settings.get('social_charges_config'):
                    social_config = org.settings.get('social_charges_config', {})
                    if social_config.get('enable_social_charges', False):
                        total_percentage = social_config.get('total_percentage', 0)
                        cache_key += f":social_{total_percentage}"
            except Exception:
                pass
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


async def calculate_quote_totals_enhanced(
    db: AsyncSession,
    items: List[Dict],
    blended_cost_rate: float,
    tax_ids: List[int] = None,
    expenses: List[Dict] = None,
    revisions_included: int = 2,
    revision_cost_per_additional: Optional[float] = None,
    revisions_count: Optional[int] = None
) -> Dict:
    """
    Enhanced quote calculation supporting multiple pricing types, expenses, and revisions (Sprint 15-16):
    - hourly: Hours × BCR (existing logic)
    - fixed: fixed_price × quantity
    - recurring: recurring_price (based on billing frequency)
    - project_value: Custom project value
    - expenses: Third-party costs with markup
    - revisions: Additional cost for revisions beyond included count
    
    Args:
        db: Database session
        items: List of items with service_id and pricing information:
            - For hourly: estimated_hours required
            - For fixed: fixed_price and quantity required
            - For recurring: recurring_price and billing_frequency required
        blended_cost_rate: Current blended cost rate (for hourly calculations)
        tax_ids: List of tax IDs to apply (optional)
        expenses: List of expenses with cost, markup_percentage, quantity (optional)
        revisions_included: Number of included revisions (default: 2)
        revision_cost_per_additional: Cost per additional revision (optional)
        revisions_count: Actual number of revisions requested (optional, for calculation)
        
    Returns:
        Dict with total_internal_cost, total_client_price, total_expenses_cost, 
        total_expenses_client_price, total_taxes, total_with_taxes, margin_percentage, 
        taxes, items, expenses, revisions_cost
    """
    from app.models.tax import Tax
    
    total_internal_cost = 0.0
    total_client_price = 0.0
    items_breakdown = []
    
    for item in items:
        service_id = item.get("service_id")
        pricing_type = item.get("pricing_type")  # Can override service pricing_type
        
        # Get service details (excluding soft-deleted services)
        result = await db.execute(
            select(Service).where(
                Service.id == service_id,
                Service.deleted_at.is_(None)
            )
        )
        service = result.scalar_one_or_none()
        
        if not service:
            continue
        
        # Use item pricing_type if provided, otherwise use service pricing_type
        effective_pricing_type = pricing_type or service.pricing_type or "hourly"
        
        # Get pricing strategy and calculate costs
        strategy = PricingStrategyFactory.get_strategy(effective_pricing_type)
        pricing_result = strategy.calculate(item, service, blended_cost_rate)
        
        internal_cost = pricing_result["internal_cost"]
        client_price = pricing_result["client_price"]
        
        # Skip items with zero cost/price
        if internal_cost == 0.0 and client_price == 0.0:
            continue
        
        total_internal_cost += internal_cost
        total_client_price += client_price
        
        # Store item breakdown for detailed response
        items_breakdown.append({
            "service_id": service_id,
            "service_name": service.name,
            "pricing_type": effective_pricing_type,
            "internal_cost": round(internal_cost, 2),
            "client_price": round(client_price, 2),
            "margin": round(((client_price - internal_cost) / client_price * 100) if client_price > 0 else 0, 2),
        })
    
    # Calculate expenses (Sprint 15: third-party costs with markup)
    total_expenses_cost = 0.0
    total_expenses_client_price = 0.0
    expenses_breakdown = []
    
    if expenses:
        for expense in expenses:
            cost = expense.get("cost", 0)
            markup_percentage = expense.get("markup_percentage", 0.0)
            quantity = expense.get("quantity", 1.0)
            
            if cost <= 0:
                continue
            
            # Calculate expense totals
            expense_cost = cost * quantity
            expense_client_price = expense_cost * (1 + markup_percentage)
            
            total_expenses_cost += expense_cost
            total_expenses_client_price += expense_client_price
            
            # Store expense breakdown
            expenses_breakdown.append({
                "name": expense.get("name", "Unknown Expense"),
                "description": expense.get("description"),
                "category": expense.get("category"),
                "cost": round(cost, 2),
                "quantity": round(quantity, 2),
                "markup_percentage": round(markup_percentage * 100, 2),  # Convert to percentage
                "expense_cost": round(expense_cost, 2),
                "client_price": round(expense_client_price, 2),
            })
    
    # Add expenses to totals
    total_internal_cost += total_expenses_cost
    total_client_price += total_expenses_client_price
    
    # Calculate additional revision costs (Sprint 16)
    revisions_cost = 0.0
    if revision_cost_per_additional is not None and revision_cost_per_additional >= 0 and revisions_count is not None:
        if revisions_count > revisions_included:
            additional_revisions = revisions_count - revisions_included
            revisions_cost = additional_revisions * revision_cost_per_additional
            total_client_price += revisions_cost
    
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
                "amount": round(tax_amount, 2),
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
        "total_internal_cost": round(total_internal_cost, 2),
        "total_client_price": round(total_client_price, 2),
        "total_expenses_cost": round(total_expenses_cost, 2),
        "total_expenses_client_price": round(total_expenses_client_price, 2),
        "total_taxes": round(total_taxes, 2),
        "total_with_taxes": round(total_with_taxes, 2),
        "margin_percentage": round(margin_percentage, 4),
        "taxes": taxes_breakdown,
        "items": items_breakdown,  # Detailed breakdown per item
        "expenses": expenses_breakdown,  # Detailed breakdown per expense (Sprint 15)
        "revisions_cost": round(revisions_cost, 2),  # Additional cost for revisions (Sprint 16)
        "revisions_included": revisions_included,
        "revisions_count": revisions_count,
    }



