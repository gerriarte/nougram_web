# Plan de Trabajo Backend - Sistema de Asignación de Recursos (Resource Allocation)

**Versión:** 1.0  
**Fecha:** 2026-01-25  
**Estado:** Pendiente de Implementación  
**Prioridad:** Media-Alta (mejora de funcionalidad core)

---

## Resumen Ejecutivo

Este documento detalla el plan de trabajo para implementar un sistema completo de asignación de recursos (Resource Allocation) que permita asignar miembros específicos del equipo a cotizaciones con horas específicas, calcular utilización por miembro individual, y validar capacidad antes de crear cotizaciones.

**Objetivo:** Implementar sistema de asignación granular de recursos del equipo a cotizaciones, con validación de capacidad y cálculo de utilización por miembro.

**Duración Estimada Total:** 3-4 sprints (6-8 semanas)  
**Prioridad:** Media-Alta (mejora significativa de la funcionalidad de cotizaciones)

**Beneficios:**
- Planificación precisa de recursos por proyecto
- Validación de capacidad antes de crear cotizaciones
- Cálculo de utilización por miembro individual
- Cálculo de costos más preciso usando salarios específicos
- Dashboard de disponibilidad de recursos

---

## 📊 ANÁLISIS DE ESTADO ACTUAL

### ✅ Implementado

1. **Modelo `TeamMember`:**
   - Campos: `billable_hours_per_week`, `non_billable_hours_percentage`
   - Relación con `Organization` (multi-tenant)
   - Soporte para múltiples monedas

2. **Cálculo de BCR (Blended Cost Rate):**
   - Usa horas billables totales del equipo
   - Considera `non_billable_hours_percentage`
   - Cálculo global, no por miembro

3. **Tasa de Utilización Global:**
   - Se calcula en dashboard (`/api/v1/insights/dashboard`)
   - Suma todas las horas estimadas vs horas disponibles totales
   - No considera asignaciones específicas

### ❌ No Implementado (Crítico)

1. **Modelo de Asignación de Recursos:**
   - No existe tabla `quote_resource_allocations`
   - No hay relación entre `Quote` y `TeamMember`
   - No se pueden asignar miembros específicos a cotizaciones

2. **Validación de Capacidad:**
   - No se valida capacidad al crear cotizaciones
   - No hay advertencias de sobreutilización
   - No se previene sobreasignación

3. **Utilización por Miembro:**
   - No se calcula utilización individual
   - No hay endpoint para ver disponibilidad por miembro
   - No se puede identificar sobrecarga de recursos

4. **Cálculo de Costos por Recurso:**
   - El BCR es global, no considera salarios específicos
   - No se puede calcular costo real usando miembros asignados

---

## 🏗️ ARQUITECTURA PROPUESTA

### 1. Modelo de Datos

#### 1.1 Nuevo Modelo: `QuoteResourceAllocation`

**Ubicación:** `backend/app/models/resource_allocation.py` (nuevo archivo)

```python
class QuoteResourceAllocation(Base):
    """
    Asignación de recursos (miembros del equipo) a cotizaciones
    
    Permite asignar miembros específicos del equipo a una cotización
    con horas específicas, roles y fechas de asignación.
    """
    __tablename__ = "quote_resource_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    team_member_id = Column(Integer, ForeignKey("team_members.id"), nullable=False, index=True)
    
    # Horas asignadas a este miembro para esta cotización
    allocated_hours = Column(Numeric(precision=10, scale=4), nullable=False)  # ESTÁNDAR NOUGRAM: Numeric
    
    # Rol específico del miembro en este proyecto (opcional)
    role_in_project = Column(String, nullable=True)  # ej: "Lead Developer", "Designer", "Project Manager"
    
    # Fechas de asignación (opcional, para proyectos con timeline específico)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Notas sobre la asignación
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Multi-tenant: organization relationship (heredado de quote)
    # No necesita campo directo, se obtiene vía quote.project.organization_id
    
    # Relationships
    quote = relationship("Quote", back_populates="resource_allocations")
    team_member = relationship("TeamMember")
    
    # Índices compuestos para queries frecuentes
    __table_args__ = (
        Index('idx_quote_resource_quote_member', 'quote_id', 'team_member_id'),
        Index('idx_quote_resource_member_dates', 'team_member_id', 'start_date', 'end_date'),
    )
```

**Campos Clave:**
- `allocated_hours`: Horas asignadas a este miembro para esta cotización (requerido)
- `role_in_project`: Rol específico en el proyecto (opcional, para claridad)
- `start_date`/`end_date`: Timeline de asignación (opcional, para proyectos con fechas específicas)
- `notes`: Notas adicionales sobre la asignación

**Validaciones:**
- `allocated_hours` debe ser > 0
- `team_member_id` debe existir y estar activo
- `quote_id` debe existir
- Si `end_date` está presente, debe ser >= `start_date`

---

#### 1.2 Actualización del Modelo `Quote`

**Ubicación:** `backend/app/models/project.py`

**Cambios:**
```python
class Quote(Base):
    # ... campos existentes ...
    
    # Relationships
    project = relationship("Project", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")
    expenses = relationship("QuoteExpense", back_populates="quote", cascade="all, delete-orphan")
    resource_allocations = relationship("QuoteResourceAllocation", back_populates="quote", cascade="all, delete-orphan")  # NUEVO
```

---

### 2. Schemas (Pydantic)

#### 2.1 Schema de Creación

**Ubicación:** `backend/app/schemas/resource_allocation.py` (nuevo archivo)

```python
class ResourceAllocationBase(BaseModel):
    """Base schema para asignación de recursos"""
    team_member_id: int = Field(..., description="ID del miembro del equipo", gt=0)
    allocated_hours: Decimal = Field(..., description="Horas asignadas a este miembro", gt=0)
    role_in_project: Optional[str] = Field(None, description="Rol específico en el proyecto")
    start_date: Optional[datetime] = Field(None, description="Fecha inicio de asignación")
    end_date: Optional[datetime] = Field(None, description="Fecha fin de asignación")
    notes: Optional[str] = Field(None, description="Notas sobre la asignación")
    
    @field_validator('end_date')
    def validate_end_date(cls, v, info):
        if v and info.data.get('start_date') and v < info.data['start_date']:
            raise ValueError("end_date must be >= start_date")
        return v

class ResourceAllocationCreate(ResourceAllocationBase):
    """Schema para crear asignación de recursos"""
    pass

class ResourceAllocationUpdate(BaseModel):
    """Schema para actualizar asignación de recursos"""
    allocated_hours: Optional[Decimal] = Field(None, gt=0)
    role_in_project: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

class ResourceAllocationResponse(ResourceAllocationBase):
    """Schema de respuesta para asignación de recursos"""
    id: int
    quote_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    team_member_name: Optional[str] = None  # Incluir nombre del miembro para conveniencia
    
    model_config = ConfigDict(from_attributes=True)
```

#### 2.2 Actualización de `ProjectCreateWithQuote`

**Ubicación:** `backend/app/schemas/project.py`

**Cambios:**
```python
class ProjectCreateWithQuote(BaseModel):
    # ... campos existentes ...
    
    # NUEVO: Asignación de recursos (opcional)
    resource_allocations: Optional[List[ResourceAllocationCreate]] = Field(
        None,
        description="Asignación de recursos específicos del equipo a esta cotización"
    )
```

---

### 3. Servicios y Lógica de Negocio

#### 3.1 Servicio de Validación de Capacidad

**Ubicación:** `backend/app/services/resource_allocation_service.py` (nuevo archivo)

```python
class ResourceAllocationService:
    """Servicio para gestionar asignaciones de recursos"""
    
    def __init__(self, db: AsyncSession, organization_id: int):
        self.db = db
        self.organization_id = organization_id
    
    async def validate_capacity(
        self,
        resource_allocations: List[ResourceAllocationCreate],
        exclude_quote_id: Optional[int] = None
    ) -> Dict:
        """
        Validar que las asignaciones no excedan la capacidad disponible
        
        Args:
            resource_allocations: Lista de asignaciones a validar
            exclude_quote_id: ID de cotización a excluir del cálculo (para updates)
        
        Returns:
            Dict con valid, errors, warnings
        """
        warnings = []
        errors = []
        
        for allocation in resource_allocations:
            # Obtener miembro del equipo
            member = await self.db.get(TeamMember, allocation.team_member_id)
            if not member or not member.is_active:
                errors.append({
                    "team_member_id": allocation.team_member_id,
                    "message": "Team member not found or inactive"
                })
                continue
            
            # Calcular horas disponibles del miembro
            non_billable = getattr(member, 'non_billable_hours_percentage', 0.0) or 0.0
            billable_factor = Decimal('1') - Decimal(str(non_billable))
            monthly_hours = Decimal(str(member.billable_hours_per_week)) * Decimal('4.33') * billable_factor
            
            # Calcular horas ya asignadas (excluyendo la cotización actual si es update)
            query = select(func.sum(QuoteResourceAllocation.allocated_hours)).join(
                Quote, QuoteResourceAllocation.quote_id == Quote.id
            ).join(
                Project, Quote.project_id == Project.id
            ).where(
                QuoteResourceAllocation.team_member_id == allocation.team_member_id,
                Project.status.in_(["Draft", "Sent", "Viewed", "Accepted"]),
                Project.deleted_at.is_(None),
                Project.organization_id == self.organization_id
            )
            
            if exclude_quote_id:
                query = query.where(QuoteResourceAllocation.quote_id != exclude_quote_id)
            
            result = await self.db.execute(query)
            already_allocated = result.scalar() or Decimal('0')
            
            # Calcular utilización proyectada
            projected_allocated = already_allocated + Decimal(str(allocation.allocated_hours))
            projected_utilization = (projected_allocated / monthly_hours * 100) if monthly_hours > 0 else 0
            
            available_capacity = monthly_hours - already_allocated
            
            if projected_utilization > 100:
                errors.append({
                    "team_member_id": allocation.team_member_id,
                    "member_name": member.name,
                    "message": f"La asignación excede la capacidad disponible. "
                              f"Disponible: {float(available_capacity):.2f}h, "
                              f"Requiere: {float(allocation.allocated_hours):.2f}h",
                    "available_capacity": float(available_capacity),
                    "requested_hours": float(allocation.allocated_hours)
                })
            elif projected_utilization > 90:
                warnings.append({
                    "team_member_id": allocation.team_member_id,
                    "member_name": member.name,
                    "message": f"Utilización proyectada: {float(projected_utilization):.1f}% (cerca del límite)",
                    "projected_utilization": float(projected_utilization)
                })
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
    
    async def calculate_member_utilization(
        self,
        team_member_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Calcular utilización de un miembro específico del equipo
        
        Args:
            team_member_id: ID del miembro del equipo
            start_date: Fecha inicio para filtrar asignaciones
            end_date: Fecha fin para filtrar asignaciones
        
        Returns:
            Dict con utilización y disponibilidad del miembro
        """
        member = await self.db.get(TeamMember, team_member_id)
        if not member:
            raise ResourceNotFoundError("TeamMember", team_member_id)
        
        # Calcular horas disponibles
        non_billable = getattr(member, 'non_billable_hours_percentage', 0.0) or 0.0
        billable_factor = Decimal('1') - Decimal(str(non_billable))
        monthly_hours = Decimal(str(member.billable_hours_per_week)) * Decimal('4.33') * billable_factor
        
        # Calcular horas asignadas
        query = select(func.sum(QuoteResourceAllocation.allocated_hours)).join(
            Quote, QuoteResourceAllocation.quote_id == Quote.id
        ).join(
            Project, Quote.project_id == Project.id
        ).where(
            QuoteResourceAllocation.team_member_id == team_member_id,
            Project.status.in_(["Draft", "Sent", "Viewed", "Accepted"]),
            Project.deleted_at.is_(None),
            Project.organization_id == self.organization_id
        )
        
        if start_date:
            query = query.where(
                or_(
                    QuoteResourceAllocation.start_date.is_(None),
                    QuoteResourceAllocation.start_date >= start_date
                )
            )
        if end_date:
            query = query.where(
                or_(
                    QuoteResourceAllocation.end_date.is_(None),
                    QuoteResourceAllocation.end_date <= end_date
                )
            )
        
        result = await self.db.execute(query)
        allocated_hours = result.scalar() or Decimal('0')
        
        utilization_rate = (allocated_hours / monthly_hours * 100) if monthly_hours > 0 else 0
        
        return {
            "team_member_id": team_member_id,
            "member_name": member.name,
            "role": member.role,
            "available_hours": float(monthly_hours),
            "allocated_hours": float(allocated_hours),
            "available_capacity": float(monthly_hours - allocated_hours),
            "utilization_rate": float(utilization_rate)
        }
```

---

## 🎯 PLAN DE TRABAJO POR SPRINTS

---

## SPRINT 1: Modelo de Datos y Migraciones (Prioridad: CRÍTICA)

**Duración:** 1 semana  
**Objetivo:** Crear modelo de datos y migraciones para asignación de recursos

### Tarea 1.1: Crear Modelo `QuoteResourceAllocation`

**Archivo:** `backend/app/models/resource_allocation.py` (nuevo)

**Objetivo:** Crear modelo SQLAlchemy para asignaciones de recursos

**Código:**
- Modelo completo con todos los campos especificados
- Relaciones con `Quote` y `TeamMember`
- Índices compuestos para performance
- Validaciones a nivel de modelo

**Estimación:** 2 horas  
**Dependencias:** Ninguna

---

### Tarea 1.2: Crear Migración de Base de Datos

**Archivo:** `backend/alembic/versions/XXXX_add_resource_allocation.py` (nuevo)

**Objetivo:** Crear tabla `quote_resource_allocations` en base de datos

**Cambios:**
- Crear tabla `quote_resource_allocations`
- Agregar foreign keys a `quotes` y `team_members`
- Crear índices compuestos
- Agregar constraint de validación (allocated_hours > 0)

**SQL Equivalente:**
```sql
CREATE TABLE quote_resource_allocations (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    team_member_id INTEGER NOT NULL REFERENCES team_members(id),
    allocated_hours NUMERIC(10,4) NOT NULL CHECK (allocated_hours > 0),
    role_in_project VARCHAR,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_end_after_start CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_quote_resource_quote_member ON quote_resource_allocations(quote_id, team_member_id);
CREATE INDEX idx_quote_resource_member_dates ON quote_resource_allocations(team_member_id, start_date, end_date);
CREATE INDEX idx_quote_resource_quote_id ON quote_resource_allocations(quote_id);
CREATE INDEX idx_quote_resource_team_member_id ON quote_resource_allocations(team_member_id);
```

**Estimación:** 1 hora  
**Dependencias:** Tarea 1.1

---

### Tarea 1.3: Actualizar Modelo `Quote`

**Archivo:** `backend/app/models/project.py`

**Objetivo:** Agregar relación con `QuoteResourceAllocation`

**Cambios:**
- Agregar import de `QuoteResourceAllocation`
- Agregar relación `resource_allocations` con cascade delete

**Estimación:** 30 minutos  
**Dependencias:** Tarea 1.1

---

### Tarea 1.4: Crear Schemas Pydantic

**Archivo:** `backend/app/schemas/resource_allocation.py` (nuevo)

**Objetivo:** Crear schemas para validación y serialización

**Schemas:**
- `ResourceAllocationBase`
- `ResourceAllocationCreate`
- `ResourceAllocationUpdate`
- `ResourceAllocationResponse`

**Validaciones:**
- `allocated_hours` > 0
- `end_date` >= `start_date` si ambos están presentes
- `team_member_id` > 0

**Estimación:** 2 horas  
**Dependencias:** Ninguna

---

### Tarea 1.5: Actualizar Schema `ProjectCreateWithQuote`

**Archivo:** `backend/app/schemas/project.py`

**Objetivo:** Agregar campo opcional `resource_allocations` al schema de creación

**Cambios:**
- Agregar import de `ResourceAllocationCreate`
- Agregar campo `resource_allocations: Optional[List[ResourceAllocationCreate]]`

**Estimación:** 30 minutos  
**Dependencias:** Tarea 1.4

---

**Total Sprint 1:** 6 horas (~1 día)

---

## SPRINT 2: Servicios y Validación de Capacidad (Prioridad: ALTA)

**Duración:** 1.5 semanas  
**Objetivo:** Implementar servicios de validación y cálculo de utilización

### Tarea 2.1: Crear Servicio `ResourceAllocationService`

**Archivo:** `backend/app/services/resource_allocation_service.py` (nuevo)

**Objetivo:** Implementar lógica de negocio para asignaciones

**Métodos:**
- `validate_capacity()`: Validar capacidad antes de asignar
- `calculate_member_utilization()`: Calcular utilización por miembro
- `get_allocations_by_quote()`: Obtener asignaciones de una cotización
- `get_allocations_by_member()`: Obtener asignaciones de un miembro

**Estimación:** 6 horas  
**Dependencias:** Sprint 1 completo

---

### Tarea 2.2: Integrar Validación en Creación de Cotizaciones

**Archivo:** `backend/app/services/project_service.py`

**Objetivo:** Validar capacidad al crear cotización con asignaciones

**Cambios:**
- En `create_project_with_quote()`:
  - Si `resource_allocations` está presente, llamar a `validate_capacity()`
  - Si hay errores, lanzar `HTTPException` con detalles
  - Si hay warnings, incluirlos en la respuesta (no bloquear creación)
  - Crear asignaciones después de crear la cotización

**Estimación:** 3 horas  
**Dependencias:** Tarea 2.1

---

### Tarea 2.3: Crear Repository para Resource Allocation

**Archivo:** `backend/app/repositories/resource_allocation_repository.py` (nuevo)

**Objetivo:** Abstracción de acceso a datos (siguiendo patrón Repository)

**Métodos:**
- `create()`: Crear asignación
- `get_by_quote_id()`: Obtener asignaciones de una cotización
- `get_by_team_member_id()`: Obtener asignaciones de un miembro
- `update()`: Actualizar asignación
- `delete()`: Eliminar asignación
- `delete_by_quote_id()`: Eliminar todas las asignaciones de una cotización

**Estimación:** 4 horas  
**Dependencias:** Sprint 1 completo

---

### Tarea 2.4: Actualizar Cálculo de Costos con Recursos Específicos

**Archivo:** `backend/app/core/calculations.py`

**Objetivo:** Opcionalmente usar costos específicos de miembros asignados en lugar de BCR global

**Lógica:**
- Si una cotización tiene `resource_allocations`:
  - Calcular costo usando salarios específicos de los miembros asignados
  - `internal_cost = sum(member.salary_monthly_brute / monthly_hours * allocated_hours)`
- Si no tiene asignaciones, usar BCR global (comportamiento actual)

**Estimación:** 4 horas  
**Dependencias:** Tarea 2.1

---

**Total Sprint 2:** 17 horas (~2.5 días)

---

## SPRINT 3: Endpoints API (Prioridad: ALTA)

**Duración:** 1.5 semanas  
**Objetivo:** Crear endpoints para gestionar asignaciones y consultar disponibilidad

### Tarea 3.1: Endpoint CRUD de Asignaciones

**Archivo:** `backend/app/api/v1/endpoints/resource_allocations.py` (nuevo)

**Endpoints:**
- `POST /api/v1/quotes/{quote_id}/resource-allocations`: Crear asignación
- `GET /api/v1/quotes/{quote_id}/resource-allocations`: Listar asignaciones de una cotización
- `PUT /api/v1/quotes/{quote_id}/resource-allocations/{allocation_id}`: Actualizar asignación
- `DELETE /api/v1/quotes/{quote_id}/resource-allocations/{allocation_id}`: Eliminar asignación

**Validaciones:**
- Verificar que quote pertenece a la organización
- Validar capacidad antes de crear/actualizar
- Verificar que team_member pertenece a la organización

**Estimación:** 6 horas  
**Dependencias:** Sprint 2 completo

---

### Tarea 3.2: Endpoint de Disponibilidad de Recursos

**Archivo:** `backend/app/api/v1/endpoints/resource_allocations.py`

**Endpoint:**
- `GET /api/v1/team/availability`: Obtener disponibilidad de todos los miembros

**Query Parameters:**
- `start_date`: Filtrar por fecha inicio
- `end_date`: Filtrar por fecha fin
- `team_member_id`: Filtrar por miembro específico (opcional)

**Response:**
```json
{
  "members": [
    {
      "team_member_id": 1,
      "member_name": "Juan Pérez",
      "role": "Developer",
      "available_hours": 138.56,
      "allocated_hours": 80.0,
      "available_capacity": 58.56,
      "utilization_rate": 57.7
    }
  ],
  "total_available_hours": 500.0,
  "total_allocated_hours": 300.0,
  "overall_utilization": 60.0
}
```

**Estimación:** 4 horas  
**Dependencias:** Tarea 2.1

---

### Tarea 3.3: Endpoint de Utilización por Miembro

**Archivo:** `backend/app/api/v1/endpoints/resource_allocations.py`

**Endpoint:**
- `GET /api/v1/team/{team_member_id}/utilization`: Obtener utilización detallada de un miembro

**Response:**
```json
{
  "team_member_id": 1,
  "member_name": "Juan Pérez",
  "role": "Developer",
  "available_hours": 138.56,
  "allocated_hours": 80.0,
  "available_capacity": 58.56,
  "utilization_rate": 57.7,
  "allocations": [
    {
      "quote_id": 123,
      "project_name": "Website Redesign",
      "allocated_hours": 40.0,
      "role_in_project": "Lead Developer",
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": "2026-02-28T23:59:59Z"
    }
  ]
}
```

**Estimación:** 3 horas  
**Dependencias:** Tarea 2.1

---

### Tarea 3.4: Integrar Asignaciones en Endpoint de Creación de Proyecto

**Archivo:** `backend/app/api/v1/endpoints/projects.py`

**Objetivo:** Actualizar endpoint `POST /api/v1/projects/` para aceptar `resource_allocations`

**Cambios:**
- Aceptar campo `resource_allocations` en el payload
- Pasar a `ProjectService.create_project_with_quote()`
- Incluir asignaciones en la respuesta

**Estimación:** 2 horas  
**Dependencias:** Tarea 2.2

---

### Tarea 3.5: Actualizar Endpoint de Cálculo de Cotización

**Archivo:** `backend/app/api/v1/endpoints/quotes.py`

**Objetivo:** Opcionalmente aceptar asignaciones en cálculo para preview

**Cambios:**
- Agregar campo opcional `resource_allocations` a `QuoteCalculateRequest`
- Si se proporcionan, calcular costo usando salarios específicos
- Retornar costo calculado con recursos específicos

**Estimación:** 3 horas  
**Dependencias:** Tarea 2.4

---

**Total Sprint 3:** 18 horas (~2.5 días)

---

## SPRINT 4: Testing y Documentación (Prioridad: MEDIA)

**Duración:** 1 semana  
**Objetivo:** Tests completos y documentación

### Tarea 4.1: Tests Unitarios del Servicio

**Archivo:** `backend/tests/services/test_resource_allocation_service.py` (nuevo)

**Tests:**
- `test_validate_capacity_success`: Validación exitosa
- `test_validate_capacity_exceeds_100_percent`: Error cuando excede capacidad
- `test_validate_capacity_warning_over_90_percent`: Warning cuando > 90%
- `test_calculate_member_utilization`: Cálculo correcto de utilización
- `test_calculate_member_utilization_with_dates`: Filtrado por fechas

**Estimación:** 4 horas  
**Dependencias:** Sprint 2 completo

---

### Tarea 4.2: Tests de Integración de Endpoints

**Archivo:** `backend/tests/api/v1/test_resource_allocations.py` (nuevo)

**Tests:**
- `test_create_resource_allocation`: Crear asignación exitosamente
- `test_create_resource_allocation_exceeds_capacity`: Error al exceder capacidad
- `test_list_resource_allocations_by_quote`: Listar asignaciones de cotización
- `test_update_resource_allocation`: Actualizar asignación
- `test_delete_resource_allocation`: Eliminar asignación
- `test_get_team_availability`: Obtener disponibilidad del equipo
- `test_get_member_utilization`: Obtener utilización de miembro

**Estimación:** 6 horas  
**Dependencias:** Sprint 3 completo

---

### Tarea 4.3: Tests de Integración con Creación de Cotizaciones

**Archivo:** `backend/tests/api/v1/test_projects.py` (actualizar)

**Tests:**
- `test_create_project_with_resource_allocations`: Crear proyecto con asignaciones
- `test_create_project_with_resource_allocations_exceeds_capacity`: Error al exceder capacidad
- `test_create_project_with_resource_allocations_warning`: Warning cuando > 90%

**Estimación:** 3 horas  
**Dependencias:** Tarea 3.4

---

### Tarea 4.4: Documentación de API

**Archivo:** Actualizar docstrings y OpenAPI schemas

**Objetivo:** Documentar todos los endpoints nuevos

**Estimación:** 2 horas  
**Dependencias:** Sprint 3 completo

---

### Tarea 4.5: Actualizar Documentación Técnica

**Archivo:** `docs/development/BACKEND_SPECT_QUOTE.md`

**Objetivo:** Agregar sección sobre Resource Allocation

**Contenido:**
- Modelo de datos
- Endpoints
- Validaciones
- Cálculo de utilización
- Ejemplos de uso

**Estimación:** 2 horas  
**Dependencias:** Sprint 3 completo

---

**Total Sprint 4:** 17 horas (~2.5 días)

---

## 📋 RESUMEN DE ESTIMACIONES

| Sprint | Tareas | Horas | Días | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| Sprint 1 | Modelo de Datos | 6h | 1d | CRÍTICA |
| Sprint 2 | Servicios y Validación | 17h | 2.5d | ALTA |
| Sprint 3 | Endpoints API | 18h | 2.5d | ALTA |
| Sprint 4 | Testing y Documentación | 17h | 2.5d | MEDIA |
| **TOTAL** | **4 sprints** | **58h** | **~8d** | |

**Duración Total Estimada:** 6-8 semanas (considerando buffer y revisión)

---

## 🔧 CONSIDERACIONES TÉCNICAS

### 1. Compatibilidad hacia atrás

**Importante:** Las asignaciones de recursos son **opcionales**. Si una cotización no tiene asignaciones, debe funcionar exactamente como antes (usando BCR global).

**Implementación:**
- Campo `resource_allocations` es opcional en `ProjectCreateWithQuote`
- Si no se proporciona, usar BCR global (comportamiento actual)
- Si se proporciona, validar y usar costos específicos

---

### 2. Validación de Capacidad

**Estrategia:**
- **Errores (bloquean creación):** Utilización > 100%
- **Warnings (no bloquean):** Utilización > 90% pero <= 100%
- **Configurable:** Umbrales configurables en `Organization.settings`

**Configuración:**
```json
{
  "resource_allocation": {
    "warning_threshold": 90,  // Porcentaje para warning
    "block_threshold": 100,   // Porcentaje para bloquear
    "allow_override": true     // Permitir override manual
  }
}
```

---

### 3. Cálculo de Costos

**Lógica:**
- Si cotización tiene asignaciones:
  - Calcular costo usando salarios específicos: `sum(member_cost * allocated_hours)`
  - `member_cost = (salary_monthly_brute * social_charges_multiplier) / monthly_billable_hours`
- Si no tiene asignaciones:
  - Usar BCR global (comportamiento actual)

**Ejemplo:**
```
Miembro: Juan Pérez
- Salary: $5,000 USD/mes
- Social charges: 1.5x
- Billable hours/mes: 138.56h
- Costo/hora: ($5,000 * 1.5) / 138.56 = $54.15/h

Asignación: 40 horas
- Costo total: 40 * $54.15 = $2,166 USD
```

---

### 4. Performance

**Optimizaciones:**
- Índices compuestos en `quote_resource_allocations`
- Cache de cálculos de utilización (TTL: 5 minutos)
- Queries optimizadas con `selectinload` para relaciones

**Índices Críticos:**
- `(quote_id, team_member_id)`: Para queries por cotización
- `(team_member_id, start_date, end_date)`: Para queries de disponibilidad
- `quote_id`: Para cascade delete eficiente

---

### 5. Multi-tenancy

**Validaciones:**
- Verificar que `team_member.organization_id == quote.project.organization_id`
- Filtrar todas las queries por `organization_id`
- No permitir asignar miembros de otras organizaciones

---

## 🧪 PLAN DE TESTING

### Tests Unitarios

1. **ResourceAllocationService:**
   - Validación de capacidad (varios escenarios)
   - Cálculo de utilización
   - Manejo de fechas

2. **Cálculos:**
   - Cálculo de costo con recursos específicos
   - Comparación con BCR global

### Tests de Integración

1. **Endpoints CRUD:**
   - Crear, leer, actualizar, eliminar asignaciones
   - Validaciones de negocio

2. **Integración con Cotizaciones:**
   - Crear cotización con asignaciones
   - Validación de capacidad en creación
   - Cálculo de costos con recursos específicos

3. **Endpoints de Disponibilidad:**
   - Obtener disponibilidad del equipo
   - Filtrado por fechas
   - Utilización por miembro

### Tests de Performance

1. **Queries con muchos registros:**
   - 1000+ cotizaciones
   - 50+ miembros del equipo
   - Validar tiempos de respuesta < 500ms

---

## 📝 MIGRACIONES NECESARIAS

### Migración 1: Crear Tabla `quote_resource_allocations`

**Archivo:** `backend/alembic/versions/XXXX_add_resource_allocation.py`

**Contenido:**
- Crear tabla con todos los campos
- Foreign keys y constraints
- Índices compuestos
- Validación de datos

**Rollback:** Eliminar tabla y todos los índices

---

## 🚀 CRITERIOS DE ACEPTACIÓN

### Funcionalidad Core

- [ ] Se puede crear cotización con asignaciones de recursos específicos
- [ ] Se valida capacidad antes de crear asignaciones
- [ ] Se calcula utilización por miembro individual
- [ ] Se puede consultar disponibilidad del equipo completo
- [ ] Se puede consultar utilización detallada de un miembro

### Validaciones

- [ ] Error cuando asignación excede 100% de capacidad
- [ ] Warning cuando asignación excede 90% de capacidad
- [ ] Validación de fechas (end_date >= start_date)
- [ ] Validación de multi-tenancy (solo miembros de la misma organización)

### Performance

- [ ] Queries de disponibilidad < 500ms con 1000+ cotizaciones
- [ ] Validación de capacidad < 200ms
- [ ] Cálculo de utilización < 100ms por miembro

### Compatibilidad

- [ ] Cotizaciones sin asignaciones funcionan igual que antes
- [ ] BCR global sigue funcionando cuando no hay asignaciones
- [ ] No se rompen endpoints existentes

---

## 📚 REFERENCIAS

### Documentos Relacionados

- `BACKEND_SPECT_QUOTE.md`: Especificación del módulo de Quotes
- `PLAN_TRABAJO_QUOTES_DASHBOARD_BACKEND.md`: Plan de trabajo del Dashboard

### Archivos de Código

- `backend/app/models/team.py`: Modelo TeamMember
- `backend/app/models/project.py`: Modelos Quote y Project
- `backend/app/core/calculations.py`: Cálculo de BCR
- `backend/app/services/project_service.py`: Servicio de proyectos

---

## 🔄 PRÓXIMOS PASOS

1. **Revisar y aprobar plan:** Validar arquitectura y estimaciones
2. **Sprint 1:** Comenzar con modelo de datos y migraciones
3. **Sprint 2:** Implementar servicios y validaciones
4. **Sprint 3:** Crear endpoints API
5. **Sprint 4:** Testing y documentación

---

**Última actualización:** 2026-01-25  
**Versión:** 1.0  
**Estado:** Pendiente de Implementación
