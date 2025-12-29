"""
Integration tests for project endpoints
"""
import pytest
from httpx import AsyncClient
from app.core.security import create_access_token
from app.models.user import User
from app.models.project import Project


@pytest.mark.integration
class TestProjectEndpoints:
    """Integration tests for project endpoints"""
    
    async def test_create_project_success(
        self,
        async_client: AsyncClient,
        test_admin_user: User,
        test_service,
        test_settings,
        test_team_member
    ):
        """Test successful project creation"""
        token = create_access_token({
            "sub": str(test_admin_user.id),
            "email": test_admin_user.email
        })
        
        response = await async_client.post(
            "/api/v1/projects/",
            json={
                "name": "Test Project",
                "client_name": "Test Client",
                "client_email": "client@example.com",
                "currency": "USD",
                "quote_items": [
                    {
                        "service_id": test_service.id,
                        "estimated_hours": 20.0
                    }
                ],
                "tax_ids": []
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Project"
        assert data["client_name"] == "Test Client"
        assert data["currency"] == "USD"
        assert "quotes" in data
        assert len(data["quotes"]) == 1
        quote = data["quotes"][0]
        assert "items" in quote
        assert len(quote["items"]) == 1
    
    async def test_create_project_no_permission(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_service,
        test_settings,
        test_team_member
    ):
        """Test project creation without permission (product_manager)"""
        token = create_access_token({
            "sub": str(test_user.id),
            "email": test_user.email
        })
        
        response = await async_client.post(
            "/api/v1/projects/",
            json={
                "name": "Test Project",
                "client_name": "Test Client",
                "client_email": "client@example.com",
                "currency": "USD",
                "quote_items": [
                    {
                        "service_id": test_service.id,
                        "estimated_hours": 20.0
                    }
                ],
                "tax_ids": []
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Product manager should not be able to create projects
        assert response.status_code in [403, 401]
    
    async def test_create_project_invalid_service(
        self,
        async_client: AsyncClient,
        test_admin_user: User,
        test_settings,
        test_team_member
    ):
        """Test project creation with invalid service"""
        token = create_access_token({
            "sub": str(test_admin_user.id),
            "email": test_admin_user.email
        })
        
        response = await async_client.post(
            "/api/v1/projects/",
            json={
                "name": "Test Project",
                "client_name": "Test Client",
                "client_email": "client@example.com",
                "currency": "USD",
                "quote_items": [
                    {
                        "service_id": 99999,
                        "estimated_hours": 20.0
                    }
                ],
                "tax_ids": []
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower() or "inactive" in data["detail"].lower()












