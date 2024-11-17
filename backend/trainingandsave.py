import torch
from sentence_transformers import SentenceTransformer
import pandas as pd

# Initialize the model
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

# Load the dataset
df = pd.read_csv('code_data.csv')
print(df.columns)
# Create embeddings for each code context in the dataset
# Save embeddings to CSV with proper format (as a list)
df['code_embedding'] = df['code'].apply(lambda x: sentence_model.encode(x))  # Directly apply the embedding function
df[['code', 'context', 'filename', 'code_embedding']].to_csv('code_data_with_embeddings.csv', index=False)


print("Model embeddings saved as 'code_data_with_embeddings.csv'")
