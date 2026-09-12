from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.user import User
from app.security.password import hash_password, verify_password


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    """
    Find a user by email address.
    """

    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_user_by_phone(
    db: Session,
    phone: str,
) -> User | None:
    """
    Find a user by phone number.
    """

    return (
        db.query(User)
        .filter(User.phone == phone)
        .first()
    )


def get_user_by_identifier(
    db: Session,
    identifier: str,
) -> User | None:
    """
    Find a user using either email or phone number.
    """

    return (
        db.query(User)
        .filter(
            or_(
                User.email == identifier,
                User.phone == identifier,
            )
        )
        .first()
    )


def create_user(
    db: Session,
    full_name: str,
    email: str,
    phone: str,
    password: str,
) -> User:
    """
    Create and persist a new user.
    """

    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        password_hash=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    identifier: str,
    password: str,
) -> User | None:
    """
    Authenticate a user using either email or phone number.
    """

    user = get_user_by_identifier(
        db,
        identifier,
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user