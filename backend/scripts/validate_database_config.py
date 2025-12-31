"""
Script para validar la configuración de base de datos
Verifica que la configuración sea correcta y consistente
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, inspect

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings


async def validate_database_config():
    """Validar configuración de base de datos"""
    print("=" * 70)
    print("VALIDACIÓN DE CONFIGURACIÓN DE BASE DE DATOS")
    print("=" * 70)
    print()
    
    # Extraer información de DATABASE_URL
    db_url = settings.DATABASE_URL
    print(f"📊 DATABASE_URL configurado:")
    print(f"   {db_url}")
    print()
    
    # Extraer componentes
    if "postgresql" in db_url:
        # Parsear URL
        parts = db_url.split("://")[1].split("@")
        if len(parts) == 2:
            auth = parts[0]
            host_db = parts[1]
            user = auth.split(":")[0]
            password = auth.split(":")[1] if ":" in auth else ""
            host_port = host_db.split("/")[0]
            db_name = host_db.split("/")[1]
            
            host = host_port.split(":")[0]
            port = host_port.split(":")[1] if ":" in host_port else "5432"
            
            print("📋 Componentes de conexión:")
            print(f"   Usuario:     {user}")
            print(f"   Host:       {host}")
            print(f"   Puerto:     {port}")
            print(f"   Base datos: {db_name}")
            print()
    
    # Intentar conectar
    print("🔍 Verificando conexión...")
    try:
        engine = create_async_engine(db_url, echo=False)
        async with engine.connect() as conn:
            # Verificar que la base de datos existe
            result = await conn.execute(text("SELECT current_database()"))
            current_db = result.scalar()
            print(f"   ✅ Conectado a: {current_db}")
            
            # Verificar versión de PostgreSQL
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"   ✅ PostgreSQL: {version.split(',')[0]}")
            
            # Verificar que la tabla organizations existe
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'organizations'
                )
            """))
            org_table_exists = result.scalar()
            
            if org_table_exists:
                print(f"   ✅ Tabla 'organizations' existe")
                
                # Verificar organización default
                result = await conn.execute(text("SELECT COUNT(*) FROM organizations WHERE id = 1"))
                default_org_count = result.scalar()
                
                if default_org_count > 0:
                    result = await conn.execute(text("SELECT name FROM organizations WHERE id = 1"))
                    org_name = result.scalar()
                    print(f"   ✅ Organización default encontrada: {org_name}")
                else:
                    print(f"   ⚠️  Organización default (ID=1) no encontrada")
            else:
                print(f"   ⚠️  Tabla 'organizations' NO existe (migraciones no aplicadas)")
            
            # Verificar migraciones de Alembic
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'alembic_version'
                )
            """))
            alembic_exists = result.scalar()
            
            if alembic_exists:
                result = await conn.execute(text("SELECT version_num FROM alembic_version"))
                version_result = result.scalar_one_or_none()
                if version_result:
                    print(f"   ✅ Versión de Alembic: {version_result}")
                else:
                    print(f"   ⚠️  No hay versión de Alembic registrada")
            else:
                print(f"   ⚠️  Tabla 'alembic_version' NO existe")
            
            # Verificar tablas principales
            print()
            print("📋 Verificando tablas principales...")
            main_tables = [
                'users', 'organizations', 'projects', 'services', 
                'costs_fixed', 'team_members', 'taxes', 'quotes'
            ]
            
            for table in main_tables:
                result = await conn.execute(text(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '{table}'
                    )
                """))
                exists = result.scalar()
                
                if exists:
                    # Verificar que tiene organization_id
                    result = await conn.execute(text(f"""
                        SELECT EXISTS (
                            SELECT FROM information_schema.columns 
                            WHERE table_schema = 'public' 
                            AND table_name = '{table}' 
                            AND column_name = 'organization_id'
                        )
                    """))
                    has_org_id = result.scalar()
                    
                    if has_org_id:
                        # Contar registros
                        result = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        count = result.scalar()
                        print(f"   ✅ {table:20} existe, tiene organization_id, {count:>4} registros")
                    else:
                        print(f"   ⚠️  {table:20} existe pero NO tiene organization_id")
                else:
                    print(f"   ❌ {table:20} NO existe")
            
            # Verificar consistencia de organization_id
            print()
            print("🔍 Verificando consistencia de datos...")
            
            # Verificar que todos los registros tienen organization_id válido
            tables_with_org_id = [
                'users', 'projects', 'services', 'costs_fixed', 
                'team_members', 'taxes'
            ]
            
            all_consistent = True
            for table in tables_with_org_id:
                result = await conn.execute(text(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '{table}'
                    )
                """))
                if result.scalar():
                    result = await conn.execute(text(f"""
                        SELECT COUNT(*) 
                        FROM {table} 
                        WHERE organization_id IS NULL
                    """))
                    null_count = result.scalar()
                    
                    if null_count > 0:
                        print(f"   ⚠️  {table}: {null_count} registros con organization_id NULL")
                        all_consistent = False
                    else:
                        # Verificar que organization_id existe en organizations
                        result = await conn.execute(text(f"""
                            SELECT COUNT(*) 
                            FROM {table} t
                            WHERE NOT EXISTS (
                                SELECT 1 FROM organizations o 
                                WHERE o.id = t.organization_id
                            )
                        """))
                        invalid_count = result.scalar()
                        
                        if invalid_count > 0:
                            print(f"   ⚠️  {table}: {invalid_count} registros con organization_id inválido")
                            all_consistent = False
                        else:
                            print(f"   ✅ {table}: todos los registros tienen organization_id válido")
            
            if all_consistent:
                print()
                print("=" * 70)
                print("✅ CONFIGURACIÓN VÁLIDA")
                print("=" * 70)
                print("   La base de datos está correctamente configurada para multi-tenant")
            else:
                print()
                print("=" * 70)
                print("⚠️  CONFIGURACIÓN CON PROBLEMAS")
                print("=" * 70)
                print("   Hay inconsistencias que deben corregirse")
        
        await engine.dispose()
    
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        print()
        print("=" * 70)
        print("❌ CONFIGURACIÓN INVÁLIDA")
        print("=" * 70)
        print("   No se pudo conectar a la base de datos")
        print("   Verifica:")
        print("   1. Que PostgreSQL esté corriendo")
        print("   2. Que la base de datos exista")
        print("   3. Que las credenciales sean correctas")
        print("   4. Que el puerto sea correcto")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(validate_database_config())

