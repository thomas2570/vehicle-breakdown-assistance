from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.provider import (
    ProviderAvailabilityUpdate,
    ProviderCreate,
    ProviderResponse,
    ProviderUpdate,
)
from app.security.dependencies import get_current_user
from app.services.provider_service import (
    create_provider,
    delete_provider,
    get_provider,
    get_provider_by_phone,
    get_providers,
    update_provider,
)


router = APIRouter(
    prefix="/providers",
    tags=["Providers"],
)


@router.post(
    "",
    response_model=ProviderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_provider_endpoint(
    provider_data: ProviderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Create a roadside service provider.
    """

    existing_provider = get_provider_by_phone(
        db,
        provider_data.phone,
    )

    if existing_provider:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Provider phone number already exists",
        )

    provider = create_provider(
            db=db,
            business_name=provider_data.business_name,
            contact_name=provider_data.contact_name,
            phone=provider_data.phone,
            service_type=provider_data.service_type.value,
            latitude=provider_data.latitude,
            longitude=provider_data.longitude,
            )

    return provider


@router.get(
    "",
    response_model=list[ProviderResponse],
)
def list_providers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Return all providers.
    """

    return get_providers(db)


@router.get(
    "/{provider_id}",
    response_model=ProviderResponse,
)
def get_provider_endpoint(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get provider by ID.
    """

    provider = get_provider(
        db,
        provider_id,
    )

    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found",
        )

    return provider


@router.patch(
    "/{provider_id}",
    response_model=ProviderResponse,
)
def update_provider_endpoint(
    provider_id: int,
    provider_data: ProviderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Update provider information.
    """

    provider = get_provider(
        db,
        provider_id,
    )

    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found",
        )

    update_data = provider_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    if "service_type" in update_data:
        update_data["service_type"] = (
            update_data["service_type"].value
        )

    if "phone" in update_data:
        existing_provider = get_provider_by_phone(
            db,
            update_data["phone"],
        )

        if (
            existing_provider
            and existing_provider.id != provider.id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Provider phone number already exists",
            )

    try:
        return update_provider(
            db=db,
            provider=provider,
            update_data=update_data,
        )

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Provider phone number already exists",
        )


@router.patch(
    "/{provider_id}/availability",
    response_model=ProviderResponse,
)
def update_availability(
    provider_id: int,
    availability_data: ProviderAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Change provider availability.
    """

    provider = get_provider(
        db,
        provider_id,
    )

    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found",
        )

    return update_provider(
        db=db,
        provider=provider,
        update_data={
            "is_available": (
                availability_data.is_available
            )
        },
    )


@router.delete(
    "/{provider_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_provider_endpoint(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Delete provider.
    """

    provider = get_provider(
        db,
        provider_id,
    )

    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found",
        )

    delete_provider(
        db,
        provider,
    )

    return None