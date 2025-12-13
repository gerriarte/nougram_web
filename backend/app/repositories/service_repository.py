"""
Repository for Service model
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from app.repositories.base import BaseRepository
from app.models.service import Service


class ServiceRepository(BaseRepository[Service]):
    """
    Repository for Service operations
    """
    
    def __init__(self, db: AsyncSession, tenant_id: Optional[int] = None):
        super().__init__(db, Service, tenant_id=tenant_id)
    
    async def get_all_active(
        self,
        include_deleted: bool = False
    ) -> List[Service]:
        """
        Get all active services (with tenant scoping)
        
        Args:
            include_deleted: Whether to include soft-deleted services
            
        Returns:
            List of Service instances
        """
        query = select(Service).where(Service.is_active == True)
        
        # Apply tenant filter
        query = self._apply_tenant_filter(query)
        
        if not include_deleted and hasattr(Service, 'deleted_at'):
            query = query.where(Service.deleted_at.is_(None))
        
        query = query.order_by(desc(Service.created_at))
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_name(
        self,
        name: str,
        include_deleted: bool = False
    ) -> Optional[Service]:
        """
        Get service by name (with tenant scoping)
        
        Args:
            name: Service name
            include_deleted: Whether to include soft-deleted services
            
        Returns:
            Service instance or None
        """
        query = select(Service).where(Service.name == name)
        
        # Apply tenant filter
        query = self._apply_tenant_filter(query)
        
        if not include_deleted and hasattr(Service, 'deleted_at'):
            query = query.where(Service.deleted_at.is_(None))
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

