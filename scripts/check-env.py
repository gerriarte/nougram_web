#!/usr/bin/env python3
"""
Valida variables de entorno obligatorias antes de levantar docker-compose.prod
Uso: python scripts/check-env.py [archivo_env]
Ejemplo: python scripts/check-env.py .env.production
"""
import sys
from pathlib import Path

ENV_FILE = sys.argv[1] if len(sys.argv) > 1 else ".env.production"
PROJECT_ROOT = Path(__file__).resolve().parent.parent

REQUIRED = [
    "POSTGRES_PASSWORD",
    "DATABASE_URL",
    "SECRET_KEY",
    "CORS_ORIGINS",
    "FRONTEND_URL",
    "NEXT_PUBLIC_API_URL",
]

PLACEHOLDERS = ("cambiar-", "generar-", "tu", "https://tu")


def main():
    env_path = PROJECT_ROOT / ENV_FILE
    if not env_path.exists():
        print(f"Error: Archivo no encontrado: {env_path}")
        print("Copia .env.production.example a .env.production y configura las variables.")
        sys.exit(1)

    seen = {}
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, _, v = line.partition("=")
            k, v = k.strip(), v.strip().strip('"').strip("'")
            seen[k] = v

    missing = []
    for req in REQUIRED:
        val = seen.get(req, "")
        if not val or any(str(val).lower().startswith(p) for p in PLACEHOLDERS):
            missing.append(req)

    if missing:
        print("Variables obligatorias no configuradas o con valores por defecto:")
        for v in missing:
            print(f"  - {v}")
        print(f"\nEdita {ENV_FILE} con valores reales.")
        sys.exit(1)

    print("OK: Variables obligatorias configuradas.")
    sys.exit(0)


if __name__ == "__main__":
    main()
