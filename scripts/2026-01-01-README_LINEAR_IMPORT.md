# 📥 Guía de Importación a Linear

Este directorio contiene archivos y scripts para importar todas las issues del proyecto Nougram a Linear.

## 📁 Archivos Disponibles

1. **`linear_import_issues.json`** - Formato JSON estructurado con todas las issues
2. **`linear_import_issues.csv`** - Formato CSV para importación manual
3. **`import_to_linear.py`** - Script Python para importación automática

---

## 🚀 Método 1: Importación Automática (Recomendado)

### Requisitos

1. **Instalar dependencias:**
   ```bash
   pip install requests python-dotenv
   ```

2. **Obtener API Key de Linear:**
   - Ve a: https://linear.app/settings/api
   - Crea un nuevo API Key
   - Copia el token

3. **Configurar variables de entorno:**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
   ```

### Ejecutar Importación

```bash
# Importación normal
python scripts/import_to_linear.py

# Ver qué se importaría sin crear issues (dry-run)
python scripts/import_to_linear.py --dry-run

# Usar archivo personalizado
python scripts/import_to_linear.py --file scripts/linear_import_issues.json
```

### Qué hace el script

1. ✅ Conecta a la API de Linear
2. ✅ Obtiene el primer team disponible
3. ✅ Crea todas las issues con:
   - Título y descripción
   - Prioridad (High/Medium/Low)
   - Estimación en puntos
   - Estado inicial (Todo/Backlog)
4. ✅ Muestra el progreso y URLs de las issues creadas

---

## 📋 Método 2: Importación Manual con CSV

### Usar el CLI de Linear

1. **Instalar Linear CLI:**
   ```bash
   npm install --global @linear/import
   ```

2. **Ejecutar importador interactivo:**
   ```bash
   linear-import
   ```

3. **Seleccionar "CSV" como formato de origen**

4. **Proporcionar el archivo:** `scripts/linear_import_issues.csv`

5. **Mapear columnas:**
   - `Title` → Title
   - `Description` → Description
   - `Priority` → Priority
   - `Estimate` → Estimate
   - `Labels` → Labels (separar por comas)
   - `State` → State

---

## 📋 Método 3: Importación Manual vía UI

### Opción A: Copiar desde JSON

1. Abre `scripts/linear_import_issues.json`
2. Para cada issue:
   - Copia el título
   - Copia la descripción
   - Crea manualmente en Linear
   - Asigna prioridad, estimación y labels

### Opción B: Usar el CSV

1. Abre `scripts/linear_import_issues.csv` en Excel/Sheets
2. Revisa cada fila
3. Crea issues manualmente en Linear con la información de cada fila

---

## 🏷️ Labels Sugeridos en Linear

Antes de importar, asegúrate de crear estos labels en Linear:

### Por Prioridad
- `priority:high`
- `priority:medium`
- `priority:low`

### Por Tipo
- `type:feature`
- `type:improvement`
- `type:technical-debt`
- `type:testing`
- `type:documentation`
- `type:devops`
- `type:security`
- `type:performance`

### Por Componente
- `component:backend`
- `component:frontend`
- `component:api`
- `component:database`
- `component:infrastructure`

---

## 📊 Proyectos Sugeridos

Después de importar, organiza las issues en estos proyectos:

1. **MVP Multi-Tenant** - Issues 1-4 (Alta prioridad)
2. **Calidad y Testing** - Issues 5-8 (Media prioridad)
3. **Producción Ready** - Issues 11-12 (Baja prioridad, crítico)
4. **Mejoras** - Issues 9-10 (Baja prioridad)

---

## ⚠️ Notas Importantes

1. **Estimaciones:** Están en horas/puntos. Ajusta según tu sistema de estimación.

2. **Prioridades:**
   - **High** = Urgente (crítico para MVP)
   - **Medium** = Alta (mejora calidad)
   - **Low** = Media (nice to have)

3. **Estados:** Todas las issues se crearán como "Todo" (backlog).

4. **Team ID:** El script usa el primer team disponible. Si tienes múltiples teams, modifica el script para especificar uno.

5. **Rate Limits:** Linear tiene rate limits. Si importas muchas issues, el script puede fallar. En ese caso, importa en lotes más pequeños.

---

## 🔧 Troubleshooting

### Error: "LINEAR_API_KEY no encontrada"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que contiene `LINEAR_API_KEY=tu_api_key`
- El archivo `.env` debe estar en el mismo directorio que el script

### Error: "No se encontraron teams"
- Asegúrate de que tu API key tiene acceso a al menos un team
- Verifica que estás usando la API key correcta

### Error: Rate limit exceeded
- Linear tiene límites de requests por minuto
- Espera unos minutos y vuelve a intentar
- O importa en lotes más pequeños modificando el script

### Issues no se crean correctamente
- Verifica los logs del script
- Revisa que el formato JSON es válido
- Verifica que el team ID es correcto

---

## 📝 Personalización

### Modificar el archivo JSON

El archivo `linear_import_issues.json` tiene esta estructura:

```json
{
  "issues": [
    {
      "title": "Título de la issue",
      "description": "Descripción detallada con markdown",
      "priority": "High|Medium|Low",
      "estimate": 8,
      "labels": ["tag1", "tag2"],
      "state": "Todo"
    }
  ]
}
```

Puedes:
- Agregar más issues
- Modificar descripciones
- Cambiar prioridades
- Ajustar estimaciones

---

## ✅ Verificación Post-Importación

Después de importar, verifica:

1. ✅ Todas las issues fueron creadas
2. ✅ Prioridades están correctas
3. ✅ Estimaciones están asignadas
4. ✅ Labels están aplicados
5. ✅ Descripciones son legibles
6. ✅ Issues están en el proyecto correcto

---

**Última actualización:** 2025-01-30  
**Mantenido por:** Equipo de Desarrollo Nougram
