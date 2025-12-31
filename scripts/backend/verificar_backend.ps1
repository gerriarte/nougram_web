# Script para verificar el estado del backend
Write-Host "========================================"
Write-Host "  Verificación del Backend Nougram"
Write-Host "========================================"
Write-Host ""

# Verificar PostgreSQL
Write-Host "[1/5] Verificando PostgreSQL..."
$postgres = docker ps --filter "name=postgres" --format "{{.Names}}"
if ($postgres) {
    Write-Host "✅ PostgreSQL está corriendo: $postgres" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL no está corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta: docker-compose up -d" -ForegroundColor Yellow
}

# Verificar puerto 8000
Write-Host "`n[2/5] Verificando puerto 8000..."
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "✅ Puerto 8000 está en uso" -ForegroundColor Green
    Write-Host "   Estado: $($port8000.State)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Puerto 8000 no está en uso (backend no está corriendo)" -ForegroundColor Red
}

# Verificar archivo .env
Write-Host "`n[3/5] Verificando configuración..."
$envPath = "backend\.env"
if (Test-Path $envPath) {
    Write-Host "✅ Archivo .env existe" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "   Crea el archivo backend\.env con las variables necesarias" -ForegroundColor Yellow
}

# Verificar entorno virtual
Write-Host "`n[4/5] Verificando entorno virtual..."
$venvPath = "backend\venv"
if (Test-Path $venvPath) {
    Write-Host "✅ Entorno virtual existe" -ForegroundColor Green
    if (Test-Path "backend\venv\Scripts\python.exe") {
        Write-Host "✅ Python encontrado en venv" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Python no encontrado en venv" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Entorno virtual no encontrado" -ForegroundColor Red
    Write-Host "   Ejecuta: cd backend && python -m venv venv" -ForegroundColor Yellow
}

# Verificar conexión al backend
Write-Host "`n[5/5] Verificando conexión al backend..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Backend responde correctamente" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "   Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend no responde" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`n   Para iniciar el backend:" -ForegroundColor Yellow
    Write-Host "   1. Abre una terminal" -ForegroundColor White
    Write-Host "   2. cd backend" -ForegroundColor White
    Write-Host "   3. venv\Scripts\activate" -ForegroundColor White
    Write-Host "   4. python main.py" -ForegroundColor White
}

Write-Host "`n========================================"
Write-Host "  Verificación completada"
Write-Host "========================================"


