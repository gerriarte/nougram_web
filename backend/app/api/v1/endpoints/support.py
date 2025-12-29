"""
Support endpoints for support roles (support_manager, data_analyst, super_admin).

Support personnel must see anonymized data by default, while super_admin may
see raw values. This module centralizes those read-only helper APIs.
"""

from __future__ import annotations

import csv
from io import StringIO
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.logging import get_logger
from app.core.permission_middleware import require_support_role_decorator
from app.core.permissions import get_user_role
from app.models.project import Project, Quote
from app.models.team import TeamMember
from app.models.user import User
from app.repositories.organization_repository import OrganizationRepository
from app.services.credit_service import CreditService
from app.services.data_anonymizer import (
    anonymize_organization_data,
    anonymize_project_cost_data,
    anonymize_quote_totals,
    anonymize_team_salaries,
    anonymize_usage_metrics,
)
from app.schemas.organization import OrganizationResponse

logger = get_logger(__name__)

router = APIRouter(prefix="/support", tags=["Support"])
require_support_user = require_support_role_decorator(
    ["super_admin", "support_manager", "data_analyst"]
)


def _is_super_admin(user: User) -> bool:
    return get_user_role(user) == "super_admin"


async def _count_quotes(db: AsyncSession, organization_id: int) -> int:
    stmt = (
        select(func.count(Quote.id))
        .join(Project, Quote.project_id == Project.id)
        .where(Project.organization_id == organization_id)
    )
    result = await db.execute(stmt)
    return result.scalar() or 0


async def _load_projects(
    db: AsyncSession, organization_ids: Optional[List[int]] = None
) -> List[Project]:
    stmt = select(Project).options(selectinload(Project.quotes))
    if organization_ids:
        stmt = stmt.where(Project.organization_id.in_(organization_ids))
    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


async def _load_quotes(
    db: AsyncSession, organization_ids: Optional[List[int]] = None
) -> List[Quote]:
    stmt = select(Quote)
    if organization_ids:
        stmt = stmt.where(Quote.organization_id.in_(organization_ids))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def _load_team_members(
    db: AsyncSession, organization_ids: Optional[List[int]] = None
) -> List[TeamMember]:
    stmt = select(TeamMember)
    if organization_ids:
        stmt = stmt.where(TeamMember.organization_id.in_(organization_ids))
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/organizations", summary="List organizations for support roles")
async def list_support_organizations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    include_inactive: bool = Query(False),
    current_user: User = Depends(require_support_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    repo = OrganizationRepository(db)
    organizations, total = await repo.list_all(
        page=page, page_size=page_size, include_inactive=include_inactive
    )

    if _is_super_admin(current_user):
        items = [
            OrganizationResponse.model_validate(org).model_dump()
            for org in organizations
        ]
    else:
        items = [anonymize_organization_data(org) for org in organizations]

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size if total else 0,
    }


@router.get(
    "/organizations/{organization_id}",
    summary="Get organization details (anonymized for support)",
)
async def get_support_organization(
    organization_id: int,
    current_user: User = Depends(require_support_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    repo = OrganizationRepository(db)
    organization = await repo.get_by_id(organization_id)
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization {organization_id} not found",
        )

    if _is_super_admin(current_user):
        return OrganizationResponse.model_validate(organization).model_dump()

    return anonymize_organization_data(organization)


@router.get(
    "/organizations/{organization_id}/usage",
    summary="Usage metrics (anonymized) for support roles",
)
async def get_support_organization_usage(
    organization_id: int,
    current_user: User = Depends(require_support_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    repo = OrganizationRepository(db)
    organization = await repo.get_by_id(organization_id)
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization {organization_id} not found",
        )

    user_count = await repo.get_user_count(organization_id)
    project_count = await repo.get_project_count(organization_id)
    quote_count = await _count_quotes(db, organization_id)
    balance = await CreditService.get_credit_balance(organization_id, db)

    if _is_super_admin(current_user):
        return {
            "organization": OrganizationResponse.model_validate(
                organization
            ).model_dump(),
            "metrics": {
                "user_count": user_count,
                "project_count": project_count,
                "quote_count": quote_count,
                "credits_available": balance.get("credits_available"),
                "credits_used_this_month": balance.get("credits_used_this_month"),
            },
        }

    metrics = anonymize_usage_metrics(
        user_count=user_count,
        project_count=project_count,
        quote_count=quote_count,
        credits_available=balance.get("credits_available"),
        credits_used_this_month=balance.get("credits_used_this_month"),
    )
    return {
        "organization": anonymize_organization_data(organization),
        "metrics": metrics,
    }


async def _build_datasets(
    db: AsyncSession, org_ids: Optional[List[int]], include_sensitive: bool
) -> Dict[str, Any]:
    repo = OrganizationRepository(db)
    if org_ids:
        organizations = [await repo.get_by_id(org_id) for org_id in org_ids]
        organizations = [org for org in organizations if org]
    else:
        organizations, _ = await repo.list_all(page=1, page_size=500, include_inactive=True)

    organization_ids = [org.id for org in organizations]
    projects = await _load_projects(db, organization_ids)
    quotes = await _load_quotes(db, organization_ids)
    team_members = await _load_team_members(db, organization_ids)

    organizations_payload = [
        OrganizationResponse.model_validate(org).model_dump()
        if include_sensitive
        else anonymize_organization_data(org)
        for org in organizations
    ]
    projects_payload = [
        {
            "id": project.id,
            "name": project.name,
            "client_name": project.client_name,
            "status": project.status,
            "organization_id": project.organization_id,
            "created_at": project.created_at.isoformat() if project.created_at else None,
        }
        if include_sensitive
        else anonymize_project_cost_data(project, getattr(project, "currency", "USD"))
        for project in projects
    ]
    quotes_payload = [
        {
            "id": quote.id,
            "project_id": quote.project_id,
            "version": quote.version,
            "total_internal_cost": float(quote.total_internal_cost),
            "total_client_price": float(quote.total_client_price),
            "margin_percentage": quote.margin_percentage,
            "notes": quote.notes,
        }
        if include_sensitive
        else anonymize_quote_totals(quote, getattr(quote, "currency", "USD"))
        for quote in quotes
    ]
    team_payload = [
        {
            "id": member.id,
            "name": member.name,
            "role": member.role,
            "salary_monthly_brute": float(member.salary_monthly_brute)
            if member.salary_monthly_brute
            else None,
            "currency": member.currency,
            "organization_id": member.organization_id,
        }
        if include_sensitive
        else anonymize_team_salaries([member], member.currency or "USD")[0]
        for member in team_members
    ]

    return {
        "organizations": organizations_payload,
        "projects": projects_payload,
        "quotes": quotes_payload,
        "team_members": team_payload,
    }


@router.get(
    "/datasets",
    summary="Get anonymized datasets",
    description="Returns anonymized datasets. Super admins receive raw values.",
)
async def get_anonymized_datasets(
    dataset_type: Optional[str] = Query(
        None, description="organizations, projects, quotes or team_members"
    ),
    organization_id: Optional[int] = Query(
        None, description="Optional organization filter"
    ),
    current_user: User = Depends(require_support_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    org_ids = [organization_id] if organization_id else None
    datasets = await _build_datasets(
        db=db,
        org_ids=org_ids,
        include_sensitive=_is_super_admin(current_user),
    )

    if dataset_type:
        if dataset_type not in datasets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid dataset_type '{dataset_type}'. "
                f"Valid options: {list(datasets.keys())}",
            )
        return {dataset_type: datasets[dataset_type]}

    return datasets


@router.post("/datasets/export", summary="Export datasets as JSON or CSV")
async def export_anonymized_dataset(
    dataset_type: str = Query(
        ..., description="organizations, projects, quotes or team_members"
    ),
    export_format: str = Query("json", description="json or csv"),
    current_user: User = Depends(require_support_user),
    db: AsyncSession = Depends(get_db),
):
    dataset = await get_anonymized_datasets(
        dataset_type=dataset_type,
        organization_id=None,
        current_user=current_user,
        db=db,
    )
    data = dataset.get(dataset_type, [])

    if export_format.lower() == "json":
        return JSONResponse(content=data)

    if export_format.lower() == "csv":
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data available for dataset '{dataset_type}'",
            )
        if not isinstance(data, list) or not isinstance(data[0], dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV export requires a list of dictionaries",
            )

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
        writer.writeheader()
        writer.writerows(data)
        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{dataset_type}_anonymized.csv"'
            },
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid export_format. Use 'json' or 'csv'.",
    )
