"""
Simple script to verify industry templates were created successfully
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.models.template import IndustryTemplate


async def verify_templates():
    """Verify templates in database"""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Count templates
            result = await session.execute(select(IndustryTemplate))
            templates = result.scalars().all()
            
            print(f"\n{'='*50}")
            print(f"VERIFICACION DE PLANTILLAS")
            print(f"{'='*50}\n")
            print(f"Total de plantillas: {len(templates)}\n")
            
            if templates:
                print("Plantillas encontradas:")
                for template in templates:
                    print(f"  [{template.id}] {template.industry_type}: {template.name}")
                    print(f"      Activa: {template.is_active}")
                    if template.suggested_roles:
                        print(f"      Roles sugeridos: {len(template.suggested_roles)}")
                    if template.suggested_services:
                        print(f"      Servicios sugeridos: {len(template.suggested_services)}")
                    if template.suggested_fixed_costs:
                        print(f"      Costos sugeridos: {len(template.suggested_fixed_costs)}")
                    print()
            else:
                print("⚠️  No se encontraron plantillas en la base de datos")
                print("   Ejecuta: python -m alembic upgrade head")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(verify_templates())










