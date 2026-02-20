# Prueba el stack de produccion localmente
# Uso: .\scripts\test-prod-local.ps1 [base_url]
# Ejemplo: .\scripts\test-prod-local.ps1 http://localhost

param([string]$BaseUrl = "http://localhost")

$ErrorActionPreference = "Stop"

Write-Host "Probando stack en $BaseUrl`n"

function Test-Url {
    param([string]$Url, [string]$Expect)
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        return $r.Content -match $Expect
    } catch {
        return $false
    }
}

Write-Host -NoNewline "GET $BaseUrl/health ... "
try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "OK"
} catch {
    Write-Host "FALLO"
    Write-Host "¿El stack esta corriendo? docker compose -f docker-compose.prod.yml up -d"
    exit 1
}

Write-Host -NoNewline "GET $BaseUrl/health/ready ... "
try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/health/ready" -UseBasicParsing -TimeoutSec 5
    if ($r.Content -match '"status":"ready"') { Write-Host "OK" } else { Write-Host "Revisar" }
} catch {
    Write-Host "No disponible"
}

Write-Host -NoNewline "GET $BaseUrl/api/v1/ ... "
try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/api/v1/" -UseBasicParsing -TimeoutSec 5
    Write-Host "OK"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 422) {
        Write-Host "OK (requiere auth)"
    } else {
        Write-Host "Revisar"
    }
}

Write-Host "`nStack respondiendo. Prueba manual: registro, login, onboarding, dashboard."
