"""
Cost models for fixed costs and overhead
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class CostFixed(Base):
    """
    Fixed cost model (overhead, subscriptions, etc.)
    """
    __tablename__ = "costs_fixed"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    amount_monthly = Column(Float, nullable=False)
    currency = Column(String, default="USD", nullable=False)  # USD, COP, ARS, EUR
    category = Column(String, nullable=False)  # 'Overhead', 'Software', etc.
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Soft delete fields
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    deleted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Multi-tenant: organization relationship
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Relationships
    deleted_by = relationship("User", foreign_keys=[deleted_by_id])


