from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import chromadb
from groq import Groq
from openai import OpenAI
import tiktoken
import uvicorn

# Initialize FastAPI app
app = FastAPI()
# Initialize clients
# D:\Rajat_VTech\Semester_4\Capstone_Project_Ideas\Codebase\careervectorstorefinal
# careervectorstorefinal
CHROMA_DB_PATH = "D:\Rajat_VTech\Semester_4\Capstone_Project_Ideas\Codebase\careervectorstorefinal"  # Path to your persistent ChromaDB from the creation script
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
openai_client = OpenAI(api_key="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")  # For query embedding
groq_client = Groq(api_key="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")  # Groq API key to call LLaMA

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

# Main function to process queries
# async def process_query(query, n_results=3,request: QueryRequest):
    # query_tokens = len(encoder.encode(query))
    # print(f"Query token count: {query_tokens}")
    # query = request.query  # Extract query from request

# API Endpoint
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
    
    # Construct prompt with summarized context
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