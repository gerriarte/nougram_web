"""
Agency settings endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.currency import get_all_currencies, get_currency_symbol, is_valid_currency
from app.core.logging import get_logger
from app.core.permissions import get_user_role
from app.models.user import User
from app.models.settings import AgencySettings
from app.repositories.settings_repository import SettingsRepository
from app.schemas.settings import (
    AgencySettingsResponse, 
    AgencySettingsUpdate,
    ExchangeRatesResponse
)
from app.services.exchange_rate_service import get_today_exchange_rates

logger = get_logger(__name__)

router = APIRouter()


@router.get("/currency", response_model=AgencySettingsResponse)
async def get_agency_currency_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    include_rates: bool = False
):
    """
    Get agency currency settings
    Returns the primary currency and available currencies.
    
    If include_rates=true and user is owner or super_admin, also returns today's exchange rates.
    """
    try:
        settings_repo = SettingsRepository(db)
        settings = await settings_repo.get_or_create_default()
        
        # Check if user can view exchange rates (owner or super_admin)
        user_role = get_user_role(current_user)
        can_view_rates = user_role in ["owner", "super_admin"]
        
        exchange_rates = None
        if include_rates and can_view_rates:
            try:
                exchange_rates = await get_today_exchange_rates()
            except Exception as e:
                logger.warning("Error fetching exchange rates", error=str(e), user_id=current_user.id)
                # Continue without rates if API fails
        
        return AgencySettingsResponse(
            primary_currency=settings.primary_currency,
            currency_symbol=get_currency_symbol(settings.primary_currency),
            available_currencies=get_all_currencies(),
            exchange_rates=exchange_rates
        )
        
    except Exception as e:
        logger.error("Error getting currency settings", error=str(e), user_id=current_user.id, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting currency settings: {str(e)}"
        )


@router.put("/currency", response_model=AgencySettingsResponse)
async def update_agency_currency_settings(
    settings_data: AgencySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update agency primary currency settings
    
    This affects how costs and prices are displayed and calculated.
    """
    try:
        # Validate currency
        if not is_valid_currency(settings_data.primary_currency):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid currency: {settings_data.primary_currency}. Supported: USD, COP, ARS, EUR"
            )
        
        settings_repo = SettingsRepository(db)
        settings = await settings_repo.get_or_create_default()
        
        # Update existing settings
        logger.info("Updating currency settings", new_currency=settings_data.primary_currency, user_id=current_user.id)
        settings.primary_currency = settings_data.primary_currency
        settings.currency_symbol = get_currency_symbol(settings_data.primary_currency)
        settings = await settings_repo.update(settings)
        
        logger.info("Currency settings updated successfully", user_id=current_user.id)
        return AgencySettingsResponse(
            primary_currency=settings.primary_currency,
            currency_symbol=settings.currency_symbol,
            available_currencies=get_all_currencies()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error updating currency settings", error=str(e), user_id=current_user.id, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating currency settings: {str(e)}"
        )


@router.get("/currency/exchange-rates", response_model=ExchangeRatesResponse)
async def get_exchange_rates(
    current_user: User = Depends(get_current_user),
):
    """
    Get today's exchange rates for all supported currencies.
    
    Only available for owner and super_admin roles.
    """
    try:
        # Check permissions
        user_role = get_user_role(current_user)
        if user_role not in ["owner", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owners and super admins can view exchange rates"
            )
        
        rates = await get_today_exchange_rates()
        
        return ExchangeRatesResponse(
            rates=rates,
            base_currency="USD"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting exchange rates", error=str(e), user_id=current_user.id, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting exchange rates: {str(e)}"
        )
