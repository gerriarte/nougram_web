# Backend Specification: Módulo de Punto de Equilibrio (Break-Even Point)

**Versión:** 1.0  
**Fecha:** 2026-01-25  
**Estado:** Pendiente de Implementación  
**Prioridad:** Media (módulo complementario de análisis financiero)

---

## Resumen Ejecutivo

Este documento especifica el módulo de **Punto de Equilibrio (Break-Even Point)** como servicio complementario que permite a las agencias calcular cuántas horas billables o ingresos necesitan para cubrir todos sus costos operacionales, proyectar escenarios financieros y tomar decisiones estratégicas basadas en datos.

**Objetivo:** Proporcionar análisis financiero avanzado que complemente el sistema de cotizaciones, permitiendo a las agencias entender su punto de equilibrio, proyectar rentabilidad y simular escenarios de negocio.

**Duración Estimada:** 2-3 sprints (4-6 semanas)  
**Prioridad:** Media (complementa funcionalidad core pero no es crítica)

**Beneficios:**
- Entender cuántas horas billables se necesitan para cubrir costos
- Proyectar rentabilidad basada en cotizaciones existentes
- Simular escenarios (subir/bajar BCR, agregar/quitar costos fijos)
- Tomar decisiones estratégicas basadas en datos financieros
- Identificar cuándo se alcanzará el punto de equilibrio con proyectos actuales

---

## 1. Conceptos Clave

### 1.1 Punto de Equilibrio (Break-Even Point)

**Definición:** El punto donde los ingresos totales igualan los costos totales (sin ganancia ni pérdida).

**Fórmula Básica:**
```
Punto de Equilibrio (en horas) = Costos Fijos Totales / BCR
Punto de Equilibrio (en ingresos) = Costos Fijos Totales / (1 - Margen Promedio)
```

**En el contexto de una agencia:**
- **Costos Fijos Totales:** Suma de todos los costos mensuales (salarios, overhead, software, etc.)
- **BCR:** Blended Cost Rate (costo por hora billable)
- **Margen Promedio:** Margen promedio de las cotizaciones activas

---

### 1.2 Métricas Relacionadas

**1. Margen de Seguridad (Safety Margin):**
```
Margen de Seguridad = (Horas Actuales - Horas de Equilibrio) / Horas de Equilibrio * 100
```
Indica qué tan lejos está la agencia del punto de equilibrio.

**2. Apalancamiento Operativo:**
```
Apalancamiento = Costos Fijos / Costos Totales
```
Indica qué tan sensibles son las utilidades a cambios en ingresos.

**3. Tiempo para Equilibrio:**
```
Tiempo = (Horas de Equilibrio - Horas Asignadas) / Velocidad de Asignación Mensual
```
Proyecta cuándo se alcanzará el equilibrio con el ritmo actual.

---

## 2. Arquitectura del Módulo

### 2.1 Servicio Principal

**Ubicación:** `backend/app/services/break_even_service.py` (nuevo archivo)

**Responsabilidades:**
- Calcular punto de equilibrio en horas e ingresos
- Proyectar escenarios financieros
- Analizar sensibilidad a cambios en costos/precios
- Calcular métricas relacionadas (margen de seguridad, apalancamiento)

---

### 2.2 Endpoints API

**Base Path:** `/api/v1/analytics/break-even`

**Endpoints:**
- `GET /api/v1/analytics/break-even`: Análisis de punto de equilibrio actual
- `POST /api/v1/analytics/break-even/scenarios`: Simular escenarios
- `GET /api/v1/analytics/break-even/projection`: Proyección temporal

---

## 3. Modelos de Datos

### 3.1 No Requiere Nuevos Modelos

**Uso de Modelos Existentes:**
- `CostFixed`: Costos fijos mensuales
- `TeamMember`: Miembros del equipo (para calcular horas disponibles)
- `Quote`: Cotizaciones (para calcular ingresos proyectados)
- `QuoteResourceAllocation`: Asignaciones de recursos (para calcular horas asignadas)

**Nota:** Este módulo es principalmente de cálculo y análisis, no requiere persistencia de datos propios.

---

## 4. Especificación de Endpoints

### 4.1 Análisis de Punto de Equilibrio Actual

#### `GET /api/v1/analytics/break-even`

**Descripción:** Calcula el punto de equilibrio actual basado en costos fijos, BCR y cotizaciones activas.

**Query Parameters:**
- `currency`: string (opcional, default: moneda principal de la organización)
- `include_projected`: boolean (opcional, default: true) - Incluir cotizaciones en estado Draft/Sent
- `period`: string (opcional, "monthly" | "quarterly" | "annual", default: "monthly")

**Response (`BreakEvenAnalysisResponse`):**

```json
{
  "period": "monthly",
  "currency": "COP",
  
  // Costos
  "total_fixed_costs": "15000000",
  "total_variable_costs": "5000000",
  "total_costs": "20000000",
  
  // Horas
  "total_billable_hours_available": 500.0,
  "break_even_hours": 300.0,
  "current_allocated_hours": 250.0,
  "hours_to_break_even": 50.0,
  "safety_margin_hours": -50.0,
  "safety_margin_percentage": -16.67,
  
  // Ingresos
  "break_even_revenue": "20000000",
  "current_projected_revenue": "16666667",
  "revenue_to_break_even": "3333333",
  "average_margin": 0.25,
  
  // Métricas
  "operating_leverage": 0.75,
  "current_utilization_rate": 50.0,
  "break_even_utilization_rate": 60.0,
  
  // Estado
  "status": "below_break_even",
  "status_message": "Necesitas 50 horas adicionales para alcanzar el punto de equilibrio",
  
  // Proyección temporal
  "months_to_break_even": 1.5,
  "projected_break_even_date": "2026-03-15"
}
```

**Lógica de Cálculo:**

1. **Calcular Costos Fijos Totales:**
   ```python
   total_fixed_costs = sum(cost.amount_monthly for cost in fixed_costs)
   ```

2. **Calcular BCR Actual:**
   ```python
   bcr = await calculate_blended_cost_rate(db, organization_id)
   ```

3. **Calcular Horas de Equilibrio:**
   ```python
   break_even_hours = total_fixed_costs / bcr
   ```

4. **Calcular Horas Asignadas Actuales:**
   ```python
   # Si hay asignaciones de recursos
   if resource_allocations_exist:
       allocated_hours = sum(allocation.allocated_hours for allocation in active_allocations)
   else:
       # Usar horas estimadas de cotizaciones activas
       allocated_hours = sum(item.estimated_hours for item in active_quote_items)
   ```

5. **Calcular Ingresos de Equilibrio:**
   ```python
   # Opción 1: Basado en BCR y margen promedio
   average_margin = calculate_average_margin(active_quotes)
   break_even_revenue = total_fixed_costs / (1 - average_margin)
   
   # Opción 2: Basado en precio promedio por hora
   average_hourly_rate = calculate_average_hourly_rate(active_quotes)
   break_even_revenue = break_even_hours * average_hourly_rate
   ```

6. **Calcular Estado:**
   ```python
   if allocated_hours >= break_even_hours:
       status = "above_break_even"
       status_message = f"Estás {allocated_hours - break_even_hours:.1f} horas por encima del equilibrio"
   else:
       status = "below_break_even"
       status_message = f"Necesitas {break_even_hours - allocated_hours:.1f} horas adicionales"
   ```

---

### 4.2 Simulación de Escenarios

#### `POST /api/v1/analytics/break-even/scenarios`

**Descripción:** Simula diferentes escenarios cambiando variables (BCR, costos fijos, precio promedio).

**Payload (`BreakEvenScenarioRequest`):**

```json
{
  "scenarios": [
    {
      "name": "Aumentar BCR 10%",
      "bcr_multiplier": 1.1,
      "fixed_costs_adjustment": 0,
      "average_margin_adjustment": 0
    },
    {
      "name": "Agregar nuevo empleado",
      "bcr_multiplier": 1.0,
      "fixed_costs_adjustment": 5000000,
      "average_margin_adjustment": 0
    },
    {
      "name": "Aumentar precios 15%",
      "bcr_multiplier": 1.0,
      "fixed_costs_adjustment": 0,
      "average_margin_adjustment": 0.15
    }
  ],
  "currency": "COP"
}
```

**Response (`BreakEvenScenariosResponse`):**

```json
{
  "base_scenario": {
    "break_even_hours": 300.0,
    "break_even_revenue": "20000000",
    "current_allocated_hours": 250.0,
    "hours_to_break_even": 50.0
  },
  "scenarios": [
    {
      "name": "Aumentar BCR 10%",
      "break_even_hours": 272.7,
      "break_even_revenue": "22000000",
      "hours_to_break_even": 22.7,
      "impact": {
        "hours_change": -27.3,
        "revenue_change": "2000000",
        "impact_percentage": -9.1
      }
    },
    {
      "name": "Agregar nuevo empleado",
      "break_even_hours": 400.0,
      "break_even_revenue": "25000000",
      "hours_to_break_even": 150.0,
      "impact": {
        "hours_change": 100.0,
        "revenue_change": "5000000",
        "impact_percentage": 33.3
      }
    }
  ]
}
```

**Lógica:**

1. Calcular escenario base (punto de equilibrio actual)
2. Para cada escenario:
   - Aplicar multiplicadores/ajustes
   - Recalcular punto de equilibrio
   - Calcular impacto vs escenario base

---

### 4.3 Proyección Temporal

#### `GET /api/v1/analytics/break-even/projection`

**Descripción:** Proyecta cuándo se alcanzará el punto de equilibrio basado en el ritmo actual de asignaciones.

**Query Parameters:**
- `months_ahead`: integer (opcional, default: 12) - Meses a proyectar
- `growth_rate`: float (opcional, default: 0) - Tasa de crecimiento mensual esperada

**Response (`BreakEvenProjectionResponse`):**

```json
{
  "current_status": {
    "allocated_hours": 250.0,
    "break_even_hours": 300.0,
    "hours_to_break_even": 50.0
  },
  "projection": [
    {
      "month": "2026-02",
      "allocated_hours": 275.0,
      "break_even_hours": 300.0,
      "hours_to_break_even": 25.0,
      "status": "below_break_even"
    },
    {
      "month": "2026-03",
      "allocated_hours": 300.0,
      "break_even_hours": 300.0,
      "hours_to_break_even": 0.0,
      "status": "at_break_even",
      "break_even_date": "2026-03-15"
    },
    {
      "month": "2026-04",
      "allocated_hours": 325.0,
      "break_even_hours": 300.0,
      "hours_to_break_even": -25.0,
      "status": "above_break_even",
      "profit_hours": 25.0
    }
  ],
  "break_even_date": "2026-03-15",
  "months_to_break_even": 1.5
}
```

**Lógica:**

1. Calcular velocidad de asignación mensual:
   ```python
   # Promedio de horas asignadas por mes en últimos 3 meses
   monthly_allocation_rate = calculate_average_monthly_allocation(quotes, months=3)
   ```

2. Proyectar mes a mes:
   ```python
   for month in range(months_ahead):
       projected_hours = current_hours + (monthly_rate * (month + 1) * (1 + growth_rate))
       if projected_hours >= break_even_hours and break_even_date is None:
           break_even_date = calculate_date_for_month(month)
   ```

---

## 5. Integración con Módulos Existentes

### 5.1 Uso del BCR

**Integración:**
- Usar `calculate_blended_cost_rate()` existente
- Considerar cache del BCR para performance
- Incluir costos sociales si están configurados

---

### 5.2 Uso de Costos Fijos

**Integración:**
- Consultar `CostFixed` para costos mensuales
- Filtrar por organización (multi-tenancy)
- Excluir costos soft-deleted
- Convertir a moneda principal si es necesario

---

### 5.3 Uso de Cotizaciones

**Integración:**
- Consultar cotizaciones activas (Draft, Sent, Viewed, Accepted)
- Usar `QuoteResourceAllocation` si existe para horas asignadas
- Si no hay asignaciones, usar `QuoteItem.estimated_hours`
- Calcular ingresos proyectados usando `Quote.total_client_price`

---

### 5.4 Uso de Asignaciones de Recursos

**Integración:**
- Si `QuoteResourceAllocation` existe, usar para cálculo preciso
- Sumar `allocated_hours` de asignaciones activas
- Filtrar por fechas si están definidas
- Considerar solo proyectos activos

---

## 6. Schemas (Pydantic)

### 6.1 Schemas de Request

**Ubicación:** `backend/app/schemas/break_even.py` (nuevo archivo)

```python
class BreakEvenAnalysisRequest(BaseModel):
    """Request para análisis de punto de equilibrio"""
    currency: Optional[str] = Field(None, description="Moneda para el análisis")
    include_projected: bool = Field(True, description="Incluir cotizaciones proyectadas")
    period: Literal["monthly", "quarterly", "annual"] = Field("monthly", description="Período de análisis")

class ScenarioConfig(BaseModel):
    """Configuración de un escenario"""
    name: str = Field(..., description="Nombre del escenario")
    bcr_multiplier: float = Field(1.0, ge=0.1, le=5.0, description="Multiplicador del BCR")
    fixed_costs_adjustment: Decimal = Field(0, description="Ajuste a costos fijos (positivo = aumentar)")
    average_margin_adjustment: Decimal = Field(0, ge=-1, le=1, description="Ajuste al margen promedio (0.15 = +15%)")

class BreakEvenScenarioRequest(BaseModel):
    """Request para simulación de escenarios"""
    scenarios: List[ScenarioConfig] = Field(..., min_items=1, max_items=10)
    currency: Optional[str] = None

class BreakEvenProjectionRequest(BaseModel):
    """Request para proyección temporal"""
    months_ahead: int = Field(12, ge=1, le=36, description="Meses a proyectar")
    growth_rate: float = Field(0.0, ge=-0.5, le=2.0, description="Tasa de crecimiento mensual esperada")
```

### 6.2 Schemas de Response

```python
class BreakEvenAnalysisResponse(BaseModel):
    """Response de análisis de punto de equilibrio"""
    period: str
    currency: str
    
    # Costos
    total_fixed_costs: Decimal
    total_variable_costs: Decimal
    total_costs: Decimal
    
    # Horas
    total_billable_hours_available: float
    break_even_hours: float
    current_allocated_hours: float
    hours_to_break_even: float
    safety_margin_hours: float
    safety_margin_percentage: float
    
    # Ingresos
    break_even_revenue: Decimal
    current_projected_revenue: Decimal
    revenue_to_break_even: Decimal
    average_margin: float
    
    # Métricas
    operating_leverage: float
    current_utilization_rate: float
    break_even_utilization_rate: float
    
    # Estado
    status: Literal["above_break_even", "at_break_even", "below_break_even"]
    status_message: str
    
    # Proyección
    months_to_break_even: Optional[float] = None
    projected_break_even_date: Optional[str] = None

class ScenarioResult(BaseModel):
    """Resultado de un escenario simulado"""
    name: str
    break_even_hours: float
    break_even_revenue: Decimal
    hours_to_break_even: float
    impact: Dict[str, Any]

class BreakEvenScenariosResponse(BaseModel):
    """Response de simulación de escenarios"""
    base_scenario: Dict[str, Any]
    scenarios: List[ScenarioResult]

class MonthProjection(BaseModel):
    """Proyección para un mes específico"""
    month: str
    allocated_hours: float
    break_even_hours: float
    hours_to_break_even: float
    status: str
    break_even_date: Optional[str] = None
    profit_hours: Optional[float] = None

class BreakEvenProjectionResponse(BaseModel):
    """Response de proyección temporal"""
    current_status: Dict[str, Any]
    projection: List[MonthProjection]
    break_even_date: Optional[str] = None
    months_to_break_even: Optional[float] = None
```

---

## 7. Servicio de Negocio

### 7.1 BreakEvenService

**Ubicación:** `backend/app/services/break_even_service.py` (nuevo archivo)

```python
class BreakEvenService:
    """Servicio para análisis de punto de equilibrio"""
    
    def __init__(self, db: AsyncSession, organization_id: int):
        self.db = db
        self.organization_id = organization_id
    
    async def calculate_break_even(
        self,
        currency: Optional[str] = None,
        include_projected: bool = True,
        period: str = "monthly"
    ) -> BreakEvenAnalysisResponse:
        """
        Calcular punto de equilibrio actual
        
        Args:
            currency: Moneda para el análisis (default: moneda principal)
            include_projected: Incluir cotizaciones proyectadas
            period: Período de análisis (monthly/quarterly/annual)
        
        Returns:
            Análisis completo de punto de equilibrio
        """
        # 1. Obtener moneda principal si no se especifica
        if not currency:
            org = await self._get_organization()
            currency = org.settings.get('primary_currency', 'USD') if org.settings else 'USD'
        
        # 2. Calcular costos fijos totales
        total_fixed_costs = await self._calculate_total_fixed_costs(currency)
        
        # 3. Calcular BCR
        bcr = await calculate_blended_cost_rate(
            self.db,
            primary_currency=currency,
            tenant_id=self.organization_id
        )
        
        # 4. Calcular horas de equilibrio
        break_even_hours = float(total_fixed_costs / bcr) if bcr > 0 else 0
        
        # 5. Calcular horas asignadas actuales
        allocated_hours = await self._calculate_allocated_hours(include_projected)
        
        # 6. Calcular ingresos de equilibrio
        average_margin = await self._calculate_average_margin()
        break_even_revenue = total_fixed_costs / (Decimal('1') - Decimal(str(average_margin))) if average_margin < 1 else total_fixed_costs
        
        # 7. Calcular ingresos proyectados
        projected_revenue = await self._calculate_projected_revenue(include_projected)
        
        # 8. Calcular métricas
        total_billable_hours = await self._calculate_total_billable_hours()
        utilization_rate = (allocated_hours / total_billable_hours * 100) if total_billable_hours > 0 else 0
        break_even_utilization = (break_even_hours / total_billable_hours * 100) if total_billable_hours > 0 else 0
        
        # 9. Determinar estado
        if allocated_hours >= break_even_hours:
            status = "above_break_even"
            status_message = f"Estás {allocated_hours - break_even_hours:.1f} horas por encima del equilibrio"
        elif abs(allocated_hours - break_even_hours) < 1.0:  # Tolerancia de 1 hora
            status = "at_break_even"
            status_message = "Estás en el punto de equilibrio"
        else:
            status = "below_break_even"
            status_message = f"Necesitas {break_even_hours - allocated_hours:.1f} horas adicionales"
        
        # 10. Calcular proyección temporal
        months_to_break_even, break_even_date = await self._calculate_projection(
            allocated_hours,
            break_even_hours
        )
        
        return BreakEvenAnalysisResponse(
            period=period,
            currency=currency,
            total_fixed_costs=total_fixed_costs,
            total_variable_costs=Decimal('0'),  # En modelo simple, todo es fijo
            total_costs=total_fixed_costs,
            total_billable_hours_available=total_billable_hours,
            break_even_hours=break_even_hours,
            current_allocated_hours=allocated_hours,
            hours_to_break_even=max(0, break_even_hours - allocated_hours),
            safety_margin_hours=allocated_hours - break_even_hours,
            safety_margin_percentage=((allocated_hours - break_even_hours) / break_even_hours * 100) if break_even_hours > 0 else 0,
            break_even_revenue=break_even_revenue,
            current_projected_revenue=projected_revenue,
            revenue_to_break_even=max(Decimal('0'), break_even_revenue - projected_revenue),
            average_margin=average_margin,
            operating_leverage=float(total_fixed_costs / total_fixed_costs) if total_fixed_costs > 0 else 0,
            current_utilization_rate=utilization_rate,
            break_even_utilization_rate=break_even_utilization,
            status=status,
            status_message=status_message,
            months_to_break_even=months_to_break_even,
            projected_break_even_date=break_even_date
        )
    
    async def simulate_scenarios(
        self,
        scenarios: List[ScenarioConfig],
        currency: Optional[str] = None
    ) -> BreakEvenScenariosResponse:
        """
        Simular diferentes escenarios financieros
        
        Args:
            scenarios: Lista de escenarios a simular
            currency: Moneda para el análisis
        
        Returns:
            Resultados de todos los escenarios
        """
        # Calcular escenario base
        base_analysis = await self.calculate_break_even(currency=currency)
        base_scenario = {
            "break_even_hours": base_analysis.break_even_hours,
            "break_even_revenue": float(base_analysis.break_even_revenue),
            "current_allocated_hours": base_analysis.current_allocated_hours,
            "hours_to_break_even": base_analysis.hours_to_break_even
        }
        
        # Simular cada escenario
        scenario_results = []
        for scenario_config in scenarios:
            # Aplicar ajustes
            adjusted_fixed_costs = base_analysis.total_fixed_costs + Decimal(str(scenario_config.fixed_costs_adjustment))
            adjusted_bcr = await self._get_adjusted_bcr(scenario_config.bcr_multiplier)
            adjusted_margin = base_analysis.average_margin + float(scenario_config.average_margin_adjustment)
            
            # Recalcular punto de equilibrio
            adjusted_break_even_hours = float(adjusted_fixed_costs / adjusted_bcr) if adjusted_bcr > 0 else 0
            adjusted_break_even_revenue = adjusted_fixed_costs / (Decimal('1') - Decimal(str(adjusted_margin))) if adjusted_margin < 1 else adjusted_fixed_costs
            
            # Calcular impacto
            hours_change = adjusted_break_even_hours - base_analysis.break_even_hours
            revenue_change = adjusted_break_even_revenue - base_analysis.break_even_revenue
            impact_percentage = (hours_change / base_analysis.break_even_hours * 100) if base_analysis.break_even_hours > 0 else 0
            
            scenario_results.append(ScenarioResult(
                name=scenario_config.name,
                break_even_hours=adjusted_break_even_hours,
                break_even_revenue=adjusted_break_even_revenue,
                hours_to_break_even=max(0, adjusted_break_even_hours - base_analysis.current_allocated_hours),
                impact={
                    "hours_change": hours_change,
                    "revenue_change": float(revenue_change),
                    "impact_percentage": impact_percentage
                }
            ))
        
        return BreakEvenScenariosResponse(
            base_scenario=base_scenario,
            scenarios=scenario_results
        )
    
    async def calculate_projection(
        self,
        months_ahead: int = 12,
        growth_rate: float = 0.0
    ) -> BreakEvenProjectionResponse:
        """
        Proyectar cuándo se alcanzará el punto de equilibrio
        
        Args:
            months_ahead: Meses a proyectar
            growth_rate: Tasa de crecimiento mensual esperada
        
        Returns:
            Proyección mes a mes
        """
        # Obtener análisis actual
        current_analysis = await self.calculate_break_even()
        
        # Calcular velocidad de asignación mensual
        monthly_allocation_rate = await self._calculate_monthly_allocation_rate()
        
        # Proyectar mes a mes
        projection = []
        break_even_date = None
        
        current_hours = current_analysis.current_allocated_hours
        break_even_hours = current_analysis.break_even_hours
        
        for month_offset in range(1, months_ahead + 1):
            # Calcular horas proyectadas para este mes
            projected_hours = current_hours + (monthly_allocation_rate * month_offset * (1 + growth_rate))
            
            hours_to_break_even = max(0, break_even_hours - projected_hours)
            
            if projected_hours >= break_even_hours:
                status = "above_break_even" if projected_hours > break_even_hours else "at_break_even"
                profit_hours = projected_hours - break_even_hours if projected_hours > break_even_hours else None
                
                # Calcular fecha exacta de equilibrio
                if break_even_date is None and projected_hours >= break_even_hours:
                    days_into_month = ((break_even_hours - current_hours) / monthly_allocation_rate) * 30 if monthly_allocation_rate > 0 else 0
                    break_even_date = (datetime.now() + timedelta(days=days_into_month)).isoformat()
            else:
                status = "below_break_even"
                profit_hours = None
            
            month_date = (datetime.now() + relativedelta(months=month_offset)).strftime("%Y-%m")
            
            projection.append(MonthProjection(
                month=month_date,
                allocated_hours=projected_hours,
                break_even_hours=break_even_hours,
                hours_to_break_even=hours_to_break_even,
                status=status,
                break_even_date=break_even_date if status in ["at_break_even", "above_break_even"] and month_offset == 1 else None,
                profit_hours=profit_hours
            ))
        
        months_to_break_even = None
        if break_even_date:
            days_diff = (datetime.fromisoformat(break_even_date) - datetime.now()).days
            months_to_break_even = days_diff / 30.0
        
        return BreakEvenProjectionResponse(
            current_status={
                "allocated_hours": current_analysis.current_allocated_hours,
                "break_even_hours": current_analysis.break_even_hours,
                "hours_to_break_even": current_analysis.hours_to_break_even
            },
            projection=projection,
            break_even_date=break_even_date,
            months_to_break_even=months_to_break_even
        )
    
    # Métodos auxiliares privados
    async def _calculate_total_fixed_costs(self, currency: str) -> Decimal:
        """Calcular total de costos fijos en la moneda especificada"""
        # Implementación similar a calculate_blended_cost_rate
        pass
    
    async def _calculate_allocated_hours(self, include_projected: bool) -> float:
        """Calcular horas asignadas actuales"""
        # Usar QuoteResourceAllocation si existe, sino QuoteItem.estimated_hours
        pass
    
    async def _calculate_average_margin(self) -> float:
        """Calcular margen promedio de cotizaciones activas"""
        pass
    
    async def _calculate_projected_revenue(self, include_projected: bool) -> Decimal:
        """Calcular ingresos proyectados de cotizaciones activas"""
        pass
    
    async def _calculate_total_billable_hours(self) -> float:
        """Calcular total de horas billables disponibles del equipo"""
        pass
    
    async def _calculate_projection(
        self,
        current_hours: float,
        break_even_hours: float
    ) -> Tuple[Optional[float], Optional[str]]:
        """Calcular proyección temporal"""
        pass
    
    async def _calculate_monthly_allocation_rate(self) -> float:
        """Calcular velocidad promedio de asignación mensual"""
        pass
```

---

## 8. Endpoints API

### 8.1 Endpoint de Análisis

**Ubicación:** `backend/app/api/v1/endpoints/analytics.py` (agregar)

```python
@router.get("/break-even", response_model=BreakEvenAnalysisResponse)
async def get_break_even_analysis(
    currency: Optional[str] = Query(None),
    include_projected: bool = Query(True),
    period: str = Query("monthly"),
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_view_analytics),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener análisis de punto de equilibrio actual
    
    **Permissions:**
    - Requires `can_view_analytics` permission
    """
    service = BreakEvenService(db, tenant.organization_id)
    return await service.calculate_break_even(
        currency=currency,
        include_projected=include_projected,
        period=period
    )
```

### 8.2 Endpoint de Escenarios

```python
@router.post("/break-even/scenarios", response_model=BreakEvenScenariosResponse)
async def simulate_break_even_scenarios(
    request: BreakEvenScenarioRequest,
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_view_analytics),
    db: AsyncSession = Depends(get_db)
):
    """
    Simular diferentes escenarios financieros
    
    Permite simular el impacto de:
    - Cambios en el BCR
    - Cambios en costos fijos
    - Cambios en márgenes promedio
    """
    service = BreakEvenService(db, tenant.organization_id)
    return await service.simulate_scenarios(
        scenarios=request.scenarios,
        currency=request.currency
    )
```

### 8.3 Endpoint de Proyección

```python
@router.get("/break-even/projection", response_model=BreakEvenProjectionResponse)
async def get_break_even_projection(
    months_ahead: int = Query(12, ge=1, le=36),
    growth_rate: float = Query(0.0, ge=-0.5, le=2.0),
    tenant: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_view_analytics),
    db: AsyncSession = Depends(get_db)
):
    """
    Proyectar cuándo se alcanzará el punto de equilibrio
    
    Basado en el ritmo actual de asignaciones y una tasa de crecimiento opcional.
    """
    service = BreakEvenService(db, tenant.organization_id)
    return await service.calculate_projection(
        months_ahead=months_ahead,
        growth_rate=growth_rate
    )
```

---

## 9. Consideraciones Técnicas

### 9.1 Performance

**Optimizaciones:**
- Cache de análisis de punto de equilibrio (TTL: 5 minutos)
- Cache de BCR (ya existe)
- Queries optimizadas con agregaciones SQL
- Índices en campos frecuentemente consultados

**Targets:**
- Análisis completo: < 500ms
- Simulación de escenarios: < 1s (para 5 escenarios)
- Proyección temporal: < 800ms (para 12 meses)

---

### 9.2 Precisión Monetaria

**ESTÁNDAR NOUGRAM:**
- Usar `Decimal` para todos los cálculos monetarios
- Serializar como `string` en respuestas JSON
- No usar `float` para cálculos financieros

---

### 9.3 Multi-tenancy

**Validaciones:**
- Filtrar todos los datos por `organization_id`
- Solo costos fijos de la organización
- Solo cotizaciones de la organización
- Solo miembros del equipo de la organización

---

## 10. Casos de Uso

### 10.1 Caso de Uso 1: Ver Estado Actual

**Usuario:** Gerente financiero  
**Objetivo:** Entender si la agencia está por encima o debajo del punto de equilibrio

**Flujo:**
1. Navega a "Analytics" → "Punto de Equilibrio"
2. Ve análisis completo con estado actual
3. Identifica si necesita más horas asignadas
4. Ve proyección de cuándo alcanzará equilibrio

---

### 10.2 Caso de Uso 2: Simular Contratación

**Usuario:** CEO  
**Objetivo:** Entender impacto de contratar un nuevo empleado

**Flujo:**
1. Va a "Analytics" → "Punto de Equilibrio" → "Simular Escenarios"
2. Crea escenario "Contratar nuevo Developer"
3. Ajusta costos fijos (+$5M COP/mes)
4. Ve impacto: necesita 33% más horas para equilibrio
5. Toma decisión informada

---

### 10.3 Caso de Uso 3: Proyectar Crecimiento

**Usuario:** Product Manager  
**Objetivo:** Planificar cuándo alcanzará equilibrio con proyectos actuales

**Flujo:**
1. Ve proyección temporal
2. Identifica que alcanzará equilibrio en 1.5 meses
3. Planifica estrategia de crecimiento post-equilibrio

---

## 11. Plan de Implementación

### Sprint 1: Servicio Core (1 semana)

**Tareas:**
1. Crear `BreakEvenService` con método `calculate_break_even()`
2. Implementar métodos auxiliares de cálculo
3. Crear schemas Pydantic
4. Tests unitarios del servicio

**Estimación:** 16 horas

---

### Sprint 2: Endpoints y Escenarios (1 semana)

**Tareas:**
1. Crear endpoint de análisis
2. Crear endpoint de escenarios
3. Implementar lógica de simulación
4. Tests de integración

**Estimación:** 16 horas

---

### Sprint 3: Proyección y Optimización (1 semana)

**Tareas:**
1. Crear endpoint de proyección temporal
2. Implementar cálculo de velocidad de asignación
3. Optimizar queries y agregar cache
4. Documentación completa

**Estimación:** 12 horas

---

**Total:** 44 horas (~6 días de trabajo)

---

## 12. Referencias

### Documentos Relacionados

- `BACKEND_SPECT_QUOTE.md`: Especificación del módulo de Quotes
- `PLAN_TRABAJO_RESOURCE_ALLOCATION_BACKEND.md`: Plan de asignación de recursos
- `backend/app/core/calculations.py`: Cálculo de BCR

### Conceptos Financieros

- **Break-Even Analysis:** Análisis de punto de equilibrio
- **Operating Leverage:** Apalancamiento operativo
- **Safety Margin:** Margen de seguridad
- **Contribution Margin:** Margen de contribución

---

**Última actualización:** 2026-01-25  
**Versión:** 1.0  
**Estado:** Pendiente de Implementación
