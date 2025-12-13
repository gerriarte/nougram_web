"""
Unit tests for calculation functions
"""
import pytest

from app.core.calculations import calculate_blended_cost_rate
from app.models.cost import CostFixed
from app.models.team import TeamMember
from app.models.settings import AgencySettings


@pytest.mark.unit
class TestBlendedCostRate:
    """Tests for blended cost rate calculation"""
    
    async def test_blended_cost_rate_single_member(self, db_session):
        """Test blended cost rate with single team member"""
        # Create settings
        settings = AgencySettings(
            primary_currency="USD",
            currency_symbol="$"
        )
        db_session.add(settings)
        await db_session.commit()
        
        # Create team member
        member = TeamMember(
            name="Test Member",
            role="Developer",
            salary_monthly_brute=5000.00,
            billable_hours_per_week=32,
            currency="USD",
            is_active=True
        )
        db_session.add(member)
        await db_session.commit()
        
        result = await calculate_blended_cost_rate(db_session, "USD")
        
        # Expected: 5000 / (32 * 4.33) = 5000 / 138.56 = 36.08
        assert result > 0
        assert isinstance(result, float)
    
    async def test_blended_cost_rate_with_fixed_costs(self, db_session):
        """Test blended cost rate including fixed costs"""
        # Create settings
        settings = AgencySettings(
            primary_currency="USD",
            currency_symbol="$"
        )
        db_session.add(settings)
        await db_session.commit()
        
        # Create team member
        member = TeamMember(
            name="Test Member",
            role="Developer",
            salary_monthly_brute=5000.00,
            billable_hours_per_week=32,
            currency="USD",
            is_active=True
        )
        db_session.add(member)
        
        # Create fixed cost
        cost = CostFixed(
            name="Test Cost",
            amount_monthly=2000.00,
            currency="USD",
            category="overhead"
        )
        db_session.add(cost)
        await db_session.commit()
        
        result = await calculate_blended_cost_rate(db_session, "USD")
        
        # Expected: (5000 + 2000) / (32 * 4.33) = 7000 / 138.56 = 50.52
        assert result > 0
        assert isinstance(result, float)
        # Should be higher than without fixed costs
        assert result > 36.0
    
    async def test_blended_cost_rate_zero_hours(self, db_session):
        """Test blended cost rate with zero billable hours"""
        from sqlalchemy import delete
        
        # Clean up any existing data first
        await db_session.execute(delete(CostFixed))
        await db_session.execute(delete(TeamMember))
        await db_session.commit()
        
        # Create settings
        settings = AgencySettings(
            primary_currency="USD",
            currency_symbol="$"
        )
        db_session.add(settings)
        await db_session.commit()
        
        # Create team member with zero hours (no fixed costs)
        member = TeamMember(
            name="Test Member Zero Hours",
            role="Developer",
            salary_monthly_brute=5000.00,
            billable_hours_per_week=0,
            currency="USD",
            is_active=True
        )
        db_session.add(member)
        await db_session.commit()
        
        result = await calculate_blended_cost_rate(db_session, "USD")
        
        # When hours_per_month is 0, the function should return 0.0
        # The calculation is: total_monthly_costs / hours_per_month
        # If hours_per_month is 0, it returns 0.0 (see calculations.py line 84)
        assert result == 0.0

