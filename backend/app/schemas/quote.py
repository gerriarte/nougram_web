"""
Pydantic schemas for Quotes
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class QuoteItemBase(BaseModel):
    """Base schema for quote items"""
    service_id: int = Field(..., description="Service ID", gt=0)
    estimated_hours: float = Field(..., description="Estimated hours", gt=0)


class QuoteItemCreate(QuoteItemBase):
    """Schema for creating a quote item"""
    pass


class QuoteItemResponse(QuoteItemBase):
    """Schema for quote item response"""
    id: int
    service_name: Optional[str] = None
    internal_cost: Optional[float] = None
    client_price: Optional[float] = None
    margin_percentage: Optional[float] = None

    class Config:
        from_attributes = True


class QuoteCalculateRequest(BaseModel):
    """Schema for quote calculation request"""
    items: List[QuoteItemBase] = Field(..., description="List of quote items")
    tax_ids: Optional[List[int]] = Field(default_factory=list, description="List of tax IDs to apply")


class QuoteCalculateResponse(BaseModel):
    """Schema for quote calculation response"""
    total_internal_cost: float = Field(..., description="Total internal cost")
    total_client_price: float = Field(..., description="Total client price (before taxes)")
    total_taxes: float = Field(default=0.0, description="Total taxes amount")
    total_with_taxes: float = Field(default=0.0, description="Total client price with taxes")
    margin_percentage: float = Field(..., description="Margin percentage (0-1)")
    items: List[dict] = Field(default_factory=list, description="Calculated items")
    taxes: List[dict] = Field(default_factory=list, description="Applied taxes breakdown")


class CurrencyInfo(BaseModel):
    """Schema for currency information"""
    code: str = Field(..., description="Currency code")
    count: int = Field(..., description="Number of costs/team members using this currency")
    exchange_rate_to_primary: float = Field(..., description="Exchange rate to primary currency")
    total_amount: float = Field(..., description="Total amount in this currency")


class BlendedCostRateResponse(BaseModel):
    """Schema for blended cost rate response"""
    blended_cost_rate: float = Field(..., description="Blended cost rate per hour")
    total_monthly_costs: float = Field(..., description="Total monthly costs (normalized to primary currency)")
    total_monthly_hours: float = Field(..., description="Total monthly billable hours")
    active_team_members: int = Field(..., description="Number of active team members")
    primary_currency: str = Field(..., description="Primary currency code")
    currencies_used: List[CurrencyInfo] = Field(default_factory=list, description="List of currencies used in costs")
    exchange_rates_date: Optional[str] = Field(None, description="Date of exchange rates (ISO format)")


class QuoteEmailRequest(BaseModel):
    """Schema for sending quote by email"""
    to_email: str = Field(..., description="Recipient email address")
    subject: Optional[str] = Field(None, description="Email subject (optional, will be auto-generated if not provided)")
    message: Optional[str] = Field(None, description="Additional message to include in email body")
    cc: Optional[List[str]] = Field(default_factory=list, description="CC email addresses")
    bcc: Optional[List[str]] = Field(default_factory=list, description="BCC email addresses")
    include_pdf: bool = Field(True, description="Include PDF attachment")
    include_docx: bool = Field(False, description="Include DOCX attachment")


class QuoteEmailResponse(BaseModel):
    """Schema for quote email response"""
    success: bool = Field(..., description="Whether the email was sent successfully")
    message: str = Field(..., description="Response message")

