# Script de Prueba - PoC ChatGPT Integration
# Este script prueba la integración de IA paso a paso

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PoC ChatGPT - Script de Prueba" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$baseUrl = "http://localhost:8000"
$headers = @{
    Authorization = 'Bearer dev-bypass-token'
    'Content-Type' = 'application/json'
}

# Paso 1: Verificar que el backend está corriendo
Write-Host "1. Verificando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    Write-Host "   OK - Backend corriendo" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Backend NO responde" -ForegroundColor Red
    Write-Host "   Por favor inicia el backend primero" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Paso 2: Verificar configuración de AI
Write-Host "2. Verificando configuración de AI..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/v1/ai/status" -Method Get
    
    if ($status.available) {
        Write-Host "   OK - AI configurado correctamente" -ForegroundColor Green
        Write-Host "   $($status.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR - AI no configurado" -ForegroundColor Red
        Write-Host "   $($status.message)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   SOLUCION:" -ForegroundColor Cyan
        Write-Host "   1. Obtén tu API key de https://platform.openai.com/api-keys" -ForegroundColor White
        Write-Host "   2. Agrega OPENAI_API_KEY=sk-... al archivo backend/.env" -ForegroundColor White
        Write-Host "   3. Reinicia el backend" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "   ERROR - No se pudo verificar AI" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Paso 3: Prueba simple de análisis
Write-Host "3. Probando análisis financiero..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar 10-15 segundos)" -ForegroundColor Gray

$body = @{
    question = "Analiza la salud financiera de mi agencia"
    include_projects = $true
    include_costs = $true
    include_services = $true
    days_back = 90
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/ai/analyze" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -TimeoutSec 30
    
    if ($response.success) {
        Write-Host "   OK - Análisis completado" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  RESULTADO DEL ANÁLISIS IA" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host $response.analysis -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "MÉTRICAS DE USO:" -ForegroundColor Yellow
        Write-Host "  Proyectos analizados: $($response.context_summary.projects_analyzed)" -ForegroundColor Gray
        Write-Host "  Servicios: $($response.context_summary.services_count)" -ForegroundColor Gray
        Write-Host "  Costos totales: `$$($response.context_summary.total_costs)" -ForegroundColor Gray
        Write-Host "  Tamaño del equipo: $($response.context_summary.team_size)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "COSTO DE LA CONSULTA:" -ForegroundColor Yellow
        Write-Host "  Tokens usados: $($response.usage.total_tokens)" -ForegroundColor Gray
        Write-Host "  Costo estimado: `$$($response.usage.estimated_cost) USD" -ForegroundColor Gray
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  PRUEBA EXITOSA!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "La integración de ChatGPT está funcionando correctamente." -ForegroundColor Green
        Write-Host "Puedes probar más consultas con el siguiente comando:" -ForegroundColor White
        Write-Host ""
        Write-Host '  $body = @{question="¿Qué servicio debo subir de precio?"} | ConvertTo-Json' -ForegroundColor Gray
        Write-Host '  Invoke-RestMethod -Uri "http://localhost:8000/api/v1/ai/analyze" -Method Post -Headers $headers -Body $body' -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "   ERROR - Análisis falló" -ForegroundColor Red
        Write-Host "   $($response.error)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ERROR - No se pudo completar el análisis" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   $($errorDetails.detail)" -ForegroundColor Yellow
    } else {
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

