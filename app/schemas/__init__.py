from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    """
    Data required to register a new user.
    """

    full_name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    phone: str = Field(
        min_length=10,
        max_length=20,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserLogin(BaseModel):
    """
    Credentials required for login.
    """

    email: EmailStr

    password: str


class TokenResponse(BaseModel):
    """
    JWT authentication response.
    """

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """
    Public user information.
    """

    id: int
    full_name: str
    email: EmailStr
    phone: str

    model_config = ConfigDict(
        from_attributes=True,
    )