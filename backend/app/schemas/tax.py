"""
Pydantic schemas for Taxes
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class TaxBase(BaseModel):
    """Base schema for taxes"""
    name: str = Field(..., description="Tax name (e.g., IVA, Transaction Cost)", min_length=1)
    code: str = Field(..., description="Tax code (e.g., IVA_CO, TX_AR)", min_length=1)
    percentage: float = Field(..., description="Tax percentage (e.g., 19.0 for 19%)", ge=0, le=100)
    country: Optional[str] = Field(None, description="Country code (e.g., CO, AR, US)")
    description: Optional[str] = Field(None, description="Tax description")
    is_active: bool = Field(True, description="Whether the tax is active")


class TaxCreate(TaxBase):
    """Schema for creating a tax"""
    pass


class TaxUpdate(BaseModel):
    """Schema for updating a tax"""
    name: Optional[str] = Field(None, min_length=1)
    code: Optional[str] = Field(None, min_length=1)
    percentage: Optional[float] = Field(None, ge=0, le=100)
    country: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TaxResponse(TaxBase):
    """Schema for tax response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[int] = None
    deleted_by_name: Optional[str] = None
    deleted_by_email: Optional[str] = None

    class Config:
        from_attributes = True


class TaxListResponse(BaseModel):
    """Schema for list of taxes"""
    items: List[TaxResponse]
    total: int
    page: int = 1
    page_size: int = 20
    total_pages: int = 1



