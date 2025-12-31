# 🔧 Solución: Error de Conexión con Backend

**Error:** "Error de conexión. El servidor backend no está disponible. Verifica que el backend esté corriendo en http://localhost:8000"

---

## ✅ Solución Rápida

### Paso 1: Iniciar el Backend

**Opción A: Script Automático (Windows)**
```bash
scripts\backend\iniciar_backend.bat
```

**Opción B: Manual**
```bash
cd backend
venv\Scripts\activate
python main.py
```

**Opción C: Con Uvicorn directamente**
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Paso 2: Verificar que el Backend Esté Corriendo

Abre en tu navegador:
- http://localhost:8000
- Deberías ver: `{"message": "Nougram API is running", "version": "1.0.0", "status": "healthy"}`

O verifica con:
```bash
curl http://localhost:8000/health
```

### Paso 3: Verificar que el Frontend Pueda Conectarse

Una vez que el backend esté corriendo, intenta iniciar sesión nuevamente.

---

## 🔍 Verificación Paso a Paso

### 1. Verificar que PostgreSQL esté corriendo

```bash
docker ps | findstr postgres
```

Si no está corriendo:
```bash
docker-compose up -d postgres
```

### 2. Verificar que el archivo .env existe

```bash
cd backend
dir .env
```

Si no existe:
```bash
python setup_env.py
```

### 3. Verificar que las migraciones estén aplicadas

```bash
cd backend
alembic current
```

Si no hay migraciones aplicadas:
```bash
alembic upgrade head
```

### 4. Iniciar el Backend

```bash
cd backend
venv\Scripts\activate
python main.py
```

Deberías ver algo como:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 5. Verificar que el Backend Responda

Abre en navegador: http://localhost:8000

Deberías ver un JSON con el mensaje de bienvenida.

---

## ⚠️ Problemas Comunes

### Problema 1: Puerto 8000 ocupado

**Síntoma:** Error al iniciar uvicorn sobre puerto ocupado

**Solución:**
```bash
# Ver qué está usando el puerto 8000
netstat -ano | findstr :8000

# Opción A: Matar el proceso
taskkill /PID <PID_NUMBER> /F

# Opción B: Cambiar puerto del backend
# Editar backend/main.py línea 117:
uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

# Y actualizar frontend/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

### Problema 2: Backend inicia pero se cierra inmediatamente

**Causa:** Error en la configuración o base de datos

**Solución:**
```bash
# Verificar logs del backend
# El error aparecerá en la consola

# Verificar configuración de BD
cd backend
python scripts/validate_database_config.py
```

### Problema 3: Error de conexión a base de datos

**Solución:**
```bash
# 1. Verificar que PostgreSQL esté corriendo
docker ps | findstr postgres

# 2. Verificar DATABASE_URL en backend/.env
# Debe ser: postgresql+asyncpg://postgres:postgres@localhost:5435/nougram_db

# 3. Verificar conexión
cd backend
python scripts/validate_database_config.py
```

### Problema 4: Frontend no puede conectarse aunque backend está corriendo

**Causa:** Problema de CORS o URL incorrecta

**Solución:**
1. Verificar que `CORS_ORIGINS` en `backend/.env` incluya `http://localhost:3000`
2. Verificar que `NEXT_PUBLIC_API_URL` en `frontend/.env.local` sea `http://localhost:8000/api/v1`
3. Reiniciar ambos servicios después de cambiar configuración

---

## 📋 Checklist de Verificación

Antes de intentar iniciar sesión, verifica:

- [ ] PostgreSQL está corriendo (`docker ps | findstr postgres`)
- [ ] Base de datos `nougram_db` existe
- [ ] Archivo `backend/.env` existe y está configurado
- [ ] Migraciones aplicadas (`alembic current` muestra versión)
- [ ] Backend está corriendo (http://localhost:8000 responde)
- [ ] Frontend está corriendo (http://localhost:3000 responde)
- [ ] No hay errores en la consola del backend
- [ ] No hay errores en la consola del frontend

---

## 🚀 Inicio Completo del Proyecto

Para iniciar todo el proyecto de una vez:

```bash
# Opción 1: Script automático (Windows)
start_dev.bat

# Opción 2: Manual
# Terminal 1: Backend
cd backend
venv\Scripts\activate
python main.py

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: PostgreSQL (si no está corriendo)
docker-compose up -d postgres
```

---

## 📞 Credenciales de Prueba

Una vez que el backend esté corriendo, puedes iniciar sesión con:

- **Email:** `gerriarte@abralatam.com`
- **Contraseña:** `Abracolombia`

Si no funciona, resetea la contraseña:
```bash
cd backend
python scripts/fix_super_admin_login.py
```

---

**Última actualización:** 30 de Diciembre, 2025

