@echo off
echo ========================================
echo  Iniciando Backend con Debug
echo ========================================
cd backend

if not exist venv (
    echo [ERROR] Entorno virtual no encontrado.
    echo Por favor, ejecuta primero: desplegar_local.bat
    pause
    exit /b 1
)

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo.
echo Verificando Python...
python --version

echo.
echo Verificando dependencias...
python -c "import fastapi; print('FastAPI:', fastapi.__version__)"

echo.
echo ========================================
echo Iniciando servidor...
echo ========================================
echo.
python main.py

pause




echo ========================================
echo  Iniciando Backend con Debug
echo ========================================
cd backend

if not exist venv (
    echo [ERROR] Entorno virtual no encontrado.
    echo Por favor, ejecuta primero: desplegar_local.bat
    pause
    exit /b 1
)

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo.
echo Verificando Python...
python --version

echo.
echo Verificando dependencias...
python -c "import fastapi; print('FastAPI:', fastapi.__version__)"

echo.
echo ========================================
echo Iniciando servidor...
echo ========================================
echo.
python main.py

pause






