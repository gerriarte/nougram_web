"""
Common Pydantic schemas
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TimestampMixin(BaseModel):
    """Common timestamp fields"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ResponseBase(BaseModel):
    """Base response model"""
    success: bool = True
    message: Optional[str] = None


class ErrorResponse(ResponseBase):
    """Error response model"""
    success: bool = False
    error: str
    detail: Optional[str] = None


class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")
    
    @property
    def offset(self) -> int:
        """Calculate offset from page and page_size"""
        return (self.page - 1) * self.page_size
    
    @property
    def limit(self) -> int:
        """Get limit (same as page_size)"""
        return self.page_size



