import asyncio
from app.database import (
    users_collection,
    disease_collection,
    yield_collection,
    crops_collection,
    diseases_collection,
    feedback_collection,
    model_history_collection
)

async def inspect():
    print("USERS:", await users_collection.count_documents({}))
    print("DISEASE PREDICTIONS:", await disease_collection.count_documents({}))
    print("YIELD PREDICTIONS:", await yield_collection.count_documents({}))
    print("CROPS:", await crops_collection.count_documents({}))
    print("DISEASES:", await diseases_collection.count_documents({}))
    print("FEEDBACK:", await feedback_collection.count_documents({}))
    print("MODEL HISTORY:", await model_history_collection.count_documents({}))

    # Print sample disease_prediction
    sample_d = await disease_collection.find_one({})
    print("\nSAMPLE DISEASE PREDICTION DOCUMENT:")
    print(sample_d)

    # Print sample yield_prediction
    sample_y = await yield_collection.find_one({})
    print("\nSAMPLE YIELD PREDICTION DOCUMENT:")
    print(sample_y)

if __name__ == "__main__":
    asyncio.run(inspect())
