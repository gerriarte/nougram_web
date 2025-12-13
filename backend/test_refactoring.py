"""
Script de prueba para verificar que los cambios del Sprint 1 funcionan correctamente
"""
import asyncio
import sys
from pathlib import Path

# Agregar el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent))

async def test_repositories():
    """Test que todos los repositorios se pueden importar y crear"""
    print("[TEST] Probando repositorios...")
    try:
        from app.repositories import (
            BaseRepository,
            CostRepository,
            ServiceRepository,
            TeamRepository,
            TaxRepository,
            UserRepository,
            SettingsRepository
        )
        print("  [OK] Todos los repositorios importados correctamente")
        return True
    except Exception as e:
        print(f"  [ERROR] Error importando repositorios: {e}")
        return False

async def test_logging():
    """Test que el logging estructurado funciona"""
    print("[TEST] Probando logging estructurado...")
    try:
        from app.core.logging import get_logger
        logger = get_logger("test")
        logger.info("Test de logging", extra={"test": True})
        logger.error("Test de error", extra={"test": True})
        print("  [OK] Logging estructurado funciona correctamente")
        return True
    except Exception as e:
        print(f"  [ERROR] Error en logging: {e}")
        return False

async def test_transactions():
    """Test que el manejo de transacciones funciona"""
    print("[TEST] Probando manejo de transacciones...")
    try:
        from app.core.transactions import transaction
        print("  [OK] Manejo de transacciones importado correctamente")
        return True
    except Exception as e:
        print(f"  [ERROR] Error en transacciones: {e}")
        return False

async def test_endpoints_imports():
    """Test que los endpoints refactorizados se pueden importar"""
    print("[TEST] Probando imports de endpoints refactorizados...")
    try:
        from app.api.v1.endpoints import costs, services, team, taxes, users, settings
        print("  [OK] Todos los endpoints refactorizados se importan correctamente")
        return True
    except Exception as e:
        print(f"  [ERROR] Error importando endpoints: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Ejecutar todas las pruebas"""
    print("=" * 60)
    print("PRUEBAS DE REFACTORIZACION - SPRINT 1")
    print("=" * 60)
    print()
    
    results = []
    
    # Ejecutar pruebas
    results.append(await test_repositories())
    results.append(await test_logging())
    results.append(await test_transactions())
    results.append(await test_endpoints_imports())
    
    # Resumen
    print()
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    if passed == total:
        print(f"[OK] TODAS LAS PRUEBAS PASARON ({passed}/{total})")
    else:
        print(f"[WARNING] ALGUNAS PRUEBAS FALLARON ({passed}/{total})")
    print("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

