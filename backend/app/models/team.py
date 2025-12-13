"""
Team member models
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy import Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class TeamMember(Base):
    """
    Team member model with cost calculation
    """
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    salary_monthly_brute = Column(Float, nullable=False)
    currency = Column(String, default="USD", nullable=False)  # USD, COP, ARS, EUR
    billable_hours_per_week = Column(Integer, default=32)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Multi-tenant: organization relationship
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Relationships
    user = relationship("User", back_populates="team_member")

