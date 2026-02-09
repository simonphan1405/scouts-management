# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development Server
```bash
# Run development server with auto-reload
python -m uvicorn src.app.main:app --reload

# Run from within src.app.main (if __name__ == "__main__")
python -m src.app.main
```

### Database Migrations
```bash
# Create new migration after modifying models
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check current migration status
alembic current
```

### Database Seeding
```bash
# Run seed script (currently seeds CHAU table)
python scripts/chau_seed_database.py
```

### Docker
```bash
# Start all services (API + PostgreSQL)
docker-compose up -d

# View API logs
docker-compose logs -f api

# Stop services
docker-compose down

# PostgreSQL shell
docker-compose exec db psql -U admin -d scouts_db
```

### Code Quality
```bash
# Format code
black src/

# Lint code
ruff check src/

# Run tests
pytest
```

## Architecture Overview

This project follows **Clean Architecture** with strict layer separation:

```
Request → API Router → Service → Repository → Database
         ↓           ↓         ↓
      Schemas    Business   Data Access
                  Logic
```

### Layer Responsibilities

1. **API Layer** (`src/app/api/v1/endpoints/`): FastAPI routers that handle HTTP requests/responses. Use Pydantic schemas for validation.

2. **Service Layer** (`src/app/services/`): Business logic. Services instantiate repositories and orchestrate operations. Never access the database directly.

3. **Repository Layer** (`src/app/repositories/`): Data access patterns. All SQLAlchemy queries live here. Repositories receive AsyncSession in `__init__`.

4. **Models** (`src/app/models/`): SQLAlchemy ORM models. Inherit from `Base` and `TimestampMixin` for timestamps.

5. **Schemas** (`src/app/schemas/`): Pydantic models for request/response validation. Typically have Create, Update, and response variants.

### Key Patterns

- **Dependency Injection**: Use `get_db()` dependency to inject AsyncSession into endpoints
- **Auto-commit on success**: The `get_db()` dependency automatically commits transactions on success and rolls back on exceptions
- **Authentication**: Use `get_current_user`, `get_current_active_user`, or `get_current_superuser` dependencies for protected endpoints

## Adding New Features

Follow this workflow strictly to maintain architecture:

1. **Create Model** in `src/app/models/`:
   ```python
   from app.db.base import Base, TimestampMixin

   class MyModel(Base, TimestampMixin):
       __tablename__ = "my_table"
       # fields...
   ```

2. **Create Migration**:
   ```bash
   alembic revision --autogenerate -m "add my_table"
   # Review the generated migration file
   alembic upgrade head
   ```

3. **Create Schemas** in `src/app/schemas/`:
   - `MyModelCreate`: Fields required for creation
   - `MyModelUpdate`: Fields allowed for updates
   - `MyModelResponse`: Fields returned to client

4. **Create Repository** in `src/app/repositories/`:
   ```python
   class MyModelRepository:
       def __init__(self, db: AsyncSession):
           self.db = db

       async def get_by_id(self, id: int) -> MyModel | None:
           # Data access logic
   ```

5. **Create Service** in `src/app/services/`:
   ```python
   class MyModelService:
       def __init__(self, db: AsyncSession):
           self.repository = MyModelRepository(db)

       async def create(self, data: MyModelCreate) -> MyModel:
           # Business logic
   ```

6. **Create Endpoints** in `src/app/api/v1/endpoints/`:
   ```python
   @router.get("/my-resource/{id}")
   async def get_item(id: int, db: AsyncSession = Depends(get_db)):
       service = MyModelService(db)
       return await service.get_by_id(id)
   ```

7. **Register Router** in `src/app/api/v1/router.py`:
   ```python
   api_router.include_router(
       my_endpoints.router,
       prefix="/my-resource",
       tags=["My Resource"]
   )
   ```

## Important Notes

### Alembic Migration Discovery
Models are NOT imported in `src/app/db/base.py` to avoid circular imports. Instead, models are imported in `alembic/env.py` for migration discovery. When adding new models, ensure they're imported in `alembic/env.py`.

### Database Session Management
The `get_db()` dependency handles session lifecycle:
- Opens session
- Yields session to endpoint
- Auto-commits on success
- Auto-rolls back on exception
- Closes session

Never manually commit/rollback in repositories or services when using `get_db()`.

### Authentication Flow
- JWT tokens are expected in `Authorization: Bearer <token>` header
- `AuthService` handles token validation and user retrieval
- Use appropriate dependency based on requirements:
  - `get_current_user`: Any authenticated user
  - `get_current_active_user`: Active users only
  - `get_current_superuser`: Superusers only

### Middleware Stack
Applied in this order (bottom to top in code):
1. RequestIDMiddleware: Adds unique request ID
2. TimingMiddleware: Tracks request duration
3. SecurityHeadersMiddleware: Adds security headers
4. CORSMiddleware: Handles CORS

### Environment Configuration
All config lives in `src/app/config.py` using Pydantic Settings. Access via `settings` object. Environment variables are loaded from `.env` file.
