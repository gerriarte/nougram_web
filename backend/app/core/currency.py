"""
Currency utilities and constants
"""
from enum import Enum
from typing import Optional, Dict, Any
import math


class Currency(str, Enum):
    """Supported currencies"""
    USD = "USD"  # US Dollar
    COP = "COP"  # Colombian Peso
    ARS = "ARS"  # Argentine Peso
    EUR = "EUR"  # Euro


CURRENCY_INFO: Dict[str, Dict[str, Any]] = {
    "USD": {
        "symbol": "$",
        "name": "US Dollar",
        "locale": "en-US",
        "decimal_places": 2,
        "thousands_separator": ",",  # Thousands separator
        "decimal_separator": ".",  # Decimal separator
        "grouping": 3,  # Group digits by 3 (thousands, millions, etc.)
    },
    "COP": {
        "symbol": "$",
        "name": "Colombian Peso",
        "locale": "es-CO",
        "decimal_places": 0,  # COP typically doesn't use decimals
        "thousands_separator": ".",  # Thousands separator (period in Spanish)
        "decimal_separator": ",",  # Decimal separator (comma in Spanish)
        "grouping": 3,  # Group digits by 3 (thousands, millions, etc.)
    },
    "ARS": {
        "symbol": "$",
        "name": "Argentine Peso",
        "locale": "es-AR",
        "decimal_places": 2,
        "thousands_separator": ".",  # Thousands separator
        "decimal_separator": ",",  # Decimal separator
        "grouping": 3,  # Group digits by 3 (thousands, millions, etc.)
    },
    "EUR": {
        "symbol": "€",
        "name": "Euro",
        "locale": "en-EU",
        "decimal_places": 2,
        "thousands_separator": ".",  # Thousands separator
        "decimal_separator": ",",  # Decimal separator
        "grouping": 3,  # Group digits by 3 (thousands, millions, etc.)
    },
}

# Exchange rates to USD (base currency)
# NOTE: These are example rates. In production, you should fetch real-time rates
# from an API like exchangerate-api.com, fixer.io, or similar
EXCHANGE_RATES_TO_USD: Dict[str, float] = {
    "USD": 1.0,      # Base currency
    "COP": 4000.0,   # Example: 1 USD = 4000 COP (update with real rates)
    "ARS": 850.0,    # Example: 1 USD = 850 ARS (update with real rates)
    "EUR": 0.92,     # Example: 1 USD = 0.92 EUR (update with real rates)
}


def format_currency(amount: float, currency: str = "USD", use_grouping: bool = True) -> str:
    """
    Format amount as currency string with proper thousands/millions grouping
    
    Args:
        amount: Amount to format
        currency: Currency code (USD, COP, ARS, EUR)
        use_grouping: Whether to use thousands/millions grouping (default: True)
        
    Returns:
        Formatted currency string (e.g., "$ 1.000.000" for COP, "$ 1,000,000.00" for USD)
    """
    currency_info = CURRENCY_INFO.get(currency, CURRENCY_INFO["USD"])
    symbol = currency_info.get("symbol", "$")
    decimal_places = currency_info.get("decimal_places", 2)
    thousands_sep = currency_info.get("thousands_separator", ",")
    decimal_sep = currency_info.get("decimal_separator", ".")
    grouping = currency_info.get("grouping", 3)
    
    # Round to appropriate decimal places
    rounded_amount = round(amount, decimal_places)
    
    # Split into integer and decimal parts
    integer_part = int(abs(rounded_amount))
    decimal_part = abs(rounded_amount) - integer_part
    
    # Format integer part with grouping
    if use_grouping and grouping > 0:
        integer_str = str(integer_part)
        # Reverse string to group from right to left
        reversed_str = integer_str[::-1]
        grouped_parts = []
        for i in range(0, len(reversed_str), grouping):
            grouped_parts.append(reversed_str[i:i+grouping])
        grouped_str = thousands_sep.join(grouped_parts)
        integer_str = grouped_str[::-1]
    else:
        integer_str = str(integer_part)
    
    # Format decimal part
    if decimal_places > 0 and decimal_part > 0:
        decimal_str = f"{decimal_part:.{decimal_places}f}"[2:]  # Remove "0."
        formatted_amount = f"{integer_str}{decimal_sep}{decimal_str}"
    else:
        formatted_amount = integer_str
    
    # Add negative sign if needed
    if rounded_amount < 0:
        formatted_amount = f"-{formatted_amount}"
    
    # Add currency symbol
    return f"{symbol} {formatted_amount}"


def get_currency_symbol(currency: str = "USD") -> str:
    """
    Get currency symbol
    
    Args:
        currency: Currency code
        
    Returns:
        Currency symbol
    """
    return CURRENCY_INFO.get(currency, CURRENCY_INFO["USD"]).get("symbol", "$")


def get_currency_name(currency: str = "USD") -> str:
    """
    Get currency name
    
    Args:
        currency: Currency code
        
    Returns:
        Currency name
    """
    return CURRENCY_INFO.get(currency, CURRENCY_INFO["USD"]).get("name", "US Dollar")


def is_valid_currency(currency: str) -> bool:
    """
    Check if currency code is valid
    
    Args:
        currency: Currency code to validate
        
    Returns:
        True if valid, False otherwise
    """
    return currency in CURRENCY_INFO


def get_all_currencies() -> list[Dict[str, str]]:
    """
    Get list of all supported currencies
    
    Returns:
        List of currency dictionaries with code, symbol, and name
    """
    return [
        {
            "code": code,
            "symbol": info["symbol"],
            "name": info["name"],
        }
        for code, info in CURRENCY_INFO.items()
    ]


def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    """
    Convert amount from one currency to another
    
    Args:
        amount: Amount to convert
        from_currency: Source currency code
        to_currency: Target currency code
        
    Returns:
        Converted amount
    """
    if from_currency == to_currency:
        return amount
    
    # Convert to USD first (base currency)
    from_rate = EXCHANGE_RATES_TO_USD.get(from_currency, 1.0)
    amount_in_usd = amount / from_rate
    
    # Convert from USD to target currency
    to_rate = EXCHANGE_RATES_TO_USD.get(to_currency, 1.0)
    return amount_in_usd * to_rate


def normalize_to_primary_currency(
    amount: float,
    from_currency: str,
    primary_currency: str = "USD"
) -> float:
    """
    Normalize amount to primary currency
    
    This is used for calculations where all costs need to be in the same currency.
    
    Args:
        amount: Amount to normalize
        from_currency: Source currency code (can be None, defaults to USD)
        primary_currency: Target primary currency code (default: USD)
        
    Returns:
        Normalized amount in primary currency
    """
    # Handle None or empty currency
    if not from_currency or from_currency not in CURRENCY_INFO:
        from_currency = "USD"
    
    if not primary_currency or primary_currency not in CURRENCY_INFO:
        primary_currency = "USD"
    
    return convert_currency(amount, from_currency, primary_currency)
