"""
Pydantic schemas for delete requests
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class DeleteRequestBase(BaseModel):
    """Base schema for delete requests"""
    resource_type: str = Field(..., description="Type of resource to delete")
    resource_id: int = Field(..., description="ID of resource to delete")


class DeleteRequestCreate(DeleteRequestBase):
    """Schema for creating a delete request"""
    pass


class DeleteRequestResponse(BaseModel):
    """Schema for delete request response"""
    id: int
    resource_type: str
    resource_id: int
    requested_by_id: int
    requested_at: datetime
    status: str  # Use string instead of enum to avoid .value issues
    approved_by_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Additional fields from relationships
    requested_by_name: Optional[str] = None
    requested_by_email: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_by_email: Optional[str] = None
    
    class Config:
        from_attributes = True


class DeleteRequestListResponse(BaseModel):
    """Schema for list of delete requests"""
    items: list[DeleteRequestResponse]
    total: int


class DeleteRequestApprovalRequest(BaseModel):
    """Schema for approving/rejecting a delete request"""
    reason: Optional[str] = Field(None, description="Reason for rejection (if rejecting)")

