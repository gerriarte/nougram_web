"""
Script para probar endpoints HTTP del Dashboard y Pipeline
Requiere que el servidor backend esté corriendo en http://localhost:8000

Ejecutar:
1. Iniciar servidor: python -m uvicorn main:app --reload --port 8000
2. En otra terminal: python scripts/test_endpoints_http.py
"""
import requests
import json
import sys
from typing import Optional

BASE_URL = "http://localhost:8000/api/v1"
AUTH_TOKEN: Optional[str] = None  # Se puede configurar aquí o leer de archivo


def get_headers():
    """Obtiene headers con autenticación"""
    headers = {"Content-Type": "application/json"}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    return headers


def test_dashboard_kpis():
    """Prueba GET /api/dashboard/kpis"""
    print("\n" + "=" * 60)
    print("TEST 1: GET /api/dashboard/kpis")
    print("=" * 60)
    
    for period in ['month', 'quarter', 'year']:
        url = f"{BASE_URL}/dashboard/kpis?period={period}"
        try:
            response = requests.get(url, headers=get_headers())
            print(f"\nPeriod: {period}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("Response:")
                print(json.dumps(data, indent=2))
                print("[OK] Endpoint funcionando correctamente")
            else:
                print(f"[ERROR] {response.text}")
        except requests.exceptions.ConnectionError:
            print(f"[ERROR] No se pudo conectar al servidor. Asegurate de que el backend esté corriendo.")
            return False
        except Exception as e:
            print(f"[ERROR] {str(e)}")
            return False
    
    return True


def test_quotes_list():
    """Prueba GET /api/quotes"""
    print("\n" + "=" * 60)
    print("TEST 2: GET /api/quotes")
    print("=" * 60)
    
    # Test sin filtros
    url = f"{BASE_URL}/quotes"
    try:
        response = requests.get(url, headers=get_headers())
        print(f"\nSin filtros")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total quotes: {data.get('meta', {}).get('total', 0)}")
            print(f"Page: {data.get('meta', {}).get('page', 1)}")
            print(f"Quotes en respuesta: {len(data.get('data', []))}")
            if data.get('data'):
                print("\nPrimera cotizacion:")
                print(json.dumps(data['data'][0], indent=2))
            print("[OK] Endpoint funcionando correctamente")
        else:
            print(f"[ERROR] {response.text}")
    except requests.exceptions.ConnectionError:
        print(f"[ERROR] No se pudo conectar al servidor.")
        return False
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False
    
    # Test con filtros
    print("\n--- Con filtros ---")
    url = f"{BASE_URL}/quotes?status=sent&search=test&page=1&limit=10&sortBy=date&order=desc"
    try:
        response = requests.get(url, headers=get_headers())
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total: {data.get('meta', {}).get('total', 0)}")
            print("[OK] Filtros funcionando")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    return True


def test_get_quote_by_id():
    """Prueba GET /api/quotes/:id"""
    print("\n" + "=" * 60)
    print("TEST 3: GET /api/quotes/:id")
    print("=" * 60)
    
    # Primero obtener una lista para tener un ID
    try:
        list_response = requests.get(f"{BASE_URL}/quotes?limit=1", headers=get_headers())
        if list_response.status_code == 200:
            data = list_response.json()
            if data.get('data') and len(data['data']) > 0:
                quote_id = data['data'][0]['id']
                
                url = f"{BASE_URL}/quotes/{quote_id}"
                response = requests.get(url, headers=get_headers())
                print(f"\nQuote ID: {quote_id}")
                print(f"Status: {response.status_code}")
                
                if response.status_code == 200:
                    quote_data = response.json()
                    print("Response:")
                    print(json.dumps(quote_data, indent=2))
                    print("[OK] Endpoint funcionando correctamente")
                    return True
                else:
                    print(f"[ERROR] {response.text}")
            else:
                print("[WARN] No hay cotizaciones para probar")
                return True
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False
    
    return True


def test_update_quote_status():
    """Prueba PATCH /api/quotes/:id/status"""
    print("\n" + "=" * 60)
    print("TEST 4: PATCH /api/quotes/:id/status")
    print("=" * 60)
    
    # Primero obtener una cotización
    try:
        list_response = requests.get(f"{BASE_URL}/quotes?limit=1", headers=get_headers())
        if list_response.status_code == 200:
            data = list_response.json()
            if data.get('data') and len(data['data']) > 0:
                quote_id = data['data'][0]['id']
                original_status = data['data'][0]['status']
                
                # Cambiar a 'sent' si no lo está
                new_status = 'sent' if original_status != 'sent' else 'draft'
                
                url = f"{BASE_URL}/quotes/{quote_id}/status"
                payload = {"status": new_status}
                
                response = requests.patch(url, headers=get_headers(), json=payload)
                print(f"\nQuote ID: {quote_id}")
                print(f"Status original: {original_status}")
                print(f"Nuevo status: {new_status}")
                print(f"HTTP Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print("Response:")
                    print(json.dumps(result, indent=2))
                    print("[OK] Endpoint funcionando correctamente")
                    
                    # Revertir cambio
                    revert_payload = {"status": original_status}
                    requests.patch(url, headers=get_headers(), json=revert_payload)
                    return True
                else:
                    print(f"[ERROR] {response.text}")
            else:
                print("[WARN] No hay cotizaciones para probar")
                return True
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False
    
    return True


def test_generate_public_link():
    """Prueba POST /api/quotes/:id/public-link"""
    print("\n" + "=" * 60)
    print("TEST 5: POST /api/quotes/:id/public-link")
    print("=" * 60)
    
    # Primero obtener una cotización
    try:
        list_response = requests.get(f"{BASE_URL}/quotes?limit=1", headers=get_headers())
        if list_response.status_code == 200:
            data = list_response.json()
            if data.get('data') and len(data['data']) > 0:
                quote_id = data['data'][0]['id']
                
                url = f"{BASE_URL}/quotes/{quote_id}/public-link"
                payload = {"daysValid": 30}
                
                response = requests.post(url, headers=get_headers(), json=payload)
                print(f"\nQuote ID: {quote_id}")
                print(f"HTTP Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print("Response:")
                    print(json.dumps(result, indent=2))
                    print("[OK] Endpoint funcionando correctamente")
                    return True
                else:
                    print(f"[ERROR] {response.text}")
            else:
                print("[WARN] No hay cotizaciones para probar")
                return True
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False
    
    return True


def test_financial_summary():
    """Prueba GET /api/admin/financial-summary"""
    print("\n" + "=" * 60)
    print("TEST 6: GET /api/admin/financial-summary")
    print("=" * 60)
    
    url = f"{BASE_URL}/admin/financial-summary"
    try:
        response = requests.get(url, headers=get_headers())
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response:")
            print(json.dumps(data, indent=2))
            print("[OK] Endpoint funcionando correctamente")
            return True
        else:
            print(f"[ERROR] {response.text}")
    except requests.exceptions.ConnectionError:
        print(f"[ERROR] No se pudo conectar al servidor.")
        return False
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False


def main():
    """Ejecuta todas las pruebas"""
    print("=" * 60)
    print("PRUEBAS DE ENDPOINTS - Dashboard y Pipeline")
    print("=" * 60)
    print("\nNota: Asegurate de que el servidor backend esté corriendo")
    print("      en http://localhost:8000")
    print("\nSi necesitas autenticacion, configura AUTH_TOKEN en el script")
    
    results = []
    
    # Ejecutar pruebas
    results.append(("Dashboard KPIs", test_dashboard_kpis()))
    results.append(("Quotes List", test_quotes_list()))
    results.append(("Get Quote by ID", test_get_quote_by_id()))
    results.append(("Update Quote Status", test_update_quote_status()))
    results.append(("Generate Public Link", test_generate_public_link()))
    results.append(("Financial Summary", test_financial_summary()))
    
    # Resumen
    print("\n" + "=" * 60)
    print("RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "[OK]" if result else "[FAIL]"
        print(f"{status} {name}")
    
    print(f"\nTotal: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("\n[SUCCESS] Todos los endpoints funcionan correctamente!")
    else:
        print("\n[WARNING] Algunos endpoints fallaron. Revisa los errores arriba.")


if __name__ == "__main__":
    main()
