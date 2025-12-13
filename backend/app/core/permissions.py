"""
Simplified permissions module: roles disabled, everything allowed.
"""

VALID_ROLES = {"super_admin", "admin_financiero", "product_manager"}


class PermissionError(Exception):
    """Legacy exception placeholder (not used when roles disabled)."""
    pass


def ensure_role_string(user) -> None:
    """Force user.role to 'super_admin' to avoid UI restrictions."""
    try:
        setattr(user, "role", "super_admin")
    except Exception:
        pass


def get_user_role(user) -> str:
    """Return 'super_admin' regardless of stored value."""
    ensure_role_string(user)
    return "super_admin"


def can_create(user, resource: str) -> bool:
    return True


def can_edit(user, resource: str) -> bool:
    return True


def can_delete(user, resource: str) -> tuple[bool, bool]:
    return True, False


def can_approve_deletions(user) -> bool:
    return True


def require_role(user, required_roles: list[str]):
    return


def require_super_admin(user):
    return
