# Cómo Ver los Logs del Backend

## Opción 1: Ver la Consola del Backend

El backend FastAPI muestra los logs en la consola donde se ejecuta `python main.py`.

### Pasos:
1. Busca la ventana de PowerShell minimizada donde está corriendo el backend
2. Haz clic en la ventana para ver los logs en tiempo real
3. Los errores aparecerán ahí con el traceback completo

## Opción 2: Ejecutar el Backend Manualmente (recomendado para debugging)

```powershell
# 1. Ir al directorio del backend
cd C:\Users\Usuario\Documents\GitHub\Cotizador\backend

# 2. Activar el entorno virtual
.\venv\Scripts\activate

# 3. Ejecutar el backend (verás los logs en esta ventana)
python main.py
```

## Opción 3: Filtrar logs por error

Si el error persiste, los logs mostrarán algo como:
```
ERROR: Internal server error: unsupported operand type(s) for /: 'float' and 'decimal.Decimal'
Traceback (most recent call last):
  File "...", line X, in ...
```

## Logs de Instrumentación

Los logs de instrumentación (para debugging) están en:
- `C:\Users\Usuario\Documents\GitHub\Cotizador\.cursor\debug.log`

Estos logs son principalmente del frontend. Para ver errores del backend, usa la consola donde se ejecuta el backend.
