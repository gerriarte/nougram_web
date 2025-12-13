"""
Repository for User model
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.repositories.base import BaseRepository
from app.models.user import User


class UserRepository(BaseRepository[User]):
    """
    Repository for User operations
    Note: User repository may need special handling for multi-tenant
    Users belong to organizations, but super_admin may need to see all users
    """
    
    def __init__(self, db: AsyncSession, tenant_id: Optional[int] = None):
        super().__init__(db, User, tenant_id=tenant_id)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email: User email
            
        Returns:
            User instance or None
        """
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_role(
        self,
        role: str
    ) -> List[User]:
        """
        Get users by role
        
        Args:
            role: User role
            
        Returns:
            List of User instances
        """
        query = select(User).where(User.role == role)
        result = await self.db.execute(query)
        return result.scalars().all()

