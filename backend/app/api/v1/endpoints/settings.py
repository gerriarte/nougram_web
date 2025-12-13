"""
Agency settings endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.currency import get_all_currencies, get_currency_symbol, is_valid_currency
from app.core.logging import get_logger
from app.models.user import User
from app.models.settings import AgencySettings
from app.repositories.settings_repository import SettingsRepository
from app.schemas.settings import AgencySettingsResponse, AgencySettingsUpdate

logger = get_logger(__name__)

router = APIRouter()


@router.get("/currency", response_model=AgencySettingsResponse)
async def get_agency_currency_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get agency currency settings
    Returns the primary currency and available currencies
    """
    try:
        settings_repo = SettingsRepository(db)
        settings = await settings_repo.get_or_create_default()
        
        return AgencySettingsResponse(
            primary_currency=settings.primary_currency,
            currency_symbol=get_currency_symbol(settings.primary_currency),
            available_currencies=get_all_currencies()
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
