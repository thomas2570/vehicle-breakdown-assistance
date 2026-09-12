from collections.abc import Generator
from sqlalchemy.orm import Session 
from app.database.database import SessionLocal

def get_db()->Generator[Session,None,None]:
    """
    Provide a database session to a FastAPI request.

    The session is closed automatically after
    the request finishes.
    """
    db=SessionLocal()
    
    try:
        yield db
    finally:
        db.close()