from fastapi import FastAPI, HTTPException, Form, Request
from typing import Dict
from pydantic import BaseModel
import json
import chromadb
from groq import Groq
from openai import OpenAI
import tiktoken
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Add test log messages
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize clients
# D:\Rajat_VTech\Semester_4\Capstone_Project_Ideas\Codebase\careervectorstorefinal
# careervectorstorefinal
CHROMA_DB_PATH = "/Users/siddhikasera/Desktop/career-compass/careervectorstorefinal"  # Path to your persistent ChromaDB from the creation script
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
openai_client = OpenAI(api_key="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")  # For query embedding
groq_client = Groq(api_key="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")  # Groq API key to call LLaMA


# File to store user data
USERS_FILE = 'users.json'

# Load users from file or create default if file doesn't exist
def load_users():
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default user database if file doesn't exist
        return {"testuser": {"password": "password123", "email": "test@example.com"}}

# Save users to file
def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

# Initialize user database
fake_users_db = load_users()
logged_in_users = {}

# Request model
class QueryRequest(BaseModel):
    query: str

# Function to query the vector store
def query_vector_store(query, n_results=3):
    # Get the collection created earlier
    collection = chroma_client.get_collection(name="job_descriptions_batch")
    
    # Generate query embedding using OpenAI
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    ).data[0].embedding
    
    # Query the ChromaDB collection
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    
    return results


# fake_users_db: Dict[str, str] = {}
class LoginRequest(BaseModel):
    username: str
    password: str

# Request body model
class UserRequest(BaseModel):
    username: str
    password: str
    email: str


# Sign Up Endpoint
@app.post("/signup")
async def signup(user: UserRequest):
    logger.debug(f"Received signup request for username: {user.username}")
    logger.debug(f"Request data: {user.dict()}")
    
    try:
        if user.username in fake_users_db:
            logger.warning(f"Signup failed - username already exists: {user.username}")
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Add user to database
        fake_users_db[user.username] = {
            "password": user.password,
            "email": user.email
        }
        
        # Save updated user database to file
        save_users(fake_users_db)
        
        logger.info(f"User registered successfully: {user.username}")
        logger.debug(f"Current users in db: {list(fake_users_db.keys())}")
        
        return {"message": "User registered successfully"}
        
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(user: LoginRequest):
    if user.username in fake_users_db and fake_users_db[user.username]["password"] == user.password:
        logged_in_users[user.username] = True
        return {"message": f"User {user.username} signed in successfully"}
    raise HTTPException(
        status_code=401, 
        detail="Invalid username or password"
    )

@app.post("/logout")
async def signout(user: UserRequest):
    if user.username in logged_in_users:
        del logged_in_users[user.username]  # Remove user from the logged-in list
        return {"message": f"User {user.username} signed out successfully"}
    
    raise HTTPException(status_code=400, detail="User is not signed in or session expired")


@app.post("/query")
async def process_query(request: QueryRequest):
    query = request.query  # Extract the query from the request body
    results = query_vector_store(query, n_results=3)
    # results = query_vector_store(query, n_results)
    
    # Summarize context to focus on key fields
    context = ""
    for i, doc in enumerate(results['documents'][0][:3]):
        doc_lines = doc.split('\n')  # Split document into lines
        context += f"Document {i+1}:\n"
        context += f"Title: {doc_lines[0][6:]}\n"  # Remove "Title: " prefix
        context += f"Description: {doc_lines[1][12:][:200]}...\n"  # Truncate to 200 chars
        context += f"Key Skills: {doc_lines[2][7:][:100]}...\n"  # Truncate to 100 chars
        context += f"Education: {doc_lines[3][10:][:100]}...\n"  # Truncate to 100 chars
        # Work Experience
        context += f"Work Experience: {doc_lines[4][15:][:100]}...\n" if len(doc_lines) > 4 else "Work Experience: None\n"
        # On-the-Job Training
        context += f"On-the-Job Training: {doc_lines[5][21:][:100]}...\n" if len(doc_lines) > 5 else "On-the-Job Training: None\n"
        context += f"Work Activities: {doc_lines[6][15:][:100]}...\n"  # Truncate to 100 chars
        context += f"Technical Skills: {doc_lines[7][17:][:100]}...\n"
        context += f"Core Tasks: {doc_lines[8][11:][:100]}...\n" if len(doc_lines) > 8 else "Core Tasks: None\n"
        context += f"Supplemental Tasks: {doc_lines[9][18:][:100]}...\n" if len(doc_lines) > 9 else "Supplemental Tasks: None\n"
        context += "\n"
    
    # Construct prompt - proper multi-line f-string formatting
    prompt = f"""You are an AI assistant helping with job-related queries.
    Use the following summarized job descriptions to answer the query.
    Focus on titles, descriptions, key skills, education, work experience,
    on-the-job training, work activities, technical skills, core tasks, and
    supplemental tasks. If the information isn’t sufficient, suggest what might help.


Query: {query}

Context:
{context}

Answer:"""
    
    # prompt_tokens = len(encoder.encode(prompt))
    # print(f"Total prompt token count (query + context): {prompt_tokens}")
    
    # Use Groq API to call LLaMA model
    response = groq_client.chat.completions.create(
        model="llama3-70b-8192",  # LLaMA model via Groq
        messages=[
            {"role": "system", "content": "You are a helpful AI career assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )
    
    answer = response.choices[0].message.content
    return {"query": query, "response": answer}
    
    # print(f"\nQuery: {query}")
    # print("\nRetrieved Documents (Summarized):")
    # for i in range(len(results['documents'][0])):
    #     doc_lines = results['documents'][0][i].split('\n')
    #     print(f"\nResult {i+1}:")
    #     print(f"Job Code: {results['ids'][0][i]}")
    #     print(f"Title: {results['metadatas'][0][i]['title']}")
    #     print(f"Distance: {results['distances'][0][i]}")
    #     print(f"Description: {doc_lines[1][12:][:200]}...")
    #     print(f"Key Skills: {doc_lines[2][7:][:100]}...")
    #     print(f"Education: {doc_lines[3][10:][:100]}...")
    #     print(f"Work Activities: {doc_lines[4][14:][:100]}...")
    #     print(f"Technical Skills: {doc_lines[7][15:][:100]}...")
    #     print(f"Core Tasks: {doc_lines[8][11:][:100]}...")
    #     print(f"Token Count: {results['metadatas'][0][i]['token_count']}")
    #     print("-" * 50)
    
    # print("\nLLaMA Response:")
    # print(answer)
    # print("=" * 70)
    # print(results["distances"][0])

# print('Successful!')

# Run FastAPI locally



if __name__ == "__main__":
    
    uvicorn.run(app, host="127.0.0.1", port=8000)