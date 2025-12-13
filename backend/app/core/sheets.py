"""
Google Sheets integration utilities
"""
from typing import Optional, Dict, List
import gspread
from google.oauth2.service_account import Credentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.cost import CostFixed
from app.models.team import TeamMember
from app.models.user import User


def get_sheets_client() -> Optional[gspread.Client]:
    """
    Get Google Sheets client using Service Account
    
    Returns:
        gspread.Client instance or None if error
    """
    try:
        # Load credentials from service account JSON file
        creds = Credentials.from_service_account_file(
            settings.GOOGLE_SERVICE_ACCOUNT_PATH,
            scopes=[
                'https://www.googleapis.com/auth/spreadsheets.readonly'
            ]
        )
        
        client = gspread.authorize(creds)
        return client
        
    except Exception as e:
        print(f"Error getting Google Sheets client: {e}")
        return None


async def sync_google_sheets_data(
    sheet_id: Optional[str] = None,
    range_name: Optional[str] = None,
    db: AsyncSession = None
) -> Dict:
    """
    Sync data from Google Sheets to database
    
    Args:
        sheet_id: Google Sheets ID (uses default from config if not provided)
        range_name: Range to sync (e.g., 'Sheet1!A1:Z100')
        db: Database session
        
    Returns:
        Dict with sync results
    """
    try:
        client = get_sheets_client()
        
        if not client:
            return {
                "success": False,
                "message": "Failed to initialize Google Sheets client",
                "records_synced": 0,
                "errors": ["Could not authenticate with Google Sheets"]
            }
        
        # Use configured sheet ID or provided one
        sheet_id_to_use = sheet_id or settings.GOOGLE_SHEETS_ID
        
        if not sheet_id_to_use:
            return {
                "success": False,
                "message": "No Google Sheets ID provided",
                "records_synced": 0,
                "errors": ["GOOGLE_SHEETS_ID not configured"]
            }
        
        # Open the spreadsheet
        spreadsheet = client.open_by_key(sheet_id_to_use)
        
        records_synced = 0
        errors = []
        
        # Sync Fixed Costs (from "Costs" sheet)
        try:
            costs_sheet = spreadsheet.worksheet("Costs")
            costs_data = costs_sheet.get_all_records()
            
            for row in costs_data:
                try:
                    # Check if cost already exists
                    result = await db.execute(
                        select(CostFixed).where(
                            CostFixed.name == row.get("name", "")
                        )
                    )
                    existing = result.scalar_one_or_none()
                    
                    if existing:
                        # Update existing cost
                        existing.amount_monthly = float(row.get("amount_monthly", 0))
                        existing.category = row.get("category", "")
                    else:
                        # Create new cost
                        new_cost = CostFixed(
                            name=row.get("name", ""),
                            amount_monthly=float(row.get("amount_monthly", 0)),
                            category=row.get("category", "general")
                        )
                        db.add(new_cost)
                    
                    records_synced += 1
                except Exception as e:
                    errors.append(f"Error syncing cost row: {str(e)}")
            
            await db.commit()
            
        except Exception as e:
            errors.append(f"Error syncing costs sheet: {str(e)}")
        
        # Sync Team Members (from "Team" sheet)
        try:
            team_sheet = spreadsheet.worksheet("Team")
            team_data = team_sheet.get_all_records()
            
            for row in team_data:
                try:
                    # Check if team member already exists
                    result = await db.execute(
                        select(TeamMember).where(
                            TeamMember.name == row.get("name", "")
                        )
                    )
                    existing = result.scalar_one_or_none()
                    
                    if existing:
                        # Update existing member
                        existing.salary_monthly_brute = float(row.get("salary_monthly_brute", 0))
                        existing.billable_hours_per_week = float(row.get("billable_hours_per_week", 40))
                        existing.role = row.get("role", "")
                        existing.is_active = row.get("is_active", True)
                    else:
                        # Create new member (would need user_id, but for now skip)
                        # In production, you'd need to map email to user_id
                        errors.append(f"New team member '{row.get('name')}' requires user association")
                    
                    records_synced += 1
                except Exception as e:
                    errors.append(f"Error syncing team member row: {str(e)}")
            
            await db.commit()
            
        except Exception as e:
            errors.append(f"Error syncing team sheet: {str(e)}")
        
        return {
            "success": len(errors) == 0,
            "message": f"Synced {records_synced} records from Google Sheets",
            "records_synced": records_synced,
            "errors": errors
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error syncing Google Sheets: {str(e)}",
            "records_synced": 0,
            "errors": [str(e)]
        }

