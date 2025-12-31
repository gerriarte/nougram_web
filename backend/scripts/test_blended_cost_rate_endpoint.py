"""
Script para probar el endpoint de blended cost rate y ver qué está retornando
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.models.user import User
from app.models.team import TeamMember
from app.models.cost import CostFixed
from app.models.organization import Organization
from app.core.tenant import TenantContext
from app.api.v1.endpoints.costs import calculate_agency_cost_hour


async def test_endpoint():
    """Probar el endpoint directamente"""
    print("=" * 70)
    print("PRUEBA DEL ENDPOINT: /settings/calculations/agency-cost-hour")
    print("=" * 70)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Obtener usuario y organización
            result = await session.execute(select(User).limit(1))
            user = result.scalar_one_or_none()
            
            if not user:
                print("[ERROR] No hay usuarios en la BD")
                return
            
            result = await session.execute(select(Organization).where(Organization.id == user.organization_id))
            org = result.scalar_one_or_none()
            
            if not org:
                print("[ERROR] Usuario no tiene organización")
                return
            
            print(f"[INFO] Usuario: {user.email}")
            print(f"[INFO] Organización ID: {org.id}")
            print()
            
            # Crear TenantContext directamente
            from app.core.tenant import TenantContext
            tenant = TenantContext(organization_id=org.id, organization=org)
            
            # Llamar al endpoint directamente
            print("[INFO] Llamando al endpoint calculate_agency_cost_hour...")
            try:
                response = await calculate_agency_cost_hour(
                    tenant=tenant,
                    current_user=user,
                    db=session
                )
                
                print()
                print("[RESULTADO DEL ENDPOINT:]")
                print(f"   blended_cost_rate: {response.blended_cost_rate}")
                print(f"   total_monthly_costs: {response.total_monthly_costs}")
                print(f"   total_fixed_overhead: {response.total_fixed_overhead}")
                print(f"   total_tools_costs: {response.total_tools_costs}")
                print(f"   total_salaries: {response.total_salaries}")
                print(f"   total_monthly_hours: {response.total_monthly_hours}")
                print(f"   active_team_members: {response.active_team_members}")
                print(f"   primary_currency: {response.primary_currency}")
                print()
                
                if response.blended_cost_rate == 0:
                    print("[PROBLEMA] blended_cost_rate es 0")
                    print()
                    print("[DIAGNOSTICO:]")
                    if response.total_monthly_hours == 0:
                        print("   - Total horas mensuales es 0")
                        print("   - CAUSA: No hay miembros del equipo o no tienen horas facturables")
                    if response.total_monthly_costs == 0:
                        print("   - Total costos mensuales es 0")
                        print("   - CAUSA: No hay costos fijos ni salarios configurados")
                    if response.total_salaries == 0:
                        print("   - Total salarios es 0")
                        print("   - CAUSA: No hay miembros del equipo activos")
                    if response.total_fixed_overhead == 0 and response.total_tools_costs == 0:
                        print("   - Total costos fijos es 0")
                        print("   - CAUSA: No hay costos fijos configurados")
                else:
                    print("[OK] El endpoint está retornando valores correctos")
                
            except Exception as e:
                print(f"[ERROR] Error al llamar al endpoint: {e}")
                import traceback
                traceback.print_exc()
            
            print()
            print("=" * 70)
            
    except Exception as e:
        print(f"[ERROR] Error durante la prueba: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_endpoint())

