#!/usr/bin/env python3
"""
Script para importar issues a Linear usando la API GraphQL.

Requisitos:
1. Instalar: pip install requests python-dotenv
2. Crear archivo .env con: LINEAR_API_KEY=tu_api_key
3. Obtener API key en: https://linear.app/settings/api

Uso:
    python scripts/import_to_linear.py

O con archivo de issues personalizado:
    python scripts/import_to_linear.py --file scripts/linear_import_issues.json
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
import argparse

try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("Error: Necesitas instalar las dependencias:")
    print("  pip install requests python-dotenv")
    sys.exit(1)

# Cargar variables de entorno
# Buscar .env en el directorio raíz del proyecto (un nivel arriba de scripts/)
script_dir = Path(__file__).parent
project_root = script_dir.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_API_URL = "https://api.linear.app/graphql"

# Mapeo de prioridades
PRIORITY_MAP = {
    "High": "urgent",
    "Medium": "high",
    "Low": "medium"
}

# Mapeo de estados
STATE_MAP = {
    "Todo": "backlog",
    "In Progress": "started",
    "Done": "completed",
    "Canceled": "canceled"
}


def get_team_id() -> Optional[str]:
    """Obtener el primer team ID disponible."""
    query = """
    query {
      teams {
        nodes {
          id
          name
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
        json={"query": query}
    )
    
    if response.status_code != 200:
        print(f"Error al obtener teams: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    teams = data.get("data", {}).get("teams", {}).get("nodes", [])
    
    if not teams:
        print("No se encontraron teams en Linear")
        return None
    
    print(f"Teams disponibles:")
    for team in teams:
        print(f"  - {team['name']}: {team['id']}")
    
    return teams[0]["id"]


def get_state_id(team_id: str, state_name: str) -> Optional[str]:
    """Obtener el ID del estado por nombre."""
    query = """
    query($teamId: String!) {
      team(id: $teamId) {
        states {
          nodes {
            id
            name
            type
          }
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
            "variables": {"teamId": team_id}
        }
    )
    
    if response.status_code != 200:
        return None
    
    data = response.json()
    states = data.get("data", {}).get("team", {}).get("states", {}).get("nodes", [])
    
    # Buscar estado por nombre o tipo
    for state in states:
        if state["name"].lower() == state_name.lower():
            return state["id"]
        if state["type"].lower() == STATE_MAP.get(state_name, "backlog"):
            return state["id"]
    
    # Si no se encuentra, usar el primer estado "backlog"
    for state in states:
        if state["type"] == "backlog":
            return state["id"]
    
    return states[0]["id"] if states else None


def create_issue(team_id: str, issue_data: Dict) -> Optional[str]:
    """Crear una issue en Linear."""
    title = issue_data.get("title", "")
    description = issue_data.get("description", "")
    priority = PRIORITY_MAP.get(issue_data.get("priority", "Low"), "medium")
    estimate = issue_data.get("estimate")
    state_name = issue_data.get("state", "Todo")
    
    # Obtener state ID
    state_id = get_state_id(team_id, state_name)
    
    # Construir mutación
    mutation = """
    mutation($teamId: String!, $title: String!, $description: String!, $priority: Int, $stateId: String, $estimate: Int) {
      issueCreate(
        input: {
          teamId: $teamId
          title: $title
          description: $description
          priority: $priority
          stateId: $stateId
          estimate: $estimate
        }
      ) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
    """
    
    variables = {
        "teamId": team_id,
        "title": title,
        "description": description,
        "priority": {"urgent": 1, "high": 2, "medium": 3, "low": 4}.get(priority, 3),
        "estimate": estimate,
    }
    
    if state_id:
        variables["stateId"] = state_id
    
    response = requests.post(
        LINEAR_API_URL,
        headers={
            "Authorization": LINEAR_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "query": mutation,
            "variables": variables
        }
    )
    
    if response.status_code != 200:
        print(f"Error al crear issue '{title}': {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    if "errors" in data:
        print(f"Error al crear issue '{title}': {data['errors']}")
        return None
    
    result = data.get("data", {}).get("issueCreate", {})
    if result.get("success"):
        issue = result.get("issue", {})
        print(f"[OK] Creada: {issue.get('identifier')} - {issue.get('title')}")
        print(f"     URL: {issue.get('url')}")
        return issue.get("id")
    else:
        print(f"[ERROR] Error al crear issue '{title}'")
        return None


def main():
    parser = argparse.ArgumentParser(description="Importar issues a Linear")
    parser.add_argument(
        "--file",
        type=str,
        default="scripts/linear_import_issues.json",
        help="Archivo JSON con las issues a importar"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Solo mostrar qué se importaría sin crear issues"
    )
    
    args = parser.parse_args()
    
    if not LINEAR_API_KEY:
        print("Error: LINEAR_API_KEY no encontrada en variables de entorno")
        print("Crea un archivo .env con: LINEAR_API_KEY=tu_api_key")
        print("Obtén tu API key en: https://linear.app/settings/api")
        sys.exit(1)
    
    # Cargar archivo JSON
    file_path = Path(args.file)
    if not file_path.exists():
        print(f"Error: Archivo no encontrado: {file_path}")
        sys.exit(1)
    
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    issues = data.get("issues", [])
    print(f"[*] Se encontraron {len(issues)} issues para importar\n")
    
    if args.dry_run:
        print("[DRY RUN] No se crearan issues\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue.get('title')}")
            print(f"   Prioridad: {issue.get('priority')}")
            print(f"   Estimación: {issue.get('estimate')} puntos")
            print()
        return
    
    # Obtener team ID
    print("[*] Obteniendo team ID...")
    team_id = get_team_id()
    if not team_id:
        print("Error: No se pudo obtener team ID")
        sys.exit(1)
    
    print(f"[OK] Usando team ID: {team_id}\n")
    
    # Crear issues
    created_ids = []
    for i, issue in enumerate(issues, 1):
        print(f"[{i}/{len(issues)}] Creando issue...")
        issue_id = create_issue(team_id, issue)
        if issue_id:
            created_ids.append(issue_id)
        print()
    
    print(f"\n[COMPLETADO] Proceso finalizado:")
    print(f"   - Issues creadas: {len(created_ids)}/{len(issues)}")
    
    if len(created_ids) < len(issues):
        print(f"   - Issues fallidas: {len(issues) - len(created_ids)}")


if __name__ == "__main__":
    main()
