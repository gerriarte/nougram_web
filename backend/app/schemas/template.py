"""
Pydantic schemas for Industry Templates
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class SuggestedRole(BaseModel):
    """Schema for suggested role in template"""
    name: str
    monthly_cost: float = Field(..., description="Monthly cost in USD")
    weekly_hours: int = Field(default=40, ge=1, le=168)
    seniority: Optional[str] = Field(None, description="junior, middle, senior")


class SuggestedService(BaseModel):
    """Schema for suggested service in template"""
    name: str
    default_hourly_rate: Optional[float] = Field(None, description="Default hourly rate in USD")
    category: str
    description: Optional[str] = None


class SuggestedCost(BaseModel):
    """Schema for suggested fixed cost in template"""
    name: str
    amount: float = Field(..., description="Monthly amount in USD")
    category: str
    description: Optional[str] = None
    adjust_by_region: bool = Field(default=False, description="Whether to adjust by region multiplier")


class IndustryTemplateResponse(BaseModel):
    """Schema for industry template response"""
    id: int
    industry_type: str
    name: str
    description: Optional[str]
    suggested_roles: Optional[List[Dict[str, Any]]]
    suggested_services: Optional[List[Dict[str, Any]]]
    suggested_fixed_costs: Optional[List[Dict[str, Any]]]
    is_active: bool
    icon: Optional[str]
    color: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class IndustryTemplateListResponse(BaseModel):
    """Schema for list of templates"""
    items: List[IndustryTemplateResponse]
    total: int


class ApplyTemplateRequest(BaseModel):
    """Schema for applying a template to an organization"""
    industry_type: str = Field(..., description="Type of industry template to apply")
    region: str = Field(default="US", description="Region code for salary adjustment")
    currency: str = Field(default="USD", description="Currency code")
    customize: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional customization data to override template defaults"
    )


class ApplyTemplateResponse(BaseModel):
    """Schema for template application response"""
    success: bool
    message: str
    template_applied: str
    region: str
    multiplier: float
    currency: str
    team_members_created: int
    services_created: int
    costs_created: int
    created_items: List[Dict[str, Any]]













