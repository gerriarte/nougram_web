#!/usr/bin/env python3
"""
Script para previsualizar las issues que se importarán a Linear.
No requiere API key.
"""

import json
from pathlib import Path

def main():
    # Intentar desde scripts/ o desde raíz
    file_path = Path("linear_import_issues.json")
    if not file_path.exists():
        file_path = Path("../linear_import_issues.json")
    
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    issues = data.get("issues", [])
    
    print("📋 PREVISUALIZACIÓN DE ISSUES PARA LINEAR\n")
    print(f"Total de issues a importar: {len(issues)}\n")
    print("=" * 80)
    
    for i, issue in enumerate(issues, 1):
        print(f"\n{i}. {issue.get('title')}")
        print(f"   Prioridad: {issue.get('priority')}")
        print(f"   Estimación: {issue.get('estimate')} puntos")
        print(f"   Labels: {', '.join(issue.get('labels', []))}")
        print(f"   Estado: {issue.get('state')}")
        
        # Mostrar primeros 200 caracteres de la descripción
        desc = issue.get('description', '')
        if len(desc) > 200:
            print(f"   Descripción: {desc[:200]}...")
        else:
            print(f"   Descripción: {desc}")
        print("-" * 80)
    
    print(f"\n✅ Total: {len(issues)} issues listas para importar")
    print("\n💡 Para importar, necesitas:")
    print("   1. Obtener API key en: https://linear.app/settings/api")
    print("   2. Crear archivo .env con: LINEAR_API_KEY=tu_api_key")
    print("   3. Ejecutar: python scripts/import_to_linear.py")

if __name__ == "__main__":
    main()
