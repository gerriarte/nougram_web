"""
Currency utilities and constants
"""
from enum import Enum
from typing import Optional, Dict


class Currency(str, Enum):
    """Supported currencies"""
    USD = "USD"  # US Dollar
    COP = "COP"  # Colombian Peso
    ARS = "ARS"  # Argentine Peso
    EUR = "EUR"  # Euro


CURRENCY_INFO: Dict[str, Dict[str, str]] = {
    "USD": {
        "symbol": "$",
        "name": "US Dollar",
        "locale": "en-US",
    },
    "COP": {
        "symbol": "$",
        "name": "Colombian Peso",
        "locale": "es-CO",
    },
    "ARS": {
        "symbol": "$",
        "name": "Argentine Peso",
        "locale": "es-AR",
    },
    "EUR": {
        "symbol": "€",
        "name": "Euro",
        "locale": "en-EU",
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


def format_currency(amount: float, currency: str = "USD") -> str:
    """
    Format amount as currency string
    
    Args:
        amount: Amount to format
        currency: Currency code (USD, COP, ARS, EUR)
        
    Returns:
        Formatted currency string
    """
    currency_info = CURRENCY_INFO.get(currency, CURRENCY_INFO["USD"])
    locale = currency_info.get("locale", "en-US")
    symbol = currency_info.get("symbol", "$")
    
    # Use locale-aware formatting
    try:
        formatted = f"{symbol} {amount:,.2f}"
        return formatted
    except Exception:
        # Fallback to simple formatting
        return f"{symbol} {amount:.2f}"


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
