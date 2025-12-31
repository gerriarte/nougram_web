"""
AI-powered financial analysis endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import get_tenant_context, TenantContext
from app.core.logging import get_logger
from app.core.error_codes import ErrorCode
from app.core.translations import translate_error
from app.models.user import User
from app.services.ai_service import ai_service
from app.schemas.ai import (
    OnboardingSuggestionRequest,
    OnboardingSuggestionResponse,
    DocumentParseRequest,
    DocumentParseResponse,
    NaturalLanguageCommandRequest,
    NaturalLanguageCommandResponse
)
from pydantic import BaseModel

logger = get_logger(__name__)
router = APIRouter()


class AIAnalysisRequest(BaseModel):
    """Request for AI analysis"""
    question: Optional[str] = None
    use_mock_data: bool = False  # Para testing sin datos reales


class AIAnalysisResponse(BaseModel):
    """Response from AI analysis"""
    success: bool
    analysis: Optional[str] = None
    error: Optional[str] = None
    usage: Optional[dict] = None
    context_summary: Optional[dict] = None


@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_financial_data(
    request: AIAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Analyze financial data with AI
    
    This is the main endpoint for AI-powered financial analysis.
    """
    
    # Check if AI service is available
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Please set OPENAI_API_KEY in environment variables."
        )
    
    try:
        # Build context with financial data
        if request.use_mock_data:
            context = _get_mock_financial_context()
        else:
            context = await _build_financial_context_safe(db, tenant.organization_id, tenant.organization)
        
        # Get AI analysis
        result = await ai_service.analyze_financial_data(
            context=context,
            question=request.question
        )
        
        if not result.get('success'):
            return AIAnalysisResponse(
                success=False,
                error=result.get('error', 'Unknown error')
            )
        
        return AIAnalysisResponse(
            success=True,
            analysis=result.get('analysis'),
            usage=result.get('usage'),
            context_summary={
                "projects_analyzed": len(context.get('projects', [])),
                "services_count": len(context.get('services', [])),
                "total_costs": context.get('total_monthly_costs'),
                "team_size": context.get('team_size')
            }
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during analysis: {str(e)}"
        )


@router.get("/status")
async def get_ai_status():
    """Check if AI service is available"""
    return {
        "available": ai_service.is_available(),
        "message": "AI service is ready" if ai_service.is_available() else "OPENAI_API_KEY not configured"
    }


@router.get("/demo")
async def demo_analysis(
    current_user: User = Depends(get_current_user)
):
    """
    Quick demo analysis with mock data (no database required)
    """
    
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Please set OPENAI_API_KEY in environment variables."
        )
    
    # Use mock data
    context = _get_mock_financial_context()
    
    # Get AI analysis
    result = await ai_service.analyze_financial_data(
        context=context,
        question="Dame un análisis completo de la salud financiera y 3 recomendaciones prioritarias"
    )
    
    if not result.get('success'):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get('error', 'Unknown error')
        )
    
    return {
        "success": True,
        "analysis": result.get('analysis'),
        "usage": result.get('usage'),
        "note": "Este análisis usa datos de ejemplo para demostración"
    }


@router.post("/suggest-config", response_model=OnboardingSuggestionResponse, summary="Get AI-powered onboarding suggestions")
async def suggest_onboarding_config(
    request: OnboardingSuggestionRequest,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI-powered suggestions for onboarding configuration based on industry, region, and currency.
    
    This endpoint uses OpenAI's Structured Outputs to generate:
    - Suggested team roles with realistic salaries for the region
    - Suggested services typical for the industry
    - Suggested fixed costs (software, tools, etc.)
    
    **Permissions:**
    - All authenticated users can request suggestions for their organization
    
    **Request Body:**
    - `industry`: Industry type (e.g., 'Marketing Digital', 'Desarrollo Web')
    - `region`: Region code (e.g., 'US', 'CO', 'MX') - defaults to 'US'
    - `currency`: Primary currency - defaults to 'USD'
    - `custom_context`: Optional additional context about the business
    
    **Returns:**
    - `200 OK`: Suggestions generated successfully
    - `503 Service Unavailable`: AI service not configured
    - `500 Internal Server Error`: Error processing request
    
    **Response includes:**
    - `suggested_roles`: List of suggested team members with salaries
    - `suggested_services`: List of suggested services with pricing models
    - `suggested_fixed_costs`: List of suggested fixed costs
    - `confidence_scores`: Confidence scores for each category
    - `reasoning`: AI reasoning for the suggestions
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=translate_error(ErrorCode.AI_SERVICE_UNAVAILABLE)
        )
    
    try:
        # Call AI service
        result = await ai_service.suggest_onboarding_data(
            industry=request.industry,
            region=request.region,
            currency=request.currency,
            custom_context=request.custom_context
        )
        
        if not result.get('success'):
            error_msg = result.get('error', 'Unknown error')
            logger.error(f"AI service error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=translate_error(ErrorCode.AI_PROCESSING_ERROR, detail=error_msg)
            )
        
        # Extract data from result
        data = result.get('data', {})
        
        # Validate and convert to Pydantic schema
        try:
            suggestion_response = OnboardingSuggestionResponse(
                suggested_roles=data.get('suggested_roles', []),
                suggested_services=data.get('suggested_services', []),
                suggested_fixed_costs=data.get('suggested_fixed_costs', []),
                confidence_scores=data.get('confidence_scores', {}),
                reasoning=data.get('reasoning')
            )
            
            logger.info(
                f"AI suggestions generated for industry={request.industry}, region={request.region}",
                extra={
                    "organization_id": tenant.organization_id,
                    "user_id": current_user.id,
                    "roles_count": len(suggestion_response.suggested_roles),
                    "services_count": len(suggestion_response.suggested_services),
                    "costs_count": len(suggestion_response.suggested_fixed_costs),
                    "usage": result.get('usage', {})
                }
            )
            
            return suggestion_response
            
        except Exception as validation_error:
            logger.error(f"Error validating AI response: {validation_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=translate_error(ErrorCode.AI_PROCESSING_ERROR, detail="Invalid response format from AI service")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in suggest_onboarding_config: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=translate_error(ErrorCode.UNKNOWN_ERROR)
        )


def _get_mock_financial_context() -> dict:
    """
    Generate mock financial data for testing/demo
    """
    return {
        'total_monthly_costs': 15000.00,
        'blended_cost_rate': 45.50,
        'team_size': 4,
        'total_monthly_hours': 550.0,
        'primary_currency': 'USD',
        'costs_by_currency': {
            'USD': 12000.00,
            'ARS': 3000.00
        },
        'services': [
            {
                'name': 'Desarrollo Frontend React',
                'default_margin_target': 0.40,
                'is_active': True
            },
            {
                'name': 'Desarrollo Backend Python',
                'default_margin_target': 0.45,
                'is_active': True
            },
            {
                'name': 'Diseño UI/UX',
                'default_margin_target': 0.35,
                'is_active': True
            },
            {
                'name': 'Consultoría DevOps',
                'default_margin_target': 0.50,
                'is_active': True
            }
        ],
        'projects': [
            {
                'name': 'Rediseño E-commerce',
                'client': 'TechStore Inc',
                'status': 'won',
                'total_price': 35000.00,
                'total_cost': 20000.00,
                'margin_percentage': 42.86,
                'created_at': '2024-10-15T10:00:00'
            },
            {
                'name': 'App Mobile Banking',
                'client': 'FinanceBank',
                'status': 'won',
                'total_price': 58000.00,
                'total_cost': 32000.00,
                'margin_percentage': 44.83,
                'created_at': '2024-10-20T14:30:00'
            },
            {
                'name': 'Portal B2B',
                'client': 'Logistics Corp',
                'status': 'in_progress',
                'total_price': 42000.00,
                'total_cost': 26000.00,
                'margin_percentage': 38.10,
                'created_at': '2024-11-01T09:00:00'
            },
            {
                'name': 'Sistema CRM',
                'client': 'Sales Solutions',
                'status': 'lost',
                'total_price': 28000.00,
                'total_cost': 18000.00,
                'margin_percentage': 35.71,
                'created_at': '2024-09-25T16:00:00'
            },
            {
                'name': 'Integración ERP',
                'client': 'Manufacturing Ltd',
                'status': 'won',
                'total_price': 65000.00,
                'total_cost': 38000.00,
                'margin_percentage': 41.54,
                'created_at': '2024-11-05T11:00:00'
            }
        ]
    }


async def _build_financial_context_safe(db: AsyncSession, organization_id: int, organization: "Organization" = None) -> dict:
    """
    Build financial context safely, with fallbacks for missing data
    Filter by organization_id for multi-tenancy.
    """
    from app.models.cost import CostFixed
    from app.models.team import TeamMember
    from app.models.service import Service
    from app.models.project import Project, Quote
    from app.models.settings import AgencySettings
    
    context = {}
    
    try:
        # 1. Get costs (safe)
        costs_result = await db.execute(
            select(CostFixed).where(
                CostFixed.deleted_at.is_(None),
                CostFixed.organization_id == organization_id
            )
        )
        costs = costs_result.scalars().all()
        
        if costs:
            total_costs = sum(getattr(cost, 'amount_monthly', 0) for cost in costs)
            context['total_monthly_costs'] = total_costs
            context['costs_count'] = len(costs)
        else:
            context['total_monthly_costs'] = 0
            context['costs_count'] = 0
    except Exception as e:
        print(f"Error loading costs: {e}")
        context['total_monthly_costs'] = 0
        context['costs_count'] = 0
    
    try:
        # 2. Get team (safe)
        team_result = await db.execute(
            select(TeamMember).where(
                TeamMember.is_active == True,
                TeamMember.organization_id == organization_id
            )
        )
        team_members = team_result.scalars().all()
        
        if team_members:
            # Calculate hours (billable_hours_per_week * 4.33)
            total_hours = sum(getattr(member, 'billable_hours_per_week', 0) * 4.33 for member in team_members)
            context['team_size'] = len(team_members)
            context['total_monthly_hours'] = round(total_hours, 2)
            
            # Blended rate
            if total_hours > 0 and context['total_monthly_costs'] > 0:
                context['blended_cost_rate'] = round(context['total_monthly_costs'] / total_hours, 2)
            else:
                context['blended_cost_rate'] = 0
        else:
            context['team_size'] = 0
            context['total_monthly_hours'] = 0
            context['blended_cost_rate'] = 0
    except Exception as e:
        print(f"Error loading team: {e}")
        context['team_size'] = 0
        context['total_monthly_hours'] = 0
        context['blended_cost_rate'] = 0
    
    try:
        # 3. Get services (safe)
        services_result = await db.execute(
            select(Service).where(
                Service.is_active == True,
                Service.deleted_at.is_(None),
                Service.organization_id == organization_id
            )
        )
        services = services_result.scalars().all()
        
        context['services'] = [
            {
                'name': getattr(service, 'name', 'Unknown'),
                'default_margin_target': getattr(service, 'default_margin_target', 0),
                'is_active': getattr(service, 'is_active', True)
            }
            for service in services
        ]
    except Exception as e:
        print(f"Error loading services: {e}")
        context['services'] = []
    
    try:
        # 4. Get projects (safe)
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        projects_result = await db.execute(
            select(Project).where(
                Project.created_at >= cutoff_date,
                Project.deleted_at.is_(None),
                Project.organization_id == organization_id
            ).order_by(Project.created_at.desc()).limit(10)
        )
        projects = projects_result.scalars().all()
        
        context['projects'] = []
        for project in projects:
            try:
                # Try to get latest quote
                quote_result = await db.execute(
                    select(Quote).where(
                        Quote.project_id == project.id
                    ).order_by(Quote.version.desc()).limit(1)
                )
                latest_quote = quote_result.scalar_one_or_none()
                
                if latest_quote:
                    total_price = getattr(latest_quote, 'total_client_price', 0) or 0
                    total_cost = getattr(latest_quote, 'total_internal_cost', 0) or 0
                    margin = getattr(latest_quote, 'margin_percentage', 0) or 0
                    
                    context['projects'].append({
                        'name': getattr(project, 'name', 'Unknown'),
                        'client': getattr(project, 'client_name', 'Unknown'),
                        'status': getattr(project, 'status', 'unknown'),
                        'total_price': float(total_price),
                        'total_cost': float(total_cost),
                        'margin_percentage': float(margin),
                        'created_at': project.created_at.isoformat() if project.created_at else None
                    })
            except Exception as e:
                print(f"Error processing project {project.id}: {e}")
                continue
    except Exception as e:
        print(f"Error loading projects: {e}")
        context['projects'] = []
    
        # 5. Get settings
        primary_currency = "USD"
        if organization and organization.settings:
            primary_currency = organization.settings.get('primary_currency', 'USD')
        else:
            # Fallback to general settings
            settings_result = await db.execute(select(AgencySettings))
            settings_obj = settings_result.scalar_one_or_none()
            primary_currency = getattr(settings_obj, 'primary_currency', 'USD') if settings_obj else 'USD'
        
        context['primary_currency'] = primary_currency
    
    # Si no hay datos suficientes, usar mock
    if context.get('team_size', 0) == 0 and len(context.get('projects', [])) == 0:
        print("No real data found, using mock data as fallback")
        return _get_mock_financial_context()
    
    return context
