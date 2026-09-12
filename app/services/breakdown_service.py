from sqlalchemy.orm import Session

from app.models.breakdown import BreakdownRequest
from app.schemas.breakdown import BreakdownStatus

from app.services.location_service import find_nearby_providers,rank_providers
from app.services.problem_mapping import get_required_service

from fastapi import HTTPException, status

from app.models.breakdown import BreakdownRequest
from app.services.location_service import (
    find_nearby_providers,
    rank_providers,
)
from app.services.problem_mapping import get_required_service

ALLOWED_STATUS_TRANSITIONS = {
    BreakdownStatus.PENDING: {
        BreakdownStatus.SEARCHING,
        BreakdownStatus.CANCELLED,
    },

    BreakdownStatus.SEARCHING: {
        BreakdownStatus.PROVIDER_ASSIGNED,
        BreakdownStatus.CANCELLED,
    },

    BreakdownStatus.PROVIDER_ASSIGNED: {
        BreakdownStatus.PROVIDER_EN_ROUTE,
        BreakdownStatus.CANCELLED,
    },

    BreakdownStatus.PROVIDER_EN_ROUTE: {
        BreakdownStatus.ARRIVED,
        BreakdownStatus.CANCELLED,
    },

    BreakdownStatus.ARRIVED: {
        BreakdownStatus.IN_PROGRESS,
        BreakdownStatus.CANCELLED,
    },

    BreakdownStatus.IN_PROGRESS: {
        BreakdownStatus.COMPLETED,
    },

    BreakdownStatus.COMPLETED: set(),

    BreakdownStatus.CANCELLED: set(),
}


def create_breakdown(
    db: Session,
    user_id: int,
    vehicle_id: int,
    problem_type: str,
    description: str | None,
    latitude: float,
    longitude: float,
) -> BreakdownRequest:
    """
    Create a new breakdown request.
    """

    breakdown = BreakdownRequest(
        user_id=user_id,
        vehicle_id=vehicle_id,
        problem_type=problem_type,
        description=description,
        latitude=latitude,
        longitude=longitude,
        status="PENDING",
    )

    db.add(breakdown)
    db.commit()
    db.refresh(breakdown)

    return breakdown


def get_user_breakdowns(
    db: Session,
    user_id: int,
) -> list[BreakdownRequest]:
    """
    Return all breakdown requests belonging to a user.
    """

    return (
        db.query(BreakdownRequest)
        .filter(
            BreakdownRequest.user_id == user_id
        )
        .order_by(
            BreakdownRequest.id.desc()
        )
        .all()
    )


def get_user_breakdown(
    db: Session,
    user_id: int,
    breakdown_id: int,
) -> BreakdownRequest | None:
    """
    Return one breakdown belonging to the authenticated user.
    """

    return (
        db.query(BreakdownRequest)
        .filter(
            BreakdownRequest.id == breakdown_id,
            BreakdownRequest.user_id == user_id,
        )
        .first()
    )


def update_breakdown_status(
    db: Session,
    breakdown: BreakdownRequest,
    new_status: str,
) -> BreakdownRequest:
    """
    Update breakdown status.
    """

    breakdown.status = new_status

    db.commit()
    db.refresh(breakdown)

    return breakdown


def delete_breakdown(
    db: Session,
    breakdown: BreakdownRequest,
) -> None:
    """
    Delete a breakdown request.
    """

    db.delete(breakdown)
    db.commit()
    
def find_nearby_providers_for_breakdown(
    db: Session,
    breakdown: BreakdownRequest,
    radius_km: float = 10.0,
):
    service_type = get_required_service(breakdown.problem_type)

    if service_type is None:
        return []

    providers = find_nearby_providers(
        db=db,
        latitude=breakdown.latitude,
        longitude=breakdown.longitude,
        radius_km=radius_km,
        service_type=service_type,
    )

    return rank_providers(providers)


def assign_best_provider(
    db: Session,
    breakdown: BreakdownRequest,
    radius_km: float = 10.0,
):
    if breakdown.status != "SEARCHING":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Breakdown cannot be assigned "
                f"while status is {breakdown.status}"
            ),
        )

    service_type = get_required_service(
        breakdown.problem_type
    )

    if service_type is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"No provider service mapping found "
                f"for problem type: {breakdown.problem_type}"
            ),
        )

    providers = find_nearby_providers(
        db=db,
        latitude=breakdown.latitude,
        longitude=breakdown.longitude,
        radius_km=radius_km,
        service_type=service_type,
    )

    ranked_providers = rank_providers(providers)

    if not ranked_providers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No suitable available provider found "
                f"within {radius_km} km"
            ),
        )

    provider, distance, score = ranked_providers[0]

    breakdown.provider_id = provider.id
    breakdown.status = "PROVIDER_ASSIGNED"

    db.commit()
    db.refresh(breakdown)

    return breakdown, provider, distance, score