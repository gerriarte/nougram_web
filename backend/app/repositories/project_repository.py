"""
Repository for Project, Quote, and QuoteItem models
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.project import Project, Quote, QuoteItem


class ProjectRepository(BaseRepository[Project]):
    """
    Repository for Project operations
    """
    
    def __init__(self, db: AsyncSession, tenant_id: Optional[int] = None):
        super().__init__(db, Project, tenant_id=tenant_id)
    
    async def get_by_id_with_quotes(
        self,
        id: int,
        include_deleted: bool = False
    ) -> Optional[Project]:
        """
        Get project by ID with quotes and items loaded (with tenant scoping)
        
        Args:
            id: Project ID
            include_deleted: Whether to include soft-deleted projects
            
        Returns:
            Project instance with relationships loaded or None
        """
        query = select(Project).options(
            selectinload(Project.quotes).selectinload(Quote.items).selectinload(QuoteItem.service),
            selectinload(Project.taxes)
        ).where(Project.id == id)
        
        # Apply tenant filter
        query = self._apply_tenant_filter(query)
        
        if not include_deleted and hasattr(Project, 'deleted_at'):
            query = query.where(Project.deleted_at.is_(None))
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_all_with_quotes(
        self,
        include_deleted: bool = False,
        status_filter: Optional[str] = None
    ) -> List[Project]:
        """
        Get all projects with quotes loaded (with tenant scoping)
        
        Args:
            include_deleted: Whether to include soft-deleted projects
            status_filter: Filter by project status
            
        Returns:
            List of Project instances with relationships loaded
        """
        query = select(Project).options(
            selectinload(Project.quotes).selectinload(Quote.items),
            selectinload(Project.taxes)
        )
        
        # Apply tenant filter first
        query = self._apply_tenant_filter(query)
        
        if not include_deleted and hasattr(Project, 'deleted_at'):
            query = query.where(Project.deleted_at.is_(None))
        
        if status_filter:
            query = query.where(Project.status == status_filter)
        
        query = query.order_by(desc(Project.created_at))
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_quote_by_id(
        self,
        quote_id: int
    ) -> Optional[Quote]:
        """
        Get quote by ID with items and expenses loaded (with tenant scoping via project)
        
        Args:
            quote_id: Quote ID
            
        Returns:
            Quote instance with items and expenses loaded or None
        """
        query = select(Quote).options(
            selectinload(Quote.items).selectinload(QuoteItem.service),
            selectinload(Quote.expenses),  # Sprint 15: Load expenses
            selectinload(Quote.project)
        ).where(Quote.id == quote_id)
        
        # Join with project to apply tenant filter
        if self.tenant_id is not None:
            query = query.join(Project).where(Project.organization_id == self.tenant_id)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_latest_quote(
        self,
        project_id: int
    ) -> Optional[Quote]:
        """
        Get latest quote for a project (with tenant scoping via project)
        
        Args:
            project_id: Project ID
        
        Returns:
            Latest Quote instance or None
        """
        query = select(Quote).where(Quote.project_id == project_id)
        
        # Apply tenant filter via project
        if self.tenant_id is not None:
            query = query.join(Project).where(Project.organization_id == self.tenant_id)
        
        query = query.order_by(desc(Quote.version)).limit(1)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_all_paginated(
        self,
        include_deleted: bool = False,
        status_filter: Optional[str] = None,
        only_deleted: bool = False,
        order_by=None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Project]:
        """
        Get all projects with pagination and eager loading (with tenant scoping)
        
        Args:
            include_deleted: Whether to include soft-deleted projects
            status_filter: Filter by project status
            only_deleted: If True, only return deleted projects (requires include_deleted=True)
            order_by: SQLAlchemy order_by clause (defaults to created_at desc)
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            List of Project instances with taxes relationship loaded
        """
        # Load relationships based on needs
        options = [selectinload(Project.taxes)]
        # If loading deleted projects, also load deleted_by relationship
        if only_deleted or include_deleted:
            options.append(selectinload(Project.deleted_by))
        
        query = select(Project).options(*options)
        
        # Apply tenant filter first
        query = self._apply_tenant_filter(query)
        
        if only_deleted:
            # Only deleted projects
            query = query.where(Project.deleted_at.isnot(None))
        elif not include_deleted:
            # Only non-deleted projects
            query = query.where(Project.deleted_at.is_(None))
        # If include_deleted=True and only_deleted=False, include both
        
        if status_filter:
            query = query.where(Project.status == status_filter)
        
        if order_by is None:
            order_by = desc(Project.created_at)
        query = query.order_by(order_by)
        
        if limit is not None:
            query = query.limit(limit)
        if offset is not None:
            query = query.offset(offset)
        
        result = await self.db.execute(query)
        return result.scalars().all()


