from fastapi import (
    APIRouter,Query,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.user import User
from app.models.breakdown import BreakdownRequest

from app.schemas.location import NearbyProviderResponse
from app.schemas.breakdown import (
    BreakdownCreate,
    BreakdownResponse,
    BreakdownStatus,
    BreakdownStatusUpdate,
)
from app.schemas.assignment import AssignmentAction,AssignmentActionRequest

from app.security.dependencies import get_current_user

from app.services.breakdown_service import (
    ALLOWED_STATUS_TRANSITIONS,
    create_breakdown,
    delete_breakdown,
    get_user_breakdown,
    get_user_breakdowns,
    update_breakdown_status,
)
from app.services.vehicle_service import get_user_vehicle
from app.services.breakdown_service import find_nearby_providers_for_breakdown
from app.services.breakdown_service import assign_best_provider

router = APIRouter(
    prefix="/breakdowns",
    tags=["Breakdowns"],
)


@router.post(
    "",
    response_model=BreakdownResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_breakdown_endpoint(
    breakdown_data: BreakdownCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a breakdown request for one of the
    authenticated user's vehicles.
    """

    vehicle = get_user_vehicle(
        db=db,
        user_id=current_user.id,
        vehicle_id=breakdown_data.vehicle_id,
    )

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    breakdown = create_breakdown(
        db=db,
        user_id=current_user.id,
        vehicle_id=breakdown_data.vehicle_id,
        problem_type=breakdown_data.problem_type,
        description=breakdown_data.description,
        latitude=breakdown_data.latitude,
        longitude=breakdown_data.longitude,
    )

    return breakdown


@router.get(
    "",
    response_model=list[BreakdownResponse],
)
def get_my_breakdowns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all breakdown requests belonging to
    the authenticated user.
    """

    return get_user_breakdowns(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{breakdown_id}",
    response_model=BreakdownResponse,
)
def get_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get one breakdown belonging to the authenticated user.
    """

    breakdown = get_user_breakdown(
        db=db,
        user_id=current_user.id,
        breakdown_id=breakdown_id,
    )

    if breakdown is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Breakdown request not found",
        )

    return breakdown


@router.patch(
    "/{breakdown_id}/status",
    response_model=BreakdownResponse,
)
def update_status(
    breakdown_id: int,
    status_data: BreakdownStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the status of a breakdown request.
    """

    breakdown = get_user_breakdown(
        db=db,
        user_id=current_user.id,
        breakdown_id=breakdown_id,
    )

    if breakdown is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Breakdown request not found",
        )

    current_status = BreakdownStatus(
        breakdown.status
    )

    new_status = status_data.status

    allowed_next_statuses = (
        ALLOWED_STATUS_TRANSITIONS.get(
            current_status,
            set(),
        )
    )

    if new_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Invalid status transition",
                "current_status": current_status.value,
                "allowed_next_statuses": [
                    item.value
                    for item in allowed_next_statuses
                ],
            },
        )

    return update_breakdown_status(
        db=db,
        breakdown=breakdown,
        new_status=new_status.value,
    )


@router.delete(
    "/{breakdown_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def cancel_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel/delete a breakdown request.

    Only PENDING, SEARCHING, PROVIDER_ASSIGNED,
    and PROVIDER_EN_ROUTE requests can be cancelled.
    """

    breakdown = get_user_breakdown(
        db=db,
        user_id=current_user.id,
        breakdown_id=breakdown_id,
    )

    if breakdown is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Breakdown request not found",
        )

    if "CANCELLED" not in ALLOWED_STATUS_TRANSITIONS.get(
        breakdown.status.upper(),
        set(),
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Breakdown cannot be cancelled "
                f"from status '{breakdown.status}'"
            ),
        )

    delete_breakdown(
        db=db,
        breakdown=breakdown,
    )

    return None

@router.get(
    "/{breakdown_id}/nearby-providers",
    response_model=list[NearbyProviderResponse],
)
def nearby_providers_for_breakdown(
    breakdown_id: int,
    radius_km: float = Query(
        default=10.0,
        gt=0,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    breakdown = (
        db.query(BreakdownRequest)
        .filter(
            BreakdownRequest.id == breakdown_id,
            BreakdownRequest.user_id == current_user.id ,
        )
        .first()
    )

    if breakdown is None:
        raise HTTPException(
            status_code=404,
            detail="Breakdown not found",
        )

    results = find_nearby_providers_for_breakdown(
        db=db,
        breakdown=breakdown,
        radius_km=radius_km,
    )

    return [
        NearbyProviderResponse(
            id=provider.id,
            business_name=provider.business_name,
            contact_name=provider.contact_name,
            phone=provider.phone,
            service_type=provider.service_type,
            latitude=provider.latitude,
            longitude=provider.longitude,
            rating=provider.rating,
            is_available=provider.is_available,
            distance=(
                f"{round(distance / 1000, 2)} km"
                if distance >= 1000
                else f"{round(distance)} m"
            ),
        )
        for provider, distance, score in results
    ]
    
@router.post(
    "/{breakdown_id}/assign-provider",
    response_model=BreakdownResponse,
)
def assign_provider(
    breakdown_id: int,
    radius_km: float = Query(
        default=10.0,
        gt=0,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    breakdown = (
        db.query(BreakdownRequest)
        .filter(
            BreakdownRequest.id == breakdown_id,
            BreakdownRequest.user_id == current_user.id,
        )
        .first()
    )

    if breakdown is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Breakdown not found",
        )

    breakdown, provider, distance, score = assign_best_provider(
        db=db,
        breakdown=breakdown,
        radius_km=radius_km,
    )

    return breakdown


@router.patch(
    "/{breakdown_id}/provider-response",
    response_model=BreakdownResponse,
)
def provider_response(
    breakdown_id: int,
    data: AssignmentActionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    breakdown = (
        db.query(BreakdownRequest)
        .filter(
            BreakdownRequest.id == breakdown_id,
            BreakdownRequest.provider_id.isnot(None),
        )
        .first()
    )

    if breakdown is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned breakdown not found",
        )

    if data.action == AssignmentAction.ACCEPT:
        if breakdown.status != "PROVIDER_ASSIGNED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Provider cannot accept this breakdown",
            )

        breakdown.status = "PROVIDER_EN_ROUTE"

    elif data.action == AssignmentAction.REJECT:
        if breakdown.status != "PROVIDER_ASSIGNED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Provider cannot reject this breakdown",
            )

        breakdown.provider_id = None
        breakdown.status = "SEARCHING"

    db.commit()
    db.refresh(breakdown)

    return breakdown