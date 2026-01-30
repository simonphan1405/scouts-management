# Fix for CHAU Auto-Increment Issue

## Problem

When creating new CHAU records, you get this error:

```
duplicate key value violates unique constraint "CHAU_pkey"
DETAIL: Key (chau_id)=(2) already exists.
```

## Root Cause

The `chau_id` column didn't have auto-increment enabled, and after inserting seed data with explicit IDs (1, 2, 3), the PostgreSQL sequence wasn't synced with the actual max ID in the table.

## Solution Applied

### 1. Fixed the Model

Updated [`src/app/models/chau.py`](file:///Users/hieuphan/web-development/projects/scouts/scouts-backend/src/app/models/chau.py) to add `autoincrement=True`:

```python
chau_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
```

### 2. Created Migration

Created migration file [`fix_chau_sequence_fix_chau_sequence_after_seed_data.py`](file:///Users/hieuphan/web-development/projects/scouts/scouts-backend/alembic/versions/fix_chau_sequence_fix_chau_sequence_after_seed_data.py) that will:

- Create the sequence `CHAU_chau_id_seq` if it doesn't exist
- Set the sequence to start from `max(chau_id) + 1`
- Link the sequence to the `chau_id` column

## How to Apply the Fix

Since your app runs in Docker, execute the migration inside the container:

```bash
cd /Users/hieuphan/web-development/projects/scouts/scouts-backend

# Run migration in Docker container
docker-compose exec backend alembic upgrade head
```

**Alternative:** If the backend container name is different:

```bash
# Find the container name
docker ps

# Run migration with the actual container name
docker exec -it <backend-container-name> alembic upgrade head
```

## Verify the Fix

After running the migration, test creating a new CHAU:

```bash
curl -X POST "http://localhost:8000/api/v1/chau" \
  -H "Content-Type: application/json" \
  -d '{
    "ten_chau": "Test Chau",
    "dia_chi": "Test Location",
    "mo_ta": "Test Description"
  }'
```

The new record should be created with `chau_id=4` (or the next available ID).

## What the Migration Does

The migration executes this SQL:

1. **Gets max ID**: `SELECT MAX(chau_id) FROM "CHAU"` → returns 3
2. **Creates sequence**: `CREATE SEQUENCE "CHAU_chau_id_seq"`
3. **Sets sequence**: `ALTER SEQUENCE "CHAU_chau_id_seq" RESTART WITH 4`
4. **Links to column**: `ALTER TABLE "CHAU" ALTER COLUMN chau_id SET DEFAULT nextval('CHAU_chau_id_seq')`

Now when you insert without specifying `chau_id`, PostgreSQL will automatically use the next value from the sequence (4, 5, 6, etc.).
