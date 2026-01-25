# Plan de Trabajo - Implementación de Amortización de Equipos (Backend)

**Versión:** 1.0  
**Fecha:** 2026-01-23  
**Objetivo:** Implementar soporte completo para amortización de equipos en el backend, alineado con los requerimientos de UI especificados en `UI_REQUIREMENTS_ADMIN_PANEL.md`

---

## Resumen Ejecutivo

Este plan detalla la implementación del módulo de amortización de equipos que permitirá:
- Registrar equipos con información de compra y parámetros de depreciación
- Calcular automáticamente la amortización mensual usando diferentes métodos
- Integrar la amortización en el cálculo del Blended Cost Rate (BCR)
- Proporcionar endpoints RESTful para CRUD completo

---

## 1. ANÁLISIS DE REQUERIMIENTOS

### 1.1 Requerimientos del Frontend (UI_REQUIREMENTS_ADMIN_PANEL.md)

```typescript
interface EquipmentAmortizationInput {
  name: string;                        // Nombre del equipo
  description?: string;                 // Descripción
  category: string;                    // "Hardware", "Software", "Vehicles", "Office Equipment"
  purchase_price: string;              // Precio de compra (Decimal como string, > 0)
  purchase_date: string;                // Fecha de compra (ISO: YYYY-MM-DD)
  currency: "USD" | "COP" | "ARS" | "EUR";
  useful_life_months: number;          // Vida útil en meses (ej: 36 meses)
  salvage_value: string;               // Valor de salvamento (Decimal como string, >= 0)
  depreciation_method: "straight_line" | "declining_balance";
  monthly_depreciation?: string;       // Calculado automáticamente (read-only)
}
```

### 1.2 Requerimientos Funcionales

1. **Modelo de Datos:**
   - Crear tabla `equipment_amortization` con todos los campos necesarios
   - Soporte multi-tenant (organization_id)
   - Soft delete
   - Campos de auditoría (created_at, updated_at, deleted_at, deleted_by_id)

2. **Cálculo de Amortización:**
   - Método línea recta: `(purchase_price - salvage_value) / useful_life_months`
   - Método saldo decreciente: Implementar fórmula estándar
   - Calcular automáticamente `monthly_depreciation` al crear/actualizar

3. **Integración con BCR:**
   - La amortización mensual debe sumarse a los gastos fijos en el cálculo del BCR
   - Categorizar equipos como "Overhead" o "Tools" según su categoría

4. **Endpoints API:**
   - `GET /api/v1/settings/equipment` - Listar equipos
   - `POST /api/v1/settings/equipment` - Crear equipo
   - `GET /api/v1/settings/equipment/{id}` - Obtener equipo
   - `PUT /api/v1/settings/equipment/{id}` - Actualizar equipo
   - `DELETE /api/v1/settings/equipment/{id}` - Eliminar equipo (soft delete)
   - `GET /api/v1/settings/equipment/{id}/depreciation-schedule` - Ver cronograma de depreciación

---

## 2. ARQUITECTURA Y DISEÑO

### 2.1 Modelo de Datos

```python
class EquipmentAmortization(Base):
    """
    Equipment amortization model
    ESTÁNDAR NOUGRAM: Campos monetarios usan Numeric para precisión grado bancario
    """
    __tablename__ = "equipment_amortization"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    category = Column(String, nullable=False)  # "Hardware", "Software", "Vehicles", "Office Equipment"
    
    # Purchase information
    purchase_price = Column(Numeric(precision=19, scale=4), nullable=False)  # ESTÁNDAR NOUGRAM: Numeric
    purchase_date = Column(DateTime(timezone=True), nullable=False)
    currency = Column(String, default="USD", nullable=False)  # USD, COP, ARS, EUR
    
    # Depreciation parameters
    useful_life_months = Column(Integer, nullable=False)  # Vida útil en meses
    salvage_value = Column(Numeric(precision=19, scale=4), nullable=False, default=0)  # ESTÁNDAR NOUGRAM: Numeric
    depreciation_method = Column(String, nullable=False, default="straight_line")  # "straight_line", "declining_balance"
    
    # Calculated fields (read-only, calculated on save)
    monthly_depreciation = Column(Numeric(precision=19, scale=4), nullable=True)  # ESTÁNDAR NOUGRAM: Numeric
    total_depreciated = Column(Numeric(precision=19, scale=4), nullable=True, default=0)  # ESTÁNDAR NOUGRAM: Numeric
    remaining_value = Column(Numeric(precision=19, scale=4), nullable=True)  # ESTÁNDAR NOUGRAM: Numeric
    
    # Status
    is_active = Column(Boolean, default=True)  # Si está activo y generando depreciación
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Soft delete
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    deleted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Multi-tenant
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Relationships
    deleted_by = relationship("User", foreign_keys=[deleted_by_id])
```

### 2.2 Servicio de Cálculo de Amortización

```python
class DepreciationService:
    """
    Service for calculating equipment depreciation
    """
    
    @staticmethod
    def calculate_straight_line(
        purchase_price: Decimal,
        salvage_value: Decimal,
        useful_life_months: int
    ) -> Decimal:
        """
        Calculate monthly depreciation using straight-line method
        Formula: (purchase_price - salvage_value) / useful_life_months
        """
        if useful_life_months <= 0:
            return Decimal('0')
        depreciable_amount = purchase_price - salvage_value
        return depreciable_amount / Decimal(str(useful_life_months))
    
    @staticmethod
    def calculate_declining_balance(
        purchase_price: Decimal,
        salvage_value: Decimal,
        useful_life_months: int,
        depreciation_rate: Optional[Decimal] = None
    ) -> Decimal:
        """
        Calculate monthly depreciation using declining balance method
        Default rate: 2x straight-line rate (double declining balance)
        Formula: (book_value * depreciation_rate) / 12
        """
        if useful_life_months <= 0:
            return Decimal('0')
        
        # Calculate straight-line rate
        straight_line_rate = Decimal('1') / Decimal(str(useful_life_months))
        
        # Use 2x rate for double declining balance (or custom rate)
        if depreciation_rate is None:
            depreciation_rate = straight_line_rate * Decimal('2')
        
        # For declining balance, we need current book value
        # First month: use purchase_price
        # Subsequent months: use remaining_value
        # This will be calculated per month in the schedule
        monthly_rate = depreciation_rate / Decimal('12')
        return purchase_price * monthly_rate
    
    @staticmethod
    def generate_depreciation_schedule(
        equipment: EquipmentAmortization,
        months: int = None
    ) -> List[Dict]:
        """
        Generate depreciation schedule for equipment
        Returns list of monthly depreciation entries
        """
        schedule = []
        current_value = equipment.purchase_price
        total_depreciated = Decimal('0')
        
        # Determine number of months to calculate
        if months is None:
            months = equipment.useful_life_months
        
        for month in range(1, months + 1):
            if equipment.depreciation_method == "straight_line":
                monthly_dep = DepreciationService.calculate_straight_line(
                    equipment.purchase_price,
                    equipment.salvage_value,
                    equipment.useful_life_months
                )
            else:  # declining_balance
                # For declining balance, recalculate each month based on current book value
                straight_line_rate = Decimal('1') / Decimal(str(equipment.useful_life_months))
                depreciation_rate = straight_line_rate * Decimal('2')  # Double declining
                monthly_rate = depreciation_rate / Decimal('12')
                monthly_dep = current_value * monthly_rate
                
                # Don't depreciate below salvage value
                if current_value - monthly_dep < equipment.salvage_value:
                    monthly_dep = current_value - equipment.salvage_value
            
            total_depreciated += monthly_dep
            current_value -= monthly_dep
            
            schedule.append({
                "month": month,
                "depreciation": float(monthly_dep),
                "accumulated_depreciation": float(total_depreciated),
                "book_value": float(current_value)
            })
            
            # Stop if we've reached salvage value
            if current_value <= equipment.salvage_value:
                break
        
        return schedule
```

### 2.3 Integración con BCR

Modificar `calculate_blended_cost_rate` en `backend/app/core/calculations.py`:

```python
# Agregar después de obtener fixed_costs:
# Get equipment amortization costs
from app.models.equipment import EquipmentAmortization
equipment_query = select(EquipmentAmortization).where(
    EquipmentAmortization.deleted_at.is_(None),
    EquipmentAmortization.is_active == True
)
if tenant_id is not None:
    equipment_query = equipment_query.where(
        EquipmentAmortization.organization_id == tenant_id
    )
equipment_result = await db.execute(equipment_query)
equipment_list = equipment_result.scalars().all()

# Convert equipment monthly depreciation to Money
equipment_costs_money = []
for equipment in equipment_list:
    equipment_currency = equipment.currency or "USD"
    normalized = normalize_to_primary_currency(
        equipment.monthly_depreciation or Decimal('0'),
        equipment_currency,
        primary_currency
    )
    if isinstance(normalized, Money):
        equipment_costs_money.append(normalized)
    else:
        equipment_costs_money.append(Money(normalized, primary_currency))

# Add equipment costs to fixed costs
all_costs = fixed_costs_money + salary_amounts + equipment_costs_money
```

---

## 3. PLAN DE IMPLEMENTACIÓN

### Fase 1: Modelo y Migración de Base de Datos

#### Tarea 1.1: Crear Modelo EquipmentAmortization
**Archivo:** `backend/app/models/equipment.py`

**Pasos:**
1. Crear nuevo archivo `equipment.py` en `backend/app/models/`
2. Definir clase `EquipmentAmortization` con todos los campos especificados
3. Agregar relaciones con `User` y `Organization`
4. Agregar métodos helper para cálculos

**Criterios de Aceptación:**
- [ ] Modelo creado con todos los campos requeridos
- [ ] Campos monetarios usan `Numeric(precision=19, scale=4)`
- [ ] Soporte multi-tenant (organization_id)
- [ ] Soft delete implementado
- [ ] Relaciones definidas correctamente

#### Tarea 1.2: Crear Migración de Alembic
**Archivo:** `backend/alembic/versions/XXXX_add_equipment_amortization.py`

**Pasos:**
1. Generar migración: `alembic revision -m "add_equipment_amortization"`
2. Crear tabla `equipment_amortization` con todos los campos
3. Crear índices necesarios:
   - `ix_equipment_amortization_id`
   - `ix_equipment_amortization_organization_id`
   - `ix_equipment_amortization_category`
   - `ix_equipment_amortization_deleted_at`
4. Crear foreign keys:
   - `organization_id` → `organizations.id`
   - `deleted_by_id` → `users.id`

**Criterios de Aceptación:**
- [ ] Migración creada y probada
- [ ] Tabla creada correctamente
- [ ] Índices creados
- [ ] Foreign keys creados
- [ ] Migración es reversible (downgrade funciona)

#### Tarea 1.3: Registrar Modelo en __init__.py
**Archivo:** `backend/app/models/__init__.py`

**Pasos:**
1. Importar `EquipmentAmortization`
2. Agregar a `__all__` si existe

**Criterios de Aceptación:**
- [ ] Modelo importado correctamente
- [ ] No hay errores de importación circular

---

### Fase 2: Schemas y Validaciones

#### Tarea 2.1: Crear Schemas Pydantic
**Archivo:** `backend/app/schemas/equipment.py`

**Schemas a crear:**
1. `EquipmentAmortizationBase` - Campos base
2. `EquipmentAmortizationCreate` - Para crear
3. `EquipmentAmortizationUpdate` - Para actualizar (todos opcionales)
4. `EquipmentAmortizationResponse` - Para respuesta
5. `EquipmentAmortizationListResponse` - Para lista paginada
6. `DepreciationScheduleResponse` - Para cronograma de depreciación

**Características:**
- Campos monetarios serializados como string (Decimal)
- Validaciones: purchase_price > 0, salvage_value >= 0, useful_life_months > 0
- Validación de fecha: purchase_date debe ser fecha válida
- Validación de método: solo "straight_line" o "declining_balance"

**Criterios de Aceptación:**
- [ ] Todos los schemas creados
- [ ] Validaciones implementadas
- [ ] Serialización Decimal como string funciona
- [ ] Schemas pasan validación de Pydantic

#### Tarea 2.2: Crear Servicio de Cálculo
**Archivo:** `backend/app/services/depreciation_service.py`

**Pasos:**
1. Crear clase `DepreciationService`
2. Implementar `calculate_straight_line`
3. Implementar `calculate_declining_balance`
4. Implementar `generate_depreciation_schedule`
5. Agregar tests unitarios

**Criterios de Aceptación:**
- [ ] Método línea recta calcula correctamente
- [ ] Método saldo decreciente calcula correctamente
- [ ] Cronograma se genera correctamente
- [ ] No se deprecia por debajo del valor de salvamento
- [ ] Tests unitarios pasan

---

### Fase 3: Repository Layer

#### Tarea 3.1: Crear EquipmentRepository
**Archivo:** `backend/app/repositories/equipment_repository.py`

**Métodos a implementar:**
- `get_all_active()` - Obtener equipos activos
- `get_by_category()` - Filtrar por categoría
- `get_by_depreciation_method()` - Filtrar por método
- `get_active_equipment_for_bcr()` - Obtener equipos activos para cálculo BCR

**Criterios de Aceptación:**
- [ ] Repository hereda de `BaseRepository`
- [ ] Tenant scoping funciona correctamente
- [ ] Soft delete respetado
- [ ] Métodos de filtrado funcionan

#### Tarea 3.2: Registrar Repository en Factory
**Archivo:** `backend/app/repositories/factory.py`

**Pasos:**
1. Agregar método `create_equipment_repository`
2. Importar `EquipmentRepository`

**Criterios de Aceptación:**
- [ ] Factory puede crear instancia de repository
- [ ] Tenant scoping aplicado automáticamente

---

### Fase 4: Endpoints API

#### Tarea 4.1: Crear Endpoints CRUD
**Archivo:** `backend/app/api/v1/endpoints/equipment.py`

**Endpoints a crear:**
1. `GET /api/v1/settings/equipment` - Listar equipos (con paginación)
2. `POST /api/v1/settings/equipment` - Crear equipo
3. `GET /api/v1/settings/equipment/{id}` - Obtener equipo por ID
4. `PUT /api/v1/settings/equipment/{id}` - Actualizar equipo
5. `DELETE /api/v1/settings/equipment/{id}` - Eliminar equipo (soft delete)
6. `POST /api/v1/settings/equipment/{id}/restore` - Restaurar equipo
7. `GET /api/v1/settings/equipment/{id}/depreciation-schedule` - Cronograma de depreciación

**Características:**
- Permisos: Requiere `can_modify_costs` para crear/editar/eliminar
- Validaciones: Todos los campos requeridos validados
- Cálculo automático: `monthly_depreciation` se calcula al guardar
- Cache invalidation: Invalidar cache de BCR al crear/editar/eliminar

**Criterios de Aceptación:**
- [ ] Todos los endpoints creados
- [ ] Permisos aplicados correctamente
- [ ] Validaciones funcionan
- [ ] Cálculo de amortización automático
- [ ] Cache de BCR se invalida
- [ ] Respuestas en formato correcto (Decimal como string)

#### Tarea 4.2: Registrar Router
**Archivo:** `backend/app/api/v1/router.py`

**Pasos:**
1. Importar router de equipment
2. Agregar `api_router.include_router(equipment.router, prefix="/settings", tags=["equipment"])`

**Criterios de Aceptación:**
- [ ] Router registrado correctamente
- [ ] Endpoints accesibles en `/api/v1/settings/equipment`

---

### Fase 5: Integración con BCR

#### Tarea 5.1: Modificar calculate_blended_cost_rate
**Archivo:** `backend/app/core/calculations.py`

**Pasos:**
1. Importar `EquipmentAmortization`
2. Agregar query para obtener equipos activos
3. Convertir `monthly_depreciation` a Money
4. Agregar a `all_costs` antes de calcular BCR
5. Actualizar desglose en respuesta (agregar `total_equipment_depreciation`)

**Criterios de Aceptación:**
- [ ] Equipos se incluyen en cálculo de BCR
- [ ] Amortización mensual se suma correctamente
- [ ] Normalización de moneda funciona
- [ ] Desglose incluye equipos
- [ ] Tests de cálculo pasan

#### Tarea 5.2: Actualizar BlendedCostRateResponse
**Archivo:** `backend/app/schemas/quote.py`

**Pasos:**
1. Agregar campo `total_equipment_depreciation` a `BlendedCostRateResponse`
2. Serializar como Decimal string

**Criterios de Aceptación:**
- [ ] Campo agregado al schema
- [ ] Serialización funciona correctamente
- [ ] Frontend puede leer el valor

---

### Fase 6: Tests

#### Tarea 6.1: Tests Unitarios del Servicio
**Archivo:** `backend/tests/unit/test_depreciation_service.py`

**Tests a crear:**
1. `test_calculate_straight_line_basic` - Cálculo básico línea recta
2. `test_calculate_straight_line_with_salvage` - Con valor de salvamento
3. `test_calculate_declining_balance_basic` - Cálculo básico saldo decreciente
4. `test_generate_depreciation_schedule_straight_line` - Cronograma línea recta
5. `test_generate_depreciation_schedule_declining_balance` - Cronograma saldo decreciente
6. `test_depreciation_below_salvage_value` - No deprecia por debajo de salvamento

**Criterios de Aceptación:**
- [ ] Todos los tests pasan
- [ ] Cobertura > 90%
- [ ] Casos edge cubiertos

#### Tarea 6.2: Tests de Integración de Endpoints
**Archivo:** `backend/tests/integration/test_equipment_endpoints.py`

**Tests a crear:**
1. `test_create_equipment` - Crear equipo
2. `test_create_equipment_calculates_depreciation` - Verificar cálculo automático
3. `test_list_equipment` - Listar equipos
4. `test_get_equipment` - Obtener equipo
5. `test_update_equipment` - Actualizar equipo
6. `test_delete_equipment` - Eliminar equipo (soft delete)
7. `test_equipment_tenant_isolation` - Aislamiento multi-tenant
8. `test_equipment_permissions` - Verificar permisos
9. `test_get_depreciation_schedule` - Obtener cronograma

**Criterios de Aceptación:**
- [ ] Todos los tests pasan
- [ ] Tenant isolation funciona
- [ ] Permisos funcionan
- [ ] Cálculos son correctos

#### Tarea 6.3: Tests de Integración con BCR
**Archivo:** `backend/tests/integration/test_bcr_with_equipment.py`

**Tests a crear:**
1. `test_bcr_includes_equipment_depreciation` - BCR incluye amortización
2. `test_bcr_excludes_inactive_equipment` - No incluye equipos inactivos
3. `test_bcr_excludes_deleted_equipment` - No incluye equipos eliminados
4. `test_bcr_normalizes_equipment_currency` - Normaliza moneda de equipos

**Criterios de Aceptación:**
- [ ] Todos los tests pasan
- [ ] BCR se calcula correctamente con equipos
- [ ] Filtros funcionan

---

### Fase 7: Documentación

#### Tarea 7.1: Actualizar Documentación de API
**Archivo:** Endpoints ya tienen docstrings, verificar que sean completos

**Pasos:**
1. Verificar docstrings en todos los endpoints
2. Agregar ejemplos de request/response
3. Documentar códigos de error

**Criterios de Aceptación:**
- [ ] Docstrings completos
- [ ] Ejemplos incluidos
- [ ] Swagger UI muestra documentación correcta

#### Tarea 7.2: Actualizar FRONTEND_API_INTEGRATION_GUIDE.md
**Archivo:** `docs/development/FRONTEND_API_INTEGRATION_GUIDE.md`

**Pasos:**
1. Agregar sección "Equipos y Amortización"
2. Documentar todos los endpoints
3. Agregar ejemplos de uso
4. Documentar integración con BCR

**Criterios de Aceptación:**
- [ ] Sección agregada
- [ ] Endpoints documentados
- [ ] Ejemplos incluidos

---

## 4. ESTRUCTURA DE ARCHIVOS

```
backend/
├── app/
│   ├── models/
│   │   └── equipment.py                    # NUEVO: Modelo EquipmentAmortization
│   ├── schemas/
│   │   └── equipment.py                    # NUEVO: Schemas Pydantic
│   ├── repositories/
│   │   └── equipment_repository.py         # NUEVO: Repository para equipos
│   ├── services/
│   │   └── depreciation_service.py         # NUEVO: Servicio de cálculos
│   ├── api/v1/endpoints/
│   │   └── equipment.py                    # NUEVO: Endpoints REST
│   ├── core/
│   │   └── calculations.py                 # MODIFICAR: Integrar equipos en BCR
│   └── repositories/
│       └── factory.py                      # MODIFICAR: Agregar create_equipment_repository
├── alembic/versions/
│   └── XXXX_add_equipment_amortization.py  # NUEVO: Migración
└── tests/
    ├── unit/
    │   └── test_depreciation_service.py    # NUEVO: Tests unitarios
    └── integration/
        ├── test_equipment_endpoints.py      # NUEVO: Tests de endpoints
        └── test_bcr_with_equipment.py      # NUEVO: Tests de integración BCR
```

---

## 5. DETALLES TÉCNICOS

### 5.1 Fórmulas de Depreciación

#### Línea Recta (Straight Line)
```
monthly_depreciation = (purchase_price - salvage_value) / useful_life_months
```

**Ejemplo:**
- Precio compra: $12,000,000 COP
- Valor salvamento: $2,000,000 COP
- Vida útil: 36 meses
- Amortización mensual: ($12,000,000 - $2,000,000) / 36 = $277,778 COP/mes

#### Saldo Decreciente (Declining Balance)
```
# Tasa de depreciación = 2 × (1 / useful_life_months)  [Double Declining Balance]
monthly_rate = depreciation_rate / 12
monthly_depreciation = current_book_value × monthly_rate

# No deprecia por debajo del valor de salvamento
if (current_book_value - monthly_depreciation) < salvage_value:
    monthly_depreciation = current_book_value - salvage_value
```

**Ejemplo (Primer mes):**
- Precio compra: $12,000,000 COP
- Vida útil: 36 meses
- Tasa anual: 2 × (1/36) = 5.56% mensual
- Amortización mes 1: $12,000,000 × 0.0556 = $667,200 COP

### 5.2 Integración con BCR

**Fórmula Actualizada:**
```
BCR = Total Monthly Costs / Total Billable Hours Available

Donde:
Total Monthly Costs = 
    (Salarios con Cargas) + 
    (Gastos Fijos) + 
    (Amortización de Equipos)  ← NUEVO
```

**Categorización:**
- Equipos con categoría "Hardware", "Vehicles", "Office Equipment" → Overhead
- Equipos con categoría "Software" → Tools/SaaS

### 5.3 Validaciones

#### Validaciones de Entrada
- `purchase_price`: Debe ser > 0
- `salvage_value`: Debe ser >= 0 y < purchase_price
- `useful_life_months`: Debe ser > 0 (típicamente 12-120 meses)
- `purchase_date`: Debe ser fecha válida, no futura
- `depreciation_method`: Solo "straight_line" o "declining_balance"
- `category`: Debe ser una de las categorías válidas

#### Validaciones de Negocio
- No se puede eliminar equipo si tiene depreciación acumulada > 0 (opcional, puede ser soft delete)
- Al actualizar `useful_life_months`, recalcular `monthly_depreciation`
- Al actualizar `purchase_price` o `salvage_value`, recalcular `monthly_depreciation`

### 5.4 Cache y Performance

- **Cache de BCR:** Se invalida automáticamente al crear/editar/eliminar equipo
- **Índices:** Crear índices en `organization_id`, `category`, `is_active`, `deleted_at`
- **Queries:** Usar `selectinload` si se necesitan relaciones

---

## 6. CRONOGRAMA ESTIMADO

### Sprint 1: Modelo y Migración (2-3 días)
- Tarea 1.1: Crear modelo (4 horas)
- Tarea 1.2: Crear migración (2 horas)
- Tarea 1.3: Registrar modelo (30 minutos)

### Sprint 2: Schemas y Servicio (2-3 días)
- Tarea 2.1: Crear schemas (3 horas)
- Tarea 2.2: Crear servicio de cálculo (4 horas)
- Tests unitarios del servicio (3 horas)

### Sprint 3: Repository y Endpoints (3-4 días)
- Tarea 3.1: Crear repository (2 horas)
- Tarea 3.2: Registrar en factory (1 hora)
- Tarea 4.1: Crear endpoints (6 horas)
- Tarea 4.2: Registrar router (30 minutos)

### Sprint 4: Integración BCR (2 días)
- Tarea 5.1: Modificar calculate_blended_cost_rate (4 horas)
- Tarea 5.2: Actualizar response schema (1 hora)
- Tests de integración (3 horas)

### Sprint 5: Tests y Documentación (2 días)
- Tarea 6.1: Tests unitarios (3 horas)
- Tarea 6.2: Tests de endpoints (4 horas)
- Tarea 6.3: Tests de integración BCR (2 horas)
- Tarea 7.1: Documentación API (2 horas)
- Tarea 7.2: Actualizar guía frontend (2 horas)

**Total Estimado:** 11-14 días de desarrollo

---

## 7. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Modelo y Migración
- [ ] Modelo `EquipmentAmortization` creado
- [ ] Migración de Alembic creada y probada
- [ ] Modelo registrado en `__init__.py`
- [ ] Migración aplicada en desarrollo

### Fase 2: Schemas y Servicio
- [ ] Schemas Pydantic creados
- [ ] Validaciones implementadas
- [ ] `DepreciationService` implementado
- [ ] Tests unitarios del servicio pasan

### Fase 3: Repository
- [ ] `EquipmentRepository` creado
- [ ] Métodos de filtrado implementados
- [ ] Registrado en `RepositoryFactory`

### Fase 4: Endpoints
- [ ] Todos los endpoints CRUD creados
- [ ] Permisos aplicados
- [ ] Validaciones funcionan
- [ ] Cálculo automático de amortización
- [ ] Router registrado

### Fase 5: Integración BCR
- [ ] `calculate_blended_cost_rate` modificado
- [ ] Equipos incluidos en cálculo
- [ ] `BlendedCostRateResponse` actualizado
- [ ] Cache se invalida correctamente

### Fase 6: Tests
- [ ] Tests unitarios del servicio pasan
- [ ] Tests de endpoints pasan
- [ ] Tests de integración BCR pasan
- [ ] Cobertura > 80%

### Fase 7: Documentación
- [ ] Docstrings completos en endpoints
- [ ] `FRONTEND_API_INTEGRATION_GUIDE.md` actualizado
- [ ] Swagger UI muestra documentación correcta

---

## 8. RIESGOS Y MITIGACIONES

### Riesgo 1: Cambios en Equipos Afectan BCR Histórico
**Mitigación:** 
- Los equipos solo afectan el BCR actual, no histórico
- Las cotizaciones guardadas mantienen su BCR original
- Documentar que cambios en equipos afectan futuras cotizaciones

### Riesgo 2: Equipos con Vida Útil Muy Larga
**Mitigación:**
- Validar que `useful_life_months` sea razonable (máximo 120 meses)
- Permitir marcar equipos como inactivos cuando se completa la depreciación

### Riesgo 3: Múltiples Métodos de Depreciación
**Mitigación:**
- Implementar solo línea recta inicialmente
- Saldo decreciente como opción avanzada
- Documentar diferencias y cuándo usar cada uno

### Riesgo 4: Performance con Muchos Equipos
**Mitigación:**
- Usar índices en queries
- Cachear BCR (ya implementado)
- Filtrar solo equipos activos y no eliminados

---

## 9. DECISIONES DE DISEÑO

### Decisión 1: Tabla Separada vs Extensión de CostFixed
**Decisión:** Tabla separada `equipment_amortization`
**Razón:** 
- Equipos tienen campos específicos (fecha compra, vida útil, método)
- Permite queries específicas para equipos
- Facilita reportes de depreciación
- Mantiene `CostFixed` simple para gastos recurrentes

### Decisión 2: Cálculo Automático vs Manual
**Decisión:** Cálculo automático de `monthly_depreciation` al guardar
**Razón:**
- Consistencia en cálculos
- Menos errores del usuario
- Actualización automática al cambiar parámetros

### Decisión 3: Métodos de Depreciación
**Decisión:** Implementar ambos métodos (línea recta y saldo decreciente)
**Razón:**
- Flexibilidad para diferentes necesidades contables
- Línea recta es más común y simple
- Saldo decreciente para casos específicos

### Decisión 4: Integración con BCR
**Decisión:** Incluir amortización mensual en cálculo de BCR
**Razón:**
- La amortización es un costo operacional real
- Debe reflejarse en el costo por hora
- Alinea con principios contables

---

## 10. PRÓXIMOS PASOS

1. **Revisar y Aprobar Plan:** Validar con equipo que el plan es correcto
2. **Crear Branch:** `feature/equipment-amortization`
3. **Implementar Fase 1:** Modelo y migración
4. **Code Review:** Revisar modelo antes de continuar
5. **Implementar Fases Restantes:** Seguir plan secuencialmente
6. **Testing:** Ejecutar suite completa de tests
7. **Documentación:** Actualizar guías y Swagger
8. **Merge a Main:** Después de aprobación

---

**Última actualización:** 2026-01-23  
**Autor:** AI Assistant  
**Revisión Requerida:** Sí
