from geoalchemy2 import Geography
from sqlalchemy import cast, func
from sqlalchemy.orm import Session

from app.models.provider import Provider


def find_nearby_providers(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    service_type: str | None = None,
):
    user_location = cast(
        func.ST_SetSRID(
            func.ST_MakePoint(longitude, latitude),
            4326,
        ),
        Geography(geometry_type="POINT", srid=4326),
    )

    distance = func.ST_Distance(
        Provider.location,
        user_location,
    )

    radius_meters = radius_km * 1000

    query = (
        db.query(
            Provider,
            distance.label("distance_meters"),
        )
        .filter(Provider.is_available.is_(True))
        .filter(
            func.ST_DWithin(
                Provider.location,
                user_location,
                radius_meters,
            )
        )
    )

    if service_type:
        query = query.filter(
            Provider.service_type == service_type
        )

    return query.order_by(
        distance.asc()
    ).all()
    
    
def rank_providers(
    providers_with_distance: list,
) -> list:
    if not providers_with_distance:
        return []

    max_distance = max(
        float(distance)
        for _, distance in providers_with_distance
    )

    ranked = []

    for provider, distance in providers_with_distance:
        distance = float(distance)

        # 1.0 = closest, 0.0 = farthest
        if max_distance == 0:
            distance_score = 1.0
        else:
            distance_score = 1 - (distance / max_distance)

        # Rating is 0-5
        rating_score = provider.rating / 5.0

        final_score = (
            0.60 * distance_score
            + 0.40 * rating_score
        )

        ranked.append(
            (
                provider,
                distance,
                round(final_score, 4),
            )
        )

    return sorted(
        ranked,
        key=lambda item: item[2],
        reverse=True,
    )