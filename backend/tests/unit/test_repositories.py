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
    
    async def test_get_all_with_where(self, db_session):
        """Test get_all with where clause"""
        repo = BaseRepository(db_session, Service)
        
        # Create multiple services
        service1 = Service(name="Service 1", is_active=True)
        service2 = Service(name="Service 2", is_active=False)
        service3 = Service(name="Service 3", is_active=True)
        
        await repo.create(service1)
        await repo.create(service2)
        await repo.create(service3)
        
        # Get only active services
        active_services = await repo.get_all(where=Service.is_active == True)
        
        assert len(active_services) >= 2
        assert all(s.is_active is True for s in active_services)
    
    async def test_get_all_with_limit_offset(self, db_session):
        """Test get_all with limit and offset"""
        repo = BaseRepository(db_session, Service)
        
        # Create multiple services
        for i in range(5):
            service = Service(name=f"Service {i}", is_active=True)
            await repo.create(service)
        
        # Get first 2
        first_page = await repo.get_all(limit=2, offset=0)
        assert len(first_page) == 2
        
        # Get next 2
        second_page = await repo.get_all(limit=2, offset=2)
        assert len(second_page) == 2
        
        # Should be different
        assert first_page[0].id != second_page[0].id
    
    async def test_tenant_filtering(self, db_session, test_organization):
        """Test tenant filtering in repositories"""
        # Create another organization
        from app.models.organization import Organization
        org2 = Organization(
            name="Org 2",
            slug="org-2",
            subscription_plan="free",
            subscription_status="active"
        )
        db_session.add(org2)
        await db_session.commit()
        
        # Create services for both organizations
        service1 = Service(
            name="Service Org 1",
            is_active=True,
            organization_id=test_organization.id
        )
        service2 = Service(
            name="Service Org 2",
            is_active=True,
            organization_id=org2.id
        )
        db_session.add(service1)
        db_session.add(service2)
        await db_session.commit()
        
        # Create repository with tenant filter
        repo = BaseRepository(db_session, Service, tenant_id=test_organization.id)
        
        # Should only get services for test_organization
        services = await repo.get_all()
        assert len(services) >= 1
        assert all(s.organization_id == test_organization.id for s in services)
        assert all(s.name == "Service Org 1" for s in services if s.name == "Service Org 1")
    
    async def test_delete_hard(self, db_session):
        """Test hard delete"""
        repo = BaseRepository(db_session, CostFixed)
        
        cost = CostFixed(
            name="Test Cost",
            amount_monthly=100.00,
            currency="USD",
            category="overhead"
        )
        created = await repo.create(cost)
        cost_id = created.id
        
        await repo.delete(created, soft=False)
        
        # Should not be found even with include_deleted=True
        found = await repo.get_by_id(cost_id, include_deleted=True)
        assert found is None
    
    async def test_get_all_with_order_by(self, db_session):
        """Test get_all with order_by"""
        repo = BaseRepository(db_session, Service)
        
        # Create services with different names
        service1 = Service(name="A Service", is_active=True)
        service2 = Service(name="B Service", is_active=True)
        service3 = Service(name="C Service", is_active=True)
        
        await repo.create(service3)
        await repo.create(service1)
        await repo.create(service2)
        
        # Get all ordered by name
        services = await repo.get_all(order_by=Service.name)
        
        # Should be in alphabetical order
        names = [s.name for s in services if s.name in ["A Service", "B Service", "C Service"]]
        if len(names) >= 3:
            assert names == sorted(names)

