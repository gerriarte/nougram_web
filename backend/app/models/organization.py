"""
Organization model for multi-tenant architecture
"""
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class Organization(Base):
    """
    Organization model for multi-tenant architecture
    Each organization is a separate tenant with isolated data
    """
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    
    # Subscription management
    subscription_plan = Column(String, default="free", nullable=False)  # free, starter, professional, enterprise
    subscription_status = Column(String, default="active", nullable=False)  # active, cancelled, past_due, trialing
    
    # Tenant-specific settings stored as JSONB (binary JSON, more efficient)
    settings = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="organization", lazy="dynamic")

