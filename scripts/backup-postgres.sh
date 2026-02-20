#!/usr/bin/env bash
# Backup de PostgreSQL (docker-compose.prod)
# Uso: ./scripts/backup-postgres.sh [destino]
# Ejemplo: ./scripts/backup-postgres.sh ./backups/nougram-$(date +%Y%m%d).sql

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${1:-$PROJECT_ROOT/backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/nougram_${TIMESTAMP}.sql"
CONTAINER="nougram-postgres-prod"

mkdir -p "$BACKUP_DIR"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "Error: Contenedor $CONTAINER no está corriendo."
  echo "Levanta el stack: docker compose -f docker-compose.prod.yml up -d"
  exit 1
fi

echo "Creando backup en $BACKUP_FILE ..."
docker exec "$CONTAINER" pg_dump -U postgres nougram_db > "$BACKUP_FILE"

if [[ -s "$BACKUP_FILE" ]]; then
  echo "OK: Backup guardado ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "Error: Archivo vacío"
  rm -f "$BACKUP_FILE"
  exit 1
fi
