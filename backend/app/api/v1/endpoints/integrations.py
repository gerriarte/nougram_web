"""
Third-party integrations endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.apollo import search_apollo
from app.core.sheets import sync_google_sheets_data
from app.models.user import User
from app.schemas.integration import (
    ApolloSearchRequest,
    ApolloSearchResponse,
    GoogleSheetsSyncRequest,
    GoogleSheetsSyncResponse,
)

router = APIRouter()


@router.get("/apollo/search", response_model=ApolloSearchResponse)
async def search_apollo_endpoint(
    query: str = Query(..., description="Search query"),
    search_type: str = Query(default="people", description="Type of search: 'people' or 'companies'"),
    limit: int = Query(default=10, ge=1, le=50, description="Maximum number of results"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search Apollo.io for contacts/companies
    
    This endpoint allows searching for people or companies in Apollo.io
    to help autocomplete client information in the quote form.
    """
    try:
        result = await search_apollo(query, search_type)
        
        if "error" in result:
            return ApolloSearchResponse(
                results=[],
                total=0,
                query=query,
                error=result.get("error")
            )
        
        # Extract results based on search type
        if search_type == "companies":
            organizations = result.get("organizations", [])
            return ApolloSearchResponse(
                results=organizations[:limit],
                total=result.get("pagination", {}).get("total", len(organizations)),
                query=query
            )
        else:
            people = result.get("people", [])
            return ApolloSearchResponse(
                results=people[:limit],
                total=result.get("pagination", {}).get("total", len(people)),
                query=query
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching Apollo.io: {str(e)}"
        )


@router.post("/sheets/sync", response_model=GoogleSheetsSyncResponse)
async def sync_google_sheets_endpoint(
    request: GoogleSheetsSyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Sync data from Google Sheets
    
    This endpoint syncs data from a Google Sheet (costs, team members, etc.)
    using the configured Service Account.
    """
    try:
        result = await sync_google_sheets_data(
            sheet_id=request.sheet_id,
            range_name=request.range,
            db=db
        )
        
        return GoogleSheetsSyncResponse(
            success=result.get("success", False),
            message=result.get("message", ""),
            records_synced=result.get("records_synced", 0),
            errors=result.get("errors", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing Google Sheets: {str(e)}"
        )



