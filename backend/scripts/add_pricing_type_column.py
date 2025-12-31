"""
Script to add pricing_type column to services table if it doesn't exist
This fixes the immediate issue without dealing with migration conflicts
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


async def add_pricing_type_column():
    """Add pricing_type and related columns to services table if they don't exist"""
    
    async with engine.begin() as conn:
        # Check if pricing_type column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='services' AND column_name='pricing_type'
        """)
        result = await conn.execute(check_query)
        column_exists = result.scalar() is not None
        
        if column_exists:
            logger.info("Column 'pricing_type' already exists in services table")
            return
        
        logger.info("Adding pricing_type and related columns to services table...")
        
        # Add pricing_type column (nullable first)
        await conn.execute(text("""
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS pricing_type VARCHAR
        """))
        
        # Add other pricing fields
        await conn.execute(text("""
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS fixed_price FLOAT
        """))
        
        await conn.execute(text("""
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false
        """))
        
        await conn.execute(text("""
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS billing_frequency VARCHAR
        """))
        
        await conn.execute(text("""
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS recurring_price FLOAT
        """))
        
        # Set default value for existing services
        await conn.execute(text("""
            UPDATE services 
            SET pricing_type = 'hourly'
            WHERE pricing_type IS NULL
        """))
        
        # Make pricing_type NOT NULL with default
        await conn.execute(text("""
            ALTER TABLE services 
            ALTER COLUMN pricing_type SET DEFAULT 'hourly',
            ALTER COLUMN pricing_type SET NOT NULL
        """))
        
        logger.info("Successfully added pricing_type and related columns to services table")


async def main():
    """Main function"""
    try:
        await add_pricing_type_column()
        logger.info("Script completed successfully")
    except Exception as e:
        logger.error(f"Error adding column: {e}", exc_info=True)
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())


