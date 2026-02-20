# Análisis de la conexión Frontend ↔ Backend

## Estado actual: **conectado** ✅ (implementado 2026-02)

El frontend usa **api-client** y servicios híbridos (API cuando hay token JWT; fallback a mocks).

---

## 1. Capa de acceso a datos

| Componente | Ubicación | Tipo | Conexión |
|------------|-----------|------|----------|
| `quoteService` | `src/services/quoteService.ts` | Híbrido | ✅ API cuando hay token; fallback mock |
| `clientService` | `src/services/clientService.ts` | Híbrido | ✅ `/projects/clients/search` |
| `resourceService` | `src/services/resourceService.ts` | Híbrido | ✅ `/settings/team` |
| `pricingService` | `src/services/pricingService.ts` | Lógica local | ⚪ Cálculos en cliente |
| `aiService` | `src/services/aiService.ts` | - | Verificar |
| `onboardingService` | `src/services/onboardingService.ts` | - | Verificar |

Cliente centralizado: `src/lib/api-client.ts` (fetch, JWT, `NEXT_PUBLIC_API_URL`).

---

## 2. Backend disponible (FastAPI)

- **Base URL:** `http://localhost:8000`
- **Prefijo API:** `/api/v1`
- **CORS:** `http://localhost:3000` incluido en `CORS_ORIGINS`

Endpoints relevantes:

| Endpoint | Método | Auth | Uso en frontend |
|----------|--------|------|-----------------|
| `/api/v1/quotes/` | GET | JWT | quoteService.getAll |
| `/api/v1/quotes/{id}` | GET | JWT | quoteService.getById |
| `/api/v1/projects/` | POST | JWT | quoteService.create |
| `/api/v1/services/` | GET | JWT | QuoteBuilderContext (MOCK_SERVICES) |
| `/api/v1/taxes/` | GET | JWT | QuoteBuilderContext (MOCK_TAXES) |
| `/api/v1/settings/team` | GET | JWT | resourceService.getAllMembers |
| `/api/v1/auth/login` | POST | - | - |
| `/api/v1/auth/register` | POST | - | - |
| `/api/v1/onboarding/*` | - | - | onboarding |

---

## 3. Configuración Next.js

```ts
// next.config.ts - ACTUAL
const nextConfig = {
  /* config options here */
};
```

- ❌ No hay `rewrites` para reenviar `/api/*` al backend  
- ❌ No hay variable `NEXT_PUBLIC_API_URL`  
- ❌ Sin proxy inverso al puerto 8000

El frontend solo habla consigo mismo en `:3000`.

---

## 4. Persistencia local vs API

| Fuente | Dónde | Uso |
|--------|-------|-----|
| `localStorage.nougram_onboarding_data` | NougramCoreContext | BCR, moneda, nombre agencia |
| `localStorage` (quoteStorage) | useQuotePipeline fallback | Cotizaciones si API falla |
| API Backend | - | **No se usa** |

---

## 5. Qué hace falta para conectar

### 5.1 Crear cliente API centralizado

```ts
// src/lib/api-client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = getStoredToken(); // desde localStorage/cookie
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
```

### 5.2 Variable de entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 5.3 Adaptar servicios

Ejemplo para `quoteService`:

```ts
// quoteService.ts - reemplazar mock por:
getAll: async (): Promise<Quote[]> => {
  const res = await apiRequest<{ items: any[] }>('/quotes/?limit=100');
  return res.items.map(mapBackendToQuote);
},
```

### 5.4 Autenticación

- Flujo login → guardar JWT  
- Enviar `Authorization: Bearer <token>` en cada petición  
- Manejo de 401 (refresh o redirección a login)

---

## 6. Resumen

| Aspecto | Estado |
|---------|--------|
| Cliente HTTP | ❌ No existe |
| Variable `NEXT_PUBLIC_API_URL` | ❌ No definida |
| Proxy/rewrites Next.js | ❌ No configurado |
| Servicios llamando al backend | ❌ Todos usan mocks |
| Auth (JWT) en requests | ❌ No implementado |
| Backend CORS | ✅ `localhost:3000` permitido |
| Backend puerto | ✅ 8000 |

Para que el frontend consuma el backend hay que:

1. Implementar `api-client.ts` con `fetch` y manejo de token.
2. Definir `NEXT_PUBLIC_API_URL` en `.env.local`.
3. Sustituir mocks en `quoteService`, `clientService`, `resourceService`, etc., por llamadas reales.
4. Implementar o integrar flujo de autenticación (login/register) y almacenamiento del JWT.
