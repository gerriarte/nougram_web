"""
Script to add non_billable_hours_percentage column to team_members table if it doesn't exist
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import engine
from app.core.logging import get_logger

logger = get_logger(__name__)


async def add_non_billable_hours_column():
    """Add non_billable_hours_percentage column to team_members table if it doesn't exist"""
    
    async with engine.begin() as conn:
        # Check if column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='team_members' AND column_name='non_billable_hours_percentage'
        """)
        result = await conn.execute(check_query)
        column_exists = result.scalar() is not None
        
        if column_exists:
            logger.info("Column 'non_billable_hours_percentage' already exists in team_members table")
            return
        
        logger.info("Adding non_billable_hours_percentage column to team_members table...")
        
        # Add column with default
        await conn.execute(text("""
            ALTER TABLE team_members 
            ADD COLUMN IF NOT EXISTS non_billable_hours_percentage FLOAT DEFAULT 0.0
        """))
        
        # Set default value for existing team_members
        await conn.execute(text("""
            UPDATE team_members 
            SET non_billable_hours_percentage = 0.0
            WHERE non_billable_hours_percentage IS NULL
        """))
        
        # Make column NOT NULL with default
        await conn.execute(text("""
            ALTER TABLE team_members 
            ALTER COLUMN non_billable_hours_percentage SET DEFAULT 0.0,
            ALTER COLUMN non_billable_hours_percentage SET NOT NULL
        """))
        
        logger.info("Successfully added non_billable_hours_percentage column to team_members table")


async def main():
    """Main function"""
    try:
        await add_non_billable_hours_column()
        logger.info("Script completed successfully")
    except Exception as e:
        logger.error(f"Error adding column: {e}", exc_info=True)
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())


