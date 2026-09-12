# Geo-Intelligent Roadside Assistance Backend

A FastAPI-based backend for a Geo-Intelligent Location-Based Routing System for On-Road Vehicle Breakdown Assistance.

The system allows users to:

- Create an account
- Authenticate using JWT
- Register vehicles
- Report vehicle breakdowns
- Store breakdown GPS coordinates
- Register roadside service providers
- Find nearby providers using PostGIS
- Filter providers according to breakdown type
- Rank providers using distance and rating
- Automatically assign the best available provider
- Track breakdown status through a defined workflow

---

# 1. Project Overview

The purpose of this project is to build a location-aware roadside assistance platform that can quickly connect a vehicle in distress with a suitable nearby service provider.

Traditional roadside assistance systems may depend on manual phone calls and static provider lists.

This system uses:

- GPS coordinates
- GIS / spatial databases
- PostgreSQL + PostGIS
- FastAPI
- JWT authentication
- Provider-service matching
- Distance-based searching
- Provider ranking
- Automatic provider assignment

The current backend represents the core MVP of the system.

Future versions will add:

- Real road routing
- ETA prediction
- Traffic intelligence
- Redis caching
- Machine Learning
- Notifications
- Provider acceptance/rejection
- Docker deployment
- AWS deployment

---

# 2. Current Backend Architecture

```text
                    Frontend
                React / Flutter
                       |
                       | HTTP / JSON
                       v
                +--------------+
                |   FastAPI    |
                |   Backend    |
                +--------------+
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
 Authentication     Business       Location
     Service         APIs          Services
        |              |              |
        |         +----+----+         |
        |         |         |         |
        v         v         v         v
      Users    Vehicles  Breakdowns Providers
                                      |
                                      v
                              PostgreSQL + PostGIS
                                      |
                                      v
                              Spatial Search
                                      |
                                      v
                              Provider Ranking
                                      |
                                      v
                              Provider Assignment


# 3. Technology Stack

3.1 Python
Python is the primary programming language.

Why?
Python is used because:

It has excellent backend support
It has strong GIS libraries
It has strong Machine Learning support
It integrates easily with PostgreSQL
It is suitable for future AI/ML services

3.2 FastAPI
FastAPI is the main backend web framework.

What does it do?
FastAPI handles:

HTTP requests
API routing
Request validation
Response serialization
Authentication dependencies
API documentation

Why FastAPI?
FastAPI provides:

High performance
Automatic Swagger documentation
Pydantic validation
Python type hints
Easy integration with SQLAlchemy
Easy integration with Machine Learning services
Swagger UI is automatically available at:

http://127.0.0.1:8000/docs

3.3 PostgreSQL
PostgreSQL is the primary relational database.
It stores:

Users
Vehicles
Breakdown requests
Providers
Provider locations
Status information

Why PostgreSQL?
PostgreSQL provides:

ACID transactions
Strong relational integrity
Foreign keys
Indexing
Production-grade reliability
Excellent support for PostGIS

3.4 PostGIS
PostGIS is the geospatial extension for PostgreSQL.
It allows PostgreSQL to understand geographic data.
The project uses PostGIS to store provider locations as geographic points.
Example:

POINT(77.2090 28.6139)
The order is:

POINT(longitude latitude)

Why PostGIS?
Normal PostgreSQL can store latitude and longitude as numbers.
However, PostGIS allows us to perform spatial operations such as:

Find nearby providers
Calculate geographic distance
Search within a radius
Sort by distance
Use spatial indexes
Example:

User Location
|
v
28.6139, 77.2090
|
v
Find providers within 10 km
|
v
Return nearest providers

3.5 GeoAlchemy2
GeoAlchemy2 provides SQLAlchemy integration for spatial databases.
It allows Python/SQLAlchemy code to work with PostGIS geometry and geography types.
Example:

location = Geography(
geometry_type="POINT",
srid=4326,
)

Why?
Without GeoAlchemy2, handling PostGIS spatial columns through SQLAlchemy would be much more difficult.

3.6 SQLAlchemy
SQLAlchemy is the ORM used for database operations.
ORM means Object Relational Mapping.
Instead of writing SQL everywhere, Python models represent database tables.
Example:

class Provider(Base):
tablename = "providers"
The provider model represents the providers database table.

Why SQLAlchemy?
It provides:

Python-based database models
Query abstraction
Transactions
Relationships
PostgreSQL integration
Maintainable database code

3.7 Alembic
Alembic handles database migrations.

Why?
When database models change, the database structure must also change.
For example:

Before:

breakdown_requests
id
user_id
vehicle_id

After:

breakdown_requests
id
user_id
vehicle_id
provider_id
Alembic creates the database migration required for this change.
Typical commands:

alembic revision --autogenerate -m "migration message"
Then:

alembic upgrade head

3.8 JWT Authentication
JWT is used for API authentication.
The authentication flow is:

User
|
| Login
v
FastAPI
|
| Verify credentials
v
JWT Token
|
v
Frontend
|
| Authorization: Bearer 
v
Protected API
Protected endpoints can identify the current user using the JWT.

3.9 Pydantic
Pydantic is used for:

Request validation
Response validation
API schemas
Type safety
Example:

class BreakdownCreate(BaseModel):
vehicle_id: int
problem_type: str
latitude: float
longitude: float
If invalid coordinates are provided, FastAPI can reject the request automatically.

# 4. Why Each Technology Exists
TechnologyPurposePythonMain programming languageFastAPIREST API frameworkPostgreSQLRelational databasePostGISGeographic/spatial operationsSQLAlchemyDatabase ORMGeoAlchemy2PostGIS + SQLAlchemy integrationAlembicDatabase migrationsPydanticValidation and schemasJWTAuthenticationUvicornASGI application serverDockerContainerization in later stageRedisCaching in later stageOSRMRoad routing in later stageMLIntelligent prediction/ranking in later stage

# 5. Main Features Implemented
Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me

Vehicle Management
GET    /api/v1/vehicles
POST   /api/v1/vehicles
GET    /api/v1/vehicles/{vehicle_id}
PATCH  /api/v1/vehicles/{vehicle_id}
DELETE /api/v1/vehicles/{vehicle_id}

Breakdown Management
GET    /api/v1/breakdowns
POST   /api/v1/breakdowns
GET    /api/v1/breakdowns/{breakdown_id}
PATCH  /api/v1/breakdowns/{breakdown_id}/status
DELETE /api/v1/breakdowns/{breakdown_id}

Provider Management
GET    /api/v1/providers
POST   /api/v1/providers
GET    /api/v1/providers/{provider_id}
PATCH  /api/v1/providers/{provider_id}
DELETE /api/v1/providers/{provider_id}
PATCH  /api/v1/providers/{provider_id}/availability

Location Services
GET /api/v1/location/nearby-providers
This searches for available providers within a specified radius.
Example:

latitude=28.6139
longitude=77.2090
radius_km=10

Breakdown-Specific Provider Search
GET /api/v1/breakdowns/{breakdown_id}/nearby-providers
This endpoint automatically:

Reads the breakdown location
Reads the breakdown problem
Determines the required provider service
Finds nearby providers
Filters unavailable providers
Filters by service type
Ranks providers
Returns the best providers

Automatic Provider Assignment
POST /api/v1/breakdowns/{breakdown_id}/assign-provider
The system:

Breakdown
|
v
Problem Type
|
v
Required Service
|
v
Nearby Providers
|
v
Available Providers
|
v
Provider Ranking
|
v
Best Provider
|
v
Provider Assigned

6. Breakdown Status Workflow
Breakdowns use controlled states.

PENDING
|
v
SEARCHING
|
v
PROVIDER_ASSIGNED
|
v
PROVIDER_EN_ROUTE
|
v
ARRIVED
|
v
IN_PROGRESS
|
v
COMPLETED
A breakdown can also be cancelled during appropriate stages.

PENDING
|
+----> CANCELLED

SEARCHING
|
+----> CANCELLED

PROVIDER_ASSIGNED
|
+----> CANCELLED

PROVIDER_EN_ROUTE
|
+----> CANCELLED
Invalid status transitions are rejected by the backend.

7. Problem-to-Service Mapping
The system converts a breakdown type into the required provider service.

ENGINE
ENGINE_FAILURE
|
v
MECHANIC
TYRE
PUNCTURE
|
v
TYRE_REPAIR
BATTERY
DEAD_BATTERY
|
v
BATTERY
FUEL
OUT_OF_FUEL
|
v
FUEL_DELIVERY
TOWING
|
v
TOWING
EV_BATTERY
|
v
EV_CHARGING
ACCIDENT
|
v
ROADSIDE_ASSISTANCE
This mapping is currently rule-based.

# 8. Provider Location System
Each provider stores:

latitude
longitude
location
Example:

Latitude:
28.6139

Longitude:
77.2090
The PostGIS point is:

POINT(77.209 28.6139)
Longitude comes first when constructing a PostGIS point.

# 9. Nearby Provider Search
The backend creates a geographic point for the user/breakdown location.
Conceptually:

User Location
|
v
ST_MakePoint()
|
v
PostGIS Geography
|
v
ST_DWithin()
|
v
Providers inside radius
Distance is calculated using:

ST_Distance()
The backend sorts providers by distance.

10. Provider Ranking
The current ranking is rule-based.
The ranking considers:

60% Distance
40% Rating
Distance score:

Closer provider = higher score
Rating score:

5.0 rating = 1.0
0.0 rating = 0.0
Final score:

Final Score =
0.60 × Distance Score

0.40 × Rating Score
This is intentionally explainable.
It is not Machine Learning yet.
Later, this ranking can be replaced or enhanced using an ML model.

11. Distance Display
The API displays distance dynamically.
If distance is less than 1 km:

750 m
If distance is 1 km or more:

1.25 km
Examples:

500 m   -> "500 m"
850 m   -> "850 m"
999 m   -> "999 m"
1000 m  -> "1.0 km"
1250 m  -> "1.25 km"
2750 m  -> "2.75 km"

12. Database Structure
Current main tables:

users
vehicles
breakdown_requests
providers
alembic_version
spatial_ref_sys
spatial_ref_sys belongs to PostGIS.
It is managed by the PostGIS extension and should not be treated as an application table.
Alembic is configured to ignore it during autogeneration.

13. Project Structure
geo-roadside-backend/
│
├── app/
│   ├── init.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── vehicles.py
│   │       ├── breakdowns.py
│   │       ├── providers.py
│   │       └── location.py
│   │
│   ├── config/
│   │
│   ├── database/
│   │   ├── base.py
│   │   ├── dependencies.py
│   │   └── session.py
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── vehicle.py
│   │   ├── breakdown.py
│   │   └── provider.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── vehicle.py
│   │   ├── breakdown.py
│   │   ├── provider.py
│   │   └── location.py
│   │
│   ├── repositories/
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── vehicle_service.py
│   │   ├── breakdown_service.py
│   │   ├── provider_service.py
│   │   ├── location_service.py
│   │   └── problem_mapping.py
│   │
│   ├── security/
│   │   └── dependencies.py
│   │
│   ├── utils/
│   │
│   └── main.py
│
├── tests/
│
├── alembic/
│
├── .env
├── .gitignore
├── requirements.txt
├── run.py
└── README.md

14. Requirements
Software Requirements
Install:

Python 3.11+
Docker Desktop
PostgreSQL client / psql (optional but recommended)
Git
VS Code or another code editor
PostGIS does not need to be installed directly on Windows if PostgreSQL/PostGIS is running through Docker.

15. PostgreSQL + PostGIS Setup
The project uses a PostGIS Docker container.
Example Docker Compose configuration:

services:
geo-postgres:
image: postgis/postgis:16-3.4
container_name: geo-roadside-postgres
restart: unless-stopped

environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  POSTGRES_DB: roadside_assistance

ports:
  - "5433:5432"

volumes:
  - geo_postgres_data:/var/lib/postgresql/data

healthcheck:
  test:
    [
      "CMD-SHELL",
      "pg_isready -U postgres -d roadside_assistance"
    ]
  interval: 5s
  timeout: 5s
  retries: 5
volumes:
geo_postgres_data:
Do not commit real database passwords to GitHub.

16. Environment Variables
Create:

.env
Example:

DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5433/roadside_assistance

SECRET_KEY=YOUR_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
Replace:

YOUR_PASSWORD
YOUR_SECRET_KEY
with your local values.
Never commit .env to GitHub.

17. Python Virtual Environment
From the project directory:

python -m venv .venv
Activate it:

..venv\Scripts\Activate.ps1
If PowerShell blocks script execution, you can run Python directly:

..venv\Scripts\python.exe --version

18. Install Dependencies
Install requirements:

pip install -r requirements.txt
Important packages include:

fastapi
uvicorn
sqlalchemy
alembic
psycopg2-binary
geoalchemy2
pydantic
python-jose
passlib
python-multipart
The exact versions should be taken from the project's current requirements.txt.

19. Start PostgreSQL/PostGIS
From the project directory:

docker compose up -d
Check:

docker compose ps
The database container should be healthy.

20. Verify Database
Using psql:

psql "postgresql://postgres:YOUR_PASSWORD@localhost:5433/roadside_assistance"
Check PostGIS:

SELECT PostGIS_Version();
Expected:

3.x
Check tables:

\dt

21. Run Alembic Migrations
After starting the database:

alembic upgrade head
Check migration status:

alembic current
Check whether new migrations are required:

alembic check
Expected:

No new upgrade operations detected.

22. Start FastAPI
Run:

python run.py
The backend will normally run at:

http://127.0.0.1:8000

23. API Documentation
Open:

http://127.0.0.1:8000/docs
FastAPI automatically generates Swagger UI.
Alternative:

http://127.0.0.1:8000/redoc

24. Health Check
Open:

GET /health
Example:

Invoke-RestMethod http://127.0.0.1:8000/health
Expected response:

{
"status": "healthy",
"version": "0.1.0"
}

25. Authentication Usage
Register
POST /api/v1/auth/register
Example:

{
"name": "Test User",
"email": "test@example.com",
"phone": "9876543210",
"password": "StrongPassword123"
}

Login
POST /api/v1/auth/login
The login endpoint returns an access token.
The frontend should store the token securely.
For protected endpoints:

Authorization: Bearer <ACCESS_TOKEN>

26. Vehicle Workflow
After login:

Login
|
v
JWT Token
|
v
Create Vehicle
|
v
Vehicle ID
|
v
Create Breakdown
Example vehicle:

{
"registration_number": "UP16AB1234",
"make": "Maruti",
"model": "Swift",
"year": 2022
}

27. Create Breakdown
Endpoint:

POST /api/v1/breakdowns
Example:

{
"vehicle_id": 1,
"problem_type": "ENGINE_FAILURE",
"description": "Vehicle engine stopped suddenly while driving.",
"latitude": 28.6139,
"longitude": 77.2090
}
The backend:

Authenticates the user
Verifies vehicle ownership
Stores the breakdown
Stores GPS coordinates
Sets the initial status

28. Register Provider
Endpoint:

POST /api/v1/providers
Example:

{
"business_name": "Delhi Roadside Mechanics",
"contact_name": "Rahul Sharma",
"phone": "9812345678",
"service_type": "MECHANIC",
"latitude": 28.6139,
"longitude": 77.2090
}
The provider location is converted into a PostGIS geographic point.

29. Find Nearby Providers
Endpoint:

GET /api/v1/location/nearby-providers
Example:

latitude=28.6139
longitude=77.2090
radius_km=10
The backend:

Coordinates
|
v
PostGIS Point
|
v
ST_DWithin()
|
v
Providers within radius
|
v
Available providers
|
v
Distance sorting

30. Find Providers for a Breakdown
Endpoint:

GET /api/v1/breakdowns/{breakdown_id}/nearby-providers
Example:

GET /api/v1/breakdowns/1/nearby-providers?radius_km=10
The user does not need to provide coordinates.
The backend obtains the coordinates directly from the breakdown.

31. Automatic Assignment
Endpoint:

POST /api/v1/breakdowns/{breakdown_id}/assign-provider
Before assignment, the breakdown should be:

SEARCHING
Then the backend:

Breakdown
|
v
Problem Type
|
v
Service Mapping
|
v
Nearby Providers
|
v
Available Providers
|
v
Provider Ranking
|
v
Best Provider
|
v
provider_id stored
|
v
PROVIDER_ASSIGNED

32. Frontend Integration
The frontend team can use the backend immediately.
Recommended frontend flow:

Login/Register
|
v
Dashboard
|
v
My Vehicles
|
v
Request Assistance
|
v
Get GPS Location
|
v
Create Breakdown
|
v
Search Nearby Providers
|
v
Display Providers on Map
|
v
Assign Provider
|
v
Show Assigned Provider
|
v
Track Breakdown Status
The frontend should use the Swagger documentation as the current API contract.

33. API Authentication Requirement
Protected endpoints require:

Authorization: Bearer 
The frontend should:

Login
Receive JWT
Store token securely
Send token with protected requests

34. Local Frontend Connection
If frontend and backend run on the same computer:

http://127.0.0.1:8000
If the frontend runs on another computer on the same network, 127.0.0.1 will NOT work.
The backend must be exposed using the host machine's LAN IP or deployed to a server.
For team development, AWS deployment can later provide a common backend URL.

35. Current Limitations
The current version is an MVP.
It currently does not yet include:

Provider-specific authentication
Provider accept/reject workflow
Real road distance
Real road ETA
Traffic prediction
Redis caching
Push notifications
SMS
Email notifications
Advanced ML provider ranking
Historical assignment analytics
Production HTTPS
Nginx reverse proxy
AWS deployment

36. Upcoming Development
Phase 10 - Provider Authentication
Create provider accounts and securely identify providers.

Provider Account
|
v
Provider Login
|
v
Provider JWT
This will allow only the assigned provider to accept or reject an assignment.

Phase 11 - Provider Acceptance
Workflow:

PROVIDER_ASSIGNED
|
+---- ACCEPT ----> PROVIDER_EN_ROUTE
|
+---- REJECT ----> SEARCHING
If rejected, the system can find another provider.

Phase 12 - OSRM Routing
Currently PostGIS provides geographic distance.
Later:

Provider
|
v
OSRM
|
v
Road Route
|
+--> Road Distance
|
+--> ETA
This will provide actual road-based routing instead of straight-line geographic distance.

Phase 13 - Redis
Redis will be used for:

Nearby provider caching
Route caching
ETA caching
Frequently requested locations

Phase 14 - Machine Learning
Potential ML components:

ETA Prediction
Predict arrival time using:

Distance
Time of day
Day of week
Traffic
Provider speed
Historical trips

Provider Ranking
Predict the best provider using:

Distance
Rating
Acceptance rate
Response time
Historical success
Service type
Availability

Provider Acceptance Prediction
Predict:

Will provider accept this request?
This can improve automatic assignment.

37. Testing
Tests should cover:

Authentication
User creation
Vehicle CRUD
Breakdown CRUD
Breakdown ownership
Status transitions
Provider CRUD
Provider availability
PostGIS search
Radius filtering
Service filtering
Provider ranking
Provider assignment
Run:

pytest -v

38. Common Problems
Problem: PostgreSQL authentication failed
Check:

DATABASE_URL
Make sure:

host = localhost
port = 5433
database = roadside_assistance
username = postgres
password = correct password

Problem: PostGIS location NOT NULL error
The provider location column is required.
When creating a provider, the backend must create:

POINT(longitude latitude)
using:

WKTElement(
f"POINT({longitude} {latitude})",
srid=4326,
)

Problem: Alembic detects spatial_ref_sys
Do not delete spatial_ref_sys.
It belongs to PostGIS.
Alembic should exclude it using an include_object filter in:

alembic/env.py

Problem: Circular import involving models
app/database/base.py should only contain the SQLAlchemy declarative base.
It should NOT import application models.
Correct concept:

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
pass
Models should import Base, not the other way around.

39. Security Notes
Never commit:

.env
database passwords
JWT secrets
API keys
private credentials
Use:

.env
locally and environment variables in production.
For production:

Use HTTPS
Use strong JWT secrets
Restrict CORS
Validate all user input
Use database least-privilege accounts
Enable secure logging
Do not expose PostgreSQL publicly
Use secrets management

40. Development Philosophy
The backend is intentionally being developed incrementally.
Each phase is implemented and tested before moving to the next phase.
Current architecture follows:

API Layer
↓
Schema Layer
↓
Service Layer
↓
Database Layer
↓
PostgreSQL / PostGIS
This separation makes the backend easier to:

Test
Maintain
Scale
Extend
Connect with Machine Learning services

41. Current Project Status
Current backend MVP:

FastAPI                 ✅
PostgreSQL              ✅
PostGIS                 ✅
SQLAlchemy              ✅
Alembic                 ✅
JWT Authentication      ✅
Vehicle APIs             ✅
Breakdown APIs           ✅
Provider APIs            ✅
Location Search          ✅
Service Mapping          ✅
Provider Ranking         ✅
Provider Assignment      ✅
Upcoming:

Provider Authentication  ⏳
Provider Accept/Reject   ⏳
OSRM Routing             ⏳
Real ETA                 ⏳
Redis                    ⏳
Notifications            ⏳
Machine Learning         ⏳
Automated Testing        ⏳
Docker/Nginx             ⏳
AWS Deployment           ⏳

42. Quick Start
For a new developer:

Clone project
git clone

Enter project
cd geo-roadside-backend

Create virtual environment
python -m venv .venv

Activate
..venv\Scripts\Activate.ps1

Install dependencies
pip install -r requirements.txt

Start PostgreSQL/PostGIS
docker compose up -d

Apply migrations
alembic upgrade head

Start backend
python run.py
Open:

http://127.0.0.1:8000/docs

43. Backend-to-Frontend Handoff
The frontend team can start development using the current API.
They should use:

Swagger:
http://127.0.0.1:8000/docs
The backend provides the core functionality required for:

Authentication UI
Vehicle management
Breakdown reporting
GPS-based provider discovery
Provider display
Provider assignment
Breakdown status tracking
Backend and frontend development can continue in parallel.

44. Final Architecture Goal
The final system will evolve into:

                     USER
                      |
                      v
              React / Flutter
                      |
                      v
                 HTTPS / Nginx
                      |
                      v
                   FastAPI
                      |
      +---------------+---------------+
      |               |               |
      v               v               v
   Auth           Breakdown       Provider
      |               |               |
      +---------------+---------------+
                      |
                      v
                PostgreSQL
                      |
                   PostGIS
                      |
                      v
              Nearby Providers
                      |
                      v
                OSRM Routing
                      |
                      v
                Redis Cache
                      |
                      v
                ML Services
                      |
      +---------------+---------------+
      |               |               |
      v               v               v
  ETA Model     Provider Ranking   Traffic Model
                      |
                      v
              Best Provider
                      |
                      v
              Notification Service
                      |
                      v
                     USER
45. Conclusion
This backend provides the core foundation for a geo-intelligent roadside assistance platform.
The current implementation combines:

REST APIs
Authentication
Relational database design
Geospatial database operations
Location-based provider discovery
Service matching
Provider ranking
Automatic provider assignment