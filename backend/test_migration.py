"""
Script temporal para probar la migración multi-tenant
Ejecutar antes de aplicar en producción
"""
import asyncio
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


async def test_migration():
    """Verificar el estado de la migración"""
    print("=" * 60)
    print("PRUEBA DE MIGRACIÓN MULTI-TENANT")
    print("=" * 60)
    
    # Crear conexión
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # 1. Verificar si existe la tabla organizations
            print("\n1. Verificando tabla 'organizations'...")
            result = await session.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'organizations'
                )
            """))
            exists = result.scalar()
            if exists:
                print("   [OK] Tabla 'organizations' existe")
            else:
                print("   [WARNING] Tabla 'organizations' NO existe (migracion no ejecutada)")
                print("\n   Para ejecutar la migración, usa:")
                print("   cd backend")
                print("   alembic upgrade head")
                return
            
            # 2. Verificar organización default
            print("\n2. Verificando organización 'default'...")
            result = await session.execute(text("""
                SELECT id, name, slug, subscription_plan 
                FROM organizations 
                WHERE id = 1
            """))
            org = result.first()
            if org:
                print(f"   [OK] Organizacion default encontrada:")
                print(f"      ID: {org[0]}")
                print(f"      Nombre: {org[1]}")
                print(f"      Slug: {org[2]}")
                print(f"      Plan: {org[3]}")
            else:
                print("   [WARNING] Organizacion default NO encontrada")
            
            # 3. Verificar organization_id en todas las tablas
            print("\n3. Verificando organization_id en tablas...")
            tables = ['users', 'projects', 'services', 'costs_fixed', 'team_members', 'taxes']
            all_have_org_id = True
            
            for table in tables:
                result = await session.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '{table}' 
                    AND column_name = 'organization_id'
                """))
                if result.first():
                    # Contar registros sin organization_id (deberían ser 0)
                    result2 = await session.execute(text(f"""
                        SELECT COUNT(*) 
                        FROM {table} 
                        WHERE organization_id IS NULL
                    """))
                    null_count = result2.scalar()
                    
                    # Contar total de registros
                    result3 = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    total = result3.scalar()
                    
                    if null_count == 0:
                        print(f"   [OK] {table}: {total} registros, todos con organization_id")
                    else:
                        print(f"   [WARNING] {table}: {null_count} registros SIN organization_id")
                        all_have_org_id = False
                else:
                    print(f"   [ERROR] {table}: columna organization_id NO existe")
                    all_have_org_id = False
            
            # 4. Verificar foreign keys
            print("\n4. Verificando foreign keys...")
            result = await session.execute(text("""
                SELECT 
                    tc.constraint_name, 
                    tc.table_name, 
                    kcu.column_name
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                    AND tc.table_name IN ('users', 'projects', 'services', 'costs_fixed', 'team_members', 'taxes')
                    AND kcu.column_name = 'organization_id'
                ORDER BY tc.table_name
            """))
            fks = result.fetchall()
            if fks:
                print(f"   [OK] {len(fks)} foreign keys encontradas:")
                for fk in fks:
                    print(f"      {fk[1]}.{fk[2]} -> organizations.id")
            else:
                print("   [WARNING] No se encontraron foreign keys")
            
            # 5. Verificar índices compuestos
            print("\n5. Verificando índices compuestos...")
            composite_indexes = [
                ('projects', 'ix_projects_organization_id_created_at'),
                ('services', 'ix_services_organization_id_created_at'),
                ('costs_fixed', 'ix_costs_fixed_organization_id_created_at'),
            ]
            for table, index_name in composite_indexes:
                result = await session.execute(text(f"""
                    SELECT indexname 
                    FROM pg_indexes 
                    WHERE tablename = '{table}' 
                    AND indexname = '{index_name}'
                """))
                if result.first():
                    print(f"   [OK] {table}: indice '{index_name}' existe")
                else:
                    print(f"   [WARNING] {table}: indice '{index_name}' NO existe")
            
            # 6. Resumen de datos por organización
            print("\n6. Resumen de datos por organización...")
            result = await session.execute(text("""
                SELECT 
                    o.id,
                    o.name,
                    (SELECT COUNT(*) FROM users WHERE organization_id = o.id) as users_count,
                    (SELECT COUNT(*) FROM projects WHERE organization_id = o.id) as projects_count,
                    (SELECT COUNT(*) FROM services WHERE organization_id = o.id) as services_count
                FROM organizations o
                ORDER BY o.id
            """))
            orgs = result.fetchall()
            for org in orgs:
                print(f"   Organización {org[0]} ({org[1]}):")
                print(f"      Usuarios: {org[2]}")
                print(f"      Proyectos: {org[3]}")
                print(f"      Servicios: {org[4]}")
            
            print("\n" + "=" * 60)
            if all_have_org_id and exists:
                print("[SUCCESS] MIGRACION EXITOSA")
            else:
                print("[WARNING] REVISAR MIGRACION - Hay problemas pendientes")
            print("=" * 60)
    
    except Exception as e:
        print(f"\n[ERROR] ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_migration())

