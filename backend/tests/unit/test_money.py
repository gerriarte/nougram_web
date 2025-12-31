"""
Unit tests for Money class and utilities
ESTÁNDAR NOUGRAM: Validación de precisión financiera grado bancario
"""
import pytest
from decimal import Decimal, ROUND_HALF_UP
from app.core.money import (
    Money,
    to_money,
    sum_money,
    from_api,
    to_api,
    ROUNDING_MODE
)


@pytest.mark.unit
class TestMoney:
    """Tests for Money class creation and basic operations"""
    
    def test_create_from_float(self):
        """Test creating Money from float"""
        money = Money(100.50, "USD")
        assert money.amount == Decimal('100.50')
        assert money.currency == "USD"
    
    def test_create_from_string(self):
        """Test creating Money from string"""
        money = Money("100.50", "USD")
        assert money.amount == Decimal('100.50')
        assert money.currency == "USD"
    
    def test_create_from_decimal(self):
        """Test creating Money from Decimal"""
        money = Money(Decimal('100.50'), "USD")
        assert money.amount == Decimal('100.50')
        assert money.currency == "USD"
    
    def test_create_from_int(self):
        """Test creating Money from int"""
        money = Money(100, "USD")
        assert money.amount == Decimal('100')
        assert money.currency == "USD"
    
    def test_currency_uppercase(self):
        """Test that currency is always uppercase"""
        money = Money(100, "usd")
        assert money.currency == "USD"
    
    def test_add_same_currency(self):
        """Test adding Money with same currency"""
        a = Money(100, "USD")
        b = Money(50, "USD")
        result = a.add(b)
        assert result.amount == Decimal('150')
        assert result.currency == "USD"
        # Verify immutability
        assert a.amount == Decimal('100')
        assert b.amount == Decimal('50')
    
    def test_add_different_currency_raises_error(self):
        """Test that adding different currencies raises ValueError"""
        a = Money(100, "USD")
        b = Money(50, "COP")
        with pytest.raises(ValueError, match="Cannot add"):
            a.add(b)
    
    def test_subtract_same_currency(self):
        """Test subtracting Money with same currency"""
        a = Money(100, "USD")
        b = Money(30, "USD")
        result = a.subtract(b)
        assert result.amount == Decimal('70')
        assert result.currency == "USD"
    
    def test_subtract_different_currency_raises_error(self):
        """Test that subtracting different currencies raises ValueError"""
        a = Money(100, "USD")
        b = Money(50, "COP")
        with pytest.raises(ValueError, match="Cannot subtract"):
            a.subtract(b)
    
    def test_multiply(self):
        """Test multiplying Money by scalar"""
        money = Money(100, "USD")
        result = money.multiply(1.5)
        assert result.amount == Decimal('150')
        # Test with Decimal
        result2 = money.multiply(Decimal('2.5'))
        assert result2.amount == Decimal('250')
    
    def test_divide(self):
        """Test dividing Money by scalar"""
        money = Money(100, "USD")
        result = money.divide(2)
        assert result.amount == Decimal('50')
        # Test with Decimal
        result2 = money.divide(Decimal('4'))
        assert result2.amount == Decimal('25')
    
    def test_divide_by_zero_raises_error(self):
        """Test that dividing by zero raises ValueError"""
        money = Money(100, "USD")
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            money.divide(0)
    
    def test_apply_percentage(self):
        """Test applying percentage (e.g., 19% IVA)"""
        money = Money(100, "USD")
        result = money.apply_percentage(19)  # 19% IVA
        assert result.amount == Decimal('19')
    
    def test_apply_margin(self):
        """Test applying margin (cost / (1 - margin))"""
        cost = Money(100, "USD")
        result = cost.apply_margin(40)  # 40% margin
        # 100 / (1 - 0.40) = 100 / 0.60 = 166.666...
        # With ROUND_HALF_UP and quantize to 0.01: 166.67
        assert result.amount.quantize(Decimal('0.01'), rounding=ROUNDING_MODE) == Decimal('166.67')
    
    def test_apply_margin_100_percent_raises_error(self):
        """Test that applying 100% margin raises ValueError"""
        cost = Money(100, "USD")
        with pytest.raises(ValueError, match="Margin cannot be >= 100%"):
            cost.apply_margin(100)
    
    def test_apply_margin_over_100_percent_raises_error(self):
        """Test that applying margin over 100% raises ValueError"""
        cost = Money(100, "USD")
        with pytest.raises(ValueError, match="Margin cannot be >= 100%"):
            cost.apply_margin(150)
    
    def test_quantize_usd(self):
        """Test quantizing USD to display precision"""
        money = Money(100.5678, "USD")
        quantized = money.quantize()
        assert quantized.amount == Decimal('100.57')  # Rounded to 2 decimals
    
    def test_quantize_cop_no_decimals(self):
        """Test quantizing COP (no decimals in display)"""
        money = Money(1000000.50, "COP")
        quantized = money.quantize()
        assert quantized.amount == Decimal('1000001')  # Rounded to nearest integer
    
    def test_quantize_with_custom_precision(self):
        """Test quantizing with custom precision"""
        money = Money(100.5678, "USD")
        precision = Decimal('0.001')
        quantized = money.quantize(precision)
        assert quantized.amount == Decimal('100.568')  # Rounded to 3 decimals
    
    def test_to_float(self):
        """Test converting Money to float"""
        money = Money(100.50, "USD")
        float_value = money.to_float()
        assert float_value == 100.50
        assert isinstance(float_value, float)
    
    def test_to_int_cents_usd(self):
        """Test converting USD Money to cents"""
        money = Money(100.50, "USD")
        cents = money.to_int_cents()
        assert cents == 10050
    
    def test_to_int_cents_cop(self):
        """Test converting COP Money (already in whole units)"""
        money = Money(1000000, "COP")
        units = money.to_int_cents()
        assert units == 1000000
    
    def test_comparison_operators(self):
        """Test comparison operators"""
        a = Money(100, "USD")
        b = Money(50, "USD")
        c = Money(100, "USD")
        
        assert a > b
        assert b < a
        assert a >= c
        assert b <= a
        assert a == c
        assert a != b
    
    def test_comparison_different_currency_raises_error(self):
        """Test that comparing different currencies raises ValueError"""
        a = Money(100, "USD")
        b = Money(100, "COP")
        with pytest.raises(ValueError, match="Cannot compare"):
            a < b
    
    def test_precision_accumulation(self):
        """Test that 0.1 + 0.2 = 0.3 (not 0.30000000000000004)"""
        a = Money(0.1, "USD")
        b = Money(0.2, "USD")
        result = a.add(b)
        assert result.amount == Decimal('0.3')
        # Verify it's exactly 0.3, not an approximation
        assert result.amount == Decimal('0.3')
    
    def test_rounding_mode_is_half_up(self):
        """CRÍTICO: Test that ROUNDING_MODE is ROUND_HALF_UP (not banker's rounding)"""
        assert ROUNDING_MODE == ROUND_HALF_UP
        # Test that 0.5 rounds up (not to nearest even)
        money = Money(Decimal('0.5'), "USD")
        quantized = money.quantize(Decimal('0.1'))
        # With ROUND_HALF_UP: 0.5 → 0.5 (no change at 0.1 precision)
        # But at 0.01 precision, 0.5 should round to 0.5
        quantized2 = money.quantize(Decimal('0.01'))
        assert quantized2.amount == Decimal('0.50')
    
    def test_rounding_half_up_vs_banker(self):
        """Test that we use round half up, not banker's rounding"""
        # 2.5 should round to 3 with ROUND_HALF_UP (not 2 with banker's rounding)
        money = Money(Decimal('2.5'), "USD")
        quantized = money.quantize(Decimal('1'))
        assert quantized.amount == Decimal('3')  # Rounds up, not to nearest even


@pytest.mark.unit
class TestMoneyHelpers:
    """Tests for Money helper functions"""
    
    def test_to_money(self):
        """Test to_money helper"""
        money = to_money(100.50, "USD")
        assert isinstance(money, Money)
        assert money.amount == Decimal('100.50')
        assert money.currency == "USD"
    
    def test_from_api(self):
        """Test from_api helper"""
        money = from_api(100.50, "USD")
        assert isinstance(money, Money)
        assert money.amount == Decimal('100.50')
    
    def test_to_api(self):
        """Test to_api helper"""
        money = Money(100.50, "USD")
        api_value = to_api(money)
        assert api_value == 100.50
        assert isinstance(api_value, float)
    
    def test_sum_money_list(self):
        """Test summing list of Money objects"""
        amounts = [
            Money(100, "USD"),
            Money(50, "USD"),
            Money(25, "USD"),
        ]
        result = sum_money(amounts)
        assert result is not None
        assert result.amount == Decimal('175')
        assert result.currency == "USD"
    
    def test_sum_money_empty_list(self):
        """Test summing empty list returns None"""
        result = sum_money([])
        assert result is None
    
    def test_sum_money_different_currencies_raises_error(self):
        """Test that summing different currencies raises ValueError"""
        amounts = [
            Money(100, "USD"),
            Money(50, "COP"),
        ]
        with pytest.raises(ValueError, match="All amounts must be in"):
            sum_money(amounts)
    
    def test_sum_money_precision(self):
        """Test that sum maintains precision"""
        amounts = [
            Money(0.1, "USD"),
            Money(0.2, "USD"),
            Money(0.3, "USD"),
        ]
        result = sum_money(amounts)
        assert result.amount == Decimal('0.6')
        # Verify exact precision
        assert result.amount == Decimal('0.6')


@pytest.mark.unit
class TestMoneyEdgeCases:
    """Tests for edge cases and error handling"""
    
    def test_negative_amount_warning(self):
        """Test that negative amounts log warning but don't fail"""
        # Negative amounts should be allowed but log a warning
        money = Money(-100, "USD")
        assert money.amount == Decimal('-100')
        assert money.currency == "USD"
    
    def test_zero_amount(self):
        """Test Money with zero amount"""
        money = Money(0, "USD")
        assert money.amount == Decimal('0')
        assert money.currency == "USD"
    
    def test_very_large_amount(self):
        """Test Money with very large amount"""
        money = Money(999999999.99, "USD")
        assert money.amount == Decimal('999999999.99')
    
    def test_very_small_amount(self):
        """Test Money with very small amount"""
        money = Money(0.0001, "USD")
        assert money.amount == Decimal('0.0001')
    
    def test_string_representation(self):
        """Test string and repr representations"""
        money = Money(100.50, "USD")
        assert str(money) == "100.50 USD"
        assert repr(money) == "Money(100.50, 'USD')"
