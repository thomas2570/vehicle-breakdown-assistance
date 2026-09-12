from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.location import NearbyProviderResponse
from app.services.location_service import find_nearby_providers

router = APIRouter(
    prefix="/location",
    tags=["Location"],
)


@router.get(
    "/nearby-providers",
    response_model=list[NearbyProviderResponse],
)
def nearby_providers(
    latitude: float = Query(
        ...,
        ge=-90,
        le=90,
    ),
    longitude: float = Query(
        ...,
        ge=-180,
        le=180,
    ),
    radius_km: float = Query(
        10.0,
        gt=0,
        le=100,
    ),
    service_type: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    results = find_nearby_providers(
        db=db,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        service_type=service_type,
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
    for provider, distance in results
]   