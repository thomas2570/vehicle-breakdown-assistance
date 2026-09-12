from pydantic import BaseModel


class NearbyProviderResponse(BaseModel):
    id: int
    business_name: str
    contact_name: str
    phone: str
    service_type: str
    latitude: float
    longitude: float
    rating: float
    is_available: bool
    distance: str