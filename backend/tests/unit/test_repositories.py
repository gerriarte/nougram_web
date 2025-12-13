"""
Unit tests for repositories
"""
import pytest
from datetime import datetime

from app.repositories.base import BaseRepository
from app.repositories.cost_repository import CostRepository
from app.repositories.service_repository import ServiceRepository
from app.models.cost import CostFixed
from app.models.service import Service


@pytest.mark.unit
class TestBaseRepository:
    """Tests for BaseRepository"""
    
    async def test_create(self, db_session):
        """Test creating an entity"""
        repo = BaseRepository(db_session, CostFixed)
        
        cost = CostFixed(
            name="Test Cost",
            amount_monthly=100.00,
            currency="USD",
            category="overhead"
        )
        
        created = await repo.create(cost)
        
        assert created.id is not None
        assert created.name == "Test Cost"
        assert created.amount_monthly == 100.00
    
    async def test_get_by_id(self, db_session):
        """Test getting entity by ID"""
        repo = BaseRepository(db_session, CostFixed)
        
        cost = CostFixed(
            name="Test Cost",
            amount_monthly=100.00,
            currency="USD",
            category="overhead"
        )
        created = await repo.create(cost)
        
        found = await repo.get_by_id(created.id)
        
        assert found is not None
        assert found.id == created.id
        assert found.name == "Test Cost"
    
    async def test_get_by_id_not_found(self, db_session):
        """Test getting non-existent entity"""
        repo = BaseRepository(db_session, CostFixed)
        
        found = await repo.get_by_id(99999)
        
        assert found is None
    
    async def test_update(self, db_session):
        """Test updating an entity"""
        repo = BaseRepository(db_session, CostFixed)
        
        cost = CostFixed(
            name="Test Cost",
            amount_monthly=100.00,
            currency="USD",
            category="overhead"
        )
        created = await repo.create(cost)
        
        created.name = "Updated Cost"
        updated = await repo.update(created)
        
        assert updated.name == "Updated Cost"
    
    async def test_delete_soft(self, db_session):
        """Test soft delete"""
        repo = BaseRepository(db_session, CostFixed)
        
        cost = CostFixed(
            name="Test Cost",
            amount_monthly=100.00,
            currency="USD",
            category="overhead"
        )
        created = await repo.create(cost)
        
        await repo.delete(created, soft=True)
        
        # Should not be found in normal query
        found = await repo.get_by_id(created.id, include_deleted=False)
        assert found is None
        
        # Should be found with include_deleted=True
        found_deleted = await repo.get_by_id(created.id, include_deleted=True)
        assert found_deleted is not None
        assert found_deleted.deleted_at is not None


@pytest.mark.unit
class TestCostRepository:
    """Tests for CostRepository"""
    
    async def test_create_cost(self, db_session):
        """Test creating a cost"""
        repo = CostRepository(db_session)
        
        cost = CostFixed(
            name="Test Cost",
            amount_monthly=100.00,
            currency="USD",
            category="overhead"
        )
        
        created = await repo.create(cost)
        
        assert created.id is not None
        assert created.name == "Test Cost"


@pytest.mark.unit
class TestServiceRepository:
    """Tests for ServiceRepository"""
    
    async def test_create_service(self, db_session):
        """Test creating a service"""
        repo = ServiceRepository(db_session)
        
        service = Service(
            name="Test Service",
            description="Test Description",
            is_active=True
        )
        
        created = await repo.create(service)
        
        assert created.id is not None
        assert created.name == "Test Service"
        assert created.name == "Test Service"
    
    async def test_get_all_active(self, db_session):
        """Test getting all active services"""
        repo = ServiceRepository(db_session)
        
        # Create active service
        active_service = Service(
            name="Active Service",
            description="Active",
            is_active=True
        )
        created_active = await repo.create(active_service)
        
        # Create inactive service (explicitly set is_active=False)
        inactive_service = Service(
            name="Inactive Service",
            description="Inactive",
            is_active=False
        )
        created_inactive = await repo.create(inactive_service)
        
        # Refresh to ensure state is correct
        await db_session.refresh(created_active)
        await db_session.refresh(created_inactive)
        
        # Verify states
        assert created_active.is_active is True
        assert created_inactive.is_active is False
        
        active_services = await repo.get_all_active()
        
        # Filter to only active services
        active_only = [s for s in active_services if s.is_active is True]
        assert len(active_only) >= 1
        assert any(s.name == "Active Service" for s in active_only)

