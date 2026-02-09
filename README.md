# 🚀 Nougram - Plataforma de Rentabilidad y Operaciones

> Plataforma SaaS multi-tenant para gestión de rentabilidad, cotizaciones y análisis de agencias de servicios digitales.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.0-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://www.python.org/)

**Documentación con fecha en el nombre:** [2026-01-04-README.md](2026-01-04-README.md) · **Índice de docs:** [docs/2026-02-07-README.md](docs/2026-02-07-README.md)

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Estado del Proyecto](#-estado-del-proyecto)
- [Documentación](#-documentación)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🎯 Descripción

**Nougram** es una plataforma SaaS diseñada para ayudar a agencias de servicios digitales a:

- 📊 **Centralizar la parametrización de costos** (overhead, nómina, herramientas)
- 💰 **Calcular tarifas rentables** basadas en costos reales y márgenes objetivo
- 📝 **Generar cotizaciones profesionales** con cálculos automáticos de rentabilidad
- 📈 **Obtener insights accionables** mediante dashboard de BI asistido por IA
- 🏢 **Gestionar múltiples organizaciones** con aislamiento completo de datos (multi-tenant)

### Problema que Resuelve

Las agencias de servicios luchan por cotizar proyectos de forma rentable. A menudo se subestiman los costos reales (costo por hora, herramientas) y no hay visibilidad sobre qué clientes o servicios son realmente rentables, lo que dificulta la escalabilidad.

### Solución

Una plataforma que centraliza la parametrización de costos, estandariza la valorización de servicios, genera cotizaciones rentables y predecibles, y proporciona insights accionables a través de un dashboard de BI asistido por IA.

## ✨ Características Principales

### 🏗️ Motor de Costos
- Registro de costos fijos (overhead): alquiler, internet, servicios
- Gestión de equipo: salarios, horas facturables, disponibilidad
- Cálculo automático del **Blended Cost Rate** (Costo-Hora-Agencia Total)
- Soporte multi-moneda (USD, EUR, COP, ARS)

### 📦 Catálogo de Servicios
- Definición de servicios con márgenes objetivo personalizables
- Cálculo automático de tarifas sugeridas por hora
- Categorización y organización de servicios
- Soft delete con restauración

### 💼 Sistema de Cotizaciones
- Creación de proyectos con múltiples versiones de cotizaciones
- Cálculo en tiempo real de costos, precios y márgenes
- Alertas visuales cuando el margen cae por debajo del objetivo
- Exportación a PDF y DOCX
- Envío de cotizaciones por email

### 📊 Dashboard e IA
- KPIs clave: Rentabilidad Promedio, Tasa de Utilización, Servicios Más/Menos Rentables
- Visualizaciones interactivas con gráficos y métricas
- **Asistente IA** para consultas sobre estrategia de precios y rentabilidad
- Filtros avanzados por fecha, proyecto, servicio

### 🏢 Multi-Tenant
- Arquitectura SaaS con aislamiento completo de datos por organización
- Gestión de suscripciones y planes
- Contexto de tenant automático en todas las operaciones
- Validación de aislamiento de datos

### 🔐 Seguridad y Permisos
- Autenticación JWT + Google OAuth 2.0
- Sistema de roles (SUPER_ADMIN, ADMIN_FINANCIERO, PRODUCT_MANAGER)
- Permisos granulares por funcionalidad
- Soft delete con aprobación para eliminaciones

### 🔌 Integraciones
- **Google Sheets**: Importación masiva de costos y equipo
- **Apollo.io**: Búsqueda de contactos y empresas
- **Google Calendar**: Lectura de disponibilidad del equipo
- **Email SMTP**: Envío de cotizaciones

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI 0.104.1 (Python 3.11+)
- **Base de Datos**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0+ (async)
- **Migraciones**: Alembic
- **Autenticación**: JWT (python-jose) + Google OAuth
- **Validación**: Pydantic 2.5+
- **IA**: OpenAI / Google Gemini
- **Exportación**: ReportLab (PDF), python-docx (DOCX)
- **Testing**: Pytest + pytest-asyncio

### Frontend
- **Framework**: Next.js 14.2+ (App Router)
- **Lenguaje**: TypeScript 5.3+
- **Estilos**: Tailwind CSS 3.4+ + Shadcn/ui (Material Design)
- **Estado**: TanStack Query 5.17+ (servidor) + Zustand 4.4+ (cliente)
- **Formularios**: React Hook Form 7.49+ + Zod 3.22+
- **Gráficos**: Recharts 2.10+
- **UI Components**: Radix UI

### DevOps
- **Contenedores**: Docker + Docker Compose
- **Base de Datos**: PostgreSQL en contenedor
- **Variables de Entorno**: python-dotenv

## 📦 Instalación

### Prerrequisitos

- **Python** 3.11 o superior
- **Node.js** 18+ y npm
- **Docker** y Docker Compose
- **Git**

### Instalación Automática (Recomendado)

Ejecuta el script de despliegue completo que configura todo automáticamente:

```bash
# Windows
desplegar_local.bat

# Linux/Mac
chmod +x desplegar_local.sh
./desplegar_local.sh
```

Este script:
- ✅ Verifica dependencias (Docker, Python, Node.js)
- ✅ Configura el entorno del backend (.env)
- ✅ Instala dependencias del backend y frontend
- ✅ Inicia PostgreSQL con Docker
- ✅ Ejecuta migraciones de base de datos

### Instalación Manual

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/gerriarte/Cotizador.git
cd Cotizador
```

#### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install
```

#### 4. Iniciar Base de Datos

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

#### 5. Ejecutar Migraciones

```bash
cd backend
alembic upgrade head
```

## ⚙️ Configuración

### Variables de Entorno del Backend

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Base de Datos
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5435/nougram_db

# JWT
SECRET_KEY=tu-clave-secreta-super-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_SERVICE_ACCOUNT_PATH=path/to/service-account.json

# Google Sheets
GOOGLE_SHEETS_ID=tu-google-sheets-id

# Apollo.io
APOLLO_API_KEY=tu-apollo-api-key

# IA (opcional - al menos uno)
OPENAI_API_KEY=tu-openai-api-key
GOOGLE_AI_API_KEY=tu-google-ai-api-key

# Email SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password
SMTP_FROM_EMAIL=tu-email@gmail.com
SMTP_FROM_NAME=Nougram
SMTP_USE_TLS=true

# CORS
CORS_ORIGINS=http://localhost:5000,http://localhost:3000

# Ambiente
ENVIRONMENT=development
```

### Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets y Google Calendar
4. Crea credenciales OAuth 2.0
5. Descarga el archivo JSON de la cuenta de servicio

## 🚀 Uso

### Iniciar Servicios

**Opción 1: Script Automático (Recomendado)**

```bash
# Windows - Inicia backend y frontend en ventanas separadas
iniciar_todo.bat
```

**Opción 2: Scripts Individuales**

```bash
# Terminal 1 - PostgreSQL
iniciar_docker.bat  # o: docker-compose up -d

# Terminal 2 - Backend
cd backend
venv\Scripts\activate
python main.py

# Terminal 3 - Frontend
cd frontend
npm run dev
```

**Opción 3: Manual**

```bash
# Terminal 1 - PostgreSQL
docker-compose up -d

# Terminal 2 - Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Acceso

- **Frontend**: http://localhost:5000 (o http://localhost:3000 según configuración)
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

### Desarrollo

Para desarrollo, puedes usar el modo "Bypass Auth" en el frontend (solo en desarrollo) o crear un usuario de prueba:

```bash
cd backend
python check_user.py
```

## 📁 Estructura del Proyecto

```
Cotizador/
├── backend/                 # Backend FastAPI
│   ├── app/
│   │   ├── api/v1/         # Endpoints de la API
│   │   │   └── endpoints/  # Handlers de endpoints
│   │   ├── core/           # Configuración y utilidades
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── repositories/   # Capa de acceso a datos
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Servicios de negocio
│   ├── alembic/            # Migraciones de base de datos
│   ├── tests/              # Tests (unitarios + integración)
│   ├── scripts/            # Scripts de utilidad
│   ├── main.py             # Punto de entrada
│   └── requirements.txt    # Dependencias Python
│
├── frontend/               # Frontend Next.js
│   ├── src/
│   │   ├── app/           # Páginas (App Router)
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilidades
│   │   └── providers/     # Context providers
│   ├── public/            # Archivos estáticos
│   └── package.json       # Dependencias Node.js
│
├── docs/                  # Documentación
│   ├── sprints/           # Documentación de sprints
│   └── development/       # Guías de desarrollo
│
├── docker-compose.yml     # Configuración Docker
└── README.md             # Este archivo
```

## 📊 Estado del Proyecto

### ✅ Sprints Completados

#### Sprint 2: Estabilización (100%)
- ✅ Testing básico (33 tests: 18 unitarios + 15 integración)
- ✅ Optimizaciones de rendimiento (paginación, índices, caché)
- ✅ Dashboard completo con KPIs avanzados
- ✅ Exportación profesional (PDF, DOCX, Email)

#### Sprint 3: Fundación Multi-Tenant (100%)
- ✅ Modelo `Organization` creado
- ✅ Migración de datos existentes
- ✅ Foreign keys y relaciones establecidas
- ✅ Índices de rendimiento agregados

#### Sprint 4: Tenant Context y Repositorios (100%)
- ✅ `TenantContext` implementado
- ✅ Repositorios actualizados con filtrado por tenant
- ✅ Endpoints actualizados para multi-tenant
- ✅ Validación de aislamiento de datos

### 🚧 En Progreso

#### Sprint 5: Endpoints y Autenticación Multi-Tenant
- ⏳ Modificar JWT para incluir `organization_id`
- ⏳ Validar `organization_id` en `get_current_user()`
- ⏳ Tests de seguridad de aislamiento

### 📋 Próximos Sprints

- Sprint 6: Administración de Organizaciones
- Sprint 7: Suscripciones y Planes
- Sprint 8: Facturación y Pagos
- Sprint 9: Onboarding y Self-Service
- Sprint 10: Analytics y Reporting Avanzado

Ver [Plan Multi-Tenant](docs/deprecated/old-architecture/2026-02-07-PLAN_MULTI_TENANT.md) para el plan completo.

## 📚 Documentación

### Documentos Principales

- **[PRD](docs/2025-12-13-PRD.md)** - Product Requirements Document completo
- **[Índice de documentación](docs/2026-02-07-README.md)** - Índice principal de docs
- **[Plan Multi-Tenant](docs/deprecated/old-architecture/2026-02-07-PLAN_MULTI_TENANT.md)** - Roadmap de migración SaaS
- **[Estado del Proyecto](docs/deprecated/old-sprints/2026-02-07-PROGRESO.md)** - Módulos completados y progreso
- **[Tareas Pendientes](docs/deprecated/old-sprints/2026-02-07-PENDIENTES.md)** - Próximos pasos

### Documentación Técnica

- **[Análisis Técnico](docs/deprecated/old-analysis/2026-02-07-ANALISIS_CODIGO.md)** - Análisis profundo del código
- **[Reglas de Desarrollo](docs/development/2025-12-13-rules.md)** - Estándares y convenciones
- **[Testing de Aislamiento](docs/testing/2026-02-07-TESTING_TENANT_ISOLATION.md)** - Validación multi-tenant
- **[Administración Multi-Tenant](docs/development/concepts/2026-02-07-MULTI_TENANT_ADMIN.md)** - Guía de administración

### Sprints

- **[Sprint 2](docs/deprecated/old-sprints/2026-02-07-SPRINT2_PROGRESO.md)** - Estabilización
- **[Sprint 3](docs/deprecated/old-sprints/2026-02-07-SPRINT3_PROGRESO.md)** - Fundación Multi-Tenant
- **[Sprint 4](docs/deprecated/old-sprints/2026-02-07-SPRINT4_PROGRESO.md)** - Tenant Context

## 🗺️ Roadmap

### Corto Plazo (Q1 2025)
- ✅ Completar migración multi-tenant
- ⏳ Sistema de suscripciones
- ⏳ Onboarding automatizado

### Mediano Plazo (Q2 2025)
- ⏳ Facturación y pagos
- ⏳ Analytics avanzado
- ⏳ API pública

### Largo Plazo (Q3-Q4 2025)
- ⏳ Marketplace de integraciones
- ⏳ Mobile app
- ⏳ White-label

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- **Backend**: Sigue PEP 8, usa type hints, documenta funciones
- **Frontend**: Usa TypeScript, sigue las convenciones de Next.js
- **Commits**: Usa mensajes descriptivos en español o inglés
- **Tests**: Asegúrate de que todos los tests pasen antes de hacer PR

Ver [Reglas de Desarrollo](docs/development/2025-12-13-rules.md) para más detalles.

## 🧪 Testing

### Ejecutar Tests

```bash
cd backend

# Todos los tests
pytest

# Con cobertura
pytest --cov=app --cov-report=html

# Tests específicos
pytest tests/unit/
pytest tests/integration/

# Validar aislamiento multi-tenant
python scripts/test_tenant_isolation.py
```

### Cobertura Actual

- **Unitarios**: 18 tests
- **Integración**: 15 tests
- **Aislamiento Multi-Tenant**: Validado ✅

## 🐛 Solución de Problemas

### Problemas Comunes

**Error de conexión a la base de datos**
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Reiniciar contenedor
docker-compose restart postgres
```

**Error de migraciones**
```bash
cd backend
alembic upgrade head
alembic revision --autogenerate -m "fix migration"
```

**Puerto ya en uso**
```bash
# Cambiar puerto en docker-compose.yml o en .env
# Backend: puerto 8000
# Frontend: puerto 5000 o 3000
# PostgreSQL: puerto 5435
```

Ver también: [Troubleshooting](docs/2025-12-30-TROUBLESHOOTING.md) y [Solución error conexión](2025-12-30-SOLUCION_ERROR_CONEXION.md), [Solución puerto 8000](2025-12-30-SOLUCION_PUERTO_8000.md).

## 📝 Licencia

Este proyecto es de uso interno y propietario. Todos los derechos reservados.

## 👥 Autores

- **Gerardo Riaño** - [@gerriarte](https://github.com/gerriarte)

## 🙏 Agradecimientos

- FastAPI por el excelente framework
- Next.js por la increíble experiencia de desarrollo
- La comunidad de código abierto por las herramientas utilizadas

---**¿Preguntas o sugerencias?** Abre un [Issue](https://github.com/gerriarte/Cotizador/issues) o contacta al equipo.**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub.**
