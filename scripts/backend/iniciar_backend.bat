@echo off
echo ========================================
echo  Iniciando Backend AgenciaOps
echo ========================================
cd backend

REM Verificar si existe el entorno virtual
if not exist venv (
    echo [ERROR] Entorno virtual no encontrado.
    echo Por favor, ejecuta primero: desplegar_local.bat
    pause
    exit /b 1
)

REM Activar entorno virtual y ejecutar
call venv\Scripts\activate.bat
python main.py
pause


