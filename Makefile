run-backend:
	@echo "Running the application..."
	@cd scouts-backend && . .venv/bin/activate && PYTHONPATH=src python -m uvicorn app.main:app --reload