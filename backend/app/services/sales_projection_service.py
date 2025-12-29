"""
Sales projection service for generating revenue forecasts based on services and team capacity
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.logging import get_logger
from app.models.service import Service
from app.models.team import TeamMember
from app.core.calculations import calculate_blended_cost_rate

logger = get_logger(__name__)


async def calculate_sales_projection(
    db: AsyncSession,
    organization_id: int,
    service_ids: List[int],
    estimated_hours_per_service: Dict[int, float],
    win_rate: float = 0.85,  # Default 85% win rate
    scenario: str = "realistic",  # "conservative", "realistic", "optimistic"
    period_months: int = 12,
    currency: str = "USD"
) -> Dict:
    """
    Calculate sales projection based on services, team capacity, and win rates.
    
    Args:
        db: Database session
        organization_id: Organization ID
        service_ids: List of service IDs to project
        estimated_hours_per_service: Dictionary mapping service_id to estimated hours
        win_rate: Expected win rate (0.0 to 1.0, default 0.85)
        scenario: Scenario type ("conservative", "realistic", "optimistic")
        period_months: Number of months to project (default 12)
        currency: Currency for calculations
        
    Returns:
        Dictionary with projection data including monthly breakdowns, totals, and KPIs
    """
    # Adjust win rate based on scenario
    scenario_multipliers = {
        "conservative": 0.70,
        "realistic": 0.85,
        "optimistic": 1.0
    }
    effective_win_rate = win_rate * scenario_multipliers.get(scenario, 0.85)
    
    # Get services
    result = await db.execute(
        select(Service).where(
            Service.id.in_(service_ids),
            Service.organization_id == organization_id,
            Service.deleted_at.is_(None)
        )
    )
    services = result.scalars().all()
    
    if not services:
        raise ValueError("No valid services found for projection")
    
    # Get BCR
    bcr = await calculate_blended_cost_rate(db, currency, use_cache=False, tenant_id=organization_id)
    
    # Get team capacity (total billable hours per month)
    result = await db.execute(
        select(TeamMember).where(
            TeamMember.organization_id == organization_id,
            TeamMember.is_active == True
        )
    )
    team_members = result.scalars().all()
    
    total_billable_hours_per_month = sum(
        member.billable_hours_per_week * 4.33 * (1 - (getattr(member, 'non_billable_hours_percentage', 0.0) or 0.0))
        for member in team_members
    )
    
    # Calculate per-service projections
    service_projections = []
    total_projected_revenue = 0.0
    total_projected_cost = 0.0
    
    for service in services:
        service_id = service.id
        estimated_hours = estimated_hours_per_service.get(service_id, 0)
        
        if estimated_hours <= 0:
            continue
        
        # Calculate cost
        cost = bcr * estimated_hours
        
        # Calculate price with margin
        if service.default_margin_target > 0 and service.default_margin_target < 1:
            price = cost / (1 - service.default_margin_target)
        else:
            price = cost * 1.4  # Default 40% margin
        
        # Apply win rate
        projected_revenue = price * effective_win_rate
        projected_cost = cost * effective_win_rate  # Only cost for won projects
        
        service_projections.append({
            "service_id": service_id,
            "service_name": service.name,
            "estimated_hours": estimated_hours,
            "base_price": price,
            "cost": cost,
            "projected_revenue": projected_revenue,
            "projected_cost": projected_cost,
            "projected_profit": projected_revenue - projected_cost,
            "margin": ((projected_revenue - projected_cost) / projected_revenue * 100) if projected_revenue > 0 else 0
        })
        
        total_projected_revenue += projected_revenue
        total_projected_cost += projected_cost
    
    # Calculate monthly breakdown
    monthly_projections = []
    revenue_per_month = total_projected_revenue / period_months
    cost_per_month = total_projected_cost / period_months
    
    for month in range(1, period_months + 1):
        monthly_projections.append({
            "month": month,
            "revenue": revenue_per_month,
            "costs": cost_per_month,
            "profit": revenue_per_month - cost_per_month,
            "margin_percentage": ((revenue_per_month - cost_per_month) / revenue_per_month * 100) if revenue_per_month > 0 else 0
        })
    
    # Calculate KPIs
    total_projected_profit = total_projected_revenue - total_projected_cost
    overall_margin = (total_projected_profit / total_projected_revenue * 100) if total_projected_revenue > 0 else 0
    
    # Capacity utilization
    total_estimated_hours = sum(estimated_hours_per_service.values())
    hours_per_month = total_estimated_hours / period_months
    capacity_utilization = (hours_per_month / total_billable_hours_per_month * 100) if total_billable_hours_per_month > 0 else 0
    
    return {
        "scenario": scenario,
        "period_months": period_months,
        "win_rate": effective_win_rate,
        "currency": currency,
        "bcr": bcr,
        "total_billable_hours_per_month": total_billable_hours_per_month,
        "service_projections": service_projections,
        "monthly_projections": monthly_projections,
        "summary": {
            "total_revenue": total_projected_revenue,
            "total_costs": total_projected_cost,
            "total_profit": total_projected_profit,
            "overall_margin_percentage": overall_margin,
            "capacity_utilization_percentage": capacity_utilization,
            "total_estimated_hours": total_estimated_hours,
            "hours_per_month": hours_per_month
        }
    }

