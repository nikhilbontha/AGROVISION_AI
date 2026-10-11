import sys
import os
import asyncio
import time

sys.path.append(os.path.abspath("backend"))

from dotenv import load_dotenv
load_dotenv("backend/.env")

from app.services.assistant_service import AssistantService

async def main():
    service = AssistantService()
    start = time.time()
    res = await service.process_message("What is the best fertilizer for cotton?", language="en", page_context="/")
    duration = time.time() - start
    print(f"Time taken: {duration:.2f}s")
    print("Reply:", res["reply"])
    print("Card:", res["card"])

    start = time.time()
    res2 = await service.process_message("వరి సాగులో నీటి యాజమాన్యం ఎలా ఉండాలి?", language="te", page_context="/")
    duration2 = time.time() - start
    print(f"Time taken 2: {duration2:.2f}s")
    print("Reply 2:", res2["reply"])

if __name__ == "__main__":
    asyncio.run(main())
