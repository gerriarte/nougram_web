# AgenciaOps - Agency Profitability Platform

Plataforma de Rentabilidad y Operaciones para Agencias de Servicios.

## 📚 Documentación

Toda la documentación está organizada en la carpeta **[docs/](./docs/README.md)**:

### Documentos Principales
- **[PRD](./docs/PRD.md)** - Product Requirements Document
- **[Arquitectura](./docs/architecture.md)** - Arquitectura del sistema
- **[Estado del Proyecto](./docs/PROGRESO.md)** - Módulos completados y progreso
- **[Tareas Pendientes](./docs/PENDIENTES.md)** - Próximos pasos

### Documentación Técnica
- **[Análisis Técnico](./docs/development/ANALISIS_CODIGO.md)** - Análisis profundo del código
- **[Reglas de Desarrollo](./docs/development/rules.md)** - Estándares y convenciones

### Sprints
- **[Sprint 1](./docs/sprints/SPRINT1_COMPLETADO.md)** - Refactorización completada

### Producción
- **[Production Readiness](./docs/PRODUCTION_READINESS.md)** - Checklist para despliegue

## 🚀 Inicio Rápido

### Despliegue Automático (Recomendado - Primera vez)

Ejecuta el script de despliegue completo que configura todo automáticamente:

```bash
# Windows
desplegar_local.bat
```

Este script:
- ✅ Verifica dependencias (Docker, Python, Node.js)
- ✅ Configura el entorno del backend (.env)
- ✅ Instala dependencias del backend y frontend
- ✅ Inicia PostgreSQL con Docker
- ✅ Ejecuta migraciones de base de datos

### Iniciar Servicios (Después del despliegue inicial)

**Opción 1: Script automático (inicia todo)**
```bash
# Windows - Inicia backend y frontend en ventanas separadas
iniciar_todo.bat
```

**Opción 2: Scripts individuales**
```bash
# Terminal 1 - PostgreSQL
iniciar_docker.bat

# Terminal 2 - Backend
iniciar_backend.bat

# Terminal 3 - Frontend
iniciar_frontend.bat
```

**Opción 3: Manual**
```bash
# Terminal 1 - PostgreSQL
docker-compose up -d

# Terminal 2 - Backend
cd backend
venv\Scripts\activate  # Windows
python main.py

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Acceso

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

Abre **http://localhost:5000** y haz clic en "Bypass Auth" para desarrollo.

## 📖 Para Más Información

Consulta **[GUIA_USUARIO.md](./GUIA_USUARIO.md)** para:
- Instalación detallada
- Configuración paso a paso
- Uso de la plataforma
- Solución de problemas

## ✅ Proyecto 93% Completado

**Últimas Mejoras (Enero 2025):**
- ✅ **Sistema de Notificaciones** - Badge en tiempo real para solicitudes de eliminación pendientes
- ✅ **UI con Permisos por Rol** - Navegación filtrada según Super Admin / Admin Financiero / Product Manager
- ✅ **Limpieza de Código** - ~244 líneas eliminadas, arquitectura más limpia
- ✅ **Análisis Profundo** - Documentación técnica completa

**Funcionalidades Completadas:**
- ✅ Motor de Costos con Blended Rate
- ✅ Catálogo de Servicios
- ✅ Sistema de Cotizaciones
- ✅ Dashboard con IA
- ✅ Gestión de Impuestos
- ✅ Sistema de Papelera (Soft Delete)
- ✅ Roles y Permisos (RBAC)

Ver **[PROGRESO.md](./PROGRESO.md)** para detalles completos.

## 🏗️ Arquitectura

- **Backend**: FastAPI (Python 3.11+) con PostgreSQL
- **Frontend**: Next.js 14+ (App Router) con TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: SQLAlchemy (async)

## 📝 Licencia

Propietario - Uso interno únicamente



