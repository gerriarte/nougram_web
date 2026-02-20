# 🔧 Solución: No se puede acceder al puerto 8000

**Problema:** Al acceder a `http://localhost:8000` aparece que no se puede acceder.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar que el Backend Esté Corriendo

El backend **NO está corriendo**. Necesitas iniciarlo primero.

### Paso 2: Iniciar el Backend

**Opción A: Script Automático (Recomendado)**

Abre una nueva terminal y ejecuta:

```bash
scripts\backend\iniciar_backend.bat
```

**Opción B: Manual**

1. Abre una terminal (PowerShell o CMD)
2. Navega al directorio del proyecto:
   ```bash
   cd C:\Users\Usuario\Documents\GitHub\Cotizador
   ```
3. Ve al directorio backend:
   ```bash
   cd backend
   ```
4. Activa el entorno virtual:
   ```bash
   venv\Scripts\activate
   ```
5. Inicia el servidor:
   ```bash
   python main.py
   ```

### Paso 3: Verificar que el Backend Inició Correctamente

Deberías ver en la terminal algo como:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Paso 4: Probar el Acceso

Una vez que veas el mensaje anterior, abre en tu navegador:

- **http://localhost:8000** - Deberías ver un JSON con el mensaje de bienvenida
- **http://localhost:8000/health** - Deberías ver `{"status": "healthy"}`
- **http://localhost:8000/docs** - Deberías ver la documentación Swagger

---

## ⚠️ Errores Comunes al Iniciar

### Error 1: "ModuleNotFoundError" o "ImportError"

**Causa:** Faltan dependencias instaladas

**Solución:**
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Error 2: "ValidationError" en Settings

**Causa:** Faltan variables de entorno en `.env`

**Solución:**
```bash
cd backend
python setup_env.py
```

Esto crea el archivo `.env` con todas las variables necesarias.

### Error 3: "Connection refused" o error de base de datos

**Causa:** PostgreSQL no está corriendo

**Solución:**
```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d postgres

# Verificar que esté corriendo
docker ps | findstr postgres
```

### Error 4: "Address already in use" (Puerto 8000 ocupado)

**Causa:** Otro proceso está usando el puerto 8000

**Solución:**
```bash
# Ver qué está usando el puerto 8000
netstat -ano | findstr :8000

# Matar el proceso (reemplaza <PID> con el número que aparece)
taskkill /PID <PID> /F

# O cambiar el puerto en backend/main.py línea 117:
uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
```

---

## 🔍 Diagnóstico Completo

Si el backend no inicia, ejecuta estos comandos para diagnosticar:

### 1. Verificar Entorno Virtual
```bash
cd backend
dir venv
```

### 2. Verificar Dependencias
```bash
cd backend
venv\Scripts\activate
pip list | findstr fastapi
pip list | findstr uvicorn
```

### 3. Verificar Archivo .env
```bash
cd backend
dir .env
```

### 4. Verificar PostgreSQL
```bash
docker ps | findstr postgres
```

### 5. Probar Importar Módulos
```bash
cd backend
venv\Scripts\activate
python -c "from app.core.config import settings; print('OK')"
```

---

## 📋 Checklist de Verificación

Antes de intentar acceder al puerto 8000:

- [ ] Entorno virtual existe (`backend/venv`)
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] Archivo `.env` existe (`backend/.env`)
- [ ] PostgreSQL está corriendo (`docker ps | findstr postgres`)
- [ ] Backend está corriendo (ver mensaje "Uvicorn running")
- [ ] No hay errores en la consola del backend
- [ ] Puerto 8000 no está ocupado por otro proceso

---

## 🚀 Inicio Completo del Proyecto

Para iniciar todo el proyecto (Backend + Frontend + Base de Datos):

```bash
# Opción 1: Script automático (Windows)
start_dev.bat

# Opción 2: Manual
# Terminal 1: PostgreSQL
docker-compose up -d postgres

# Terminal 2: Backend
cd backend
venv\Scripts\activate
python main.py

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## 💡 Consejos

1. **Mantén el backend corriendo:** El backend debe estar corriendo mientras usas el frontend
2. **No cierres la terminal:** Si cierras la terminal donde corre el backend, se detendrá
3. **Verifica los logs:** Si hay errores, aparecerán en la consola del backend
4. **Usa scripts .bat:** Los scripts `.bat` automatizan el proceso de inicio

---

**Última actualización:** 30 de Diciembre, 2025

