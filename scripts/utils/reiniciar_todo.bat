@echo off
REM Script para reiniciar completamente el entorno de desarrollo
REM Detiene todos los procesos y reinicia backend y frontend

echo ========================================
echo   Reiniciando AgenciaOps
echo ========================================
echo.

REM Detener procesos de Node (Frontend)
echo [1/4] Deteniendo procesos de Node (Frontend)...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo   No se encontraron procesos de Node corriendo
) else (
    echo   Procesos de Node detenidos
)
timeout /t 2 /nobreak >nul

REM Detener procesos de Python/Uvicorn (Backend)
echo [2/4] Deteniendo procesos de Python/Uvicorn (Backend)...
for /f "tokens=2" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=2" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo   Procesos del backend detenidos
timeout /t 2 /nobreak >nul

REM Limpiar caché de Next.js
echo [3/4] Limpiando caché de Next.js...
if exist "frontend\.next" (
    rmdir /s /q "frontend\.next" >nul 2>&1
    echo   Caché de Next.js limpiada
) else (
    echo   No hay caché para limpiar
)

REM Esperar un momento
timeout /t 2 /nobreak >nul

REM Reiniciar servicios
echo [4/4] Reiniciando servicios...
echo.
start "AgenciaOps Backend" cmd /k "cd /d %~dp0..\.. && scripts\backend\iniciar_backend.bat"

REM Esperar un poco para que el backend inicie
timeout /t 5 /nobreak >nul

start "AgenciaOps Frontend" cmd /k "cd /d %~dp0..\.. && scripts\frontend\iniciar_frontend.bat"

echo.
echo ========================================
echo   Reinicio completado
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Los servicios se están iniciando en ventanas separadas...
echo.
pause

