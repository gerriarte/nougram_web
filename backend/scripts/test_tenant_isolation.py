"""
Script para validar el aislamiento de datos entre tenants (organizaciones)

Este script:
1. Crea dos organizaciones (Org A y Org B)
2. Crea usuarios para cada organización
3. Crea datos (proyectos, servicios, costos) para cada organización
4. Intenta acceder a datos de Org B usando credenciales de Org A
5. Verifica que el aislamiento funciona correctamente
"""
import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
backend_dir = Path(__file__).parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    # Try parent directory
    parent_env = backend_dir.parent / ".env"
    if parent_env.exists():
        load_dotenv(parent_env)

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.organization import Organization
from app.models.user import User
from app.models.project import Project
from app.models.service import Service
from app.models.cost import CostFixed
from app.models.team import TeamMember
from app.repositories.factory import RepositoryFactory
from app.core.tenant import TenantContext
from datetime import datetime


async def setup_test_data(db: AsyncSession):
    """Crea organizaciones y datos de prueba"""
    print("\n" + "="*60)
    print("CONFIGURANDO DATOS DE PRUEBA")
    print("="*60)
    
    # Limpiar datos existentes de prueba en orden correcto (primero dependientes, luego organizaciones)
    from sqlalchemy import func
    from app.models.project import Quote, QuoteItem
    from app.models.team import TeamMember
    
    # 1. Buscar organizaciones de prueba primero
    result = await db.execute(
        select(Organization).where(
            Organization.slug.in_(["org-a-test", "org-b-test"])
        )
    )
    existing_orgs = result.scalars().all()
    
    if existing_orgs:
        print("\n[INFO] Datos de prueba ya existen, limpiando...")
        org_ids = [org.id for org in existing_orgs]
        
        # 2. Eliminar proyectos relacionados (y sus quotes/quote_items)
        result = await db.execute(
            select(Project).where(Project.organization_id.in_(org_ids))
        )
        existing_projects = result.scalars().all()
        for project in existing_projects:
            await db.delete(project)
        
        # 3. Eliminar servicios relacionados
        result = await db.execute(
            select(Service).where(Service.organization_id.in_(org_ids))
        )
        existing_services = result.scalars().all()
        for service in existing_services:
            await db.delete(service)
        
        # 4. Eliminar costos relacionados
        result = await db.execute(
            select(CostFixed).where(CostFixed.organization_id.in_(org_ids))
        )
        existing_costs = result.scalars().all()
        for cost in existing_costs:
            await db.delete(cost)
        
        # 5. Eliminar team members relacionados
        result = await db.execute(
            select(TeamMember).where(TeamMember.organization_id.in_(org_ids))
        )
        existing_members = result.scalars().all()
        for member in existing_members:
            await db.delete(member)
        
        # 6. Eliminar usuarios relacionados
        result = await db.execute(
            select(User).where(User.organization_id.in_(org_ids))
        )
        existing_users = result.scalars().all()
        for user in existing_users:
            await db.delete(user)
        
        # 7. Eliminar organizaciones
        for org in existing_orgs:
            await db.delete(org)
        
        await db.commit()
        print("[OK] Datos de prueba anteriores eliminados")
    
    # 3. Crear Organización A
    org_a = Organization(
        name="Organizacion A - Test",
        slug="org-a-test",
        subscription_plan="professional",
        subscription_status="active"
    )
    db.add(org_a)
    await db.flush()
    print(f"\n[OK] Organizacion A creada: ID={org_a.id}, Name={org_a.name}")
    
    # 4. Crear Organización B
    org_b = Organization(
        name="Organizacion B - Test",
        slug="org-b-test",
        subscription_plan="professional",
        subscription_status="active"
    )
    db.add(org_b)
    await db.flush()
    print(f"[OK] Organizacion B creada: ID={org_b.id}, Name={org_b.name}")
    
    # 5. Crear Usuario para Org A
    user_a = User(
        email="user_a@orga.test",
        full_name="Usuario Org A",
        hashed_password=get_password_hash("password123"),
        role="product_manager",
        organization_id=org_a.id
    )
    db.add(user_a)
    await db.flush()
    print(f"\n[OK] Usuario A creado: ID={user_a.id}, Email={user_a.email}, Org={user_a.organization_id}")
    
    # 6. Crear Usuario para Org B
    user_b = User(
        email="user_b@orgb.test",
        full_name="Usuario Org B",
        hashed_password=get_password_hash("password123"),
        role="product_manager",
        organization_id=org_b.id
    )
    db.add(user_b)
    await db.flush()
    print(f"[OK] Usuario B creado: ID={user_b.id}, Email={user_b.email}, Org={user_b.organization_id}")
    
    # 7. Crear datos para Org A
    project_repo_a = RepositoryFactory.create_project_repository(db, org_a.id)
    service_repo_a = RepositoryFactory.create_service_repository(db, org_a.id)
    cost_repo_a = RepositoryFactory.create_cost_repository(db, org_a.id)
    
    project_a = Project(
        name="Proyecto Org A",
        client_name="Cliente A",
        client_email="cliente_a@test.com",
        currency="USD",
        status="Draft",
        organization_id=org_a.id
    )
    project_a = await project_repo_a.create(project_a)
    print(f"\n[OK] Proyecto A creado: ID={project_a.id}, Name={project_a.name}")
    
    service_a = Service(
        name="Servicio Org A",
        description="Servicio exclusivo de Org A",
        default_margin_target=0.30,
        is_active=True,
        organization_id=org_a.id
    )
    service_a = await service_repo_a.create(service_a)
    print(f"[OK] Servicio A creado: ID={service_a.id}, Name={service_a.name}")
    
    cost_a = CostFixed(
        name="Costo Org A",
        amount_monthly=1000.0,
        currency="USD",
        category="Overhead",
        description="Costo exclusivo de Org A",
        organization_id=org_a.id
    )
    cost_a = await cost_repo_a.create(cost_a)
    print(f"[OK] Costo A creado: ID={cost_a.id}, Name={cost_a.name}")
    
    # 6. Crear datos para Org B
    project_repo_b = RepositoryFactory.create_project_repository(db, org_b.id)
    service_repo_b = RepositoryFactory.create_service_repository(db, org_b.id)
    cost_repo_b = RepositoryFactory.create_cost_repository(db, org_b.id)
    
    project_b = Project(
        name="Proyecto Org B",
        client_name="Cliente B",
        client_email="cliente_b@test.com",
        currency="USD",
        status="Draft",
        organization_id=org_b.id
    )
    project_b = await project_repo_b.create(project_b)
    print(f"\n[OK] Proyecto B creado: ID={project_b.id}, Name={project_b.name}")
    
    service_b = Service(
        name="Servicio Org B",
        description="Servicio exclusivo de Org B",
        default_margin_target=0.35,
        is_active=True,
        organization_id=org_b.id
    )
    service_b = await service_repo_b.create(service_b)
    print(f"[OK] Servicio B creado: ID={service_b.id}, Name={service_b.name}")
    
    cost_b = CostFixed(
        name="Costo Org B",
        amount_monthly=2000.0,
        currency="USD",
        category="Overhead",
        description="Costo exclusivo de Org B",
        organization_id=org_b.id
    )
    cost_b = await cost_repo_b.create(cost_b)
    print(f"[OK] Costo B creado: ID={cost_b.id}, Name={cost_b.name}")
    
    await db.commit()
    
    return {
        "org_a": org_a,
        "org_b": org_b,
        "user_a": user_a,
        "user_b": user_b,
        "project_a": project_a,
        "project_b": project_b,
        "service_a": service_a,
        "service_b": service_b,
        "cost_a": cost_a,
        "cost_b": cost_b
    }


async def test_tenant_isolation(db: AsyncSession, test_data: dict):
    """Prueba el aislamiento de datos entre organizaciones"""
    print("\n" + "="*60)
    print("PRUEBAS DE AISLAMIENTO DE DATOS")
    print("="*60)
    
    org_a = test_data["org_a"]
    org_b = test_data["org_b"]
    project_a = test_data["project_a"]
    project_b = test_data["project_b"]
    service_a = test_data["service_a"]
    service_b = test_data["service_b"]
    cost_a = test_data["cost_a"]
    cost_b = test_data["cost_b"]
    
    # Crear TenantContext para Org A
    tenant_a = TenantContext(organization_id=org_a.id, organization=org_a)
    
    # Crear repositorios scoped para Org A
    project_repo_a = RepositoryFactory.create_project_repository(db, tenant_a.organization_id)
    service_repo_a = RepositoryFactory.create_service_repository(db, tenant_a.organization_id)
    cost_repo_a = RepositoryFactory.create_cost_repository(db, tenant_a.organization_id)
    
    print("\n" + "-"*60)
    print("TEST 1: Usuario de Org A puede acceder a sus propios datos")
    print("-"*60)
    
    # Org A debería poder ver su proyecto
    found_project_a = await project_repo_a.get_by_id(project_a.id)
    assert found_project_a is not None, "Org A deberia poder ver su propio proyecto"
    assert found_project_a.name == "Proyecto Org A", "Nombre del proyecto deberia ser correcto"
    print(f"[OK] Org A puede acceder a su proyecto: {found_project_a.name}")
    
    # Org A debería poder ver su servicio
    found_service_a = await service_repo_a.get_by_id(service_a.id)
    assert found_service_a is not None, "Org A deberia poder ver su propio servicio"
    assert found_service_a.name == "Servicio Org A", "Nombre del servicio deberia ser correcto"
    print(f"[OK] Org A puede acceder a su servicio: {found_service_a.name}")
    
    # Org A debería poder ver su costo
    found_cost_a = await cost_repo_a.get_by_id(cost_a.id)
    assert found_cost_a is not None, "Org A deberia poder ver su propio costo"
    assert found_cost_a.name == "Costo Org A", "Nombre del costo deberia ser correcto"
    print(f"[OK] Org A puede acceder a su costo: {found_cost_a.name}")
    
    print("\n" + "-"*60)
    print("TEST 2: Usuario de Org A NO puede acceder a datos de Org B")
    print("-"*60)
    
    # Org A NO debería poder ver el proyecto de Org B
    found_project_b = await project_repo_a.get_by_id(project_b.id)
    assert found_project_b is None, "Org A NO deberia poder ver el proyecto de Org B"
    print(f"[OK] Org A NO puede acceder al proyecto de Org B (correctamente bloqueado)")
    
    # Org A NO debería poder ver el servicio de Org B
    found_service_b = await service_repo_a.get_by_id(service_b.id)
    assert found_service_b is None, "Org A NO deberia poder ver el servicio de Org B"
    print(f"[OK] Org A NO puede acceder al servicio de Org B (correctamente bloqueado)")
    
    # Org A NO debería poder ver el costo de Org B
    found_cost_b = await cost_repo_a.get_by_id(cost_b.id)
    assert found_cost_b is None, "Org A NO deberia poder ver el costo de Org B"
    print(f"[OK] Org A NO puede acceder al costo de Org B (correctamente bloqueado)")
    
    print("\n" + "-"*60)
    print("TEST 3: Listado de datos solo muestra datos de la organización")
    print("-"*60)
    
    # Org A debería ver solo sus proyectos
    projects_a = await project_repo_a.get_all()
    assert len(projects_a) >= 1, "Org A deberia tener al menos 1 proyecto"
    assert all(p.organization_id == org_a.id for p in projects_a), "Todos los proyectos deberian ser de Org A"
    print(f"[OK] Org A ve {len(projects_a)} proyecto(s), todos pertenecen a Org A")
    
    # Org A debería ver solo sus servicios
    services_a = await service_repo_a.get_all()
    assert len(services_a) >= 1, "Org A deberia tener al menos 1 servicio"
    assert all(s.organization_id == org_a.id for s in services_a), "Todos los servicios deberian ser de Org A"
    print(f"[OK] Org A ve {len(services_a)} servicio(s), todos pertenecen a Org A")
    
    # Org A debería ver solo sus costos
    costs_a = await cost_repo_a.get_all()
    assert len(costs_a) >= 1, "Org A deberia tener al menos 1 costo"
    assert all(c.organization_id == org_a.id for c in costs_a), "Todos los costos deberian ser de Org A"
    print(f"[OK] Org A ve {len(costs_a)} costo(s), todos pertenecen a Org A")
    
    print("\n" + "-"*60)
    print("TEST 4: Creación de datos asigna correctamente organization_id")
    print("-"*60)
    
    # Crear nuevo proyecto para Org A
    new_project = Project(
        name="Nuevo Proyecto Org A",
        client_name="Nuevo Cliente A",
        client_email="nuevo_cliente_a@test.com",
        currency="USD",
        status="Draft",
        organization_id=org_a.id
    )
    new_project = await project_repo_a.create(new_project)
    assert new_project.organization_id == org_a.id, "Nuevo proyecto deberia tener organization_id de Org A"
    print(f"[OK] Nuevo proyecto creado con organization_id={new_project.organization_id} (correcto)")
    
    # Verificar que Org B no puede ver este nuevo proyecto
    project_repo_b = RepositoryFactory.create_project_repository(db, org_b.id)
    found_new_project = await project_repo_b.get_by_id(new_project.id)
    assert found_new_project is None, "Org B NO deberia poder ver el nuevo proyecto de Org A"
    print(f"[OK] Org B NO puede acceder al nuevo proyecto de Org A (correctamente bloqueado)")
    
    print("\n" + "="*60)
    print("[OK] TODAS LAS PRUEBAS DE AISLAMIENTO PASARON")
    print("="*60)


async def cleanup_test_data(db: AsyncSession, test_data: dict):
    """Limpia los datos de prueba"""
    print("\n" + "="*60)
    print("LIMPIANDO DATOS DE PRUEBA")
    print("="*60)
    
    try:
        # Eliminar proyectos
        if "project_a" in test_data:
            await db.delete(test_data["project_a"])
        if "project_b" in test_data:
            await db.delete(test_data["project_b"])
        # Eliminar servicios
        if "service_a" in test_data:
            await db.delete(test_data["service_a"])
        if "service_b" in test_data:
            await db.delete(test_data["service_b"])
        # Eliminar costos
        if "cost_a" in test_data:
            await db.delete(test_data["cost_a"])
        if "cost_b" in test_data:
            await db.delete(test_data["cost_b"])
        # Eliminar usuarios
        if "user_a" in test_data:
            await db.delete(test_data["user_a"])
        if "user_b" in test_data:
            await db.delete(test_data["user_b"])
        # Eliminar organizaciones
        if "org_a" in test_data:
            await db.delete(test_data["org_a"])
        if "org_b" in test_data:
            await db.delete(test_data["org_b"])
        
        await db.commit()
        print("[OK] Datos de prueba eliminados")
    except Exception as e:
        print(f"⚠️  Error al limpiar datos: {e}")
        await db.rollback()


async def main():
    """Función principal"""
    print("\n" + "="*60)
    print("SCRIPT DE VALIDACIÓN DE AISLAMIENTO DE DATOS")
    print("="*60)
    print(f"\nBase de datos: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'N/A'}")
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    test_data = None
    
    try:
        async with async_session() as db:
            # Setup test data
            test_data = await setup_test_data(db)
            
            # Run isolation tests
            await test_tenant_isolation(db, test_data)
            
            # Ask user if they want to cleanup (if running interactively)
            print("\n" + "-"*60)
            try:
                cleanup = input("Deseas eliminar los datos de prueba? (s/n): ").lower().strip()
                if cleanup == 's':
                    await cleanup_test_data(db, test_data)
                else:
                    print("[INFO] Datos de prueba conservados en la base de datos")
                    print(f"   - Org A ID: {test_data['org_a'].id}")
                    print(f"   - Org B ID: {test_data['org_b'].id}")
                    print(f"   - User A: {test_data['user_a'].email}")
                    print(f"   - User B: {test_data['user_b'].email}")
            except (EOFError, KeyboardInterrupt):
                # Non-interactive environment, keep test data
                print("[INFO] Entorno no interactivo - Datos de prueba conservados")
                print(f"   - Org A ID: {test_data['org_a'].id}")
                print(f"   - Org B ID: {test_data['org_b'].id}")
                print(f"   - User A: {test_data['user_a'].email}")
                print(f"   - User B: {test_data['user_b'].email}")
    
    except AssertionError as e:
        print(f"\n[ERROR] Prueba de aislamiento fallo: {e}")
        if test_data:
            async with async_session() as db:
                cleanup_input = input("\n¿Deseas eliminar los datos de prueba? (s/n): ").lower().strip()
                if cleanup_input == 's':
                    await cleanup_test_data(db, test_data)
        sys.exit(1)
    
    except Exception as e:
        print(f"\n[ERROR] ERROR INESPERADO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        await engine.dispose()
    
    print("\n[OK] Script completado exitosamente\n")


if __name__ == "__main__":
    asyncio.run(main())

