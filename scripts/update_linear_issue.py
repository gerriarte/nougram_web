#!/usr/bin/env python3
"""
Script para actualizar el estado de una issue en Linear.

Uso:
    python scripts/update_linear_issue.py NOU-6 Done
    
O con estado personalizado:
    python scripts/update_linear_issue.py NOU-6 "In Progress"
"""

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

# Mapeo de estados comunes
STATE_MAP = {
    "Todo": "backlog",
    "In Progress": "started",
    "Done": "completed",
    "Canceled": "canceled"
}


def get_issue_by_identifier(identifier: str) -> Optional[dict]:
    """Obtener una issue por su identifier (ej: NOU-6)."""
    query = """
    query($identifier: String!) {
      issue(id: $identifier) {
        id
        identifier
        title
        state {
          id
          name
          type
        }
        team {
          id
          name
        }
      }
    }
    """
    
    # Intentar primero como identifier completo
    response = requests.post(
        LINEAR_API_URL,
        headers={
            "Authorization": LINEAR_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "query": query,
            "variables": {"identifier": identifier}
        }
    )
    
    if response.status_code != 200:
        print(f"Error al buscar issue: {response.status_code}")
        return None
    
    data = response.json()
    
    if "errors" in data:
        # Si falla, intentar buscar por filters
        query_filter = """
        query($filter: IssueFilter!) {
          issues(filter: $filter) {
            nodes {
              id
              identifier
              title
              state {
                id
                name
                type
              }
              team {
                id
                name
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
                "query": query_filter,
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
    
    issue = data.get("data", {}).get("issue")
    return issue


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
    
    # Buscar estado por nombre (case insensitive)
    for state in states:
        if state["name"].lower() == state_name.lower():
            return state["id"]
    
    # Buscar por tipo
    state_type = STATE_MAP.get(state_name, "completed")
    for state in states:
        if state["type"].lower() == state_type.lower():
            return state["id"]
    
    return None


def update_issue_state(issue_id: str, state_id: str) -> bool:
    """Actualizar el estado de una issue."""
    mutation = """
    mutation($issueId: String!, $stateId: String!) {
      issueUpdate(
        id: $issueId
        input: {
          stateId: $stateId
        }
      ) {
        success
        issue {
          id
          identifier
          title
          state {
            id
            name
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
            "query": mutation,
            "variables": {
                "issueId": issue_id,
                "stateId": state_id
            }
        }
    )
    
    if response.status_code != 200:
        print(f"Error al actualizar issue: {response.status_code}")
        print(response.text)
        return False
    
    data = response.json()
    if "errors" in data:
        print(f"Error: {data['errors']}")
        return False
    
    result = data.get("data", {}).get("issueUpdate", {})
    return result.get("success", False)


def main():
    parser = argparse.ArgumentParser(
        description="Actualizar el estado de una issue en Linear",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python scripts/update_linear_issue.py NOU-6 Done
  python scripts/update_linear_issue.py NOU-6 "In Progress"
  python scripts/update_linear_issue.py NOU-6 Canceled
        """
    )
    parser.add_argument(
        "identifier",
        type=str,
        help="Identifier de la issue (ej: NOU-6)"
    )
    parser.add_argument(
        "state",
        type=str,
        nargs="?",
        default="Done",
        help='Nuevo estado (default: "Done")'
    )
    
    args = parser.parse_args()
    
    if not LINEAR_API_KEY:
        print("Error: LINEAR_API_KEY no encontrada en variables de entorno")
        print("Crea un archivo .env con: LINEAR_API_KEY=tu_api_key")
        print("Obtén tu API key en: https://linear.app/settings/api")
        sys.exit(1)
    
    identifier = args.identifier
    new_state = args.state
    
    print(f"[*] Buscando issue: {identifier}...")
    issue = get_issue_by_identifier(identifier)
    
    if not issue:
        print(f"Error: No se encontró la issue {identifier}")
        sys.exit(1)
    
    print(f"[OK] Issue encontrada:")
    print(f"     Identifier: {issue['identifier']}")
    print(f"     Título: {issue['title']}")
    print(f"     Estado actual: {issue['state']['name']}")
    print(f"     Team: {issue['team']['name']}")
    print()
    
    if issue['state']['name'].lower() == new_state.lower():
        print(f"La issue ya está en estado '{new_state}'")
        return
    
    print(f"[*] Obteniendo ID del estado '{new_state}'...")
    team_id = issue['team']['id']
    state_id = get_state_id(team_id, new_state)
    
    if not state_id:
        print(f"Error: No se encontró el estado '{new_state}' en el team")
        print(f"Estados disponibles en Linear para el team {issue['team']['name']}")
        sys.exit(1)
    
    print(f"[OK] Estado encontrado: {new_state}")
    print()
    
    print(f"[*] Actualizando issue a estado '{new_state}'...")
    success = update_issue_state(issue['id'], state_id)
    
    if success:
        print(f"[OK] Issue {identifier} actualizada exitosamente a '{new_state}'")
    else:
        print(f"[ERROR] No se pudo actualizar la issue")
        sys.exit(1)


if __name__ == "__main__":
    main()
