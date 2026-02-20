# Scripts de Utilidad - Backend

Este directorio contiene scripts útiles para gestión y mantenimiento de la base de datos.

## 📋 Scripts Disponibles

### `validate_database_config.py`

Valida que la configuración de base de datos sea correcta y consistente.

**Uso:**
```bash
python backend/scripts/validate_database_config.py
```

**Qué verifica:**
- ✅ Conexión a la base de datos
- ✅ Existencia de tabla `organizations`
- ✅ Organización default (ID=1)
- ✅ Versión de Alembic
- ✅ Tablas principales con `organization_id`
- ✅ Consistencia de datos (organization_id válidos)

**Ejemplo de salida:**
```
✅ CONFIGURACIÓN VÁLIDA
   La base de datos está correctamente configurada para multi-tenant
```

---

### `migrate_database.py`

Migra datos de una base de datos legacy (`agenciops_db`) a la base de datos estándar (`nougram_db`).

**⚠️ ADVERTENCIA:** Este script copia todos los datos. Asegúrate de tener un backup antes de ejecutarlo.

**Uso:**
```bash
python backend/scripts/migrate_database.py
```

**Qué hace:**
1. Verifica que ambas bases de datos existan
2. Lista todas las tablas en la base de datos origen
3. Muestra estadísticas de datos
4. Solicita confirmación
5. Copia todos los datos tabla por tabla
6. Muestra resumen de migración

**Requisitos:**
- Ambas bases de datos deben existir
- La base de datos destino debe tener las migraciones aplicadas
- Debes tener permisos para escribir en ambas bases de datos

**Ejemplo de salida:**
```
✅ MIGRACIÓN COMPLETADA
   Tablas migradas: 20/20
   Total de registros: 150
```

---

## 🔧 Scripts Manuales (en `manual_tests/`)

### `test_migration.py`

Script temporal para probar la migración multi-tenant. Verifica:
- Existencia de tabla `organizations`
- Organización default
- `organization_id` en todas las tablas
- Foreign keys
- Índices compuestos

**Uso:**
```bash
python backend/scripts/manual_tests/test_migration.py
```

---

## 📝 Notas

- Todos los scripts deben ejecutarse desde el directorio `backend/` o con el path correcto
- Los scripts usan la configuración de `app.core.config.settings`
- Asegúrate de tener el entorno virtual activado
- Los scripts son asíncronos y requieren Python 3.11+

---

## 🚀 Flujo de Setup Recomendado

1. **Crear archivo .env**
   ```bash
   python backend/setup_env.py
   ```

2. **Iniciar PostgreSQL**
   ```bash
   docker-compose up -d postgres
   ```

3. **Aplicar migraciones**
   ```bash
   cd backend
   alembic upgrade head
   ```

4. **Validar configuración**
   ```bash
   python backend/scripts/validate_database_config.py
   ```

5. **Si tienes datos legacy, migrar**
   ```bash
   python backend/scripts/migrate_database.py
   ```

---

**Última actualización:** 30 de Diciembre, 2025

