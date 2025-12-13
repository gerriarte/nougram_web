"""
Pydantic schemas for Fixed Costs
"""
from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field

CurrencyCode = Literal["USD", "COP", "ARS", "EUR"]


class CostFixedBase(BaseModel):
    """Base schema for fixed costs"""
    name: str = Field(..., description="Cost name", min_length=1)
    amount_monthly: float = Field(..., description="Monthly amount", gt=0)
    currency: CurrencyCode = Field("USD", description="Currency code (USD, COP, ARS, EUR)")
    category: str = Field(..., description="Cost category (e.g., 'Overhead', 'Software')")
    description: Optional[str] = Field(None, description="Cost description")


class CostFixedCreate(CostFixedBase):
    """Schema for creating a fixed cost"""
    pass


class CostFixedUpdate(BaseModel):
    """Schema for updating a fixed cost"""
    name: Optional[str] = Field(None, min_length=1)
    amount_monthly: Optional[float] = Field(None, gt=0)
    currency: Optional[CurrencyCode] = None
    category: Optional[str] = None
    description: Optional[str] = None


class CostFixedResponse(CostFixedBase):
    """Schema for fixed cost response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[int] = None
    deleted_by_name: Optional[str] = None
    deleted_by_email: Optional[str] = None

    class Config:
        from_attributes = True


class CostFixedListResponse(BaseModel):
    """Schema for list of fixed costs"""
    items: list[CostFixedResponse]
    total: int
    page: int = 1
    page_size: int = 20
    total_pages: int = 1

