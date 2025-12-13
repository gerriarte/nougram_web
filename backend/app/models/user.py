"""
User model for authentication
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """
    User model for authentication and authorization
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    google_refresh_token = Column(String, nullable=True)  # Encrypted
    # Roles: non-disruptive string-based role (nullable, defaults handled at DB/migration)
    role = Column(String(32), nullable=True, index=True)
    
    # Multi-tenant: organization relationship
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    team_member = relationship("TeamMember", back_populates="user", uselist=False)
    # Note: delete_requests relationships disabled (rollback from roles system)


