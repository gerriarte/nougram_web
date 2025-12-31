"""
Script to add pricing_type column to quote_items table if it doesn't exist
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


async def add_pricing_type_to_quote_items():
    """Add pricing_type and related columns to quote_items table if they don't exist"""
    
    async with engine.begin() as conn:
        # Check if pricing_type column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='quote_items' AND column_name='pricing_type'
        """)
        result = await conn.execute(check_query)
        column_exists = result.scalar() is not None
        
        if column_exists:
            logger.info("Column 'pricing_type' already exists in quote_items table")
            return
        
        logger.info("Adding pricing_type and related columns to quote_items table...")
        
        # Add pricing_type column (nullable)
        await conn.execute(text("""
            ALTER TABLE quote_items 
            ADD COLUMN IF NOT EXISTS pricing_type VARCHAR
        """))
        
        # Add fixed_price column
        await conn.execute(text("""
            ALTER TABLE quote_items 
            ADD COLUMN IF NOT EXISTS fixed_price FLOAT
        """))
        
        # Add quantity column with default
        await conn.execute(text("""
            ALTER TABLE quote_items 
            ADD COLUMN IF NOT EXISTS quantity FLOAT DEFAULT 1.0
        """))
        
        # Set default value for existing quote_items
        await conn.execute(text("""
            UPDATE quote_items 
            SET quantity = 1.0
            WHERE quantity IS NULL
        """))
        
        # Make quantity NOT NULL with default
        await conn.execute(text("""
            ALTER TABLE quote_items 
            ALTER COLUMN quantity SET DEFAULT 1.0,
            ALTER COLUMN quantity SET NOT NULL
        """))
        
        logger.info("Successfully added pricing_type and related columns to quote_items table")


async def main():
    """Main function"""
    try:
        await add_pricing_type_to_quote_items()
        logger.info("Script completed successfully")
    except Exception as e:
        logger.error(f"Error adding column: {e}", exc_info=True)
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())


