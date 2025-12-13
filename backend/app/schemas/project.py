"""
Pydantic schemas for Projects
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base schema for projects"""
    name: str = Field(..., description="Project name", min_length=1)
    client_name: str = Field(..., description="Client name", min_length=1)
    client_email: Optional[str] = Field(None, description="Client email")
    currency: str = Field("USD", description="Currency code (USD, COP, ARS, EUR)")
    tax_ids: Optional[List[int]] = Field(default_factory=list, description="List of tax IDs to apply")


class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1)
    client_name: Optional[str] = Field(None, min_length=1)
    client_email: Optional[str] = None
    status: Optional[str] = None
    currency: Optional[str] = None
    tax_ids: Optional[List[int]] = Field(None, description="List of tax IDs to apply")


class ProjectResponse(ProjectBase):
    """Schema for project response"""
    id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[int] = None
    deleted_by_name: Optional[str] = None
    deleted_by_email: Optional[str] = None
    taxes: Optional[List[dict]] = Field(default_factory=list, description="Applied taxes")

    class Config:
        from_attributes = True


class QuoteResponse(BaseModel):
    """Schema for quote response (without items)"""
    id: int
    project_id: int
    version: int
    total_internal_cost: Optional[float] = None
    total_client_price: Optional[float] = None
    margin_percentage: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema for list of projects"""
    items: list[ProjectResponse]
    total: int
    page: int = 1
    page_size: int = 20
    total_pages: int = 1


class QuoteItemCreate(BaseModel):
    """Schema for creating a quote item"""
    service_id: int = Field(..., description="Service ID", gt=0)
    estimated_hours: float = Field(..., description="Estimated hours", gt=0)


class QuoteItemResponse(BaseModel):
    """Schema for quote item response"""
    id: int
    service_id: int
    service_name: Optional[str] = None
    estimated_hours: float
    internal_cost: Optional[float] = None
    client_price: Optional[float] = None
    margin_percentage: Optional[float] = None

    class Config:
        from_attributes = True


class ProjectCreateWithQuote(ProjectCreate):
    """Schema for creating a project with initial quote"""
    quote_items: List[QuoteItemCreate] = Field(..., description="List of quote items", min_items=1)


class QuoteResponseWithItems(QuoteResponse):
    """Schema for quote response with items"""
    items: List[QuoteItemResponse] = Field(default_factory=list)


class QuoteUpdate(BaseModel):
    """Schema for updating a quote"""
    items: List[QuoteItemCreate] = Field(..., description="List of quote items", min_items=1)
    notes: Optional[str] = Field(None, description="Notes for the quote")


class QuoteCreateNewVersion(BaseModel):
    """Schema for creating a new version of a quote"""
    items: List[QuoteItemCreate] = Field(..., description="List of quote items", min_items=1)
    notes: Optional[str] = Field(None, description="Notes for the new version")
