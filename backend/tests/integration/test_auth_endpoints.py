"""
Integration tests for authentication endpoints
"""
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash
from app.models.user import User


@pytest.mark.integration
class TestAuthEndpoints:
    """Integration tests for authentication endpoints"""
    
    async def test_login_success(self, async_client: AsyncClient, test_user: User):
        """Test successful login"""
        response = await async_client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["full_name"] == "Test User"
    
    async def test_login_invalid_email(self, async_client: AsyncClient):
        """Test login with invalid email"""
        response = await async_client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "inválidas" in data["detail"].lower() or "invalid" in data["detail"].lower()
    
    async def test_login_invalid_password(self, async_client: AsyncClient, test_user: User):
        """Test login with invalid password"""
        response = await async_client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "inválidas" in data["detail"].lower() or "invalid" in data["detail"].lower()
    
    async def test_get_current_user(self, async_client: AsyncClient, test_user: User):
        """Test getting current user info"""
        # Create access token
        token = create_access_token({"sub": str(test_user.id), "email": test_user.email})
        
        response = await async_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
    
    async def test_get_current_user_no_token(self, async_client: AsyncClient):
        """Test getting current user without token"""
        response = await async_client.get("/api/v1/auth/me")
        
        assert response.status_code == 401
    
    async def test_get_current_user_invalid_token(self, async_client: AsyncClient):
        """Test getting current user with invalid token"""
        response = await async_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401


