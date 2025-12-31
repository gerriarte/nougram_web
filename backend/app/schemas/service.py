"""
Pydantic schemas for Services
ESTÁNDAR NOUGRAM: Campos monetarios y porcentajes usan Decimal serializado como string
"""
from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_serializer
from app.core.pydantic_config import DECIMAL_CONFIG


class ServiceBase(BaseModel):
    """Base schema for services (Sprint 14: supports multiple pricing types)
    ESTÁNDAR NOUGRAM: Campos monetarios y porcentajes usan Decimal para precisión
    """
    name: str = Field(..., description="Service name", min_length=1)
    description: Optional[str] = Field(None, description="Service description")
    default_margin_target: Decimal = Field(Decimal('0.40'), description="Default profit margin target", ge=0, le=1)
    is_active: bool = Field(True, description="Whether the service is active")
    pricing_type: Optional[str] = Field("hourly", description="Pricing type: 'hourly', 'fixed', 'recurring', 'project_value'")
    fixed_price: Optional[Decimal] = Field(None, description="Fixed price (for fixed pricing)", ge=0)
    is_recurring: Optional[bool] = Field(False, description="Whether service is recurring")
    billing_frequency: Optional[str] = Field(None, description="Billing frequency: 'monthly', 'annual' (for recurring)")
    recurring_price: Optional[Decimal] = Field(None, description="Recurring price (for recurring pricing)", ge=0)
    
    # ESTÁNDAR NOUGRAM: Serializar Decimal como string
    @field_serializer('default_margin_target', 'fixed_price', 'recurring_price')
    def serialize_decimal(self, value: Optional[Decimal]) -> Optional[str]:
        """Serializa Decimal como string para mantener precisión"""
        return str(value) if value is not None else None
    
    model_config = DECIMAL_CONFIG


class ServiceCreate(ServiceBase):
    """Schema for creating a service"""
    pass


class ServiceUpdate(BaseModel):
    """Schema for updating a service (Sprint 14: supports multiple pricing types)
    ESTÁNDAR NOUGRAM: Campos monetarios y porcentajes usan Decimal para precisión
    """
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    default_margin_target: Optional[Decimal] = Field(None, ge=0, le=1)
    is_active: Optional[bool] = None
    pricing_type: Optional[str] = Field(None, description="Pricing type: 'hourly', 'fixed', 'recurring', 'project_value'")
    fixed_price: Optional[Decimal] = Field(None, ge=0)
    is_recurring: Optional[bool] = None
    billing_frequency: Optional[str] = None
    recurring_price: Optional[Decimal] = Field(None, ge=0)
    
    # ESTÁNDAR NOUGRAM: Serializar Decimal como string
    @field_serializer('default_margin_target', 'fixed_price', 'recurring_price')
    def serialize_decimal(self, value: Optional[Decimal]) -> Optional[str]:
        """Serializa Decimal como string para mantener precisión"""
        return str(value) if value is not None else None
    
    model_config = DECIMAL_CONFIG


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

