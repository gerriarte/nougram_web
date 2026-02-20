# Alembic Migrations

Este directorio contiene las migraciones de base de datos usando Alembic.

## Configuración

Alembic está configurado para trabajar con PostgreSQL y SQLAlchemy async.

## Uso

### Crear una nueva migración (automática)

```bash
# Genera automáticamente las diferencias entre modelos y BD
alembic revision --autogenerate -m "descripción de los cambios"
```

### Crear una migración manual

```bash
# Crea un archivo de migración vacío para escribir manualmente
alembic revision -m "descripción de los cambios"
```

### Aplicar migraciones

```bash
# Aplicar todas las migraciones pendientes
alembic upgrade head

# Aplicar hasta una revisión específica
alembic upgrade <revision_id>

# Aplicar solo la siguiente migración
alembic upgrade +1
```

### Revertir migraciones

```bash
# Revertir la última migración
alembic downgrade -1

# Revertir hasta una revisión específica
alembic downgrade <revision_id>

# Revertir todas las migraciones
alembic downgrade base
```

### Ver estado de migraciones

```bash
# Ver historial de migraciones
alembic history

# Ver migraciones pendientes
alembic current
```

### Ver SQL sin ejecutar

```bash
# Ver el SQL que se ejecutaría sin aplicarlo
alembic upgrade head --sql
```

## Estructura

- `versions/` - Contiene las migraciones generadas
- `env.py` - Configuración del entorno de Alembic
- `script.py.mako` - Template para generar migraciones

## Notas

- Las migraciones se generan automáticamente comparando los modelos SQLAlchemy con la base de datos actual
- Siempre revisa las migraciones generadas antes de aplicarlas
- Usa nombres descriptivos para las migraciones

