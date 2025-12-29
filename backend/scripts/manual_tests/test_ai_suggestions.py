"""
Script de prueba para el endpoint de sugerencias de IA
Ejecutar: python -m scripts.manual_tests.test_ai_suggestions
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_path))

from app.services.ai_service import ai_service


async def test_ai_suggestions():
    """Test AI suggestions endpoint"""
    print("=" * 60)
    print("Testing AI Suggestions Service")
    print("=" * 60)
    
    # Check if AI service is available
    if not ai_service.is_available():
        print("\n❌ AI Service is NOT available")
        print("   Please set OPENAI_API_KEY in your environment variables")
        print("   Example: export OPENAI_API_KEY='sk-...'")
        return False
    
    print("\n✅ AI Service is available")
    
    # Test parameters
    industry = "Marketing Digital"
    region = "CO"
    currency = "COP"
    custom_context = "Agencia enfocada en SEO y contenido"
    
    print(f"\n📋 Test Parameters:")
    print(f"   Industry: {industry}")
    print(f"   Region: {region}")
    print(f"   Currency: {currency}")
    print(f"   Custom Context: {custom_context}")
    
    print("\n🔄 Generating suggestions...")
    
    try:
        result = await ai_service.suggest_onboarding_data(
            industry=industry,
            region=region,
            currency=currency,
            custom_context=custom_context
        )
        
        if not result.get('success'):
            print(f"\n❌ Error: {result.get('error')}")
            return False
        
        data = result.get('data', {})
        usage = result.get('usage', {})
        
        print("\n✅ Suggestions generated successfully!")
        print(f"\n📊 Usage:")
        print(f"   Prompt tokens: {usage.get('prompt_tokens', 0)}")
        print(f"   Completion tokens: {usage.get('completion_tokens', 0)}")
        print(f"   Total tokens: {usage.get('total_tokens', 0)}")
        print(f"   Estimated cost: ${usage.get('estimated_cost', 0):.4f}")
        
        print(f"\n👥 Suggested Roles: {len(data.get('suggested_roles', []))}")
        for i, role in enumerate(data.get('suggested_roles', [])[:3], 1):
            print(f"   {i}. {role.get('name')} - {role.get('role')} ({role.get('currency')} {role.get('salary_monthly_brute'):,.0f}/mes)")
        
        print(f"\n📦 Suggested Services: {len(data.get('suggested_services', []))}")
        for i, service in enumerate(data.get('suggested_services', [])[:3], 1):
            print(f"   {i}. {service.get('name')} - {service.get('pricing_type')} (margin: {service.get('default_margin_target', 0)*100:.0f}%)")
        
        print(f"\n💰 Suggested Fixed Costs: {len(data.get('suggested_fixed_costs', []))}")
        for i, cost in enumerate(data.get('suggested_fixed_costs', [])[:3], 1):
            print(f"   {i}. {cost.get('name')} - {cost.get('category')} ({cost.get('currency')} {cost.get('amount_monthly', 0):,.0f}/mes)")
        
        confidence = data.get('confidence_scores', {})
        if confidence:
            print(f"\n🎯 Confidence Scores:")
            print(f"   Roles: {confidence.get('roles', 0)*100:.0f}%")
            print(f"   Services: {confidence.get('services', 0)*100:.0f}%")
            print(f"   Costs: {confidence.get('costs', 0)*100:.0f}%")
        
        if data.get('reasoning'):
            print(f"\n💭 AI Reasoning:")
            print(f"   {data.get('reasoning')[:200]}...")
        
        print("\n" + "=" * 60)
        print("✅ Test completed successfully!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(test_ai_suggestions())
    sys.exit(0 if success else 1)

