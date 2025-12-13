"""
Main API router for v1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, costs, team, services, quotes, projects, insights, integrations, settings, taxes, maintenance, delete_requests, users, ai

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(costs.router, prefix="/settings", tags=["costs"])
api_router.include_router(team.router, prefix="/settings", tags=["team"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(taxes.router, prefix="/taxes", tags=["taxes"])
api_router.include_router(maintenance.router, prefix="", tags=["maintenance"])
api_router.include_router(delete_requests.router, prefix="/delete-requests", tags=["delete-requests"])
api_router.include_router(users.router, prefix="", tags=["users"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
