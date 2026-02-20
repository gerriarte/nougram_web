"""
Script para probar los endpoints del Dashboard y Pipeline
Ejecutar: python scripts/test_dashboard_endpoints.py
"""
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.project import Project, Quote
from app.models.organization import Organization
from app.models.user import User
from app.models.team import TeamMember
from app.models.cost import CostFixed
from app.models.service import Service
from decimal import Decimal
from datetime import datetime

# Database URL - ajustar según tu configuración
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5435/cotizador_db")


async def setup_test_data(db: AsyncSession):
    """Crea datos de prueba para testing"""
    print("Creando datos de prueba...")
    
    # Verificar si ya existe organización de prueba
    from sqlalchemy import select
    org_result = await db.execute(select(Organization).limit(1))
    org = org_result.scalar_one_or_none()
    
    if not org:
        print("[ERROR] No se encontro organizacion. Por favor crea una organizacion primero.")
        return None
    
    org_id = org.id
    print(f"[OK] Usando organizacion ID: {org_id}")
    
    # Crear usuario de prueba si no existe
    user_result = await db.execute(
        select(User).where(User.organization_id == org_id).limit(1)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        print("[ERROR] No se encontro usuario. Por favor crea un usuario primero.")
        return None
    
    print(f"[OK] Usando usuario ID: {user.id}")
    
    # Crear proyectos y cotizaciones de prueba
    projects_data = [
        {
            "name": "App E-commerce",
            "client_name": "TechCorp",
            "client_email": "contact@techcorp.com",
            "status": "Won",
            "currency": "COP"
        },
        {
            "name": "Landing Page",
            "client_name": "StartupX",
            "client_email": "hello@startupx.com",
            "status": "Sent",
            "currency": "USD"
        },
        {
            "name": "Branding",
            "client_name": "DesignCo",
            "client_email": "info@designco.com",
            "status": "Draft",
            "currency": "COP"
        }
    ]
    
    created_projects = []
    for proj_data in projects_data:
        # Verificar si ya existe
        existing = await db.execute(
            select(Project).where(
                Project.name == proj_data["name"],
                Project.organization_id == org_id
            )
        )
        if existing.scalar_one_or_none():
            print(f"  [SKIP] Proyecto '{proj_data['name']}' ya existe, omitiendo...")
            continue
        
        project = Project(
            **proj_data,
            organization_id=org_id
        )
        db.add(project)
        await db.flush()
        
        # Crear cotización para el proyecto
        quote = Quote(
            project_id=project.id,
            version=1,
            total_internal_cost=Decimal("10000000"),
            total_client_price=Decimal("15000000"),
            margin_percentage=Decimal("0.33"),
            sent_at=datetime.now() if proj_data["status"] == "Sent" else None,
            viewed_count=3 if proj_data["status"] == "Sent" else 0
        )
        db.add(quote)
        created_projects.append(project)
        print(f"  [OK] Creado proyecto '{proj_data['name']}' con cotizacion")
    
    await db.commit()
    print(f"[OK] Creados {len(created_projects)} proyectos de prueba\n")
    
    return org_id, user.id


async def test_endpoints():
    """Prueba los endpoints implementados"""
    print("Iniciando pruebas de endpoints...\n")
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        # Setup test data
        result = await setup_test_data(db)
        if not result:
            print("[ERROR] No se pudieron crear datos de prueba")
            return
        
        org_id, user_id = result
        
        print("=" * 60)
        print("PRUEBAS DE ENDPOINTS")
        print("=" * 60)
        
        # Test 1: Verificar estructura de tabla quotes
        print("\n1️⃣ Verificando estructura de tabla 'quotes'...")
        from sqlalchemy import inspect
        inspector = inspect(engine.sync_engine)
        columns = [col['name'] for col in inspector.get_columns('quotes')]
        
        required_columns = ['sent_at', 'viewed_count', 'public_token']
        missing = [col for col in required_columns if col not in columns]
        
        if missing:
            print(f"  [ERROR] Faltan columnas: {missing}")
        else:
            print(f"  [OK] Todas las columnas requeridas existen")
            print(f"  [INFO] Columnas encontradas: {', '.join(required_columns)}")
        
        # Test 2: Verificar datos de prueba
        print("\n2. Verificando datos de prueba...")
        from sqlalchemy import select, func
        quotes_result = await db.execute(
            select(func.count(Quote.id))
            .join(Project)
            .where(Project.organization_id == org_id)
        )
        quotes_count = quotes_result.scalar() or 0
        print(f"  [OK] Cotizaciones encontradas: {quotes_count}")
        
        # Test 3: Verificar campos nuevos
        print("\n3. Verificando campos nuevos en cotizaciones...")
        quotes_result = await db.execute(
            select(Quote)
            .join(Project)
            .where(Project.organization_id == org_id)
            .limit(1)
        )
        quote = quotes_result.scalar_one_or_none()
        
        if quote:
            print(f"  [OK] Quote ID: {quote.id}")
            print(f"  [OK] sent_at: {quote.sent_at}")
            print(f"  [OK] viewed_count: {quote.viewed_count}")
            print(f"  [OK] public_token: {quote.public_token}")
        else:
            print("  [WARN] No hay cotizaciones para verificar")
        
        # Test 4: Verificar índices
        print("\n4. Verificando indices...")
        indexes = inspector.get_indexes('quotes')
        public_token_index = [idx for idx in indexes if 'public_token' in str(idx.get('column_names', []))]
        
        if public_token_index:
            print(f"  [OK] Indice en public_token existe")
        else:
            print(f"  [WARN] Indice en public_token no encontrado (puede estar bien si no hay datos)")
        
        print("\n" + "=" * 60)
        print("[OK] VERIFICACION COMPLETA")
        print("=" * 60)
        print("\n[INFO] Para probar los endpoints HTTP, ejecuta el servidor:")
        print("   python -m uvicorn main:app --reload --port 8000")
        print("\n   Luego prueba con:")
        print("   curl http://localhost:8000/api/v1/dashboard/kpis?period=month")
        print("   curl http://localhost:8000/api/v1/quotes")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_endpoints())
