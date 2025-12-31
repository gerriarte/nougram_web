"""
Script simple para resetear contraseña del super admin
Ejecutar desde el directorio backend
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash


async def reset_password_simple():
    """Resetear contraseña del super admin"""
    print("=" * 70)
    print("RESET DE CONTRASEÑA - SUPER ADMIN")
    print("=" * 70)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Buscar usuario gerriarte@abralatam.com
            result = await session.execute(
                select(User).where(User.email == 'gerriarte@abralatam.com')
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print("[ERROR] Usuario gerriarte@abralatam.com NO encontrado")
                return
            
            print(f"[OK] Usuario encontrado: {user.email}")
            print(f"   Nombre: {user.full_name}")
            print(f"   Rol: {user.role}")
            print()
            
            # Resetear a contraseña conocida
            new_password = "Abracolombia"
            print(f"[INFO] Reseteando contraseña a: {new_password}")
            
            hashed_password = get_password_hash(new_password)
            user.hashed_password = hashed_password
            
            # Asegurar que el rol sea super_admin
            if user.role != 'super_admin':
                print(f"[WARNING] Cambiando rol de '{user.role}' a 'super_admin'")
                user.role = 'super_admin'
            
            # Asegurar que role_type sea support
            if user.role_type != 'support':
                print(f"[INFO] Estableciendo role_type a 'support'")
                user.role_type = 'support'
            
            await session.commit()
            await session.refresh(user)
            
            print()
            print("=" * 70)
            print("[OK] CONTRASEÑA RESETEADA EXITOSAMENTE")
            print("=" * 70)
            print()
            print("[INFO] Credenciales:")
            print(f"   Email: {user.email}")
            print(f"   Contraseña: {new_password}")
            print()
            print("[INFO] Ahora puedes iniciar sesión con estas credenciales")
            print()
            
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(reset_password_simple())

