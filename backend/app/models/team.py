"""
Team member models
ESTÁNDAR NOUGRAM: Campos monetarios y porcentajes usan Numeric para precisión grado bancario
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Numeric
from sqlalchemy import Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base
from app.models.organization import FlexibleJSON


class TeamMember(Base):
    """
    Team member model with cost calculation
    ESTÁNDAR NOUGRAM: Campos monetarios y porcentajes usan Numeric para precisión
    """
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    salary_monthly_brute = Column(Numeric(precision=19, scale=4), nullable=False)  # ESTÁNDAR NOUGRAM: Numeric
    currency = Column(String, default="USD", nullable=False)  # USD, COP, ARS, EUR
    billable_hours_per_week = Column(Integer, default=32)
    non_billable_hours_percentage = Column(Numeric(precision=10, scale=4), default=0.0)  # ESTÁNDAR NOUGRAM: Numeric - Percentage of time for admin/compliance (e.g., 0.20 = 20%)
    non_billable_hours_breakdown = Column(FlexibleJSON, nullable=True)  # Detailed breakdown of non-billable hours for efficiency audits: {"meetings": 5, "administration": 3, "training": 2, "other": 2}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Multi-tenant: organization relationship
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Relationships
    user = relationship("User", back_populates="team_member")

