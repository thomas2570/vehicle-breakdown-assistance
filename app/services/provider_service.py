from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.models.provider import Provider


def build_location(
    latitude: float,
    longitude: float,
) -> WKTElement:
    """
    Convert latitude/longitude into a PostGIS POINT.

    PostGIS expects:
        POINT(longitude latitude)
    """

    return WKTElement(
        f"POINT({longitude} {latitude})",
        srid=4326,
    )


def get_provider_by_phone(
    db: Session,
    phone: str,
) -> Provider | None:
    """
    Find provider using phone number.
    """

    return (
        db.query(Provider)
        .filter(Provider.phone == phone)
        .first()
    )


def create_provider(
    db: Session,
    business_name: str,
    contact_name: str,
    phone: str,
    service_type: str,
    latitude: float,
    longitude: float,
) -> Provider:
    """
    Create a provider with a PostGIS location.
    """

    provider = Provider(
        business_name=business_name,
        contact_name=contact_name,
        phone=phone,
        service_type=service_type,
        latitude=latitude,
        longitude=longitude,
        location=build_location(
            latitude=latitude,
            longitude=longitude,
        ),
        rating=0.0,
        is_available=True,
    )

    db.add(provider)
    db.commit()
    db.refresh(provider)

    return provider


def get_providers(
    db: Session,
) -> list[Provider]:
    """
    Return all providers.
    """

    return (
        db.query(Provider)
        .order_by(Provider.id.desc())
        .all()
    )


def get_provider(
    db: Session,
    provider_id: int,
) -> Provider | None:
    """
    Return provider by ID.
    """

    return (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )


def update_provider(
    db: Session,
    provider: Provider,
    update_data: dict,
) -> Provider:
    """
    Update provider fields.

    If latitude or longitude changes,
    update the PostGIS location as well.
    """

    latitude = update_data.get(
        "latitude",
        provider.latitude,
    )

    longitude = update_data.get(
        "longitude",
        provider.longitude,
    )

    for field, value in update_data.items():
        setattr(provider, field, value)

    if (
        "latitude" in update_data
        or "longitude" in update_data
    ):
        provider.location = build_location(
            latitude=latitude,
            longitude=longitude,
        )

    db.commit()
    db.refresh(provider)

    return provider


def delete_provider(
    db: Session,
    provider: Provider,
) -> None:
    """
    Delete provider.
    """

    db.delete(provider)
    db.commit()