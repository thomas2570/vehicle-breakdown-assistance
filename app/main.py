from fastapi import FastAPI
from sqlalchemy import text

from app.api.v1.auth import router as auth_router
from app.api.v1.vehicles import router as vehicle_router
from app.api.v1.breakdowns import router as breakdown_router
from app.api.v1.providers import router as provider_router
from app.api.v1.location import router as location_router

from app.config.settings import get_settings
from app.database.database import engine


settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    description="Backend API for location-based roadside assistance",
    version=settings.app_version,
    debug=settings.debug,
)


app.include_router(auth_router, prefix="/api/v1")
app.include_router(vehicle_router, prefix="/api/v1")
app.include_router(breakdown_router, prefix="/api/v1")
app.include_router(provider_router, prefix="/api/v1")
app.include_router(location_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "Geo-Intelligent Roadside Assistance API is running",
        "environment": settings.app_env,
        "version": settings.app_version,
    }



@app.get("/health/database")
async def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as exc:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(exc),
        }