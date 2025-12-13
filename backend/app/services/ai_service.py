"""
AI Service for financial analysis using OpenAI GPT-4
"""
from typing import Dict, List, Optional
from openai import AsyncOpenAI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered financial analysis"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
        if not api_key:
            logger.warning("OPENAI_API_KEY not configured. AI features will be disabled.")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=api_key)
    
    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.client is not None
    
    async def analyze_financial_data(
        self,
        context: Dict,
        question: Optional[str] = None
    ) -> Dict:
        """
        Analyze financial data and provide insights
        
        Args:
            context: Dictionary with financial data (projects, costs, team, etc.)
            question: Optional specific question from user
            
        Returns:
            Dictionary with analysis and recommendations
        """
        if not self.is_available():
            return {
                "error": "AI service not configured. Please set OPENAI_API_KEY.",
                "success": False
            }
        
        try:
            # Build prompt with context
            prompt = self._build_financial_prompt(context, question)
            
            # Call GPT-4
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": """Eres un CFO experto y asesor financiero para agencias digitales.
                        
Tu objetivo es analizar datos financieros y proporcionar:
1. Análisis claro y estructurado
2. Insights accionables
3. Recomendaciones específicas con números
4. Identificación de riesgos y oportunidades

Responde SIEMPRE en español.
Usa emojis para mejor legibilidad: 📊 📈 💰 ⚠️ ✅ 🎯 💡
Sé directo y específico con los números.
Prioriza recomendaciones por impacto esperado."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "success": True,
                "analysis": analysis,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                    "estimated_cost": self._estimate_cost(response.usage)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {e}")
            return {
                "error": f"Error al analizar: {str(e)}",
                "success": False
            }
    
    def _build_financial_prompt(
        self,
        context: Dict,
        question: Optional[str] = None
    ) -> str:
        """Build prompt with financial context"""
        
        # Extract data from context
        total_costs = context.get('total_monthly_costs', 0)
        blended_rate = context.get('blended_cost_rate', 0)
        team_size = context.get('team_size', 0)
        total_hours = context.get('total_monthly_hours', 0)
        projects = context.get('projects', [])
        services = context.get('services', [])
        primary_currency = context.get('primary_currency', 'USD')
        
        # Calculate project metrics
        total_revenue = sum(p.get('total_price', 0) for p in projects)
        won_projects = [p for p in projects if p.get('status') == 'won']
        lost_projects = [p for p in projects if p.get('status') == 'lost']
        avg_margin = sum(p.get('margin_percentage', 0) for p in projects) / len(projects) if projects else 0
        
        # Build context string
        context_str = f"""
CONTEXTO FINANCIERO DE LA AGENCIA:

📊 COSTOS OPERATIVOS:
- Costos fijos mensuales: ${total_costs:,.2f} {primary_currency}
- Blended Cost Rate (costo por hora): ${blended_rate:.2f}/hora
- Equipo: {team_size} personas
- Horas disponibles/mes: {total_hours} horas

💼 PROYECTOS ({len(projects)} total):
- Proyectos ganados: {len(won_projects)}
- Proyectos perdidos: {len(lost_projects)}
- Ingresos totales: ${total_revenue:,.2f}
- Margen promedio: {avg_margin:.1f}%

🛠️ SERVICIOS ({len(services)} servicios):
"""
        
        # Add top services
        for service in services[:5]:
            context_str += f"- {service.get('name')}: Margen objetivo {service.get('default_margin_target', 0)*100:.0f}%\n"
        
        # Add recent projects summary
        if projects:
            context_str += "\n📈 PROYECTOS RECIENTES:\n"
            for i, project in enumerate(projects[:5], 1):
                status_emoji = "✅" if project.get('status') == 'won' else "❌" if project.get('status') == 'lost' else "⏳"
                context_str += f"{i}. {status_emoji} {project.get('name')}: ${project.get('total_price', 0):,.2f}, Margen: {project.get('margin_percentage', 0):.1f}%\n"
        
        # Add user question or default analysis request
        if question:
            context_str += f"\n\n❓ PREGUNTA ESPECÍFICA:\n{question}"
        else:
            context_str += """

📋 ANÁLISIS REQUERIDO:
Por favor proporciona:

1. 📊 RESUMEN EJECUTIVO: Estado general de la salud financiera

2. 💡 INSIGHTS CLAVE: 3-5 observaciones importantes sobre los datos

3. ⚠️ RIESGOS IDENTIFICADOS: Qué problemas o alertas ves

4. 🎯 OPORTUNIDADES: Dónde hay potencial de mejora

5. 🚀 RECOMENDACIONES: 3-5 acciones concretas priorizadas por impacto esperado
   (incluye números y métricas específicas)
"""
        
        return context_str
    
    def _estimate_cost(self, usage) -> float:
        """Estimate cost of API call in USD"""
        # GPT-4 Turbo pricing
        input_cost = (usage.prompt_tokens / 1000) * 0.01
        output_cost = (usage.completion_tokens / 1000) * 0.03
        return round(input_cost + output_cost, 4)


# Singleton instance
ai_service = AIService()

