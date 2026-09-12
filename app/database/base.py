from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    """
    pass     


# from app.models.breakdown import BreakdownRequest
# from app.models.provider import Provider
# from app.models.user import User
# from app.models.vehicle import Vehicle