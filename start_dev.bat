@echo off
REM Script maestro para iniciar el entorno de desarrollo
REM Este script inicia tanto el backend como el frontend

echo ========================================
echo   AgenciaOps - Entorno de Desarrollo
echo ========================================
echo.

echo Iniciando servicios...
echo.

REM Iniciar backend en una nueva ventana
echo [1/2] Iniciando backend...
start "AgenciaOps Backend" cmd /k "scripts\backend\iniciar_backend.bat"

REM Esperar un poco para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar frontend en una nueva ventana
echo [2/2] Iniciando frontend...
start "AgenciaOps Frontend" cmd /k "scripts\frontend\iniciar_frontend.bat"

echo.
echo ========================================
echo   Servicios iniciados
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul

