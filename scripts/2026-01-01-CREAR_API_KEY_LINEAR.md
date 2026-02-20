# 🔑 Cómo Crear API Key en Linear

## Pasos Detallados

### 1. Acceder a Settings de Linear

1. Abre [Linear.app](https://linear.app) e inicia sesión
2. Haz clic en tu **workspace name** (nombre del workspace) en la esquina superior izquierda
3. Selecciona **"Settings"** del menú desplegable

---

### 2. Navegar a Security & Access

Una vez en Settings:
1. En el menú lateral izquierdo, busca y haz clic en **"Security & access"**
2. O ve directamente a: https://linear.app/settings/security-and-access

---

### 3. Crear Personal API Key

En la página "Security & access":
1. Busca la sección **"Personal API keys"**
2. Haz clic en el botón **"+ New API Key"** o **"Create API Key"**
3. Asigna un nombre descriptivo, por ejemplo:
   - `Nougram Import Script`
   - `Importación Proyecto`
   - `Script de Importación`
4. Configura los permisos y acceso a teams según necesites
5. Haz clic en **"Create"** para generar la API key

---

### 4. Copiar la API Key

⚠️ **IMPORTANTE:** La API key se muestra **SOLO UNA VEZ** por seguridad.

- Copia inmediatamente la API key (empieza con `lin_api_...`)
- Guárdala en un lugar seguro temporalmente
- **No la compartas públicamente** (está en `.gitignore` para no subirla a Git)

---

### 5. Formato de la API Key

La API key tiene este formato:
```
lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Ejemplo:
```
lin_api_abc123def456ghi789jkl012mno345pqr678
```

---

## ⚠️ Seguridad

- ✅ **SÍ:** Guárdala en el archivo `.env` (está en `.gitignore`)
- ✅ **SÍ:** Úsala en scripts locales
- ❌ **NO:** La subas a Git
- ❌ **NO:** La compartas públicamente
- ❌ **NO:** La incluyas en código fuente

---

## 📝 Siguiente Paso

Una vez que tengas tu API key:

1. **Crea el archivo `.env`** en la raíz del proyecto con:
   ```
   LINEAR_API_KEY=lin_api_tu_api_key_aqui
   ```

2. **Ejecuta el script de importación:**
   ```bash
   python scripts/import_to_linear.py
   ```

---

## 🔗 Enlaces Útiles

- **Settings de Linear:** https://linear.app/settings
- **API Settings:** https://linear.app/settings/api
- **Documentación API de Linear:** https://developers.linear.app/docs

---

**Última actualización:** 2025-01-30
