"""
Quote calculation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.calculations import calculate_blended_cost_rate, calculate_quote_totals
from app.models.user import User
from app.models.service import Service
from app.schemas.quote import QuoteCalculateRequest, QuoteCalculateResponse

router = APIRouter()


@router.post("/calculate", response_model=QuoteCalculateResponse)
async def calculate_quote(
    request: QuoteCalculateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate quote totals (internal cost, client price, margin)
    This is the core endpoint for Module 3
    Receives: list of {service_id, estimated_hours}
    Returns: {total_internal_cost, total_client_price, margin_percentage}
    """
    # Validate services exist
    for item in request.items:
        result = await db.execute(
            select(Service).where(Service.id == item.service_id, Service.is_active == True)
        )
        service = result.scalar_one_or_none()
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service with id {item.service_id} not found or inactive"
            )
    
    # Calculate blended cost rate
    blended_rate = await calculate_blended_cost_rate(db)
    
    # Convert request items to dict format for calculation
    items_dict = [{"service_id": item.service_id, "estimated_hours": item.estimated_hours} for item in request.items]
    
    # Calculate quote totals (with taxes if provided)
    tax_ids = request.tax_ids or []
    totals = await calculate_quote_totals(db, items_dict, blended_rate, tax_ids)
    
    # Calculate individual item details
    calculated_items = []
    for item in request.items:
        result = await db.execute(
            select(Service).where(Service.id == item.service_id)
        )
        service = result.scalar_one()
        
        internal_cost = blended_rate * item.estimated_hours
        client_price = internal_cost / (1 - service.default_margin_target)
        margin_pct = ((client_price - internal_cost) / client_price) if client_price > 0 else 0
        
        calculated_items.append({
            "service_id": item.service_id,
            "service_name": service.name,
            "estimated_hours": item.estimated_hours,
            "internal_cost": round(internal_cost, 2),
            "client_price": round(client_price, 2),
            "margin_percentage": round(margin_pct, 4),
        })
    
    return QuoteCalculateResponse(
        total_internal_cost=round(totals["total_internal_cost"], 2),
        total_client_price=round(totals["total_client_price"], 2),
        total_taxes=round(totals.get("total_taxes", 0.0), 2),
        total_with_taxes=round(totals.get("total_with_taxes", totals["total_client_price"]), 2),
        margin_percentage=round(totals["margin_percentage"], 4),
        items=calculated_items,
        taxes=totals.get("taxes", [])
    )



