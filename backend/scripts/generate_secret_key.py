"""
Script para generar una SECRET_KEY segura para producción
"""
import secrets

def generate_secret_key():
    """Genera una clave secreta segura de 32 bytes (256 bits)"""
    return secrets.token_urlsafe(32)

if __name__ == "__main__":
    key = generate_secret_key()
    print("=" * 60)
    print("SECRET_KEY generada para producción:")
    print("=" * 60)
    print(key)
    print("=" * 60)
    print("\n⚠️  IMPORTANTE:")
    print("- Guarda esta clave de forma segura")
    print("- NO la compartas públicamente")
    print("- Úsala solo en producción")
    print("- Si se compromete, genera una nueva inmediatamente")
    print("=" * 60)
