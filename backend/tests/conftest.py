"""
Pytest configuration and shared fixtures
"""
import pytest
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.config import settings
from app.models.user import User
from app.models.service import Service
from app.models.cost import CostFixed
from app.models.team import TeamMember
from app.models.settings import AgencySettings
from app.core.security import get_password_hash


# Test database URL (SQLite in-memory for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session"""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user"""
    user = User(
        email="test@example.com",
        full_name="Test User",
        role="product_manager",
        hashed_password=get_password_hash("testpassword123")
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
    """Create a test admin user"""
    user = User(
        email="admin@example.com",
        full_name="Admin User",
        role="super_admin",
        hashed_password=get_password_hash("adminpassword123")
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_settings(db_session: AsyncSession) -> AgencySettings:
    """Create test agency settings"""
    settings = AgencySettings(
        primary_currency="USD",
        currency_symbol="$"
    )
    db_session.add(settings)
    await db_session.commit()
    await db_session.refresh(settings)
    return settings


@pytest.fixture
async def test_service(db_session: AsyncSession) -> Service:
    """Create a test service"""
    service = Service(
        name="Test Service",
        description="Test service description",
        default_margin_target=0.30,
        is_active=True
    )
    db_session.add(service)
    await db_session.commit()
    await db_session.refresh(service)
    return service


@pytest.fixture
async def test_cost(db_session: AsyncSession) -> CostFixed:
    """Create a test fixed cost"""
    cost = CostFixed(
        name="Test Cost",
        amount_monthly=1000.0,
        currency="USD",
        category="Overhead",
        description="Test cost description"
    )
    db_session.add(cost)
    await db_session.commit()
    await db_session.refresh(cost)
    return cost


@pytest.fixture
async def test_team_member(db_session: AsyncSession, test_user: User) -> TeamMember:
    """Create a test team member"""
    member = TeamMember(
        user_id=test_user.id,
        name="Test Member",
        role="Developer",
        salary_monthly_brute=5000.0,
        currency="USD",
        billable_hours_per_week=40,
        is_active=True
    )
    db_session.add(member)
    await db_session.commit()
    await db_session.refresh(member)
    return member


@pytest.fixture
async def async_client(db_session: AsyncSession) -> AsyncGenerator:
    """Create an async test client for FastAPI with test database override"""
    from httpx import AsyncClient, ASGITransport
    from typing import AsyncGenerator
    from main import app
    from app.core.database import get_db
    
    # Override get_db dependency to use test database session
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client
    
    # Clean up overrides
    app.dependency_overrides.clear()

