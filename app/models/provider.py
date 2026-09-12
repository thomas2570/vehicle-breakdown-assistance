from datetime import datetime

from geoalchemy2 import Geography
from sqlalchemy import Boolean, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Provider(Base):
    __tablename__ = "providers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    business_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    contact_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    service_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    location = mapped_column(
        Geography(
            geometry_type="POINT",
            srid=4326,
            spatial_index=True,
        ),
        nullable=False,
    )

    rating: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )