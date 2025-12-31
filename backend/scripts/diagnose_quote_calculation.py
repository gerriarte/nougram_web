"""
Script de diagnóstico para verificar por qué no se calculan los valores de las propuestas
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.models.user import User
from app.models.team import TeamMember
from app.models.cost import CostFixed
from app.models.service import Service
from app.models.organization import Organization
from app.core.calculations import calculate_blended_cost_rate


async def diagnose_quote_calculation():
    """Diagnosticar problemas con el cálculo de propuestas"""
    print("=" * 70)
    print("DIAGNOSTICO: CALCULO DE VALORES EN PROPUESTAS")
    print("=" * 70)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # 1. Verificar organización
            print("[1/7] Verificando organización...")
            result = await session.execute(select(Organization).limit(1))
            org = result.scalar_one_or_none()
            
            if not org:
                print("   [ERROR] No hay organizaciones en la BD")
                return
            
            org_id = org.id
            primary_currency = (org.settings or {}).get('primary_currency', 'USD')
            print(f"   [OK] Organización ID: {org_id}")
            print(f"   [OK] Moneda primaria: {primary_currency}")
            print()
            
            # 2. Verificar miembros del equipo
            print("[2/7] Verificando miembros del equipo...")
            result = await session.execute(
                select(TeamMember).where(
                    TeamMember.organization_id == org_id
                )
            )
            team_members = result.scalars().all()
            
            if not team_members:
                print("   [ERROR] No hay miembros del equipo configurados")
                print("   [SOLUCION] Configura miembros del equipo en Settings > Team")
            else:
                total_salary = sum(m.salary or 0 for m in team_members)
                total_billable_hours = sum(m.billable_hours_per_month or 0 for m in team_members)
                print(f"   [OK] Miembros del equipo: {len(team_members)}")
                print(f"   [OK] Salario total mensual: {total_salary}")
                print(f"   [OK] Horas facturables totales: {total_billable_hours}")
                if total_billable_hours == 0:
                    print("   [WARNING] Total de horas facturables es 0")
            print()
            
            # 3. Verificar costos fijos
            print("[3/7] Verificando costos fijos...")
            result = await session.execute(
                select(CostFixed).where(
                    CostFixed.organization_id == org_id,
                    CostFixed.deleted_at.is_(None)
                )
            )
            fixed_costs = result.scalars().all()
            
            if not fixed_costs:
                print("   [WARNING] No hay costos fijos configurados")
                print("   [INFO] Los costos fijos son opcionales pero afectan el cálculo")
            else:
                total_fixed = sum(c.amount_monthly or 0 for c in fixed_costs)
                print(f"   [OK] Costos fijos: {len(fixed_costs)}")
                print(f"   [OK] Total costos fijos mensuales: {total_fixed}")
            print()
            
            # 4. Calcular blended cost rate
            print("[4/7] Calculando Blended Cost Rate...")
            try:
                social_config = org.settings.get('social_charges_config') if org.settings else None
                blended_rate = await calculate_blended_cost_rate(
                    session,
                    primary_currency=primary_currency,
                    tenant_id=org_id,
                    social_charges_config=social_config
                )
                
                if blended_rate <= 0:
                    print(f"   [ERROR] Blended Cost Rate es {blended_rate}")
                    print("   [CAUSA] No hay datos suficientes para calcular")
                    print("   [SOLUCION] Configura miembros del equipo con salarios y horas facturables")
                else:
                    print(f"   [OK] Blended Cost Rate: {blended_rate} {primary_currency}/hora")
            except Exception as e:
                print(f"   [ERROR] Error al calcular Blended Cost Rate: {e}")
            print()
            
            # 5. Verificar servicios
            print("[5/7] Verificando servicios...")
            result = await session.execute(
                select(Service).where(
                    Service.organization_id == org_id,
                    Service.deleted_at.is_(None)
                )
            )
            services = result.scalars().all()
            
            if not services:
                print("   [ERROR] No hay servicios configurados")
                print("   [SOLUCION] Configura servicios en Settings > Services")
            else:
                active_services = [s for s in services if s.is_active]
                print(f"   [OK] Total servicios: {len(services)}")
                print(f"   [OK] Servicios activos: {len(active_services)}")
                
                # Verificar configuración de servicios
                services_without_margin = [s for s in active_services if not s.default_margin_target or s.default_margin_target <= 0]
                services_without_pricing = [s for s in active_services if not s.pricing_type]
                
                if services_without_margin:
                    print(f"   [WARNING] {len(services_without_margin)} servicios sin margen objetivo:")
                    for s in services_without_margin[:3]:
                        print(f"      - {s.name} (ID: {s.id})")
                
                if services_without_pricing:
                    print(f"   [WARNING] {len(services_without_pricing)} servicios sin tipo de pricing:")
                    for s in services_without_pricing[:3]:
                        print(f"      - {s.name} (ID: {s.id})")
            print()
            
            # 6. Verificar usuarios
            print("[6/7] Verificando usuarios...")
            result = await session.execute(
                select(User).where(User.organization_id == org_id)
            )
            users = result.scalars().all()
            print(f"   [OK] Usuarios en organización: {len(users)}")
            print()
            
            # 7. Resumen y recomendaciones
            print("[7/7] RESUMEN Y RECOMENDACIONES")
            print("=" * 70)
            
            issues = []
            if not team_members:
                issues.append("[ERROR] No hay miembros del equipo configurados")
            elif total_billable_hours == 0:
                issues.append("[WARNING] Los miembros del equipo no tienen horas facturables")
            
            if blended_rate <= 0:
                issues.append("[ERROR] Blended Cost Rate es 0 o negativo")
            
            if not services:
                issues.append("[ERROR] No hay servicios configurados")
            elif len(active_services) == 0:
                issues.append("[ERROR] No hay servicios activos")
            
            if services_without_margin:
                issues.append(f"[WARNING] {len(services_without_margin)} servicios sin margen objetivo")
            
            if not issues:
                print("[OK] Todo está configurado correctamente")
                print()
                print("Si aún no ves los valores calculados:")
                print("   1. Verifica que los items tengan los campos requeridos:")
                print("      - hourly: estimated_hours > 0")
                print("      - fixed: fixed_price > 0 y quantity > 0")
                print("      - recurring: recurring_price > 0 y billing_frequency")
                print("   2. Revisa los logs del backend al crear una propuesta")
                print("   3. Verifica la consola del navegador por errores")
            else:
                print("[PROBLEMAS ENCONTRADOS:]")
                for issue in issues:
                    print(f"   {issue}")
                print()
                print("[SOLUCIONES:]")
                if not team_members or total_billable_hours == 0:
                    print("   1. Ve a Settings > Team y agrega miembros con:")
                    print("      - Salario mensual")
                    print("      - Horas facturables por mes")
                if not services or len(active_services) == 0:
                    print("   2. Ve a Settings > Services y:")
                    print("      - Crea servicios activos")
                    print("      - Configura margen objetivo (default_margin_target)")
                    print("      - Configura tipo de pricing")
                if services_without_margin:
                    print("   3. Edita los servicios y configura el margen objetivo")
            
            print()
            print("=" * 70)
            
    except Exception as e:
        print(f"[ERROR] Error durante diagnóstico: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(diagnose_quote_calculation())

