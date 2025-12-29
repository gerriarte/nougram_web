# Tests - Nougram Backend

## Estructura

```
tests/
├── __init__.py
├── conftest.py          # Fixtures compartidas
├── unit/                # Tests unitarios
│   ├── test_calculations.py
│   ├── test_repositories.py
│   └── test_security.py
└── integration/         # Tests de integración
```

## Ejecutar Tests

### Todos los tests
```bash
cd backend
pytest
```

### Tests unitarios solamente
```bash
cd backend
pytest tests/unit/
```

### Test específico
```bash
cd backend
pytest tests/unit/test_repositories.py
```

### Con cobertura
```bash
cd backend
pytest --cov=app --cov-report=html
```

## Fixtures Disponibles

- `db_session`: Sesión de base de datos de prueba (SQLite en memoria)
- `test_user`: Usuario de prueba con rol `product_manager`
- `test_admin_user`: Usuario de prueba con rol `super_admin`

## Notas

- Los tests usan SQLite en memoria para velocidad
- Cada test tiene su propia sesión de base de datos
- Las tablas se crean y destruyen automáticamente












