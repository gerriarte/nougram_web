"""
Pydantic configuration for Decimal serialization
ESTÁNDAR NOUGRAM: Decimal se serializa como string para mantener precisión
"""
from decimal import Decimal
from pydantic import ConfigDict

# Configuración base para schemas con Decimal
# ESTÁNDAR NOUGRAM: Decimal se serializa como string en JSON
DECIMAL_CONFIG = ConfigDict(
    json_encoders={
        Decimal: lambda v: str(v) if v is not None else None
    }
)
