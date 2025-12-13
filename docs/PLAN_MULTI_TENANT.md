# 🏗️ Plan de Trabajo: Arquitectura Multi-Tenant SaaS

**Fecha de análisis:** 12 de Diciembre, 2025  
**Estado:** Sprint 2 completado ✅ | Preparado para Sprint 3

---

## 📊 Resumen Ejecutivo

Este plan transforma la aplicación actual (single-tenant) en una plataforma SaaS multi-tenant completa, permitiendo que múltiples organizaciones usen la aplicación de forma aislada y segura.

**Timeline Total:** 16-20 semanas  
**Estado Actual:** ✅ Sprint 2 completado (100%)

---

## ✅ FASE 1: Sprint 2 - Estabilización (COMPLETADA)

### Estado: ✅ 100% Completado

| Sprint | Tarea | Estado | Tests |
|--------|-------|--------|-------|
| 2.1 | Testing Básico | ✅ | 33 tests (18 unitarios + 15 integración) |
| 2.2 | Optimizaciones | ✅ | Paginación, índices, caché |
| 2.3 | Dashboard | ✅ | KPIs avanzados, filtros, gráficos |
| 2.4 | Exportación | ✅ | PDF, DOCX, Email |

**Resultados:**
- ✅ Base sólida de tests antes de migración
- ✅ Rendimiento optimizado con caché e índices
- ✅ Dashboard completo con análisis avanzado
- ✅ Exportación profesional de cotizaciones

---

## 🚀 FASE 2: Multi-Tenant Architecture (Sprints 3-8)

### Sprint 3: Fundación Multi-Tenant ⏳ SIGUIENTE

**Objetivo:** Crear modelos y migración de datos existentes  
**Duración:** 2 semanas  
**Estado:** Pendiente  
**Prioridad:** Alta

#### Tareas:

1. **Crear modelo Organization**
   - Archivo: `backend/app/models/organization.py`
   - Campos: `id`, `name`, `slug`, `subscription_plan`, `subscription_status`, `settings` (JSON)
   - Relación con `User`

2. **Migración de datos existentes**
   - Crear tabla `organizations`
   - Crear organización "default" (ID=1)
   - Agregar `organization_id` (nullable primero) a:
     - `users`
     - `projects`
     - `services`
     - `costs_fixed`
     - `team_members`
     - `taxes`
   - Asignar todos los registros existentes a `organization_id = 1`
   - Hacer `organization_id` NOT NULL
   - Crear índices compuestos: `(organization_id, id)`, `(organization_id, created_at)`

3. **Actualizar modelo User**
   - Agregar `organization_id` ForeignKey
   - Relación con Organization

**Archivos clave:**
- `backend/app/models/organization.py` (nuevo)
- `backend/alembic/versions/XXX_add_multi_tenant.py` (nuevo)
- `backend/app/models/user.py` (actualizar)
- Todos los modelos (actualizar)

**Riesgos:**
- ⚠️ Migración debe ser reversible
- ⚠️ Preservar todos los datos existentes
- ⚠️ Validar integridad post-migración

---

### Sprint 4: Tenant Context y Repositorios

**Objetivo:** Implementar aislamiento de datos por tenant  
**Duración:** 2 semanas  
**Dependencias:** Sprint 3 completado

#### Tareas:

1. **Tenant Context Manager**
   - `backend/app/core/tenant.py` (nuevo)
   - Clase `TenantContext`
   - Dependency `get_tenant_context()` con validación de suscripción

2. **Modificar BaseRepository**
   - Agregar `tenant_id` al constructor
   - Filtrado automático por `organization_id` en todas las queries
   - Métodos con tenant scoping

3. **Actualizar repositorios**
   - `ProjectRepository`, `ServiceRepository`, `CostRepository`, `TaxRepository`, `TeamRepository`
   - Constructor acepta `tenant_id`
   - Queries filtran por tenant

4. **Repository Factory**
   - `backend/app/repositories/factory.py` (nuevo)
   - Factory que crea repositorios con tenant context

---

### Sprint 5: Endpoints y Autenticación Multi-Tenant

**Objetivo:** Actualizar endpoints y JWT para multi-tenant  
**Duración:** 2 semanas  
**Dependencias:** Sprint 4 completado

#### Tareas:

1. **Modificar JWT**
   - Incluir `organization_id` en token payload
   - Validar `organization_id` en `get_current_user()`

2. **Actualizar endpoints**
   - Agregar `tenant: TenantContext = Depends(get_tenant_context)`
   - Usar `RepositoryFactory` con `tenant.organization_id`
   - Validar ownership en update/delete
   - Endpoints afectados: todos los principales

3. **Tests de aislamiento**
   - Validar que tenant A no accede a datos de tenant B
   - Tests de data leakage prevention

---

### Sprint 6: Gestión de Organizaciones

**Objetivo:** CRUD de organizaciones y gestión de usuarios  
**Duración:** 2 semanas  
**Dependencias:** Sprint 5 completado

#### Tareas:

1. **Endpoints de Organizaciones**
   - CRUD completo
   - Endpoint de registro público
   - Setup inicial

2. **Sistema de invitaciones**
   - Invitar usuarios a organización
   - Asignar usuarios

3. **Validación de límites por plan**
   - Validar límites: max_users, max_projects
   - Middleware de verificación

4. **Frontend básico**
   - Registro de organización
   - Dashboard de administración
   - Gestión de usuarios

---
### Sprint 6.5: Sistema de Plantillas y Onboarding ⭐

**Objetivo:** Implementar sistema de plantillas por área creativa para mejorar el onboarding de nuevas organizaciones  
**Duración:** 1 semana  
**Estado:** Pendiente  
**Dependencias:** Sprint 6 completado  
**Prioridad:** Alta

#### Contexto

Este sprint mejora significativamente la experiencia de onboarding permitiendo que nuevas organizaciones comiencen con una estructura pre-configurada basada en su industria (Branding, Desarrollo Web, Audiovisual, etc.), reduciendo fricción y mejorando time-to-value.

#### Tareas Detalladas:

**6.5.1: Modelo IndustryTemplate**

- Crear: `backend/app/models/template.py` (nuevo)
- Modelo `IndustryTemplate`:hon
  - id (Integer, primary key)
  - industry_type (String, unique, index)  # "branding", "web_development", etc.
  - name (String)  # "Agencia de Branding"
  - description (Text, nullable)
  - suggested_roles (JSON)  # Array de roles con salarios, seniority, horas facturables
  - suggested_services (JSON)  # Array de servicios con márgenes objetivo
  - suggested_fixed_costs (JSON, nullable)  # Array de costos fijos sugeridos
  - is_active (Boolean, default=True)
  - created_at, updated_at (DateTime)
  **6.5.2: Migración y Seed Data**

- Crear: `backend/alembic/versions/XXX_add_industry_templates.py` (nuevo)
- Seed data para 5 plantillas iniciales:
  1. **Agencia de Branding**
     - Roles: Diseñador Gráfico Jr/Middle/Senior, Ejecutivo de Cuentas, Ilustrador
     - Servicios: Diseño de Identidad Visual, Packaging, Brand Strategy
     - Costos: Adobe Creative Cloud, Figma Team
  2. **Desarrollo Web/Software**
     - Roles: Desarrollador Frontend/Backend (Jr/Middle/Senior), Project Manager, QA Tester
     - Servicios: Landing Page, E-commerce, API REST, Mantenimiento
     - Costos: GitHub Team, AWS/Azure Credits, Herramientas de Testing
  3. **Producción Audiovisual**
     - Roles: Editor de Video, Director de Fotografía, Productor, Motion Graphics
     - Servicios: Video Corporativo, Post-producción, Motion Graphics, Animación
     - Costos: Adobe Creative Suite, Almacenamiento NAS, Licencias de Stock
  4. **Marketing Digital**
     - Roles: Community Manager, Especialista Paid Media, SEO Specialist, Content Creator
     - Servicios: Gestión Redes Sociales, Campañas Publicidad, SEO, Content Marketing
     - Costos: Herramientas de Analytics, Plataformas de Publicidad
  5. **Consultoría de Software**
     - Roles: Consultor Senior/Middle, Arquitecto de Software, Tech Lead
     - Servicios: Auditoría Técnica, Arquitectura de Sistemas, Consultoría Estratégica
     - Costos: Herramientas de Análisis, Licencias de Software

**6.5.3: Lógica de Aplicación de Plantillas**

- Crear: `backend/app/services/template_service.py` (nuevo)
- Función principal: `apply_industry_template()`
  - Parámetros: `organization_id`, `industry_type`, `region`, `currency`, `customize`, `db`
  - Funcionalidades:
    - Ajuste de rangos salariales por región (multiplier por país)
    - Crear TeamMembers (valores promedio o placeholders)
    - Crear Services con márgenes objetivos
    - Crear CostFixed sugeridos (marcados como `is_suggested=True`)
    - Guardar contexto de onboarding en `Organization.settings`

**6.5.4: Ajustes por Región**

- Multiplicadores por región (basados en USD):hon
  REGION_MULTIPLIERS = {
      "US": 1.0,      # Baseline
      "UK": 0.85,
      "COL": 0.25,    # Colombia
      "ARG": 0.15,    # Argentina
      "MEX": 0.30,    # México
      "ESP": 0.70,    # España
      "BR": 0.20,     # Brasil
  }
  - Ajustar salarios automáticamente según región seleccionada

**6.5.5: Endpoints de Plantillas**

- Crear: `backend/app/api/v1/endpoints/templates.py` (nuevo)
- Endpoints:
  - `GET /api/v1/templates/industries` - Listar plantillas disponibles
  - `GET /api/v1/templates/industries/{industry_type}` - Obtener detalle de plantilla
  - `POST /api/v1/organizations/{id}/apply-template` - Aplicar plantilla a organización

**6.5.6: Frontend - Onboarding Flow**

- Crear: `frontend/src/app/(app)/onboarding/` (nuevo)
- Flujo multi-step:
  1. **Paso 1:** Información Básica (nombre, país, moneda, email)
  2. **Paso 2:** Selección de Industria (listado visual de plantillas)
  3. **Paso 3:** Preview de Plantilla (estructura sugerida)
  4. **Paso 4:** Personalización (opcional - editar roles, servicios, costos)
  5. **Paso 5:** Confirmación y aplicación
- Integración con registro público

**6.5.7: Actualización de Organization Model**

- Usar `Organization.settings` (JSONB) para almacenar contexto:
  
  {
    "onboarding_completed": true,
    "industry_type": "branding",
    "client_types": ["startups", "enterprise"],
    "services_offered": ["identity_design", "packaging"],
    "team_size_range": "small",
    "template_applied_at": "2025-01-15T10:30:00Z",
    "template_applied_region": "US",
    "template_applied_currency": "USD"
  }
  **Archivos clave:**
- `backend/app/models/template.py` (nuevo)
- `backend/app/services/template_service.py` (nuevo)
- `backend/app/api/v1/endpoints/templates.py` (nuevo)
- `backend/alembic/versions/XXX_add_industry_templates.py` (nuevo)
- `frontend/src/app/(app)/onboarding/` (nuevo - múltiples páginas)

**Criterios de aceptación:**
- [ ] Modelo IndustryTemplate creado
- [ ] 5 plantillas predefinidas creadas como seed data
- [ ] Endpoints de plantillas funcionando
- [ ] Aplicación de plantilla crea recursos correctamente (TeamMembers, Services, CostFixed)
- [ ] Ajuste de salarios por región funciona
- [ ] Onboarding flow completo y funcional
- [ ] UI intuitiva y responsive
- [ ] Tests de aplicación de plantilla pasando
- [ ] Validación de datos (al menos 1 rol y 1 servicio creados)

**Valor de negocio:**
- ✅ Reduce fricción significativamente (no empezar desde cero)
- ✅ Mejora tasa de conversión en registro
- ✅ Diferencia competitiva clara
- ✅ Mejora time-to-value (usuario productivo más rápido)
- ✅ Reduce barrera de entrada

---

### Sprint 7: Facturación y Suscripciones

**Objetivo:** Integración con Stripe  
**Duración:** 2 semanas  
**Dependencias:** Sprint 6 completado

#### Tareas:

1. **Integración Stripe**
   - Planes: free, starter, professional, enterprise
   - Webhook handler

2. **Endpoints de facturación**
   - Checkout
   - Webhook de Stripe
   - Gestión de suscripción

3. **Modelo de planes**
   - Configurar planes y límites

4. **Frontend de facturación**
   - Página de planes
   - Gestión de suscripción
   - Dashboard con estado

---

### Sprint 8: Testing y Seguridad Multi-Tenant

**Objetivo:** Validar aislamiento y seguridad  
**Duración:** 2 semanas  
**Dependencias:** Sprint 7 completado

#### Tareas:

1. **Tests de seguridad**
   - Data leakage prevention
   - Cross-tenant access prevention
   - Validación de límites

2. **Auditoría**
   - Modelo `AuditLog`
   - Logging de acciones críticas

3. **Rate limiting por tenant**
   - Límites diferenciados por plan

4. **Performance testing**
   - Tests con múltiples tenants
   - Validar índices compuestos
   - Validar caché multi-tenant

---

## 🔗 FASE 3: Integraciones Multi-Tenant (Sprint 9)

### Sprint 9: Integraciones Completas

**Objetivo:** Completar integraciones con soporte multi-tenant  
**Duración:** 2-3 semanas  
**Dependencias:** Sprint 8 completado

#### Tareas:

1. **Google Sheets** (con tenant scoping)
2. **Google Calendar** (por usuario dentro de organización)
3. **Apollo.io** (configuración por organización)

---

## 📈 Timeline Estimado

| Fase | Sprint | Duración | Estado |
|------|--------|----------|--------|
| Estabilización | Sprint 2 | 2-3 semanas | ✅ Completado |
| Multi-Tenant | Sprint 3 | 2 semanas | ⏳ Siguiente |
| Multi-Tenant | Sprint 4 | 2 semanas | ⏳ Pendiente |
| Multi-Tenant | Sprint 5 | 2 semanas | ⏳ Pendiente |
| Multi-Tenant | Sprint 6 | 2 semanas | ⏳ Pendiente |
| Multi-Tenant | Sprint 7 | 2 semanas | ⏳ Pendiente |
| Multi-Tenant | Sprint 8 | 2 semanas | ⏳ Pendiente |
| Integraciones | Sprint 9 | 2-3 semanas | ⏳ Pendiente |
| **Total** | | **16-20 semanas** | |

---

## ⚠️ Consideraciones Importantes

### Migración de Datos (Sprint 3)

La migración debe ser:
1. ✅ **Reversible** - Rollback posible
2. ✅ **Segura** - Preservar todos los datos existentes
3. ✅ **Validada** - Verificar integridad post-migración
4. ✅ **Probada** - Testing exhaustivo antes de producción

### Testing Continuo

- Cada sprint incluye tests específicos
- Validar retrocompatibilidad en Sprint 3-4
- Tests de seguridad desde Sprint 5
- Tests de performance en Sprint 8

### Configuración

- Variables de entorno globales para infraestructura
- `Organization.settings` (JSON) para configuraciones por tenant
- Planes de suscripción en código (recomendado)

### Riesgos y Mitigación

| Riesgo | Mitigación |
|--------|------------|
| Data leakage | Tests exhaustivos + validación en repositorios |
| Performance | Índices compuestos + caché por tenant |
| Migración fallida | Migración reversible + testing previo |

---

## 🎯 Siguiente Paso

**Comienza con Sprint 3: Fundación Multi-Tenant**

1. Crear modelo `Organization`
2. Preparar migración de Alembic
3. Actualizar modelos existentes
4. Probar migración en entorno de desarrollo

---

**Última actualización:** 12 de Diciembre, 2025

