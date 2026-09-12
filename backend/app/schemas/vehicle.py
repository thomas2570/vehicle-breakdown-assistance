from pydantic import BaseModel, ConfigDict, Field


class VehicleCreate(BaseModel):
    """
    Data required to create a vehicle.
    """

    registration_number: str = Field(
        min_length=3,
        max_length=30,
    )

    make: str = Field(
        min_length=2,
        max_length=50,
    )

    model: str = Field(
        min_length=1,
        max_length=50,
    )

    vehicle_type: str = Field(
        min_length=2,
        max_length=30,
    )


class VehicleUpdate(BaseModel):
    """
    Fields that can be updated.
    All fields are optional because this is a PATCH request.
    """

    registration_number: str | None = Field(
        default=None,
        min_length=3,
        max_length=30,
    )

    make: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    model: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    vehicle_type: str | None = Field(
        default=None,
        min_length=2,
        max_length=30,
    )


class VehicleResponse(BaseModel):
    """
    Public representation of a vehicle.
    """

    id: int
    user_id: int
    registration_number: str
    make: str
    model: str
    vehicle_type: str

    model_config = ConfigDict(
        from_attributes=True,
    )