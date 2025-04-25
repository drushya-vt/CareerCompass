# backend/app/api/chat.py
import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
import datetime
import logging
import chromadb
from groq import Groq
from openai import OpenAI
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ Missing GROQ_API_KEY in the .env file.")

# Initialize clients and models
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROMA_DB_PATH = os.path.join(BASE_DIR, "careervectorstorefinal")
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)  # ✅ Initialize first
collections = chroma_client.list_collections()  # ✅ Now this is valid
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
openai_client = OpenAI(api_key=OPENAI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)


chat_model = ChatOpenAI(
    model="llama3-70b-8192",
    openai_api_key=GROQ_API_KEY,
    openai_api_base="https://api.groq.com/openai/v1",
    max_tokens=800,
    temperature=0.7
)

# Set up chat history directory and system prompt
CHAT_HISTORY_DIR = "chat_history"
os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)
SYSTEM_PROMPT = "You are a chatbot named CareerCompass. You are a highly knowledgeable and supportive career assistant. You are assisting a user explore career options and make informed decisions based on their interests, education, skills, and preferences. Each time the user converses with you, make sure the context is professional and about their career and that you are providing a helpful response. If the user asks you to do something that is not about a career guidance you should refuse to respond. Keep responses concise yet informative. Use bullet points or numbered lists to break down complex topics into digestible steps."
conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]

# Request models
class QueryRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    query: str

# Helper function: Query the vector store
def query_vector_store(query: str, n_results: int = 3):
    collection = chroma_client.get_collection(name="job_descriptions_batch")
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    ).data[0].embedding
    return collection.query(query_embeddings=[query_embedding], n_results=n_results)

# Endpoint: /query
@router.post("/query")
async def process_query(request: QueryRequest):
    query = request.query
    results = query_vector_store(query, n_results=3)
    
    # Summarize context from the vector store results
    context = ""
    try:
        for i, doc in enumerate(results['documents'][0][:3]):
            doc_lines = doc.split('\n')
            context += f"Document {i+1}:\n"
            context += f"Title: {doc_lines[0][6:]}\n"
            context += f"Description: {doc_lines[1][12:][:200]}...\n"
            context += f"Key Skills: {doc_lines[2][7:][:100]}...\n"
            context += f"Education: {doc_lines[3][10:][:100]}...\n"
            context += f"Work Experience: {doc_lines[4][15:][:100]}...\n" if len(doc_lines) > 4 else "Work Experience: None\n"
            context += f"On-the-Job Training: {doc_lines[5][21:][:100]}...\n" if len(doc_lines) > 5 else "On-the-Job Training: None\n"
            context += f"Work Activities: {doc_lines[6][15:][:100]}...\n"
            context += f"Technical Skills: {doc_lines[7][17:][:100]}...\n"
            context += f"Core Tasks: {doc_lines[8][11:][:100]}...\n" if len(doc_lines) > 8 else "Core Tasks: None\n"
            context += f"Supplemental Tasks: {doc_lines[9][18:][:100]}...\n" if len(doc_lines) > 9 else "Supplemental Tasks: None\n"
            context += "\n"
    except Exception as e:
        logger.error(f"Error processing vector store results: {e}")
        raise HTTPException(status_code=500, detail="Error processing vector store results.")
    
    # Construct prompt for the LLM using the context
    prompt = f"""You are an AI assistant helping with job-related queries.
Use the following summarized job descriptions to answer the query.
Focus on titles, descriptions, key skills, education, work experience, on-the-job training, work activities, technical skills, core tasks, and supplemental tasks. If the information isn’t sufficient, suggest what might help.

Query: {query}

Context:
{context}

Answer:"""
    
    # Make the API call to the Groq model
    response = groq_client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": "You are a helpful AI career assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )
    answer = response.choices[0].message.content
    return {"query": query, "response": answer}

# Endpoint: /chatbot using conversation history
@router.post("/chatbot")
async def chatbot_endpoint(request: ChatRequest):
    global conversation_history
    try:
        if len(conversation_history) == 1:  # Only the system prompt exists
            context_results = query_vector_store(request.query, n_results=3)
            if not context_results or not context_results.get("documents") or not context_results["documents"][0]:
                fallback = ("I couldn't find much information on that topic. "
                            "Try refining your query or check specialized job platforms.")
                return {"query": request.query, "response": fallback}
            context_str = ""
            for i, doc in enumerate(context_results['documents'][0][:3]):
                doc_lines = doc.split('\n')
                context_str += f"Document {i+1}:\n"
                context_str += f"Title: {doc_lines[0][6:]}\n"
                context_str += f"Description: {doc_lines[1][12:][:200]}...\n"
                context_str += f"Key Skills: {doc_lines[2][7:][:100]}...\n"
                context_str += f"Education: {doc_lines[3][10:][:100]}...\n"
                context_str += f"Work Experience: {doc_lines[4][15:][:100]}...\n" if len(doc_lines) > 4 else "Work Experience: None\n"
                context_str += f"On-the-Job Training: {doc_lines[5][21:][:100]}...\n" if len(doc_lines) > 5 else "On-the-Job Training: None\n"
                context_str += f"Work Activities: {doc_lines[6][15:][:100]}...\n"
                context_str += f"Technical Skills: {doc_lines[7][17:][:100]}...\n"
                context_str += f"Core Tasks: {doc_lines[8][11:][:100]}...\n" if len(doc_lines) > 8 else "Core Tasks: None\n"
                context_str += f"Supplemental Tasks: {doc_lines[9][18:][:100]}...\n" if len(doc_lines) > 9 else "Supplemental Tasks: None\n\n"
            full_prompt = f"""You are a career guidance assistant helping users explore job roles based on their interests and goals.
Use the summarized job descriptions below as your primary knowledge source to answer the user's query.
Base your answers strictly on the provided information, but if relevant, include industry-recognized certifications or skills that are commonly required or beneficial for the role.
Always ensure your answers are specific, helpful, and actionable.


Query: {request.query}

Context:
{context_str}

Answer:"""
            conversation_history.append(HumanMessage(content=full_prompt))
        else:
            conversation_history.append(HumanMessage(content=request.query))
        
        assistant_reply = chat_model.invoke(conversation_history)
        conversation_history.append(assistant_reply)
        return {"query": request.query, "response": assistant_reply.content}
    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: Save and reset conversation
@router.post("/exit")
async def exit_chat():
    global conversation_history
    try:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"chat_{timestamp}.json"
        filepath = os.path.join(CHAT_HISTORY_DIR, filename)
        history_data = [
            {"role": "system", "content": conversation_history[0].content}
        ] + [
            {"role": "user" if isinstance(msg, HumanMessage) else "assistant", "content": msg.content}
            for msg in conversation_history[1:]
        ]
        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(history_data, file, indent=4)
        logger.info(f"Chat history saved as: {filepath}")
        conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]
        return {"message": "Conversation saved and chat reset.", "file": filename}
    except Exception as e:
        logger.error(f"Error in exit chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: List saved chat histories
@router.get("/history")
async def list_saved_chats():
    try:
        files = [f for f in os.listdir(CHAT_HISTORY_DIR) if f.endswith(".json")]
        return {"saved_chats": files}
    except Exception as e:
        logger.error(f"Error listing saved chats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: Resume a saved conversation
@router.get("/resume/{filename}")
async def resume_conversation(filename: str):
    try:
        filepath = os.path.join(CHAT_HISTORY_DIR, filename)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Conversation not found.")
        with open(filepath, "r", encoding="utf-8") as f:
            saved_data = json.load(f)

        global conversation_history
        conversation_history = []
        for message in saved_data:
            role = message["role"]
            content = message["content"]
            if role == "system":
                conversation_history.append(SystemMessage(content=content))
            elif role == "user":
                conversation_history.append(HumanMessage(content=content))
            elif role == "assistant":
                conversation_history.append(AIMessage(content=content))

        logger.info(f"Conversation '{filename}' resumed successfully")
        # Return both the message and the raw conversation data
        return {
            "message": f"Conversation '{filename}' resumed successfully.",
            "conversation": saved_data
        }
    except Exception as e:
        logger.error(f"Error resuming conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
