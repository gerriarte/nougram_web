"""
Schemas for AI-powered configuration assistance
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

from app.schemas.team import TeamMemberCreate
from app.schemas.service import ServiceCreate
from app.schemas.cost import CostFixedCreate


class OnboardingSuggestionRequest(BaseModel):
    """Request for AI-powered onboarding suggestions"""
    industry: str = Field(..., description="Industry type (e.g., 'Marketing Digital', 'Desarrollo Web')")
    region: str = Field(default="US", description="Region code (e.g., 'US', 'CO', 'MX')")
    currency: str = Field(default="USD", description="Primary currency")
    custom_context: Optional[str] = Field(None, description="Additional context about the business")


class OnboardingSuggestionResponse(BaseModel):
    """Response with AI-generated onboarding suggestions"""
    suggested_roles: List[TeamMemberCreate] = Field(default_factory=list, description="Suggested team members")
    suggested_services: List[ServiceCreate] = Field(default_factory=list, description="Suggested services")
    suggested_fixed_costs: List[CostFixedCreate] = Field(default_factory=list, description="Suggested fixed costs")
    confidence_scores: Dict[str, float] = Field(default_factory=dict, description="Confidence scores for each suggestion category")
    reasoning: Optional[str] = Field(None, description="AI reasoning for the suggestions")


class DocumentParseRequest(BaseModel):
    """Request for parsing unstructured document data"""
    text: str = Field(..., description="Text content from document (PDF, CSV, etc.)")
    document_type: Optional[str] = Field(None, description="Type of document: 'payroll', 'expenses', 'mixed'")


class DocumentParseResponse(BaseModel):
    """Response with parsed structured data from document"""
    team_members: List[TeamMemberCreate] = Field(default_factory=list, description="Extracted team members")
    fixed_costs: List[CostFixedCreate] = Field(default_factory=list, description="Extracted fixed costs")
    subscriptions: List[Dict] = Field(default_factory=list, description="Extracted subscriptions")
    confidence_scores: Dict[str, float] = Field(default_factory=dict, description="Confidence scores for extracted data")
    warnings: List[str] = Field(default_factory=list, description="Warnings about parsing issues")


class NaturalLanguageCommandRequest(BaseModel):
    """Request for processing natural language configuration commands"""
    command: str = Field(..., description="Natural language command (e.g., 'Añade un Senior Designer que gana 45k anuales')")
    context: Optional[Dict] = Field(None, description="Current configuration context")


class NaturalLanguageCommandResponse(BaseModel):
    """Response with structured action from natural language command"""
    action_type: str = Field(..., description="Type of action: 'add_team_member', 'add_service', 'add_fixed_cost', etc.")
    action_data: Dict = Field(..., description="Structured data for the action")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score for the parsed command")
    requires_confirmation: bool = Field(default=True, description="Whether user confirmation is required")
    reasoning: Optional[str] = Field(None, description="AI reasoning for the parsed command")

