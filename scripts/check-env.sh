#!/usr/bin/env bash
# Valida variables de entorno obligatorias antes de levantar docker-compose.prod
# Uso: ./scripts/check-env.sh [archivo_env]
# Ejemplo: ./scripts/check-env.sh .env.production

set -e

ENV_FILE="${1:-.env.production}"
REQUIRED=(
  "POSTGRES_PASSWORD"
  "DATABASE_URL"
  "SECRET_KEY"
  "CORS_ORIGINS"
  "FRONTEND_URL"
  "NEXT_PUBLIC_API_URL"
)

missing=()
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: Archivo no encontrado: $ENV_FILE"
  echo "Copia .env.production.example a .env.production y configura las variables."
  exit 1
fi

for var in "${REQUIRED[@]}"; do
  if ! grep -q "^${var}=.\+" "$ENV_FILE" 2>/dev/null; then
    val=$(grep "^${var}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
    if [[ -z "$val" || "$val" == "cambiar-"* || "$val" == "generar-"* || "$val" == "tu"* ]]; then
      missing+=("$var")
    fi
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Variables obligatorias no configuradas o con valores por defecto:"
  for v in "${missing[@]}"; do echo "  - $v"; done
  echo ""
  echo "Edita $ENV_FILE con valores reales."
  exit 1
fi

echo "OK: Variables obligatorias configuradas."
exit 0
