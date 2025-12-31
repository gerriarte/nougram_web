"""
Script para resetear la contraseña del usuario super admin
Permite resetear la contraseña de cualquier usuario super_admin
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


async def reset_super_admin_password():
    """Resetear contraseña del usuario super admin"""
    print("=" * 70)
    print("RESET DE CONTRASEÑA - SUPER ADMIN")
    print("=" * 70)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Buscar usuarios super_admin
            result = await session.execute(
                select(User).where(User.role == 'super_admin')
            )
            super_admins = result.scalars().all()
            
            if not super_admins:
                print("❌ No se encontraron usuarios con rol super_admin")
                print()
                print("💡 Opciones:")
                print("   1. Crear un nuevo usuario super admin")
                print("   2. Verificar usuarios existentes")
                return
            
            # Mostrar usuarios disponibles
            print("[INFO] Usuarios super_admin encontrados:")
            for idx, user in enumerate(super_admins, 1):
                print(f"   {idx}. {user.email} ({user.full_name})")
            print()
            
            # Seleccionar usuario
            if len(super_admins) == 1:
                selected_user = super_admins[0]
                print(f"[OK] Usuario seleccionado: {selected_user.email}")
            else:
                choice = input("Selecciona el numero del usuario (o Enter para el primero): ").strip()
                if choice.isdigit() and 1 <= int(choice) <= len(super_admins):
                    selected_user = super_admins[int(choice) - 1]
                else:
                    selected_user = super_admins[0]
                    print(f"[OK] Usuario seleccionado: {selected_user.email}")
            
            print()
            
            # Solicitar nueva contraseña
            print("[INFO] Nueva contraseña:")
            print("   (Deja vacio para usar contraseña por defecto: 'Abracolombia')")
            new_password = input("   Contraseña: ").strip()
            
            if not new_password:
                new_password = "Abracolombia"
                print(f"   Usando contraseña por defecto: {new_password}")
            
            if len(new_password) < 8:
                print("[WARNING] ADVERTENCIA: La contraseña tiene menos de 8 caracteres")
                confirm = input("   ¿Continuar de todas formas? (si/no): ").strip().lower()
                if confirm not in ['si', 'yes', 'y', 's']:
                    print("[ERROR] Operación cancelada")
                    return
            
            # Confirmar
            print()
            print(f"[WARNING] ADVERTENCIA: Se reseteara la contraseña para:")
            print(f"   Email: {selected_user.email}")
            print(f"   Nombre: {selected_user.full_name}")
            print()
            confirm = input("¿Continuar? (si/no): ").strip().lower()
            
            if confirm not in ['si', 'yes', 'y', 's']:
                print("[ERROR] Operación cancelada")
                return
            
            # Resetear contraseña
            print()
            print("[INFO] Reseteando contraseña...")
            
            hashed_password = get_password_hash(new_password)
            selected_user.hashed_password = hashed_password
            
            await session.commit()
            await session.refresh(selected_user)
            
            print("[OK] Contraseña reseteada exitosamente")
            print()
            print("[INFO] Detalles:")
            print(f"   Email: {selected_user.email}")
            print(f"   Nueva contraseña: {new_password}")
            print()
            print("[INFO] Ahora puedes iniciar sesión con estas credenciales")
            
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(reset_super_admin_password())

