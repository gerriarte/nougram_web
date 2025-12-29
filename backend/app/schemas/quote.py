"""
Pydantic schemas for Quotes
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class QuoteItemBase(BaseModel):
    """Base schema for quote items (Sprint 14: supports multiple pricing types)"""
    service_id: int = Field(..., description="Service ID", gt=0)
    estimated_hours: Optional[float] = Field(None, description="Estimated hours (required for hourly pricing)", ge=0)
    pricing_type: Optional[str] = Field(None, description="Pricing type: 'hourly', 'fixed', 'recurring', 'project_value' (overrides service default)")
    fixed_price: Optional[float] = Field(None, description="Fixed price (required for fixed pricing)", ge=0)
    quantity: Optional[float] = Field(1.0, description="Quantity for fixed/recurring pricing", ge=0)
    recurring_price: Optional[float] = Field(None, description="Recurring price (required for recurring pricing)", ge=0)
    billing_frequency: Optional[str] = Field(None, description="Billing frequency: 'monthly', 'annual' (for recurring pricing)")
    project_value: Optional[float] = Field(None, description="Project value (for project_value pricing)", ge=0)


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


class QuoteExpenseBase(BaseModel):
    """Base schema for quote expenses (Sprint 15: third-party costs with markup)"""
    name: str = Field(..., description="Expense name", min_length=1)
    description: Optional[str] = Field(None, description="Expense description")
    cost: float = Field(..., description="Real cost", ge=0)
    markup_percentage: float = Field(0.0, description="Mark-up percentage (0.10 = 10%)", ge=0, le=10)
    category: Optional[str] = Field(None, description="Category: 'Third Party', 'Materials', 'Licenses'")
    quantity: float = Field(1.0, description="Quantity", ge=0)


class QuoteExpenseCreate(QuoteExpenseBase):
    """Schema for creating a quote expense"""
    pass


class QuoteExpenseResponse(QuoteExpenseBase):
    """Schema for quote expense response"""
    id: int
    quote_id: int
    client_price: float = Field(..., description="Client price (cost * quantity * (1 + markup))")
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class QuoteCalculateRequest(BaseModel):
    """Schema for quote calculation request (Sprint 16: includes expenses and revisions)"""
    items: List[QuoteItemBase] = Field(..., description="List of quote items")
    expenses: Optional[List[QuoteExpenseBase]] = Field(default_factory=list, description="List of quote expenses (third-party costs)")
    tax_ids: Optional[List[int]] = Field(default_factory=list, description="List of tax IDs to apply")
    revisions_included: Optional[int] = Field(default=2, description="Number of included revisions", ge=0)
    revision_cost_per_additional: Optional[float] = Field(None, description="Cost per additional revision", ge=0)
    revisions_count: Optional[int] = Field(None, description="Actual number of revisions requested (for calculation)", ge=0)


class QuoteCalculateResponse(BaseModel):
    """Schema for quote calculation response (Sprint 16: includes expenses and revisions breakdown)"""
    total_internal_cost: float = Field(..., description="Total internal cost (services + expenses cost)")
    total_client_price: float = Field(..., description="Total client price (before taxes)")
    total_expenses_cost: float = Field(default=0.0, description="Total expenses cost (before markup)")
    total_expenses_client_price: float = Field(default=0.0, description="Total expenses client price (with markup)")
    total_taxes: float = Field(default=0.0, description="Total taxes amount")
    total_with_taxes: float = Field(default=0.0, description="Total client price with taxes")
    margin_percentage: float = Field(..., description="Margin percentage (0-1)")
    items: List[dict] = Field(default_factory=list, description="Calculated items")
    expenses: List[dict] = Field(default_factory=list, description="Calculated expenses breakdown")
    taxes: List[dict] = Field(default_factory=list, description="Applied taxes breakdown")
    revisions_cost: float = Field(default=0.0, description="Additional cost for revisions beyond included count")
    revisions_included: int = Field(default=2, description="Number of included revisions")
    revisions_count: Optional[int] = Field(None, description="Actual number of revisions requested")


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

