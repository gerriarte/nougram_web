"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user, verify_password
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdate,
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def email_password_login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate using email and password stored in the database."""

    normalized_email = payload.email.strip().lower()

    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalar_one_or_none()

    if user is None or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    from app.core.permissions import get_user_role

    token_data_jwt = {
        "sub": str(user.id),
        "email": user.email,
        "name": user.full_name,
    }
    access_token = create_access_token(token_data_jwt)

    user_role = get_user_role(user)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user_role,
        },
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information
    """
    from app.core.permissions import get_user_role

    user_role = get_user_role(current_user)

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        has_calendar_connected=current_user.google_refresh_token is not None,
        role=user_role  # Explicit string
    )

@router.put("/me", response_model=UserResponse)
async def update_current_user_info(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile information."""

    current_user.full_name = payload.full_name
    await db.commit()
    await db.refresh(current_user)

    from app.core.permissions import get_user_role

    user_role = get_user_role(current_user)

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        has_calendar_connected=current_user.google_refresh_token is not None,
        role=user_role,
    )



