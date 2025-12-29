@echo off
echo ========================================
echo  Iniciando PostgreSQL con Docker
echo ========================================
echo.

REM Verificar que Docker está corriendo
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop no esta corriendo.
    echo Por favor, abre Docker Desktop y espera a que termine de iniciar.
    pause
    exit /b 1
)

echo [OK] Docker Desktop esta corriendo
echo.

REM Iniciar PostgreSQL
echo Iniciando PostgreSQL...
docker-compose up -d

if errorlevel 1 (
    echo [ERROR] No se pudo iniciar PostgreSQL
    pause
    exit /b 1
)

echo.
echo [OK] PostgreSQL iniciado correctamente!
echo.
echo Próximos pasos:
echo 1. Abre otra ventana PowerShell
echo 2. cd backend
echo 3. python main.py
echo.
echo Para detener PostgreSQL: docker-compose down
echo.
pause

