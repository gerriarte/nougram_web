"""
Repository for AgencySettings model
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.repositories.base import BaseRepository
from app.models.settings import AgencySettings


class SettingsRepository(BaseRepository[AgencySettings]):
    """
    Repository for AgencySettings operations
    Note: AgencySettings doesn't have organization_id, so tenant scoping is disabled
    """
    
    def __init__(self, db: AsyncSession, tenant_id: Optional[int] = None):
        # Settings don't have organization_id, so pass None for tenant_id to disable scoping
        super().__init__(db, AgencySettings, tenant_id=None)
    
    async def get_settings(self) -> Optional[AgencySettings]:
        """
        Get agency settings (singleton pattern)
        
        Returns:
            AgencySettings instance or None
        """
        query = select(AgencySettings).limit(1)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_or_create_default(self) -> AgencySettings:
        """
        Get existing settings or create default if none exists
        
        Returns:
            AgencySettings instance
        """
        settings = await self.get_settings()
        
        if settings is None:
            settings = AgencySettings(
                primary_currency="USD",
                currency_symbol="$"
            )
            settings = await self.create(settings)
        
        return settings

