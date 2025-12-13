"""
Pydantic schemas for Insights and AI
"""
from typing import Optional
from pydantic import BaseModel, Field


class AIAdvisorRequest(BaseModel):
    """Schema for AI advisor request"""
    question: str = Field(..., description="Question to ask the AI advisor")
    ai_provider: str = Field(default="openai", description="AI provider: 'openai' or 'gemini'")


class AIAdvisorResponse(BaseModel):
    """Schema for AI advisor response"""
    success: bool = Field(..., description="Whether the query was successful")
    answer: str = Field(..., description="AI advisor response")
    provider: Optional[str] = Field(None, description="AI provider used")

