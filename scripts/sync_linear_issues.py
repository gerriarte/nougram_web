#!/usr/bin/env python3
"""
Script para sincronizar/actualizar issues en Linear.

Requisitos:
1. Instalar: pip install requests python-dotenv
2. Crear archivo .env con: LINEAR_API_KEY=tu_api_key
3. Obtener API key en: https://linear.app/settings/api

Uso:
    python scripts/sync_linear_issues.py NOU-30 NOU-31
"""

import json
import os
import sys
from pathlib import Path
from typing import Optional
import argparse

try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("Error: Necesitas instalar las dependencias:")
    print("  pip install requests python-dotenv")
    sys.exit(1)

# Cargar variables de entorno
script_dir = Path(__file__).parent
project_root = script_dir.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_API_URL = "https://api.linear.app/graphql"

if not LINEAR_API_KEY:
    print("Error: LINEAR_API_KEY no encontrada en variables de entorno")
    print("Crea un archivo .env con: LINEAR_API_KEY=tu_api_key")
    print("Obtén tu API key en: https://linear.app/settings/api")
    sys.exit(1)


def get_issue_by_identifier(identifier: str) -> Optional[dict]:
    """Obtener una issue por su identifier (ej: NOU-30)."""
    # Usar filter para buscar por identifier
    query = """
    query($filter: IssueFilter!) {
      issues(filter: $filter) {
        nodes {
          id
          identifier
          title
          description
          state {
            id
            name
            type
          }
          team {
            id
            name
          }
          priority
          estimate
          url
        }
      }
    }
    """
    
    response = requests.post(
        LINEAR_API_URL,
        headers={
            "Authorization": LINEAR_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "query": query,
            "variables": {
                "filter": {
                    "identifier": {
                        "eq": identifier
                    }
                }
            }
        }
    )
    
    if response.status_code != 200:
        print(f"Error al buscar issue: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    if "errors" in data:
        print(f"Error: {data['errors']}")
        return None
    
    issues = data.get("data", {}).get("issues", {}).get("nodes", [])
    if issues:
        return issues[0]
    else:
        print(f"No se encontró issue con identifier: {identifier}")
        return None


def update_issue_description(issue_id: str, description: str) -> bool:
    """Actualizar la descripción de una issue."""
    mutation = """
    mutation($id: String!, $description: String!) {
      issueUpdate(
        id: $id
        input: {
          description: $description
        }
      ) {
        success
        issue {
          id
          identifier
          title
        }
      }
    }
    """
    
    response = requests.post(
        LINEAR_API_URL,
        headers={
            "Authorization": LINEAR_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "query": mutation,
            "variables": {
                "id": issue_id,
                "description": description
            }
        }
    )
    
    if response.status_code != 200:
        print(f"Error al actualizar issue: {response.status_code}")
        print(response.text)
        return False
    
    data = response.json()
    if "errors" in data:
        print(f"Error al actualizar issue: {data['errors']}")
        return False
    
    result = data.get("data", {}).get("issueUpdate", {})
    return result.get("success", False)


def main():
    parser = argparse.ArgumentParser(description="Sincronizar issues en Linear")
    parser.add_argument(
        "identifiers",
        nargs="+",
        help="Identifiers de las issues a sincronizar (ej: NOU-30 NOU-31)"
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Solo mostrar información sin actualizar"
    )
    
    args = parser.parse_args()
    
    print(f"[*] Sincronizando {len(args.identifiers)} issues...\n")
    
    for identifier in args.identifiers:
        print(f"[*] Obteniendo información de {identifier}...")
        issue = get_issue_by_identifier(identifier)
        
        if not issue:
            print(f"[ERROR] No se pudo obtener {identifier}\n")
            continue
        
        print(f"[OK] {issue['identifier']} - {issue['title']}")
        print(f"     Estado: {issue['state']['name']}")
        print(f"     Prioridad: {issue['priority']}")
        print(f"     Estimación: {issue.get('estimate')}")
        print(f"     URL: {issue['url']}")
        
        if args.show:
            print(f"\n     Descripción (primeros 200 chars):")
            desc = issue.get('description', '') or ''
            print(f"     {desc[:200]}...")
        else:
            print(f"     [INFO] Usa --show para ver más detalles")
        
        print()
    
    if args.show:
        print("[INFO] Modo --show: No se realizaron actualizaciones")
    else:
        print("[INFO] Sincronización completa (solo lectura)")


if __name__ == "__main__":
    main()
