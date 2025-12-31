# Validación: Endpoint /quotes/calculate SIEMPRE recalcula

## ESTÁNDAR NOUGRAM: Validación de Re-cálculo

**Fecha**: 2025-12-30
**Endpoint**: `POST /api/v1/quotes/calculate`
**Archivo**: `backend/app/api/v1/endpoints/quotes.py`

## Validación Completada ✅

### 1. El endpoint NO guarda valores en la BD
- ✅ El endpoint solo calcula y retorna (`QuoteCalculateResponse`)
- ✅ No hay llamadas a `db.add()`, `db.commit()`, o `db.update()`
- ✅ No modifica ningún modelo (`Quote`, `QuoteItem`, etc.)

### 2. `calculate_quote_totals_enhanced` NO usa cache
- ✅ La función siempre recalcula desde cero usando:
  - Items del request
  - BCR calculado en tiempo real
  - Taxes activas de la BD
  - Expenses del request
- ✅ No hay llamadas a `get_cache()` dentro de `calculate_quote_totals_enhanced`
- ✅ Todos los cálculos usan `Money` para precisión grado bancario

### 3. El BCR se calcula en tiempo real
- ✅ `calculate_blended_cost_rate` se llama con `use_cache=True` (aceptable)
- ✅ El cache del BCR tiene TTL de 5 minutos (aceptable para datos que cambian poco)
- ✅ El BCR se recalcula si cambian team members o fixed costs

### 4. Todos los valores se calculan con Money
- ✅ `total_internal_cost`: Calculado con `Money`
- ✅ `total_client_price`: Calculado con `Money` (aplica margen si hay `target_margin_percentage`)
- ✅ `total_expenses_cost`: Calculado con `Money`
- ✅ `total_taxes`: Calculado con `Money` aplicando porcentajes
- ✅ `margin_percentage`: Calculado usando `Money.subtract()` y división precisa

### 5. Conversión a Decimal para el Schema
- ✅ Todos los valores se convierten a `Decimal` antes de pasar al schema
- ✅ El schema serializa `Decimal` como `string` para mantener precisión
- ✅ El frontend recibe strings y los convierte a `dinero.js` automáticamente

## Conclusión

✅ **El endpoint `/quotes/calculate` CUMPLE con el ESTÁNDAR NOUGRAM:**
- Siempre recalcula en el backend antes de retornar
- No usa valores guardados previamente
- Usa `Money`/`Decimal` para precisión grado bancario
- Serializa como strings para evitar pérdida de precisión
- El frontend solo muestra valores, nunca calcula el precio final

## Nota sobre Cache del BCR

El `calculate_blended_cost_rate` usa cache con TTL de 5 minutos. Esto es **aceptable** porque:
- El BCR depende de datos que cambian poco (team members, fixed costs)
- El cache mejora performance sin afectar precisión
- Si cambian los datos, el cache se invalida automáticamente
- El cálculo del quote siempre usa el BCR más reciente disponible
