"""
Pydantic schemas for Agency Settings
"""
from typing import Optional
from pydantic import BaseModel, Field
from app.core.currency import Currency


class AgencySettingsResponse(BaseModel):
    """Schema for agency settings response"""
    primary_currency: str = Field(..., description="Primary currency code (USD, COP, ARS, EUR)")
    currency_symbol: str = Field(..., description="Currency symbol")
    available_currencies: list[dict] = Field(default_factory=list, description="List of available currencies")

    class Config:
        from_attributes = True


class AgencySettingsUpdate(BaseModel):
    """Schema for updating agency settings"""
    primary_currency: str = Field(..., description="Primary currency code (USD, COP, ARS, EUR)")
