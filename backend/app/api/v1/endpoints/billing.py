"""
Billing and subscription endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime
from datetime import timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import get_tenant_context, TenantContext
from app.core.stripe_service import stripe_service
from app.core.logging import get_logger
from app.models.user import User
from app.models.subscription import Subscription
from app.repositories.factory import RepositoryFactory
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.billing import (
    CheckoutSessionCreate,
    CheckoutSessionResponse,
    SubscriptionResponse,
    SubscriptionUpdate,
    SubscriptionCancel,
    PlansListResponse,
    PlanInfo,
)

logger = get_logger(__name__)
router = APIRouter()


@router.post("/checkout-session", response_model=CheckoutSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_checkout_session(
    checkout_data: CheckoutSessionCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe checkout session for subscription
    
    Only organization owners/admins can create checkout sessions
    """
    # Get price ID for the plan
    price_id = stripe_service.get_price_id(checkout_data.plan, checkout_data.interval)
    
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Price ID not configured for plan {checkout_data.plan} with interval {checkout_data.interval}"
        )
    
    # Get organization
    org_repo = RepositoryFactory.create_organization_repository(db)
    organization = await org_repo.get_by_id(tenant.organization_id)
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Get or create Stripe customer
    customer_id = None
    subscription_repo = RepositoryFactory.create_subscription_repository(db)
    existing_subscription = await subscription_repo.get_latest_subscription(tenant.organization_id)
    
    if existing_subscription and existing_subscription.stripe_customer_id:
        customer_id = existing_subscription.stripe_customer_id
    else:
        # Create new customer in Stripe
        customer = stripe_service.create_customer(
            email=current_user.email,
            name=organization.name,
            organization_id=tenant.organization_id
        )
        customer_id = customer.id
    
    # Create checkout session
    try:
        session = stripe_service.create_checkout_session(
            customer_id=customer_id,
            price_id=price_id,
            success_url=checkout_data.success_url,
            cancel_url=checkout_data.cancel_url,
            organization_id=tenant.organization_id,
            mode="subscription",
            metadata={
                "plan": checkout_data.plan,
                "interval": checkout_data.interval
            }
        )
        
        logger.info(
            f"Created checkout session {session.id} for organization {tenant.organization_id}",
            extra={"organization_id": tenant.organization_id, "plan": checkout_data.plan}
        )
        
        return CheckoutSessionResponse(
            session_id=session.id,
            url=session.url
        )
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current subscription for the organization
    """
    subscription_repo = RepositoryFactory.create_subscription_repository(db)
    subscription = await subscription_repo.get_active_subscription(tenant.organization_id)
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    return SubscriptionResponse.model_validate(subscription)


@router.put("/subscription", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_data: SubscriptionUpdate,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update subscription (change plan or cancel at period end)
    
    Only organization owners/admins can update subscriptions
    """
    subscription_repo = RepositoryFactory.create_subscription_repository(db)
    subscription = await subscription_repo.get_active_subscription(tenant.organization_id)
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    if not subscription.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription is not linked to Stripe"
        )
    
    try:
        # Update in Stripe
        price_id = None
        if subscription_data.plan:
            price_id = stripe_service.get_price_id(
                subscription_data.plan,
                subscription_data.interval or "month"
            )
            if not price_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Price ID not configured for plan {subscription_data.plan}"
                )
        
        updated_stripe_subscription = stripe_service.update_subscription(
            subscription_id=subscription.stripe_subscription_id,
            price_id=price_id,
            cancel_at_period_end=subscription_data.cancel_at_period_end
        )
        
        # Sync with database
        subscription.plan = updated_stripe_subscription.plan.id if subscription_data.plan else subscription.plan
        subscription.status = updated_stripe_subscription.status
        subscription.current_period_start = datetime.fromtimestamp(
            updated_stripe_subscription.current_period_start, tz=timezone.utc
        )
        subscription.current_period_end = datetime.fromtimestamp(
            updated_stripe_subscription.current_period_end, tz=timezone.utc
        )
        subscription.cancel_at_period_end = updated_stripe_subscription.cancel_at_period_end
        
        if subscription_data.plan and price_id:
            subscription.stripe_price_id = price_id
        
        await db.commit()
        await db.refresh(subscription)
        
        logger.info(
            f"Updated subscription {subscription.id} for organization {tenant.organization_id}",
            extra={"organization_id": tenant.organization_id, "plan": subscription.plan}
        )
        
        return SubscriptionResponse.model_validate(subscription)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update subscription: {str(e)}"
        )


@router.post("/subscription/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    cancel_data: SubscriptionCancel,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel subscription (immediately or at period end)
    
    Only organization owners/admins can cancel subscriptions
    """
    subscription_repo = RepositoryFactory.create_subscription_repository(db)
    subscription = await subscription_repo.get_active_subscription(tenant.organization_id)
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    if not subscription.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription is not linked to Stripe"
        )
    
    try:
        # Cancel in Stripe
        updated_stripe_subscription = stripe_service.cancel_subscription(
            subscription_id=subscription.stripe_subscription_id,
            cancel_at_period_end=not cancel_data.cancel_immediately
        )
        
        # Sync with database
        if cancel_data.cancel_immediately:
            subscription.status = "cancelled"
            subscription.canceled_at = datetime.utcnow()
        else:
            subscription.status = updated_stripe_subscription.status
            subscription.cancel_at_period_end = True
        
        await db.commit()
        await db.refresh(subscription)
        
        logger.info(
            f"Cancelled subscription {subscription.id} for organization {tenant.organization_id}",
            extra={"organization_id": tenant.organization_id, "immediate": cancel_data.cancel_immediately}
        )
        
        return SubscriptionResponse.model_validate(subscription)
        
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel subscription: {str(e)}"
        )


@router.get("/plans", response_model=PlansListResponse)
async def list_plans(
    current_user: User = Depends(get_current_user)
):
    """
    List available subscription plans
    """
    from app.core.plan_limits import PLAN_INFO
    
    plans = []
    for plan_key, plan_data in PLAN_INFO.items():
        plans.append(PlanInfo(
            name=plan_key,
            display_name=plan_data.get("display_name", plan_key.title()),
            description=plan_data.get("description", ""),
            monthly_price=plan_data.get("monthly_price"),
            yearly_price=plan_data.get("yearly_price"),
            features=plan_data.get("features", []),
            limits=plan_data.get("limits", {})
        ))
    
    return PlansListResponse(plans=plans)


