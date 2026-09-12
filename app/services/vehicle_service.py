from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle


def get_vehicle_by_registration(
    db: Session,
    registration_number: str,
) -> Vehicle | None:
    """
    Find a vehicle by registration number.
    """

    return (
        db.query(Vehicle)
        .filter(
            Vehicle.registration_number == registration_number
        )
        .first()
    )


def create_vehicle(
    db: Session,
    user_id: int,
    registration_number: str,
    make: str,
    model: str,
    vehicle_type: str,
) -> Vehicle:
    """
    Create a vehicle belonging to a specific user.
    """

    vehicle = Vehicle(
        user_id=user_id,
        registration_number=registration_number,
        make=make,
        model=model,
        vehicle_type=vehicle_type,
    )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return vehicle


def get_user_vehicles(
    db: Session,
    user_id: int,
) -> list[Vehicle]:
    """
    Return all vehicles belonging to a user.
    """

    return (
        db.query(Vehicle)
        .filter(Vehicle.user_id == user_id)
        .order_by(Vehicle.id.desc())
        .all()
    )


def get_user_vehicle(
    db: Session,
    user_id: int,
    vehicle_id: int,
) -> Vehicle | None:
    """
    Return a vehicle only if it belongs to the given user.
    """

    return (
        db.query(Vehicle)
        .filter(
            Vehicle.id == vehicle_id,
            Vehicle.user_id == user_id,
        )
        .first()
    )


def update_vehicle(
    db: Session,
    vehicle: Vehicle,
    update_data: dict,
) -> Vehicle:
    """
    Update a vehicle using only supplied fields.
    """

    for field, value in update_data.items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)

    return vehicle


def delete_vehicle(
    db: Session,
    vehicle: Vehicle,
) -> None:
    """
    Delete a vehicle.
    """

    db.delete(vehicle)
    db.commit()