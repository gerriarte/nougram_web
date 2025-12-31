"""
Script para analizar los cálculos de costos operativos y detectar problemas
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
from app.models.team import TeamMember
from app.models.cost import CostFixed
from app.models.organization import Organization
from app.core.calculations import calculate_blended_cost_rate
from app.core.currency import normalize_to_primary_currency, EXCHANGE_RATES_TO_USD


async def analyze_operational_costs():
    """Analizar cálculos de costos operativos"""
    print("=" * 70)
    print("ANALISIS: CALCULOS DE COSTOS OPERATIVOS")
    print("=" * 70)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # 1. Obtener organización
            result = await session.execute(select(Organization).limit(1))
            org = result.scalar_one_or_none()
            
            if not org:
                print("[ERROR] No hay organizaciones en la BD")
                return
            
            org_id = org.id
            primary_currency = (org.settings or {}).get('primary_currency', 'USD')
            social_config = org.settings.get('social_charges_config') if org.settings else None
            
            print(f"[INFO] Organización ID: {org_id}")
            print(f"[INFO] Moneda primaria: {primary_currency}")
            print()
            
            # 2. Analizar miembros del equipo
            print("[1/5] ANALIZANDO MIEMBROS DEL EQUIPO")
            print("-" * 70)
            result = await session.execute(
                select(TeamMember).where(
                    TeamMember.organization_id == org_id,
                    TeamMember.is_active == True
                )
            )
            team_members = result.scalars().all()
            
            if not team_members:
                print("   [ERROR] No hay miembros del equipo activos")
            else:
                print(f"   [OK] Miembros activos: {len(team_members)}")
                print()
                
                total_salaries_raw = 0.0
                total_salaries_normalized = 0.0
                total_hours = 0.0
                
                # Calcular multiplicador de cargas sociales
                social_charges_multiplier = 1.0
                if social_config and social_config.get('enable_social_charges', False):
                    total_percentage = 0.0
                    total_percentage += social_config.get('health_percentage', 0) or 0
                    total_percentage += social_config.get('pension_percentage', 0) or 0
                    total_percentage += social_config.get('arl_percentage', 0) or 0
                    total_percentage += social_config.get('parafiscales_percentage', 0) or 0
                    total_percentage += social_config.get('prima_services_percentage', 0) or 0
                    total_percentage += social_config.get('cesantias_percentage', 0) or 0
                    total_percentage += social_config.get('int_cesantias_percentage', 0) or 0
                    total_percentage += social_config.get('vacations_percentage', 0) or 0
                    
                    if total_percentage == 0:
                        total_percentage = social_config.get('total_percentage', 0) or 0
                    
                    if total_percentage:
                        social_charges_multiplier = 1.0 + (total_percentage / 100.0)
                        print(f"   [INFO] Multiplicador de cargas sociales: {social_charges_multiplier:.4f} ({total_percentage}%)")
                        print()
                
                for member in team_members:
                    member_currency = member.currency or "USD"
                    salary_raw = member.salary_monthly_brute
                    salary_normalized = normalize_to_primary_currency(
                        salary_raw,
                        member_currency,
                        primary_currency
                    )
                    salary_with_charges = salary_normalized * social_charges_multiplier
                    
                    hours_per_month = member.billable_hours_per_week * 4.33 * (
                        1 - (member.non_billable_hours_percentage or 0.0)
                    )
                    
                    total_salaries_raw += salary_raw
                    total_salaries_normalized += salary_with_charges
                    total_hours += hours_per_month
                    
                    print(f"   Miembro: {member.name}")
                    print(f"      Salario bruto: {salary_raw} {member_currency}")
                    print(f"      Salario normalizado: {salary_normalized:.2f} {primary_currency}")
                    print(f"      Con cargas sociales: {salary_with_charges:.2f} {primary_currency}")
                    print(f"      Horas facturables/semana: {member.billable_hours_per_week}")
                    print(f"      Horas no facturables %: {(member.non_billable_hours_percentage or 0.0) * 100:.1f}%")
                    print(f"      Horas facturables/mes: {hours_per_month:.2f}")
                    print()
                
                print(f"   [RESUMEN] Total salarios brutos: {total_salaries_raw:.2f}")
                print(f"   [RESUMEN] Total salarios normalizados: {total_salaries_normalized:.2f} {primary_currency}")
                print(f"   [RESUMEN] Total horas facturables/mes: {total_hours:.2f}")
                print()
            
            # 3. Analizar costos fijos
            print("[2/5] ANALIZANDO COSTOS FIJOS")
            print("-" * 70)
            result = await session.execute(
                select(CostFixed).where(
                    CostFixed.organization_id == org_id,
                    CostFixed.deleted_at.is_(None)
                )
            )
            fixed_costs = result.scalars().all()
            
            if not fixed_costs:
                print("   [WARNING] No hay costos fijos configurados")
            else:
                print(f"   [OK] Costos fijos: {len(fixed_costs)}")
                print()
                
                total_fixed_raw = 0.0
                total_fixed_normalized = 0.0
                total_overhead = 0.0
                total_tools = 0.0
                
                # Categorías que se consideran "Overhead"
                overhead_categories = ['Overhead', 'Infrastructure', 'Office', 'Utilities', 'Rent']
                # Categorías que se consideran "Tools" o "Software"
                tools_categories = ['Software', 'Tools', 'SaaS', 'Subscriptions', 'Licenses']
                
                for cost in fixed_costs:
                    cost_currency = cost.currency or "USD"
                    amount_raw = cost.amount_monthly
                    amount_normalized = normalize_to_primary_currency(
                        amount_raw,
                        cost_currency,
                        primary_currency
                    )
                    
                    total_fixed_raw += amount_raw
                    total_fixed_normalized += amount_normalized
                    
                    # Categorizar
                    category = cost.category or ""
                    if category in overhead_categories:
                        total_overhead += amount_normalized
                    elif category in tools_categories:
                        total_tools += amount_normalized
                    else:
                        # Si no coincide, se cuenta como overhead por defecto
                        total_overhead += amount_normalized
                    
                    print(f"   Costo: {cost.name}")
                    print(f"      Monto: {amount_raw} {cost_currency}")
                    print(f"      Normalizado: {amount_normalized:.2f} {primary_currency}")
                    print(f"      Categoría: {category}")
                    if category in overhead_categories:
                        print(f"      Tipo: Overhead")
                    elif category in tools_categories:
                        print(f"      Tipo: Tools/SaaS")
                    else:
                        print(f"      Tipo: Overhead (por defecto)")
                    print()
                
                print(f"   [RESUMEN] Total costos fijos brutos: {total_fixed_raw:.2f}")
                print(f"   [RESUMEN] Total costos fijos normalizados: {total_fixed_normalized:.2f} {primary_currency}")
                print(f"   [RESUMEN] Total Overhead: {total_overhead:.2f} {primary_currency}")
                print(f"   [RESUMEN] Total Tools/SaaS: {total_tools:.2f} {primary_currency}")
                print()
            
            # 4. Calcular Blended Cost Rate
            print("[3/5] CALCULANDO BLENDED COST RATE")
            print("-" * 70)
            try:
                blended_rate = await calculate_blended_cost_rate(
                    session,
                    primary_currency=primary_currency,
                    tenant_id=org_id,
                    social_charges_config=social_config,
                    use_cache=False  # No usar cache para análisis detallado
                )
                
                total_monthly_costs = total_salaries_normalized + total_fixed_normalized
                
                print(f"   [RESULTADO] Blended Cost Rate: {blended_rate:.2f} {primary_currency}/hora")
                print(f"   [FORMULA] Total Costos Mensuales / Total Horas Facturables")
                print(f"   [FORMULA] {total_monthly_costs:.2f} / {total_hours:.2f} = {blended_rate:.2f}")
                print()
            except Exception as e:
                print(f"   [ERROR] Error al calcular: {e}")
                import traceback
                traceback.print_exc()
                print()
            
            # 5. Comparar con endpoint
            print("[4/5] COMPARANDO CON ENDPOINT")
            print("-" * 70)
            print("   [INFO] El endpoint /calculations/agency-cost-hour debería retornar:")
            print(f"      - blended_cost_rate: {blended_rate:.2f}")
            print(f"      - total_monthly_costs: {total_salaries_normalized + total_fixed_normalized:.2f}")
            print(f"      - total_salaries: {total_salaries_normalized:.2f}")
            print(f"      - total_fixed_overhead: {total_overhead:.2f}")
            print(f"      - total_tools_costs: {total_tools:.2f}")
            print(f"      - total_monthly_hours: {total_hours:.2f}")
            print(f"      - active_team_members: {len(team_members)}")
            print()
            
            # 6. Verificar problemas comunes
            print("[5/5] VERIFICANDO PROBLEMAS COMUNES")
            print("-" * 70)
            
            issues = []
            
            if not team_members:
                issues.append("[ERROR] No hay miembros del equipo - BCR será 0")
            
            if total_hours == 0:
                issues.append("[ERROR] Total de horas facturables es 0 - BCR será 0")
            
            if blended_rate == 0:
                issues.append("[ERROR] Blended Cost Rate es 0")
            
            if total_fixed_normalized == 0:
                issues.append("[WARNING] No hay costos fijos configurados")
            
            # Verificar categorización
            uncategorized = [c for c in fixed_costs if c.category not in overhead_categories + tools_categories]
            if uncategorized:
                issues.append(f"[WARNING] {len(uncategorized)} costos con categorías no reconocidas (se cuentan como Overhead)")
            
            # Verificar normalización de monedas
            different_currencies = set()
            for member in team_members:
                if member.currency and member.currency != primary_currency:
                    different_currencies.add(member.currency)
            for cost in fixed_costs:
                if cost.currency and cost.currency != primary_currency:
                    different_currencies.add(cost.currency)
            
            if different_currencies:
                print(f"   [INFO] Monedas diferentes encontradas: {', '.join(different_currencies)}")
                print(f"   [INFO] Tasas de cambio usadas:")
                for curr in different_currencies:
                    if curr in EXCHANGE_RATES_TO_USD:
                        rate = EXCHANGE_RATES_TO_USD[curr]
                        print(f"      {curr}: 1 USD = {rate} {curr}")
                    else:
                        issues.append(f"[WARNING] No hay tasa de cambio para {curr}")
                print()
            
            if issues:
                print("   [PROBLEMAS ENCONTRADOS:]")
                for issue in issues:
                    print(f"      {issue}")
            else:
                print("   [OK] No se encontraron problemas obvios")
            
            print()
            print("=" * 70)
            
    except Exception as e:
        print(f"[ERROR] Error durante análisis: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(analyze_operational_costs())

