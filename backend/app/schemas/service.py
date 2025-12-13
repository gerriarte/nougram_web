"""
Pydantic schemas for Services
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ServiceBase(BaseModel):
    """Base schema for services"""
    name: str = Field(..., description="Service name", min_length=1)
    description: Optional[str] = Field(None, description="Service description")
    default_margin_target: float = Field(0.40, description="Default profit margin target", ge=0, le=1)
    is_active: bool = Field(True, description="Whether the service is active")


class ServiceCreate(ServiceBase):
    """Schema for creating a service"""
    pass


class ServiceUpdate(BaseModel):
    """Schema for updating a service"""
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    default_margin_target: Optional[float] = Field(None, ge=0, le=1)
    is_active: Optional[bool] = None


class ServiceResponse(ServiceBase):
    """Schema for service response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[int] = None
    deleted_by_name: Optional[str] = None
    deleted_by_email: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceListResponse(BaseModel):
    """Schema for list of services"""
    items: list[ServiceResponse]
    total: int
    page: int = 1
    page_size: int = 20
    total_pages: int = 1

