import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def clear():
    from app.database import disease_collection, yield_collection
    res1 = await disease_collection.delete_many({})
    res2 = await yield_collection.delete_many({})
    print(f"Deleted {res1.deleted_count} disease records and {res2.deleted_count} yield records.")

if __name__ == "__main__":
    asyncio.run(clear())
