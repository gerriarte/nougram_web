"""
Pydantic schemas for Agency Settings
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.core.currency import Currency


class AgencySettingsResponse(BaseModel):
    """Schema for agency settings response"""
    primary_currency: str = Field(..., description="Primary currency code (USD, COP, ARS, EUR)")
    currency_symbol: str = Field(..., description="Currency symbol")
    available_currencies: list[dict] = Field(default_factory=list, description="List of available currencies")
    exchange_rates: Optional[Dict[str, Any]] = Field(None, description="Today's exchange rates (only for owner/super_admin)")

    class Config:
        from_attributes = True


class AgencySettingsUpdate(BaseModel):
    """Schema for updating agency settings"""
    primary_currency: str = Field(..., description="Primary currency code (USD, COP, ARS, EUR)")


class ExchangeRateInfo(BaseModel):
    """Schema for exchange rate information"""
    rate: float = Field(..., description="Exchange rate to USD")
    rate_to_usd: float = Field(..., description="Exchange rate to USD (same as rate)")
    last_updated: str = Field(..., description="ISO timestamp of last update")


class ExchangeRatesResponse(BaseModel):
    """Schema for exchange rates response"""
    rates: Dict[str, ExchangeRateInfo] = Field(..., description="Exchange rates for all supported currencies")
    base_currency: str = Field(default="USD", description="Base currency for rates")
