"""
Project and quote models
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, func, Table, Index
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from app.core.database import Base

# Association table for many-to-many relationship between Project and Tax
project_taxes = Table(
    "project_taxes",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("tax_id", Integer, ForeignKey("taxes.id"), primary_key=True),
)


class ProjectStatus(str, enum.Enum):
    """Project status enumeration"""
    DRAFT = "Draft"
    SENT = "Sent"
    WON = "Won"
    LOST = "Lost"


class Project(Base):
    """
    Project model
    """
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    client_email = Column(String, nullable=True)
    status = Column(String, default="Draft")
    currency = Column(String, default="USD")  # USD, COP, ARS, EUR
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Soft delete fields
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    deleted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Multi-tenant: organization relationship
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Relationships
    quotes = relationship("Quote", back_populates="project", cascade="all, delete-orphan")
    taxes = relationship("Tax", secondary="project_taxes", back_populates="projects")
    deleted_by = relationship("User", foreign_keys=[deleted_by_id])


class Quote(Base):
    """
    Quote model for projects
    """
    __tablename__ = "quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    version = Column(Integer, default=1)
    total_internal_cost = Column(Float, nullable=True)
    total_client_price = Column(Float, nullable=True)
    margin_percentage = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Sprint 16: Revision fields
    revisions_included = Column(Integer, default=2, nullable=False)  # Number of included revisions
    revision_cost_per_additional = Column(Float, nullable=True)  # Cost per additional revision
    
    # Relationships
    project = relationship("Project", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")
    expenses = relationship("QuoteExpense", back_populates="quote", cascade="all, delete-orphan")


class QuoteItem(Base):
    """
    Quote item model (individual service in a quote)
    """
    __tablename__ = "quote_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    estimated_hours = Column(Float, nullable=True)  # Nullable for fixed/recurring pricing
    internal_cost = Column(Float, nullable=True)
    client_price = Column(Float, nullable=True)
    margin_percentage = Column(Float, nullable=True)
    
    # Pricing type fields (Sprint 14) - Can override service pricing_type
    pricing_type = Column(String, nullable=True)  # Overrides service pricing_type: "hourly", "fixed", "recurring", "project_value"
    fixed_price = Column(Float, nullable=True)  # If pricing_type = "fixed"
    quantity = Column(Float, default=1.0)  # For modules/milestones (fixed pricing)
    
    # Relationships
    quote = relationship("Quote", back_populates="items")
    service = relationship("Service")


class QuoteExpense(Base):
    """
    Quote expense model (third-party costs, materials, licenses with markup)
    Sprint 15: Support for third-party expenses with markup for creative sectors
    """
    __tablename__ = "quote_expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    cost = Column(Float, nullable=False)  # Real cost
    markup_percentage = Column(Float, default=0.0, nullable=False)  # Mark-up (0.10 = 10%)
    client_price = Column(Float, nullable=False)  # cost * quantity * (1 + markup)
    category = Column(String, nullable=True)  # "Third Party", "Materials", "Licenses"
    quantity = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quote = relationship("Quote", back_populates="expenses")


