# Scouts Management System - Makefile
# Convenience commands for development and deployment

# Run backend locally with virtual environment
run-backend:
	@echo "Running the application..."
	@cd scouts-backend && . .venv/bin/activate && PYTHONPATH=src python -m uvicorn app.main:app --reload

# Start Docker Compose services
compose-up:
	@echo "Starting the application..."
	@cd scouts-backend && docker compose up -d --build
	@echo "Waiting for database to be ready..."
	@sleep 5

# Stop Docker Compose services
compose-down:
	@echo "Stopping the application..."
	@cd scouts-backend && docker compose down -v

# Run database migrations (requires services to be running)
migrate:
	@echo "Running database migrations..."
	@cd scouts-backend && docker compose exec api alembic upgrade head

# Start services and run migrations in one command
compose-up-migrate:
	@echo "Starting application and running migrations..."
	@cd scouts-backend && docker compose up -d --build
	@echo "Waiting for services to be ready..."
	@sleep 7
	@echo "Running migrations..."
	@cd scouts-backend && docker compose exec api alembic upgrade head
	@echo "✅ Application started and migrations completed!"

# Seed the database with initial data
seed:
	@echo "Seeding the database..."
	@cd scouts-backend && docker compose exec api python -m scripts.seed_database

# View API logs
logs:
	@cd scouts-backend && docker compose logs -f api

# View database logs
logs-db:
	@cd scouts-backend && docker compose logs -f db

# Help command
help:
	@echo "Available commands:"
	@echo "  make run-backend        - Run backend locally with venv"
	@echo "  make compose-up         - Start Docker services"
	@echo "  make compose-down       - Stop Docker services"
	@echo "  make migrate            - Run database migrations"
	@echo "  make compose-up-migrate - Start services + run migrations"
	@echo "  make seed               - Seed database with initial data"
	@echo "  make logs               - View API logs"
	@echo "  make logs-db            - View database logs"