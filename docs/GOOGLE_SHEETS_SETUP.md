# Guía de Configuración: Google Sheets para el Cotizador

Para que los leads del formulario se guarden automáticamente en una hoja de cálculo, sigue estos pasos:

## 1. Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto (ej. "Nougram Landing").
3. En el buscador, escribe "Google Sheets API" y selecciona la opción.
4. Haz clic en **Habilitar** (Enable).

## 2. Crear Credenciales (Service Account)
1. Ve al menú hamburguesa > **IAM y administración** > **Cuentas de servicio**.
2. Haz clic en **+ CREAR CUENTA DE SERVICIO**.
3. Nombre: `cotizador-bot` (o lo que quieras). Descripción: "Bot para guardar leads".
4. Haz clic en **Crear y Continuar**.
5. Rol: Selecciona **Editor** (Basic > Editor) o busca "Editor de Hojas de cálculo de Google" si prefieres ser más específico.
6. Haz clic en **Continuar** y luego en **Listo**.

## 3. Obtener la Clave (JSON)
1. En la lista de cuentas de servicio, haz clic en el email de la cuenta que acabas de crear (ej. `cotizador-bot@...`).
2. Ve a la pestaña **Claves** (Keys).
3. Haz clic en **Agregar clave** > **Crear clave nueva**.
4. Tipo: **JSON**. Se descargará un archivo `.json` a tu computadora.
5. **¡IMPORTANTE!** Abre ese archivo con un editor de texto (Bloc de notas, VS Code). Lo necesitarás en breve.

## 4. Preparar la Hoja de Google (Sheet)
1. Crea una nueva hoja en [Google Sheets](https://sheets.new/).
2. Ponle un nombre (ej. "Leads Nougram").
3. **Importantísimo**: En la pestaña inferior, asegúrate de que se llame `Hoja 1` (o `Sheet1` si está en inglés).
    *   Si le cambias el nombre, deberás configurar la variable `GOOGLE_SHEET_NAME`.
4. Crea los encabezados en la primera fila (A1:F1):
    *   A: Fecha
    *   B: Nombre
    *   C: Email
    *   D: Profesión
    *   E: Teléfono
    *   F: WhatsApp
5. Haz clic en el botón **Compartir** (Share) arriba a la derecha.
6. Copia el `client_email` de tu archivo JSON (el correo raro que termina en `iam.gserviceaccount.com`) y pégalo allí. Dale permisos de **Editor**.

## 5. Configurar Variables de Entorno (Vercel)
Ve a tu proyecto en Vercel > Settings > Environment Variables y agrega:

| Variable | Valor |
| :--- | :--- |
| `GOOGLE_SHEET_ID` | El ID de tu hoja (está en la URL: docs.google.com/spreadsheets/d/**ESTA_PARTE_LARGA**/edit) |
| `GOOGLE_CLIENT_EMAIL` | El `client_email` del archivo JSON. |
| `GOOGLE_PRIVATE_KEY` | El `private_key` del archivo JSON. **Cuidado**: Copia todo, desde `-----BEGIN PRIVATE KEY-----` hasta el final. |
| `GOOGLE_SHEET_NAME` | (Opcional) El nombre de la pestaña si no es "Hoja 1". |

## 6. Probar
1. Haz un deploy o usa `vercel dev`.
2. Envía el formulario.
3. ¡Revisa tu hoja de cálculo!
