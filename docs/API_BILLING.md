# API de Facturación y Suscripciones

Esta documentación describe los endpoints de la API para gestionar suscripciones y facturación con Stripe.

## Configuración

### Variables de Entorno Requeridas

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_IDS={"starter_month":"price_xxx","starter_year":"price_yyy",...}
```

### Configuración de Price IDs

Los `STRIPE_PRICE_IDS` deben estar en formato JSON con las siguientes claves:
- `{plan}_{interval}` donde:
  - `plan` puede ser: `free`, `starter`, `professional`, `enterprise`
  - `interval` puede ser: `month`, `year`

Ejemplo:
```json
{
  "starter_month": "price_1234567890",
  "starter_year": "price_0987654321",
  "professional_month": "price_abcdefghij",
  "professional_year": "price_jihgfedcba"
}
```

## Endpoints

### 1. Crear Sesión de Checkout

Crea una sesión de checkout de Stripe para suscribirse a un plan.

**Endpoint:** `POST /api/v1/billing/checkout-session`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "plan": "starter",
  "interval": "month",
  "success_url": "https://tu-app.com/settings/billing?success=true",
  "cancel_url": "https://tu-app.com/settings/billing?canceled=true"
}
```

**Response:** `201 Created`
```json
{
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Descripción:**
- Crea o reutiliza un cliente de Stripe para la organización
- Crea una sesión de checkout con el precio correspondiente al plan
- Retorna la URL para redirigir al usuario a Stripe Checkout

---

### 2. Obtener Suscripción Actual

Obtiene la suscripción activa de la organización del usuario autenticado.

**Endpoint:** `GET /api/v1/billing/subscription`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "organization_id": 1,
  "stripe_subscription_id": "sub_...",
  "stripe_customer_id": "cus_...",
  "stripe_price_id": "price_...",
  "plan": "starter",
  "status": "active",
  "current_period_start": "2025-01-01T00:00:00Z",
  "current_period_end": "2025-02-01T00:00:00Z",
  "cancel_at_period_end": false,
  "canceled_at": null,
  "trial_start": null,
  "trial_end": null,
  "latest_invoice_id": "in_...",
  "default_payment_method": null,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Errores:**
- `404 Not Found`: No hay suscripción activa

---

### 3. Actualizar Suscripción

Actualiza la suscripción actual (cambiar plan o cancelar al final del período).

**Endpoint:** `PUT /api/v1/billing/subscription`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "plan": "professional",
  "interval": "month",
  "cancel_at_period_end": false
}
```

**Campos opcionales:**
- `plan`: Nuevo plan (free, starter, professional, enterprise)
- `interval`: Intervalo de facturación (month, year)
- `cancel_at_period_end`: Si es `true`, cancela al final del período actual

**Response:** `200 OK`
```json
{
  "id": 1,
  "organization_id": 1,
  "plan": "professional",
  "status": "active",
  ...
}
```

**Errores:**
- `404 Not Found`: No hay suscripción activa
- `400 Bad Request`: Price ID no configurado para el plan
- `500 Internal Server Error`: Error al actualizar en Stripe

---

### 4. Cancelar Suscripción

Cancela la suscripción actual (inmediatamente o al final del período).

**Endpoint:** `POST /api/v1/billing/subscription/cancel`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "cancel_immediately": false
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "active",
  "cancel_at_period_end": true,
  ...
}
```

**Notas:**
- Si `cancel_immediately` es `false`, la suscripción se cancela al final del período actual
- Si `cancel_immediately` es `true`, la suscripción se cancela inmediatamente

---

### 5. Listar Planes Disponibles

Obtiene la lista de planes disponibles con sus precios y características.

**Endpoint:** `GET /api/v1/billing/plans`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "plans": [
    {
      "name": "free",
      "display_name": "Free",
      "description": "Perfect for trying out AgenciaOps",
      "monthly_price": 0,
      "yearly_price": 0,
      "features": [
        "Up to 1 user",
        "Up to 5 projects",
        ...
      ],
      "limits": {
        "max_users": 1,
        "max_projects": 5,
        "max_services": 10,
        "max_team_members": 3
      }
    },
    {
      "name": "starter",
      "display_name": "Starter",
      "description": "Ideal for small teams getting started",
      "monthly_price": 29.99,
      "yearly_price": 299.99,
      "features": [...],
      "limits": {...}
    },
    ...
  ]
}
```

---

## Webhooks de Stripe

### Endpoint de Webhook

**Endpoint:** `POST /api/v1/stripe/webhook`

Este endpoint debe ser configurado en Stripe Dashboard como webhook URL. No requiere autenticación (Stripe verifica la firma).

**Headers (de Stripe):**
```
stripe-signature: t=...,v1=...
```

### Eventos Manejados

El sistema maneja los siguientes eventos de Stripe:

#### 1. `checkout.session.completed`
Se activa cuando un usuario completa el checkout. El sistema:
- Crea o actualiza la suscripción en la base de datos
- Sincroniza el estado con Stripe
- Actualiza el plan de la organización

#### 2. `customer.subscription.created`
Se activa cuando se crea una nueva suscripción en Stripe. El sistema:
- Crea un registro de `Subscription` en la base de datos
- Sincroniza toda la información de la suscripción

#### 3. `customer.subscription.updated`
Se activa cuando se actualiza una suscripción (cambio de plan, cancelación, etc.). El sistema:
- Actualiza el registro de `Subscription` en la base de datos
- Sincroniza el estado, fechas de período, etc.
- Actualiza el plan de la organización si cambió

#### 4. `customer.subscription.deleted`
Se activa cuando se cancela o elimina una suscripción. El sistema:
- Marca la suscripción como cancelada
- Actualiza el estado de la organización

#### 5. `invoice.payment_succeeded`
Se activa cuando un pago de factura es exitoso. El sistema:
- Actualiza el `latest_invoice_id` en la suscripción

#### 6. `invoice.payment_failed`
Se activa cuando falla un pago de factura. El sistema:
- Actualiza el estado de la suscripción a `past_due`
- Actualiza el estado de la organización

### Seguridad

- Todos los webhooks verifican la firma usando `STRIPE_WEBHOOK_SECRET`
- Los eventos duplicados se manejan de forma idempotente
- Se registran todos los eventos procesados para auditoría

---

## Flujos Comunes

### Flujo 1: Nueva Suscripción

1. Usuario selecciona un plan en el frontend
2. Frontend llama a `POST /billing/checkout-session`
3. Backend crea sesión de checkout en Stripe
4. Usuario completa el pago en Stripe Checkout
5. Stripe envía webhook `checkout.session.completed`
6. Backend crea `Subscription` y actualiza `Organization`
7. Usuario es redirigido a `success_url`

### Flujo 2: Cambio de Plan

1. Usuario solicita cambio de plan
2. Frontend llama a `PUT /billing/subscription` con nuevo plan
3. Backend actualiza suscripción en Stripe
4. Stripe procesa el cambio y aplica prorrateo
5. Stripe envía webhook `customer.subscription.updated`
6. Backend sincroniza estado con base de datos

### Flujo 3: Cancelación

1. Usuario cancela suscripción
2. Frontend llama a `POST /billing/subscription/cancel`
3. Backend cancela en Stripe (al final del período o inmediatamente)
4. Stripe envía webhook `customer.subscription.updated` o `customer.subscription.deleted`
5. Backend marca suscripción como cancelada

---

## Estados de Suscripción

Los estados posibles de una suscripción son:

- `active`: Suscripción activa y pagada
- `trialing`: En período de prueba
- `past_due`: Pago fallido, pero aún activa
- `cancelled`: Cancelada
- `incomplete`: Suscripción iniciada pero no completada
- `incomplete_expired`: Suscripción incompleta expirada

---

## Planes Disponibles

### Free
- **Precio:** $0/mes
- **Límites:**
  - 1 usuario
  - 5 proyectos
  - 10 servicios
  - 3 miembros del equipo

### Starter
- **Precio:** $29.99/mes o $299.99/año
- **Límites:**
  - 5 usuarios
  - 25 proyectos
  - 50 servicios
  - 10 miembros del equipo

### Professional
- **Precio:** $99.99/mes o $999.99/año
- **Límites:**
  - 20 usuarios
  - 100 proyectos
  - 200 servicios
  - 50 miembros del equipo

### Enterprise
- **Precio:** Contactar para precio
- **Límites:**
  - Ilimitados

---

## Errores Comunes

### Error: "Price ID not configured for plan"
**Causa:** El plan solicitado no tiene un Price ID configurado en `STRIPE_PRICE_IDS`.  
**Solución:** Agregar el Price ID correspondiente en las variables de entorno.

### Error: "No active subscription found"
**Causa:** La organización no tiene una suscripción activa.  
**Solución:** Crear una nueva suscripción mediante checkout.

### Error: "Subscription is not linked to Stripe"
**Causa:** La suscripción existe en la base de datos pero no tiene `stripe_subscription_id`.  
**Solución:** Esta situación no debería ocurrir normalmente. Verificar sincronización con webhooks.

---

## Notas de Implementación

- Todas las operaciones de facturación requieren que el usuario esté autenticado
- Solo los administradores de la organización pueden gestionar suscripciones
- Los webhooks se procesan de forma asíncrona y actualizan la base de datos
- El estado se sincroniza automáticamente con Stripe mediante webhooks
- Se recomienda usar el frontend para todas las operaciones de suscripción





Esta documentación describe los endpoints de la API para gestionar suscripciones y facturación con Stripe.

## Configuración

### Variables de Entorno Requeridas

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_IDS={"starter_month":"price_xxx","starter_year":"price_yyy",...}
```

### Configuración de Price IDs

Los `STRIPE_PRICE_IDS` deben estar en formato JSON con las siguientes claves:
- `{plan}_{interval}` donde:
  - `plan` puede ser: `free`, `starter`, `professional`, `enterprise`
  - `interval` puede ser: `month`, `year`

Ejemplo:
```json
{
  "starter_month": "price_1234567890",
  "starter_year": "price_0987654321",
  "professional_month": "price_abcdefghij",
  "professional_year": "price_jihgfedcba"
}
```

## Endpoints

### 1. Crear Sesión de Checkout

Crea una sesión de checkout de Stripe para suscribirse a un plan.

**Endpoint:** `POST /api/v1/billing/checkout-session`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "plan": "starter",
  "interval": "month",
  "success_url": "https://tu-app.com/settings/billing?success=true",
  "cancel_url": "https://tu-app.com/settings/billing?canceled=true"
}
```

**Response:** `201 Created`
```json
{
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Descripción:**
- Crea o reutiliza un cliente de Stripe para la organización
- Crea una sesión de checkout con el precio correspondiente al plan
- Retorna la URL para redirigir al usuario a Stripe Checkout

---

### 2. Obtener Suscripción Actual

Obtiene la suscripción activa de la organización del usuario autenticado.

**Endpoint:** `GET /api/v1/billing/subscription`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "organization_id": 1,
  "stripe_subscription_id": "sub_...",
  "stripe_customer_id": "cus_...",
  "stripe_price_id": "price_...",
  "plan": "starter",
  "status": "active",
  "current_period_start": "2025-01-01T00:00:00Z",
  "current_period_end": "2025-02-01T00:00:00Z",
  "cancel_at_period_end": false,
  "canceled_at": null,
  "trial_start": null,
  "trial_end": null,
  "latest_invoice_id": "in_...",
  "default_payment_method": null,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Errores:**
- `404 Not Found`: No hay suscripción activa

---

### 3. Actualizar Suscripción

Actualiza la suscripción actual (cambiar plan o cancelar al final del período).

**Endpoint:** `PUT /api/v1/billing/subscription`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "plan": "professional",
  "interval": "month",
  "cancel_at_period_end": false
}
```

**Campos opcionales:**
- `plan`: Nuevo plan (free, starter, professional, enterprise)
- `interval`: Intervalo de facturación (month, year)
- `cancel_at_period_end`: Si es `true`, cancela al final del período actual

**Response:** `200 OK`
```json
{
  "id": 1,
  "organization_id": 1,
  "plan": "professional",
  "status": "active",
  ...
}
```

**Errores:**
- `404 Not Found`: No hay suscripción activa
- `400 Bad Request`: Price ID no configurado para el plan
- `500 Internal Server Error`: Error al actualizar en Stripe

---

### 4. Cancelar Suscripción

Cancela la suscripción actual (inmediatamente o al final del período).

**Endpoint:** `POST /api/v1/billing/subscription/cancel`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "cancel_immediately": false
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "active",
  "cancel_at_period_end": true,
  ...
}
```

**Notas:**
- Si `cancel_immediately` es `false`, la suscripción se cancela al final del período actual
- Si `cancel_immediately` es `true`, la suscripción se cancela inmediatamente

---

### 5. Listar Planes Disponibles

Obtiene la lista de planes disponibles con sus precios y características.

**Endpoint:** `GET /api/v1/billing/plans`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "plans": [
    {
      "name": "free",
      "display_name": "Free",
      "description": "Perfect for trying out AgenciaOps",
      "monthly_price": 0,
      "yearly_price": 0,
      "features": [
        "Up to 1 user",
        "Up to 5 projects",
        ...
      ],
      "limits": {
        "max_users": 1,
        "max_projects": 5,
        "max_services": 10,
        "max_team_members": 3
      }
    },
    {
      "name": "starter",
      "display_name": "Starter",
      "description": "Ideal for small teams getting started",
      "monthly_price": 29.99,
      "yearly_price": 299.99,
      "features": [...],
      "limits": {...}
    },
    ...
  ]
}
```

---

## Webhooks de Stripe

### Endpoint de Webhook

**Endpoint:** `POST /api/v1/stripe/webhook`

Este endpoint debe ser configurado en Stripe Dashboard como webhook URL. No requiere autenticación (Stripe verifica la firma).

**Headers (de Stripe):**
```
stripe-signature: t=...,v1=...
```

### Eventos Manejados

El sistema maneja los siguientes eventos de Stripe:

#### 1. `checkout.session.completed`
Se activa cuando un usuario completa el checkout. El sistema:
- Crea o actualiza la suscripción en la base de datos
- Sincroniza el estado con Stripe
- Actualiza el plan de la organización

#### 2. `customer.subscription.created`
Se activa cuando se crea una nueva suscripción en Stripe. El sistema:
- Crea un registro de `Subscription` en la base de datos
- Sincroniza toda la información de la suscripción

#### 3. `customer.subscription.updated`
Se activa cuando se actualiza una suscripción (cambio de plan, cancelación, etc.). El sistema:
- Actualiza el registro de `Subscription` en la base de datos
- Sincroniza el estado, fechas de período, etc.
- Actualiza el plan de la organización si cambió

#### 4. `customer.subscription.deleted`
Se activa cuando se cancela o elimina una suscripción. El sistema:
- Marca la suscripción como cancelada
- Actualiza el estado de la organización

#### 5. `invoice.payment_succeeded`
Se activa cuando un pago de factura es exitoso. El sistema:
- Actualiza el `latest_invoice_id` en la suscripción

#### 6. `invoice.payment_failed`
Se activa cuando falla un pago de factura. El sistema:
- Actualiza el estado de la suscripción a `past_due`
- Actualiza el estado de la organización

### Seguridad

- Todos los webhooks verifican la firma usando `STRIPE_WEBHOOK_SECRET`
- Los eventos duplicados se manejan de forma idempotente
- Se registran todos los eventos procesados para auditoría

---

## Flujos Comunes

### Flujo 1: Nueva Suscripción

1. Usuario selecciona un plan en el frontend
2. Frontend llama a `POST /billing/checkout-session`
3. Backend crea sesión de checkout en Stripe
4. Usuario completa el pago en Stripe Checkout
5. Stripe envía webhook `checkout.session.completed`
6. Backend crea `Subscription` y actualiza `Organization`
7. Usuario es redirigido a `success_url`

### Flujo 2: Cambio de Plan

1. Usuario solicita cambio de plan
2. Frontend llama a `PUT /billing/subscription` con nuevo plan
3. Backend actualiza suscripción en Stripe
4. Stripe procesa el cambio y aplica prorrateo
5. Stripe envía webhook `customer.subscription.updated`
6. Backend sincroniza estado con base de datos

### Flujo 3: Cancelación

1. Usuario cancela suscripción
2. Frontend llama a `POST /billing/subscription/cancel`
3. Backend cancela en Stripe (al final del período o inmediatamente)
4. Stripe envía webhook `customer.subscription.updated` o `customer.subscription.deleted`
5. Backend marca suscripción como cancelada

---

## Estados de Suscripción

Los estados posibles de una suscripción son:

- `active`: Suscripción activa y pagada
- `trialing`: En período de prueba
- `past_due`: Pago fallido, pero aún activa
- `cancelled`: Cancelada
- `incomplete`: Suscripción iniciada pero no completada
- `incomplete_expired`: Suscripción incompleta expirada

---

## Planes Disponibles

### Free
- **Precio:** $0/mes
- **Límites:**
  - 1 usuario
  - 5 proyectos
  - 10 servicios
  - 3 miembros del equipo

### Starter
- **Precio:** $29.99/mes o $299.99/año
- **Límites:**
  - 5 usuarios
  - 25 proyectos
  - 50 servicios
  - 10 miembros del equipo

### Professional
- **Precio:** $99.99/mes o $999.99/año
- **Límites:**
  - 20 usuarios
  - 100 proyectos
  - 200 servicios
  - 50 miembros del equipo

### Enterprise
- **Precio:** Contactar para precio
- **Límites:**
  - Ilimitados

---

## Errores Comunes

### Error: "Price ID not configured for plan"
**Causa:** El plan solicitado no tiene un Price ID configurado en `STRIPE_PRICE_IDS`.  
**Solución:** Agregar el Price ID correspondiente en las variables de entorno.

### Error: "No active subscription found"
**Causa:** La organización no tiene una suscripción activa.  
**Solución:** Crear una nueva suscripción mediante checkout.

### Error: "Subscription is not linked to Stripe"
**Causa:** La suscripción existe en la base de datos pero no tiene `stripe_subscription_id`.  
**Solución:** Esta situación no debería ocurrir normalmente. Verificar sincronización con webhooks.

---

## Notas de Implementación

- Todas las operaciones de facturación requieren que el usuario esté autenticado
- Solo los administradores de la organización pueden gestionar suscripciones
- Los webhooks se procesan de forma asíncrona y actualizan la base de datos
- El estado se sincroniza automáticamente con Stripe mediante webhooks
- Se recomienda usar el frontend para todas las operaciones de suscripción






