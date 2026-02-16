# Backup de PostgreSQL (docker-compose.prod)
# Uso: .\scripts\backup-postgres.ps1 [destino]
# Ejemplo: .\scripts\backup-postgres.ps1 .\backups\

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = if ($args[0]) { $args[0] } else { Join-Path $ProjectRoot "backups" }
$BackupFile = Join-Path $BackupDir "nougram_$Timestamp.sql"
$Container = "nougram-postgres-prod"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$running = docker ps --format "{{.Names}}" | Select-String -Pattern "^$Container`$"
if (-not $running) {
    Write-Error "Contenedor $Container no esta corriendo. Levanta: docker compose -f docker-compose.prod.yml up -d"
}

Write-Host "Creando backup en $BackupFile ..."
docker exec $Container pg_dump -U postgres nougram_db | Out-File -FilePath $BackupFile -Encoding utf8

if ((Get-Item $BackupFile).Length -gt 0) {
    $size = (Get-Item $BackupFile).Length / 1KB
    Write-Host "OK: Backup guardado ($([math]::Round($size, 1)) KB)"
} else {
    Remove-Item $BackupFile -Force -ErrorAction SilentlyContinue
    Write-Error "Error: Archivo vacio"
}
