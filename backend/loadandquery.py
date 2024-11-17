# import pandas as pd
# from sentence_transformers import SentenceTransformer, util
# import numpy as np
# import torch
# import ast

# # Load the dataset with embeddings
# df = pd.read_csv('code_data_with_embeddings.csv')

# # Convert 'code_embedding' back to lists (using literal_eval to safely interpret the string)
# df['code_embedding'] = df['code_embedding'].apply(lambda x: np.array(ast.literal_eval(x)))

# # Function for querying the model with user input
# def query_model(user_query, threshold=0.5):
#     # Generate embedding for the user query using Sentence-BERT
#     sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
#     query_embedding = sentence_model.encode(user_query)
    
#     # Ensure `query_embedding` has the correct shape and dtype
#     query_embedding = torch.tensor(query_embedding, dtype=torch.float32).unsqueeze(0)  # Shape: [1, embedding_dim]
    
#     # Calculate cosine similarities between the user query embedding and code embeddings
#     similarities = [
#         util.cos_sim(query_embedding, torch.tensor(row['code_embedding'], dtype=torch.float32).unsqueeze(0)).item()
#         for _, row in df.iterrows()
#     ]
    
#     # Find the index of the best match if the score meets the threshold
#     best_match_index = np.argmax(similarities)
#     best_match_score = similarities[best_match_index]
    
#     if best_match_score < threshold:
#         return "No relevant code found", None
    
#     best_code = df.loc[best_match_index, 'code']
#     best_filename = df.loc[best_match_index, 'filename']
    
#     return best_code, best_filename

# # Example usage
# user_query = "submit input text"
# code, filename = query_model(user_query)

# print("Best Matching Code:", code)
# print("Filename:", filename)


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import numpy as np
import torch
import ast

# Load the dataset with embeddings
df = pd.read_csv('C:\\Users\\Admin\\Desktop\\codesearcher2\\backend\\code_data_with_embeddings.csv')

# Convert 'code_embedding' back to lists (using literal_eval to safely interpret the string)
df['code_embedding'] = df['code_embedding'].apply(lambda x: np.array(ast.literal_eval(x)))

# Initialize the Sentence-BERT model
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

# Create the FastAPI app
app = FastAPI()

# Allow all origins for CORS (you can modify this for more restrictive policies)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (replace with a list of allowed domains if needed)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Define the request model for the user query
class QueryRequest(BaseModel):
    query: str
    threshold: float = 0.5  # Default threshold for similarity score

# Function for querying the model with user input
def query_model(user_query, threshold=0.5):
    # Generate embedding for the user query using Sentence-BERT
    sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
    query_embedding = sentence_model.encode(user_query)
    
    # Ensure `query_embedding` has the correct shape and dtype
    query_embedding = torch.tensor(query_embedding, dtype=torch.float32).unsqueeze(0)  # Shape: [1, embedding_dim]
    
    # Calculate cosine similarities between the user query embedding and code embeddings
    similarities = [
        util.cos_sim(query_embedding, torch.tensor(row['code_embedding'], dtype=torch.float32).unsqueeze(0)).item()
        for _, row in df.iterrows()
    ]
    
    # Find the index of the best match if the score meets the threshold
    best_match_index = np.argmax(similarities)
    best_match_score = similarities[best_match_index]
    if best_match_score < threshold:
        return "No relevant code found", None,None
    
    best_code = df.loc[best_match_index, 'code']
    best_filename = df.loc[best_match_index, 'filename']
    best_context = df.loc[best_match_index, 'context']
    print(best_code,best_filename,best_context)
    return best_code, best_filename,best_context
# Define the API endpoint for querying
@app.post("/query")
async def query_api(request: QueryRequest):
    try:
        # Extract the query and threshold from the request
        user_query = request.query
        threshold = request.threshold
        
        # Get the best matching code and filename
        code, filename ,context = query_model(user_query, threshold)
        
        if code == "No relevant code found":
            return {"message":"No relevant Context found"}
        
        return {"code": code, "folder": filename,"message":context}
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# Run the API server with `uvicorn app:app --reload`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8080)