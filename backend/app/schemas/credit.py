"""
Pydantic schemas for credit system
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CreditBalanceResponse(BaseModel):
    """Credit balance information"""
    organization_id: int
    credits_available: int
    credits_used_total: int
    credits_used_this_month: int
    credits_per_month: Optional[int] = None  # None means unlimited
    manual_credits_bonus: int
    last_reset_at: Optional[str] = None  # ISO datetime string
    next_reset_at: Optional[str] = None  # ISO datetime string
    is_unlimited: bool


class CreditTransactionResponse(BaseModel):
    """Credit transaction record"""
    id: int
    organization_id: int
    transaction_type: str  # subscription_grant, manual_adjustment, consumption, refund
    amount: int  # Positive = added, negative = consumed
    reason: Optional[str] = None
    reference_id: Optional[int] = None
    performed_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CreditTransactionListResponse(BaseModel):
    """List of credit transactions"""
    items: list[CreditTransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class GrantManualCreditsRequest(BaseModel):
    """Request to grant manual credits"""
    amount: int = Field(..., gt=0, description="Number of credits to grant (must be positive)")
    reason: str = Field(..., min_length=1, description="Reason for granting credits")


class ResetCreditsRequest(BaseModel):
    """Request to manually reset monthly credits (admin only)"""
    pass  # No additional fields needed






