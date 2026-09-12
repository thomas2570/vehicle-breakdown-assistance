from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleResponse,
    VehicleUpdate,
)
from app.security.dependencies import get_current_user
from app.services.vehicle_service import (
    create_vehicle,
    delete_vehicle,
    get_user_vehicle,
    get_user_vehicles,
    get_vehicle_by_registration,
    update_vehicle,
)


router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"],
)


@router.post(
    "",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vehicle_endpoint(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a vehicle for the authenticated user.
    """

    existing_vehicle = get_vehicle_by_registration(
        db,
        vehicle_data.registration_number,
    )

    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vehicle registration number already exists",
        )

    try:
        vehicle = create_vehicle(
            db=db,
            user_id=current_user.id,
            registration_number=vehicle_data.registration_number,
            make=vehicle_data.make,
            model=vehicle_data.model,
            vehicle_type=vehicle_data.vehicle_type,
        )

        return vehicle

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vehicle registration number already exists",
        )


@router.get(
    "",
    response_model=list[VehicleResponse],
)
def get_my_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all vehicles owned by the authenticated user.
    """

    return get_user_vehicles(
        db,
        current_user.id,
    )


@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get one vehicle belonging to the authenticated user.
    """

    vehicle = get_user_vehicle(
        db=db,
        user_id=current_user.id,
        vehicle_id=vehicle_id,
    )

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    return vehicle


@router.patch(
    "/{vehicle_id}",
    response_model=VehicleResponse,
)
def update_vehicle_endpoint(
    vehicle_id: int,
    vehicle_data: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a vehicle belonging to the authenticated user.
    """

    vehicle = get_user_vehicle(
        db=db,
        user_id=current_user.id,
        vehicle_id=vehicle_id,
    )

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    update_data = vehicle_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    if "registration_number" in update_data:
        existing_vehicle = get_vehicle_by_registration(
            db,
            update_data["registration_number"],
        )

        if (
            existing_vehicle
            and existing_vehicle.id != vehicle.id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Vehicle registration number already exists",
            )

    try:
        return update_vehicle(
            db=db,
            vehicle=vehicle,
            update_data=update_data,
        )

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vehicle registration number already exists",
        )


@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_vehicle_endpoint(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a vehicle belonging to the authenticated user.
    """

    vehicle = get_user_vehicle(
        db=db,
        user_id=current_user.id,
        vehicle_id=vehicle_id,
    )

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    delete_vehicle(
        db=db,
        vehicle=vehicle,
    )

    return None