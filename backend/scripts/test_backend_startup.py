"""
Script para probar el inicio del backend y detectar errores
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_imports():
    """Probar imports críticos"""
    print("=" * 70)
    print("PRUEBA DE INICIO DEL BACKEND")
    print("=" * 70)
    print()
    
    errors = []
    
    # 1. Probar importar config
    print("[1/6] Probando importar config...")
    try:
        from app.core.config import settings
        print("   [OK] Config importado")
        print(f"   DATABASE_URL: {'Configurado' if settings.DATABASE_URL else 'NO configurado'}")
    except Exception as e:
        print(f"   [ERROR] {e}")
        errors.append(f"Error en config: {e}")
    
    # 2. Probar importar database
    print()
    print("[2/6] Probando importar database...")
    try:
        from app.core.database import engine, Base
        print("   [OK] Database importado")
    except Exception as e:
        print(f"   [ERROR] {e}")
        errors.append(f"Error en database: {e}")
    
    # 3. Probar importar modelos
    print()
    print("[3/6] Probando importar modelos...")
    try:
        import app.models
        print("   [OK] Modelos importados")
    except Exception as e:
        print(f"   [ERROR] {e}")
        errors.append(f"Error en modelos: {e}")
    
    # 4. Probar importar router
    print()
    print("[4/6] Probando importar router...")
    try:
        from app.api.v1.router import api_router
        print("   [OK] Router importado")
    except Exception as e:
        print(f"   [ERROR] {e}")
        errors.append(f"Error en router: {e}")
    
    # 5. Probar crear app FastAPI
    print()
    print("[5/6] Probando crear app FastAPI...")
    try:
        from fastapi import FastAPI
        from app.core.config import settings
        from app.core.database import engine, Base
        from app.api.v1.router import api_router
        
        app = FastAPI(title="Nougram API")
        print("   [OK] App FastAPI creada")
    except Exception as e:
        print(f"   [ERROR] {e}")
        errors.append(f"Error creando app: {e}")
    
    # 6. Probar conexión a base de datos
    print()
    print("[6/6] Probando conexión a base de datos...")
    try:
        import asyncio
        from app.core.database import engine
        
        async def test_connection():
            async with engine.connect() as conn:
                await conn.execute("SELECT 1")
                return True
        
        result = asyncio.run(test_connection())
        if result:
            print("   [OK] Conexión a base de datos exitosa")
    except Exception as e:
        print(f"   [ERROR] {e}")
        errors.append(f"Error en conexión BD: {e}")
    
    print()
    print("=" * 70)
    if errors:
        print("[ERROR] SE ENCONTRARON ERRORES:")
        for error in errors:
            print(f"   - {error}")
        print()
        print("El backend NO puede iniciar debido a estos errores.")
        return False
    else:
        print("[OK] TODAS LAS PRUEBAS PASARON")
        print("El backend debería poder iniciar correctamente.")
        return True
    print("=" * 70)


if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)

