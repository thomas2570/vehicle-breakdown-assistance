from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ServiceType(str, Enum):
    MECHANIC = "MECHANIC"
    TOWING = "TOWING"
    TYRE_REPAIR = "TYRE_REPAIR"
    BATTERY = "BATTERY"
    FUEL_DELIVERY = "FUEL_DELIVERY"
    EV_CHARGING = "EV_CHARGING"
    ROADSIDE_ASSISTANCE = "ROADSIDE_ASSISTANCE"


class ProviderCreate(BaseModel):
    """
    Data required to create a provider.
    """

    business_name: str = Field(
        min_length=2,
        max_length=150,
    )

    contact_name: str = Field(
        min_length=2,
        max_length=100,
    )

    phone: str = Field(
        min_length=10,
        max_length=20,
    )

    service_type: ServiceType

    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )


class ProviderUpdate(BaseModel):
    """
    Fields that can be updated.
    """

    business_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    contact_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    phone: str | None = Field(
        default=None,
        min_length=10,
        max_length=20,
    )

    service_type: ServiceType | None = None

    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90,
    )

    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180,
    )


class ProviderAvailabilityUpdate(BaseModel):
    """
    Update provider availability.
    """

    is_available: bool


class ProviderResponse(BaseModel):
    """
    Provider returned to API clients.
    """

    id: int
    business_name: str
    contact_name: str
    phone: str
    service_type: ServiceType
    latitude: float
    longitude: float
    rating: float
    is_available: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )