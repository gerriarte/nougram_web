@echo off
echo ========================================
echo  Iniciando Backend Nougram (Test)
echo ========================================
cd /d %~dp0

REM Verificar si existe el entorno virtual
if not exist venv (
    echo [ERROR] Entorno virtual no encontrado.
    echo Por favor, ejecuta primero: python -m venv venv
    pause
    exit /b 1
)

REM Activar entorno virtual y ejecutar
call venv\Scripts\activate.bat

echo [INFO] Probando imports...
python -c "from app.core.config import settings; print('Config OK')" 2>&1
if errorlevel 1 (
    echo [ERROR] Error al importar config
    pause
    exit /b 1
)

echo [INFO] Iniciando servidor...
python main.py
pause

