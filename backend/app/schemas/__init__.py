"""
Pydantic schemas for request/response validation
"""
from app.schemas.cost import (
    CostFixedCreate,
    CostFixedUpdate,
    CostFixedResponse,
    CostFixedListResponse,
)
from app.schemas.team import (
    TeamMemberCreate,
    TeamMemberUpdate,
    TeamMemberResponse,
    TeamMemberListResponse,
)
from app.schemas.service import (
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    ServiceListResponse,
)
from app.schemas.quote import (
    QuoteItemCreate as QuoteItemCreateBase,
    QuoteCalculateRequest,
    QuoteCalculateResponse,
    BlendedCostRateResponse,
    CurrencyInfo,
    QuoteItemResponse as QuoteItemResponseBase,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectCreateWithQuote,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    QuoteResponse,
    QuoteResponseWithItems,
    QuoteItemCreate,
    QuoteItemResponse,
)
from app.schemas.auth import (
    GoogleLoginRequest,
    GoogleConnectRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.integration import (
    ApolloSearchRequest,
    ApolloSearchResponse,
    GoogleSheetsSyncRequest,
    GoogleSheetsSyncResponse,
)
from app.schemas.insight import (
    AIAdvisorRequest,
    AIAdvisorResponse,
)
from app.schemas.common import ResponseBase, ErrorResponse

__all__ = [
    # Cost schemas
    "CostFixedCreate",
    "CostFixedUpdate",
    "CostFixedResponse",
    "CostFixedListResponse",
    # Team schemas
    "TeamMemberCreate",
    "TeamMemberUpdate",
    "TeamMemberResponse",
    "TeamMemberListResponse",
    # Service schemas
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceResponse",
    "ServiceListResponse",
    # Quote schemas
    "QuoteItemCreateBase",
    "QuoteCalculateRequest",
    "QuoteCalculateResponse",
    "BlendedCostRateResponse",
    "CurrencyInfo",
    "QuoteItemResponseBase",
    # Project schemas
    "ProjectCreate",
    "ProjectCreateWithQuote",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectListResponse",
    "QuoteResponse",
    "QuoteResponseWithItems",
    "QuoteItemCreate",
    "QuoteItemResponse",
    # Auth schemas
    "GoogleLoginRequest",
    "GoogleConnectRequest",
    "TokenResponse",
    "UserResponse",
    # Integration schemas
    "ApolloSearchRequest",
    "ApolloSearchResponse",
    "GoogleSheetsSyncRequest",
    "GoogleSheetsSyncResponse",
    # Insight schemas
    "AIAdvisorRequest",
    "AIAdvisorResponse",
    # Common schemas
    "ResponseBase",
    "ErrorResponse",
]



