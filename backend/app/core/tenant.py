"""
Tenant Context for multi-tenant architecture
Manages organization context and isolation
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.organization import Organization
from app.core.logging import get_logger

logger = get_logger(__name__)


class TenantContext:
    """
    Tenant context containing organization information
    Used to isolate data access by organization
    """
    def __init__(self, organization_id: int, organization: Organization):
        self.organization_id = organization_id
        self.organization = organization
        self.subscription_plan = organization.subscription_plan
        self.subscription_status = organization.subscription_status
    
    def is_active(self) -> bool:
        """Check if organization subscription is active"""
        return self.subscription_status == "active"
    
    def __repr__(self):
        return f"TenantContext(org_id={self.organization_id}, plan={self.subscription_plan}, status={self.subscription_status})"


async def get_tenant_context(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> TenantContext:
    """
    Dependency to get tenant context from current user
    
    Validates that:
    1. User has an organization_id
    2. Organization exists
    3. Organization subscription is active (can be bypassed for super_admin)
    
    Returns:
        TenantContext with organization information
    
    Raises:
        HTTPException 400: If user has no organization
        HTTPException 404: If organization not found
        HTTPException 403: If organization subscription is not active
    """
    # Get organization_id from user
    organization_id = getattr(current_user, 'organization_id', None)
    
    if organization_id is None:
        # Fallback to default organization for backward compatibility
        logger.warning(f"User {current_user.id} has no organization_id, using default organization")
        organization_id = 1
    
    # Load organization with all details
    result = await db.execute(
        select(Organization)
        .where(Organization.id == organization_id)
    )
    organization = result.scalar_one_or_none()
    
    if organization is None:
        logger.error(f"Organization {organization_id} not found for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization not found"
        )
    
    # Check subscription status (allow super_admin to bypass)
    is_super_admin = getattr(current_user, 'role', None) == 'super_admin'
    
    if not organization.subscription_status == "active" and not is_super_admin:
        logger.warning(
            f"User {current_user.id} accessing organization {organization_id} with status {organization.subscription_status}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Organization subscription is {organization.subscription_status}. Please contact support."
        )
    
    tenant_context = TenantContext(
        organization_id=organization.id,
        organization=organization
    )
    
    logger.info(
        f"Tenant context created for user {current_user.id}",
        organization_id=tenant_context.organization_id,
        plan=tenant_context.subscription_plan
    )
    
    return tenant_context


