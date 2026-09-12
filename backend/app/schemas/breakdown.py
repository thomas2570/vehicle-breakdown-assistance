from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class BreakdownStatus(str, Enum):
    PENDING = "PENDING"
    SEARCHING = "SEARCHING"
    PROVIDER_ASSIGNED = "PROVIDER_ASSIGNED"
    PROVIDER_EN_ROUTE = "PROVIDER_EN_ROUTE"
    ARRIVED = "ARRIVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class BreakdownCreate(BaseModel):
    """
    Data required to create a breakdown request.
    """

    vehicle_id: int = Field(
        gt=0,
    )

    problem_type: str = Field(
        min_length=2,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )

    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )


class BreakdownStatusUpdate(BaseModel):
    """
    Request body for updating breakdown status.
    """

    status: BreakdownStatus


class BreakdownResponse(BaseModel):
    """
    Breakdown response returned to the client.
    """

    id: int
    user_id: int
    vehicle_id: int
    provider_id: int | None
    problem_type: str
    description: str | None
    latitude: float
    longitude: float
    status: BreakdownStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)