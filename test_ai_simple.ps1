# Script de Prueba SIMPLIFICADO - PoC ChatGPT
# Este script usa datos mock, no depende de la base de datos

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PoC ChatGPT - PRUEBA SIMPLIFICADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"
$headers = @{
    Authorization = 'Bearer dev-bypass-token'
    'Content-Type' = 'application/json'
}

# Paso 1: Verificar backend
Write-Host "1. Verificando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   OK - Backend corriendo" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Backend NO responde" -ForegroundColor Red
    Write-Host "   Por favor inicia el backend primero:" -ForegroundColor Yellow
    Write-Host "   cd backend; .\venv\Scripts\Activate.ps1; python main.py" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Paso 2: Verificar AI
Write-Host "2. Verificando configuracion de AI..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/v1/ai/status" -Method Get -ErrorAction Stop
    
    if ($status.available) {
        Write-Host "   OK - AI configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ERROR - AI no configurado" -ForegroundColor Red
        Write-Host "   $($status.message)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ERROR - Error verificando AI" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Paso 3: Prueba DEMO (con datos mock)
Write-Host "3. Ejecutando analisis DEMO con IA..." -ForegroundColor Yellow
Write-Host "   (Usa datos de ejemplo, no requiere base de datos)" -ForegroundColor Gray
Write-Host "   Esperando respuesta de OpenAI (10-20 seg)..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/ai/demo" `
        -Method Get `
        -Headers $headers `
        -TimeoutSec 60 `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ANALISIS IA COMPLETADO" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host $response.analysis -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host ""
        Write-Host "METRICAS:" -ForegroundColor Cyan
        Write-Host "  Tokens usados: $($response.usage.total_tokens)" -ForegroundColor Gray
        Write-Host "  Costo: `$$($response.usage.estimated_cost) USD" -ForegroundColor Gray
        Write-Host ""
        Write-Host "NOTA:" -ForegroundColor Yellow
        Write-Host "  $($response.note)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  PoC FUNCIONANDO CORRECTAMENTE!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "PROXIMO PASO:" -ForegroundColor Cyan
        Write-Host "  Agrega datos reales a tu sistema y usa:" -ForegroundColor White
        Write-Host "  POST /api/v1/ai/analyze" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "   ERROR - Error en analisis" -ForegroundColor Red
        Write-Host "   $($response.error)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ERROR - Error ejecutando analisis" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        try {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   $($errorDetails.detail)" -ForegroundColor Yellow
        } catch {
            Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "TROUBLESHOOTING:" -ForegroundColor Cyan
    Write-Host "  1. Verifica que OPENAI_API_KEY este en backend/.env" -ForegroundColor Gray
    Write-Host "  2. Reinicia el backend" -ForegroundColor Gray
    Write-Host "  3. Verifica tu credito en OpenAI" -ForegroundColor Gray
}

Write-Host ""
