"""
Pricing strategies for different pricing types using Strategy Pattern
"""
from abc import ABC, abstractmethod
from typing import Dict, Optional
from decimal import Decimal
from app.models.service import Service


class PricingStrategy(ABC):
    """
    Abstract base class for pricing strategies
    """
    
    @abstractmethod
    def calculate(
        self,
        item: Dict,
        service: Service,
        blended_cost_rate: float
    ) -> Dict[str, float]:
        """
        Calculate internal cost and client price for an item
        
        Args:
            item: Item dictionary with pricing information
            service: Service model instance
            blended_cost_rate: Current blended cost rate
            
        Returns:
            Dictionary with 'internal_cost' and 'client_price'
        """
        pass


class HourlyPricingStrategy(PricingStrategy):
    """
    Strategy for hourly pricing: Hours × BCR
    Note: client_price is calculated at quote level using target_margin_percentage
    """
    
    def calculate(
        self,
        item: Dict,
        service: Service,
        blended_cost_rate: float
    ) -> Dict[str, float]:
        """
        Calculate pricing for hourly services
        
        Args:
            item: Must contain 'estimated_hours'
            service: Service model (default_margin_target used as fallback if no quote-level margin)
            blended_cost_rate: Cost per hour
            
        Returns:
            Dictionary with internal_cost and client_price (client_price uses service margin as fallback)
        """
        estimated_hours = item.get("estimated_hours", 0)
        if estimated_hours <= 0:
            return {"internal_cost": 0.0, "client_price": 0.0}
        
        # Convert estimated_hours to float if it's Decimal to avoid type mixing
        estimated_hours_float = float(estimated_hours) if isinstance(estimated_hours, Decimal) else estimated_hours
        internal_cost = blended_cost_rate * estimated_hours_float
        
        # Calculate client price with service margin (fallback if no quote-level margin)
        # This will be overridden at quote level if target_margin_percentage is provided
        if service.default_margin_target and float(service.default_margin_target) > 0 and float(service.default_margin_target) < 1:
            # Convert Decimal to float to avoid type mixing in division
            margin_target_float = float(service.default_margin_target)
            client_price = internal_cost / (1 - margin_target_float)
        else:
            client_price = internal_cost  # Fallback if margin is invalid
        
        return {
            "internal_cost": internal_cost,
            "client_price": client_price  # Will be recalculated at quote level if target_margin_percentage is provided
        }


class FixedPricingStrategy(PricingStrategy):
    """
    Strategy for fixed pricing: fixed_price × quantity
    """
    
    def calculate(
        self,
        item: Dict,
        service: Service,
        blended_cost_rate: float
    ) -> Dict[str, float]:
        """
        Calculate pricing for fixed-price services
        
        Args:
            item: Must contain 'fixed_price' and optionally 'quantity' and 'estimated_hours'
            service: Service with fixed_price fallback
            blended_cost_rate: Cost per hour (for internal cost calculation)
            
        Returns:
            Dictionary with internal_cost and client_price
        """
        fixed_price = item.get("fixed_price") or service.fixed_price
        quantity = item.get("quantity", 1.0)
        
        if fixed_price is None or fixed_price <= 0:
            return {"internal_cost": 0.0, "client_price": 0.0}
        
        client_price = fixed_price * quantity
        
        # For fixed pricing, internal cost is calculated based on estimated hours if provided
        # Otherwise, we use a conservative estimate
        estimated_hours = item.get("estimated_hours")
        if estimated_hours and estimated_hours > 0:
            internal_cost = blended_cost_rate * estimated_hours * quantity
        else:
            # If no hours provided, assume internal cost is 60% of fixed price (conservative)
            internal_cost = (fixed_price * quantity) * 0.6
        
        return {
            "internal_cost": internal_cost,
            "client_price": client_price
        }


class RecurringPricingStrategy(PricingStrategy):
    """
    Strategy for recurring pricing: recurring_price based on billing frequency
    """
    
    def calculate(
        self,
        item: Dict,
        service: Service,
        blended_cost_rate: float
    ) -> Dict[str, float]:
        """
        Calculate pricing for recurring services
        
        Args:
            item: Must contain 'recurring_price' and optionally 'billing_frequency', 'quantity', 'estimated_hours'
            service: Service with recurring_price and billing_frequency fallbacks
            blended_cost_rate: Cost per hour (for internal cost calculation)
            
        Returns:
            Dictionary with internal_cost and client_price
        """
        recurring_price = item.get("recurring_price") or service.recurring_price
        billing_frequency = item.get("billing_frequency") or service.billing_frequency or "monthly"
        quantity = item.get("quantity", 1.0)
        
        if recurring_price is None or recurring_price <= 0:
            return {"internal_cost": 0.0, "client_price": 0.0}
        
        client_price = recurring_price * quantity
        
        # For recurring services, internal cost is based on estimated hours if provided
        # Otherwise, estimate based on typical allocation
        estimated_hours = item.get("estimated_hours")
        if estimated_hours and estimated_hours > 0:
            internal_cost = blended_cost_rate * estimated_hours
        else:
            # Estimate: monthly retainer typically uses ~20% of monthly billable hours
            # Assuming 160 billable hours/month, 20% = 32 hours
            estimated_monthly_hours = 32.0
            if billing_frequency == "annual":
                estimated_monthly_hours *= 12
            internal_cost = blended_cost_rate * estimated_monthly_hours * quantity
        
        return {
            "internal_cost": internal_cost,
            "client_price": client_price
        }


class ProjectValuePricingStrategy(PricingStrategy):
    """
    Strategy for project value pricing: Custom project value
    """
    
    def calculate(
        self,
        item: Dict,
        service: Service,
        blended_cost_rate: float
    ) -> Dict[str, float]:
        """
        Calculate pricing for project value services
        
        Args:
            item: Must contain 'project_value' or 'fixed_price' and optionally 'quantity' and 'estimated_hours'
            service: Service model (not used for this strategy)
            blended_cost_rate: Cost per hour (for internal cost calculation)
            
        Returns:
            Dictionary with internal_cost and client_price
        """
        project_value = item.get("project_value") or item.get("fixed_price")
        quantity = item.get("quantity", 1.0)
        
        if project_value is None or project_value <= 0:
            return {"internal_cost": 0.0, "client_price": 0.0}
        
        client_price = project_value * quantity
        
        # For project value, internal cost is based on estimated hours if provided
        estimated_hours = item.get("estimated_hours")
        if estimated_hours and estimated_hours > 0:
            internal_cost = blended_cost_rate * estimated_hours * quantity
        else:
            # If no hours, assume internal cost is 50% of project value
            internal_cost = (project_value * quantity) * 0.5
        
        return {
            "internal_cost": internal_cost,
            "client_price": client_price
        }


class PricingStrategyFactory:
    """
    Factory for creating pricing strategies based on pricing type
    """
    
    _strategies: Dict[str, PricingStrategy] = {
        "hourly": HourlyPricingStrategy(),
        "fixed": FixedPricingStrategy(),
        "recurring": RecurringPricingStrategy(),
        "project_value": ProjectValuePricingStrategy(),
    }
    
    @classmethod
    def get_strategy(cls, pricing_type: Optional[str]) -> PricingStrategy:
        """
        Get pricing strategy for the given pricing type
        
        Args:
            pricing_type: Type of pricing (hourly, fixed, recurring, project_value)
            
        Returns:
            PricingStrategy instance (defaults to HourlyPricingStrategy)
        """
        if not pricing_type:
            pricing_type = "hourly"
        
        return cls._strategies.get(pricing_type, cls._strategies["hourly"])
    
    @classmethod
    def register_strategy(cls, pricing_type: str, strategy: PricingStrategy):
        """
        Register a new pricing strategy (for extensibility)
        
        Args:
            pricing_type: Type identifier for the strategy
            strategy: PricingStrategy instance
        """
        cls._strategies[pricing_type] = strategy




