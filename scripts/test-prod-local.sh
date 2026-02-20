#!/usr/bin/env bash
# Prueba el stack de producción localmente
# Requisito: .env.production con CORS_ORIGINS, FRONTEND_URL, NEXT_PUBLIC_API_URL apuntando a http://localhost
# Uso: ./scripts/test-prod-local.sh [base_url]
# Ejemplo: ./scripts/test-prod-local.sh http://localhost

set -e

BASE_URL="${1:-http://localhost}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Probando stack en $BASE_URL"
echo ""

# Health básico (nginx puede devolver 200 directo)
echo -n "GET $BASE_URL/health ... "
if curl -sf --max-time 5 "$BASE_URL/health" > /dev/null; then
  echo "OK"
else
  echo "FALLO"
  echo "¿El stack está corriendo? docker compose -f docker-compose.prod.yml up -d"
  exit 1
fi

# Health/ready (proxy a backend, verifica BD)
echo -n "GET $BASE_URL/health/ready ... "
READY=$(curl -sf --max-time 5 "$BASE_URL/health/ready" 2>/dev/null || echo "")
if echo "$READY" | grep -q '"status":"ready"'; then
  echo "OK"
else
  echo "FALLO o no disponible (nginx podría no hacer proxy de /health/ready en HTTP)"
fi

# API root
echo -n "GET $BASE_URL/api/v1/ ... "
API=$(curl -sf --max-time 5 "$BASE_URL/api/v1/" 2>/dev/null || echo "")
if echo "$API" | grep -q "Nougram\|running\|401\|422"; then
  echo "OK"
else
  echo "Revisar (puede requerir auth)"
fi

echo ""
echo "Stack respondiendo. Prueba manual: registro, login, onboarding, dashboard."
