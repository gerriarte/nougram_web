"""
Pydantic schemas for Team Members
"""
from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field

CurrencyCode = Literal["USD", "COP", "ARS", "EUR"]


class TeamMemberBase(BaseModel):
    """Base schema for team members"""
    name: str = Field(..., description="Team member name", min_length=1)
    role: str = Field(..., description="Team member role", min_length=1)
    salary_monthly_brute: float = Field(..., description="Monthly gross salary", gt=0)
    currency: CurrencyCode = Field("USD", description="Currency code (USD, COP, ARS, EUR)")
    billable_hours_per_week: int = Field(32, description="Billable hours per week", ge=0, le=80)
    is_active: Optional[bool] = Field(True, description="Whether the team member is active")
    user_id: Optional[int] = Field(None, description="Associated user ID")


class TeamMemberCreate(TeamMemberBase):
    """Schema for creating a team member"""
    pass


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member"""
    name: Optional[str] = Field(None, min_length=1)
    role: Optional[str] = Field(None, min_length=1)
    salary_monthly_brute: Optional[float] = Field(None, gt=0)
    currency: Optional[CurrencyCode] = None
    billable_hours_per_week: Optional[int] = Field(None, ge=0, le=40)
    is_active: Optional[bool] = None
    user_id: Optional[int] = None


class TeamMemberResponse(TeamMemberBase):
    """Schema for team member response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TeamMemberListResponse(BaseModel):
    """Schema for list of team members"""
    items: list[TeamMemberResponse]
    total: int
    page: int = 1
    page_size: int = 20
    total_pages: int = 1

