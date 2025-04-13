from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import chromadb
from groq import Groq
from openai import OpenAI
import tiktoken
import uvicorn
from fastapi.middleware.cors import CORSMiddleware




# Initialize FastAPI app
app = FastAPI()
# Initialize clients
# D:\Rajat_VTech\Semester_4\Capstone_Project_Ideas\Codebase\careervectorstorefinal
# careervectorstorefinal
# Allow all origins (or you can specify particular domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


CHROMA_DB_PATH = r"C:\Users\mohin\OneDrive\Desktop\capstone\careervectorstorefinal"  # Path to your persistent ChromaDB from the creation script
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
         context += f"### 📄 Document {i+1}\n"
         context += f"**🧑‍💼 Title:** {doc_lines[0][6:]}\n"
         context += f"**📘 Description:** {doc_lines[1][12:][:200]}...\n"
         context += f"**🛠️ Key Skills:**\n- {doc_lines[2][7:][:100]}...\n"
         context += f"**🎓 Education:**\n- {doc_lines[3][10:][:100]}...\n"
         context += f"**💼 Work Experience:**\n- {doc_lines[4][15:][:100]}...\n" if len(doc_lines) > 4 else "**💼 Work Experience:**\n- None\n"
         context += f"**🧪 On-the-Job Training:**\n- {doc_lines[5][21:][:100]}...\n" if len(doc_lines) > 5 else "**🧪 On-the-Job Training:**\n- None\n"
         context += f"**🧰 Work Activities:**\n- {doc_lines[6][15:][:100]}...\n" if len(doc_lines) > 6 else "**🧰 Work Activities:**\n- None\n"
         context += f"**🔧 Technical Skills:**\n- {doc_lines[7][17:][:100]}...\n" if len(doc_lines) > 7 else "**🔧 Technical Skills:**\n- None\n"
         context += f"**📋 Core Tasks:**\n- {doc_lines[8][11:][:100]}...\n" if len(doc_lines) > 8 else "**📋 Core Tasks:**\n- None\n"
         context += f"**➕ Supplemental Tasks:**\n- {doc_lines[9][18:][:100]}...\n" if len(doc_lines) > 9 else "**➕ Supplemental Tasks:**\n- None\n"
         context += "\n"

   

   
    
    # Construct prompt with summarized context
    prompt = f"""You are a career guidance assistant helping users explore job roles based on their interests and goals.
Use the summarized job descriptions below as your primary knowledge source to answer the user's query.
Base your answers strictly on the provided information, but if relevant, include industry-recognized certifications or skills that are commonly required or beneficial for the role.
Always ensure your answers are specific, helpful, and actionable.

Please format your response using **Markdown** for readability:

- Use `**bold**` to highlight important terms or requirements.
- Use `###` for key fields (e.g.,Title, Description Recommended Roles, Skills Needed).
- Use bullet points (`-`) for lists of roles, skills, or tips.
- Use `>` for additional notes, suggestions, or industry tips.
- Use emojis where appropriate to enhance readability.


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
            {"role": "system", "content": "You are a chatbot named CareerCompass. You are a highly knowledgeable and supportive career assistant. You are assisting a user explore career options and make informed decisions based on their interests, education, skills, and preferences. Each time the user converses with you, make sure the context is professional and about their career and that you are providing a helpful response. If the user asks you to do something that is not about a career guidance you should refuse to respond. Keep responses concise yet informative. Use bullet points or numbered lists to break down complex topics into digestible steps."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )

    
    answer = response.choices[0].message.content
    return {"query": query, "response": answer}


# print('Successful!')

# Run FastAPI locally
if __name__ == "__main__":
    
    uvicorn.run(app, host="127.0.0.1", port=8000)