"""Script para probar el login"""
import asyncio
import httpx
from app.core.security import verify_password, get_password_hash
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User

async def test_password_verification():
    """Probar verificación de contraseña directamente"""
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.email == 'gerriarte@abralatam.com')
        )
        user = result.scalar_one_or_none()
        
        if user and user.hashed_password:
            test_password = "Abracolombia"
            is_valid = verify_password(test_password, user.hashed_password)
            print(f"Verificacion de contraseña '{test_password}': {is_valid}")
            
            if not is_valid:
                print("\n[ERROR] La contraseña no coincide!")
                print("Generando nuevo hash para la contraseña...")
                new_hash = get_password_hash(test_password)
                print(f"Nuevo hash: {new_hash}")
        else:
            print("[ERROR] Usuario no encontrado o sin password hash")
    
    await engine.dispose()

async def test_api_login():
    """Probar el endpoint de login via API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:5000/api/v1/auth/login",
                json={
                    "email": "gerriarte@abralatam.com",
                    "password": "Abracolombia"
                },
                timeout=5.0
            )
            print(f"\n[API TEST] Status: {response.status_code}")
            print(f"[API TEST] Response: {response.text}")
            if response.status_code == 200:
                data = response.json()
                print(f"[API TEST] Token recibido: {data.get('access_token', 'N/A')[:50]}...")
    except Exception as e:
        print(f"[API TEST] Error: {e}")

if __name__ == "__main__":
    print("=== Test de Verificacion de Contraseña ===")
    asyncio.run(test_password_verification())
    print("\n=== Test de API Login ===")
    asyncio.run(test_api_login())












