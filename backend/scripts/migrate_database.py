"""
Script para migrar datos de agenciops_db a nougram_db
Ejecutar con precaución y hacer backup primero
"""
import asyncio
import sys
import os
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, inspect

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings


async def check_database_exists(engine, db_name: str) -> bool:
    """Verificar si una base de datos existe"""
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
            {"db_name": db_name}
        )
        return result.scalar() is not None


async def get_table_count(engine, table_name: str) -> int:
    """Obtener el número de registros en una tabla"""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text(f"SELECT COUNT(*) FROM {table_name}")
            )
            return result.scalar() or 0
    except Exception as e:
        print(f"   ⚠️  Error al contar {table_name}: {e}")
        return 0


async def migrate_database():
    """Migrar datos de agenciops_db a nougram_db"""
    print("=" * 70)
    print("MIGRACIÓN DE BASE DE DATOS: agenciops_db → nougram_db")
    print("=" * 70)
    print()
    
    # URLs de conexión
    source_url = settings.DATABASE_URL.replace("nougram_db", "agenciops_db")
    target_url = settings.DATABASE_URL.replace("agenciops_db", "nougram_db")
    
    # Extraer información de conexión
    if "agenciops_db" in settings.DATABASE_URL:
        # Si estamos usando agenciops_db, migrar a nougram_db
        source_url = settings.DATABASE_URL
        # Construir target_url basado en source_url
        if "5435" in source_url:
            target_url = source_url.replace("agenciops_db", "nougram_db")
        else:
            target_url = source_url.replace("agenciops_db", "nougram_db")
    else:
        print("⚠️  Ya estás usando nougram_db. No hay necesidad de migrar.")
        return
    
    print(f"📊 Base de datos origen:  {source_url.split('@')[-1] if '@' in source_url else source_url}")
    print(f"📊 Base de datos destino: {target_url.split('@')[-1] if '@' in target_url else target_url}")
    print()
    
    # Crear engines
    source_engine = create_async_engine(source_url, echo=False)
    target_engine = create_async_engine(target_url, echo=False)
    
    try:
        # Verificar que ambas bases de datos existen
        print("🔍 Verificando bases de datos...")
        
        # Para verificar, necesitamos conectarnos a postgres directamente
        admin_url = source_url.rsplit("/", 1)[0] + "/postgres"
        admin_engine = create_async_engine(admin_url, echo=False)
        
        source_db = source_url.split("/")[-1]
        target_db = target_url.split("/")[-1]
        
        async with admin_engine.connect() as conn:
            # Verificar source
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": source_db}
            )
            source_exists = result.scalar() is not None
            
            # Verificar target
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": target_db}
            )
            target_exists = result.scalar() is not None
        
        await admin_engine.dispose()
        
        if not source_exists:
            print(f"❌ Error: Base de datos origen '{source_db}' no existe")
            return
        
        if not target_exists:
            print(f"⚠️  Base de datos destino '{target_db}' no existe")
            print(f"   Creando base de datos...")
            async with admin_engine.connect() as conn:
                await conn.execute(text("COMMIT"))  # Salir de transacción
                await conn.execute(text(f'CREATE DATABASE "{target_db}"'))
            print(f"   ✅ Base de datos '{target_db}' creada")
        
        print("✅ Ambas bases de datos existen")
        print()
        
        # Listar tablas en source
        print("📋 Analizando estructura de datos...")
        async with source_engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]
        
        print(f"   Encontradas {len(tables)} tablas")
        print()
        
        # Mostrar estadísticas de source
        print("📊 Estadísticas de base de datos origen:")
        for table in tables:
            count = await get_table_count(source_engine, table)
            if count > 0:
                print(f"   {table:30} {count:>6} registros")
        print()
        
        # Confirmar migración
        print("⚠️  ADVERTENCIA: Esta operación copiará todos los datos.")
        print("   Asegúrate de tener un backup antes de continuar.")
        print()
        response = input("¿Continuar con la migración? (sí/no): ").strip().lower()
        
        if response not in ['sí', 'si', 'yes', 'y', 's']:
            print("❌ Migración cancelada")
            return
        
        print()
        print("🚀 Iniciando migración...")
        print()
        
        # Usar pg_dump y pg_restore sería más eficiente, pero usaremos SQL directo
        # para tener más control
        
        # Para cada tabla, copiar datos
        migrated_tables = 0
        total_records = 0
        
        for table in tables:
            try:
                print(f"📦 Migrando tabla: {table}...", end=" ")
                
                # Obtener datos de source
                async with source_engine.connect() as source_conn:
                    result = await source_conn.execute(text(f"SELECT * FROM {table}"))
                    rows = result.fetchall()
                    columns = result.keys()
                
                if not rows:
                    print("vacía (omitida)")
                    continue
                
                # Insertar en target
                if rows:
                    # Construir query de inserción
                    col_names = ", ".join(columns)
                    placeholders = ", ".join([f":{col}" for col in columns])
                    insert_query = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
                    
                    async with target_engine.begin() as target_conn:
                        # Limpiar tabla destino primero (opcional, comentado por seguridad)
                        # await target_conn.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
                        
                        # Insertar datos
                        for row in rows:
                            row_dict = dict(zip(columns, row))
                            await target_conn.execute(text(insert_query), row_dict)
                    
                    migrated_tables += 1
                    total_records += len(rows)
                    print(f"✅ {len(rows)} registros")
                else:
                    print("vacía")
            
            except Exception as e:
                print(f"❌ Error: {e}")
                continue
        
        print()
        print("=" * 70)
        print("✅ MIGRACIÓN COMPLETADA")
        print("=" * 70)
        print(f"   Tablas migradas: {migrated_tables}/{len(tables)}")
        print(f"   Total de registros: {total_records}")
        print()
        print("📝 Próximos pasos:")
        print("   1. Verificar que los datos se migraron correctamente")
        print("   2. Actualizar DATABASE_URL en .env a nougram_db")
        print("   3. Ejecutar: alembic upgrade head (por si acaso)")
        print("   4. Probar la aplicación")
        print()
    
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        await source_engine.dispose()
        await target_engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate_database())

