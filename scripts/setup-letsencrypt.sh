#!/usr/bin/env bash
# Obtiene certificados Let's Encrypt para HTTPS
# Requisitos: certbot instalado, dominio apuntando al servidor, puerto 80 libre
# Uso: SSL_DOMAIN=app.tudominio.com EMAIL=tu@email.com ./scripts/setup-letsencrypt.sh

set -e

DOMAIN="${SSL_DOMAIN:?Definir SSL_DOMAIN (ej: app.tudominio.com)}"
EMAIL="${SSL_EMAIL:?Definir SSL_EMAIL para Let's Encrypt}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERTBOT_DIR="$PROJECT_ROOT/certbot"

echo "Dominio: $DOMAIN"
echo "Email: $EMAIL"
echo "Directorio certbot: $CERTBOT_DIR"
echo ""

# Detener compose si está usando puerto 80
if docker compose -f "$PROJECT_ROOT/docker-compose.prod.yml" ps 2>/dev/null | grep -q "Up"; then
  echo "Deteniendo servicios para liberar puerto 80..."
  docker compose -f "$PROJECT_ROOT/docker-compose.prod.yml" -f "$PROJECT_ROOT/docker-compose.prod.ssl.yml" down 2>/dev/null || true
  docker compose -f "$PROJECT_ROOT/docker-compose.prod.yml" down 2>/dev/null || true
fi

mkdir -p "$CERTBOT_DIR"

# Obtener certificados (standalone requiere puerto 80 libre)
echo "Obteniendo certificados..."
sudo certbot certonly \
  --standalone \
  -d "$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --non-interactive \
  --config-dir "$CERTBOT_DIR" \
  --work-dir "$PROJECT_ROOT/certbot-work" \
  --logs-dir "$PROJECT_ROOT/certbot-logs"

echo ""
echo "Certificados generados en: $CERTBOT_DIR/live/$DOMAIN/"
echo ""
echo "Para usar con docker-compose:"
echo "  1. Añadir a .env.production:"
echo "     SSL_DOMAIN=$DOMAIN"
echo ""
echo "  2. Levantar con SSL:"
echo "     docker compose -f docker-compose.prod.yml -f docker-compose.prod.ssl.yml --env-file .env.production up -d"
echo ""
echo "Renovación automática (cron):"
echo "  sudo certbot renew --config-dir $CERTBOT_DIR --deploy-hook 'docker compose -f $PROJECT_ROOT/docker-compose.prod.yml restart nginx'"
