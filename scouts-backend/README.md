# Scouts Backend API

A production-ready FastAPI backend skeleton following best practices with Clean Architecture, async SQLAlchemy, and comprehensive middleware.

## Features

- ✅ **FastAPI** framework with async/await support
- ✅ **SQLAlchemy 2.0** with async engine for database operations
- ✅ **Pydantic v2** for data validation and settings management
- ✅ **Clean Architecture** with separation of concerns (API → Service → Repository layers)
- ✅ **Custom middleware** for request ID, timing, and security headers
- ✅ **CORS** configuration for frontend integration
- ✅ **Exception handling** with consistent error responses
- ✅ **Logging** with structured output
- ✅ **Docker & Docker Compose** setup with PostgreSQL
- ✅ **Health check endpoints** for monitoring
- ✅ **Auto-generated API documentation** (Swagger UI & ReDoc)

## Architecture

The project follows Clean Architecture principles with clear separation of concerns:

```
src/app/
├── api/          # API layer - FastAPI routers and endpoints
├── core/         # Core utilities - exceptions, logging, middleware
├── db/           # Database configuration and session management
├── models/       # SQLAlchemy ORM models
├── schemas/      # Pydantic schemas for validation
├── services/     # Business logic layer
└── repositories/ # Data access layer
```

## Requirements

- Python 3.12+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

## Setup

### Local Development

1. **Clone the repository** (if applicable):

   ```bash
   cd /Users/hieuphan/web-development/projects/scouts/scouts-backend
   ```

2. **Create and activate virtual environment**:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start PostgreSQL** (if not using Docker):
   - Install and start PostgreSQL
   - Create database: `createdb scouts_db`

6. **Run the application**:

   ```bash
   # From the scouts-backend directory
   python -m uvicorn src.app.main:app --reload
   ```

   The API will be available at: http://localhost:8000

### Docker Development

1. **Start services**:

   ```bash
   docker-compose up -d
   ```

2. **View logs**:

   ```bash
   docker-compose logs -f api
   ```

3. **Stop services**:
   ```bash
   docker-compose down
   ```

## Database Migrations

This project uses **Alembic** for database schema management. All schema changes should be managed through migrations.

### Initial Setup

When setting up the project for the first time, run migrations to create the database schema:

```bash
# Activate virtual environment
source .venv/bin/activate

# Apply all migrations
alembic upgrade head
```

### Creating New Migrations

When you modify database models (in `src/app/models/`), create a new migration:

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Example:
# alembic revision --autogenerate -m "Add profile table"
```

**Important**: Always review the generated migration file in `alembic/versions/` before applying it.

### Applying Migrations

```bash
# Upgrade to the latest version
alembic upgrade head

# Upgrade to a specific version
alembic upgrade <revision_id>

# Upgrade by one version
alembic upgrade +1
```

### Rolling Back Migrations

```bash
# Downgrade by one version
alembic downgrade -1

# Downgrade to a specific version
alembic downgrade <revision_id>

# Downgrade all the way
alembic downgrade base
```

### Checking Migration Status

```bash
# Show current migration version
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic history --verbose
```

### Migration Workflow

1. **Modify your models** in `src/app/models/`
2. **Import the model** in `src/app/db/base.py` so Alembic can detect it
3. **Generate migration**: `alembic revision --autogenerate -m "description"`
4. **Review the migration** file in `alembic/versions/`
5. **Apply the migration**: `alembic upgrade head`
6. **Test your changes** with the application

### Important Notes

- Always run migrations before starting the application
- Never use `Base.metadata.create_all()` in production
- Commit migration files to version control
- Test migrations in development before applying to production

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Available Endpoints

### Health Checks

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/db` - Database health check

### Users (Example Resource)

- `GET /api/v1/users` - List all users (with pagination)
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/{id}` - Update a user
- `DELETE /api/v1/users/{id}` - Delete a user

## Environment Variables

See `.env.example` for all available configuration options:

- `DATABASE_URL` - PostgreSQL connection string
- `ENVIRONMENT` - development/production
- `DEBUG` - Enable debug mode
- `CORS_ORIGINS` - Allowed CORS origins
- `SECRET_KEY` - Secret key for JWT and encryption
- `LOG_LEVEL` - Logging level (INFO, DEBUG, WARNING, ERROR)

## Project Structure

```
scouts-backend/
├── src/
│   └── app/
│       ├── api/v1/            # API v1 endpoints
│       ├── core/              # Core utilities
│       ├── db/                # Database config
│       ├── models/            # Database models
│       ├── schemas/           # Pydantic schemas
│       ├── services/          # Business logic
│       ├── repositories/      # Data access
│       ├── config.py          # Settings
│       ├── dependencies.py    # DI utilities
│       └── main.py            # Application entry point
├── logs/                      # Application logs
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
├── .env.example               # Environment template
└── README.md                  # This file
```

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black src/
```

### Linting

```bash
ruff check src/
```

## Common Commands

```bash
# Run development server
python -m uvicorn src.app.main:app --reload

# Run with custom host/port
python -m uvicorn src.app.main:app --host 0.0.0.0 --port 8000

# Docker Compose
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f api    # View API logs
docker-compose exec api bash  # Shell into API container
docker-compose exec db psql -U admin -d scouts_db  # PostgreSQL shell
```

## Adding New Features

### 1. Create a Model

Add a new model in `src/app/models/`:

```python
from app.db.base import Base, TimestampMixin

class MyModel(Base, TimestampMixin):
    __tablename__ = "my_table"
    # ... fields
```

### 2. Create Schemas

Add Pydantic schemas in `src/app/schemas/`:

```python
from pydantic import BaseModel

class MyModelCreate(BaseModel):
    # ... fields
```

### 3. Create Repository

Add repository in `src/app/repositories/`:

```python
class MyModelRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    # ... methods
```

### 4. Create Service

Add service in `src/app/services/`:

```python
class MyModelService:
    def __init__(self, db: AsyncSession):
        self.repository = MyModelRepository(db)
    # ... business logic
```

### 5. Create Endpoints

Add endpoints in `src/app/api/v1/endpoints/`:

```python
router = APIRouter()

@router.get("")
async def get_items(db: AsyncSession = Depends(get_db)):
    # ... endpoint logic
```

### 6. Register Router

Update `src/app/api/v1/router.py`:

```python
api_router.include_router(
    my_endpoints.router,
    prefix="/my-resource",
    tags=["My Resource"]
)
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
