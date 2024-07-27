import pandas as pd
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
import numpy as np

# Load your data
df = pd.read_csv('venues_all.csv')

# Print columns to verify
print("Columns in the DataFrame:", df.columns)

# Clean data
df['description'] = df['description'].fillna('').astype(str)

# Initialize your model
model = SentenceTransformer('all-MiniLM-L6-v2')
embedding_dimension = model.get_sentence_embedding_dimension()
print(f"Embedding dimension: {embedding_dimension}")

# Generate embeddings
df['embedding'] = df['description'].apply(lambda x: model.encode(x).tolist())

# Initialize Pinecone client
pc = Pinecone(api_key='43e2bb20-aced-41b0-88c2-d1631a0b1066')

# List existing indexes
indexes = pc.list_indexes().names()

# Delete the existing index if it exists
index_name = 'venues'
if index_name in indexes:
    try:
        pc.delete_index(index_name)
        print(f"Deleted existing index: {index_name}")
    except Exception as e:
        print(f"Error deleting index: {e}")

# Create a new index with the correct dimension
try:
    pc.create_index(
        name=index_name,
        dimension=embedding_dimension,
        metric='cosine',
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'  # Change this to your desired region
        )
    )
    print(f"Created new index: {index_name} with dimension: {embedding_dimension}")
except Exception as e:
    print(f"Error creating index: {e}")

# Connect to the index
index = pc.Index(index_name)

# Prepare data for upsert
data_to_upsert = []
for i, row in df.iterrows():
    metadata = {
        'name': row['name'],
        'city': row['city'],
        'state': row['state'],
        'max_capacity': row['max_capacity'] if not pd.isna(row['max_capacity']) else 0
    }
    if 'starting_price_cents' in row and not pd.isna(row['starting_price_cents']):
        metadata['starting_price'] = row['starting_price_cents']
    
    data_to_upsert.append({
        'id': str(i),
        'values': row['embedding'],
        'metadata': metadata
    })

# Remove entries with missing or malformed embeddings
data_to_upsert = [entry for entry in data_to_upsert if not any(np.isnan(entry['values']))]

# Define a function to upsert data in batches
def upsert_batches(index, vectors, batch_size=100):
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch)

# Upsert data to Pinecone in batches
upsert_batches(index, data_to_upsert, batch_size=100)

print("Data upserted successfully.")