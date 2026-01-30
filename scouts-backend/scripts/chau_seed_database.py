"""
Database seeding script.
Run this script to populate the database with initial data.

Usage:
    python -m scripts.seed_database
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.chau import Chau
from app.db.seeds.chau_seed_data import CHAU_SEED_DATA


async def seed_chau_table(db: AsyncSession) -> None:
    """Seed the CHAU table with initial data."""
    print("🌱 Seeding CHAU table...")
    
    for data in CHAU_SEED_DATA:
        # Check if record with this name already exists
        from sqlalchemy import select
        stmt = select(Chau).where(Chau.ten_chau == data["ten_chau"])
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"   ⏭️  Skipping {data['ten_chau']} (already exists)")
            continue
        
        # Create new record
        chau = Chau(**data)
        db.add(chau)
        print(f"   ✅ Added {data['ten_chau']}")
    
    await db.commit()
    print("✅ CHAU table seeded successfully!\n")


async def seed_database() -> None:
    """Main seeding function."""
    print("\n" + "="*50)
    print("🚀 Starting database seeding...")
    print("="*50 + "\n")
    
    async with AsyncSessionLocal() as db:
        try:
            await seed_chau_table(db)
            print("="*50)
            print("✨ All seeding completed successfully!")
            print("="*50 + "\n")
        except Exception as e:
            print(f"\n❌ Error during seeding: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())
