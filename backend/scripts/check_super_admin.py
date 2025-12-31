"""
Script para verificar y gestionar el usuario super admin
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
from app.core.security import verify_password, get_password_hash


async def check_super_admin():
    """Verificar estado del usuario super admin"""
    print("=" * 70)
    print("VERIFICACIÓN DE USUARIO SUPER ADMIN")
    print("=" * 70)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Buscar usuarios con rol super_admin
            result = await session.execute(
                select(User).where(User.role == 'super_admin')
            )
            super_admins = result.scalars().all()
            
            print(f"[INFO] Usuarios super_admin encontrados: {len(super_admins)}")
            print()
            
            if not super_admins:
                print("[ERROR] No se encontraron usuarios con rol super_admin")
                print()
                print("[INFO] Opciones:")
                print("   1. Crear un nuevo usuario super admin")
                print("   2. Verificar si hay usuarios en la base de datos")
                return
            
            # Verificar emails específicos
            emails_to_check = [
                'gerriarte@abralatam.com',
                'gerardoriarte@gmail.com'
            ]
            
            for email in emails_to_check:
                result = await session.execute(
                    select(User).where(User.email == email.lower())
                )
                user = result.scalar_one_or_none()
                
                if user:
                    print(f"[OK] Usuario encontrado: {user.email}")
                    print(f"   Nombre: {user.full_name}")
                    print(f"   Rol: {user.role}")
                    print(f"   Role Type: {user.role_type}")
                    print(f"   Organization ID: {user.organization_id}")
                    print(f"   Tiene password hash: {'SI' if user.hashed_password else 'NO'}")
                    if user.hashed_password:
                        print(f"   Password hash (primeros 30 chars): {user.hashed_password[:30]}...")
                    print()
                else:
                    print(f"[ERROR] Usuario NO encontrado: {email}")
                    print()
            
            # Mostrar todos los super admins
            print("[INFO] Todos los usuarios super_admin:")
            for user in super_admins:
                print(f"   - {user.email} ({user.full_name})")
                print(f"     Role Type: {user.role_type}")
                print(f"     Organization ID: {user.organization_id}")
                print(f"     Password hash: {'SI' if user.hashed_password else 'NO'}")
                print()
            
            # Verificar si gerriarte@abralatam.com existe pero no es super_admin
            result = await session.execute(
                select(User).where(User.email == 'gerriarte@abralatam.com')
            )
            user_gerriarte = result.scalar_one_or_none()
            
            if user_gerriarte and user_gerriarte.role != 'super_admin':
                print("[WARNING] ADVERTENCIA:")
                print(f"   El usuario gerriarte@abralatam.com existe pero NO tiene rol super_admin")
                print(f"   Rol actual: {user_gerriarte.role}")
                print()
                print("[INFO] Para convertirlo en super_admin:")
                print("   1. El email debe ser 'gerardoriarte@gmail.com' (según validación)")
                print("   2. O modificar la validación en app/core/permissions.py")
                print()
            
            # Verificar todos los usuarios
            all_users_result = await session.execute(select(User))
            all_users = all_users_result.scalars().all()
            print(f"[INFO] Total de usuarios en la BD: {len(all_users)}")
            print()
            
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(check_super_admin())

