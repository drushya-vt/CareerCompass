# backend/app/api/chat.py
import os
import json
import datetime
import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import chromadb
from groq import Groq
from openai import OpenAI
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage

from dynamodb.dynamodb_client import save_chat_history, get_chat_history

# Configure logging
logger = logging.getLogger(__name__)
router = APIRouter()

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ Missing GROQ_API_KEY in the .env file.")

# Initialize clients and models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROMA_DB_PATH = os.path.join(BASE_DIR, "careervectorstorefinal")
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

SYSTEM_PROMPT = "You are a chatbot named CareerCompass..."

# Per-user memory
user_conversations = {}
user_visible_histories = {}

# Request models
class QueryRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    query: str

# Helper function
def query_vector_store(query: str, n_results: int = 3):
    collection = chroma_client.get_collection(name="job_descriptions_batch")
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    ).data[0].embedding
    return collection.query(query_embeddings=[query_embedding], n_results=n_results)

@router.post("/chatbot")
async def chatbot_endpoint(chat: ChatRequest, request: Request):
    username = request.query_params.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")

    if username not in user_conversations:
        user_conversations[username] = [SystemMessage(content=SYSTEM_PROMPT)]
        user_visible_histories[username] = []

    conversation_history = user_conversations[username]
    visible_history = user_visible_histories[username]

    if len(conversation_history) == 1:
        context_results = query_vector_store(chat.query, n_results=3)
        if not context_results or not context_results.get("documents") or not context_results["documents"][0]:
            fallback = "I couldn't find much information."
            return {"query": chat.query, "response": fallback}

        context_str = ""
        for i, doc in enumerate(context_results['documents'][0][:3]):
            doc_lines = doc.split('\n')
            context_str += f"### 📄 Document {i+1}\n"
            context_str += f"**🧑‍💼 Title:** {doc_lines[0][6:]}\n"
            context_str += f"**📘 Description:** {doc_lines[1][12:][:200]}...\n"
            context_str += f"**🛠️ Key Skills:**\n- {doc_lines[2][7:][:100]}...\n"
            context_str += f"**🎓 Education:**\n- {doc_lines[3][10:][:100]}...\n"

        full_prompt = f"""You are a career guidance assistant...\n\nQuery: {chat.query}\n\nContext:\n{context_str}\n\nAnswer:"""
        conversation_history.append(HumanMessage(content=full_prompt))
    else:
        conversation_history.append(HumanMessage(content=chat.query))

    visible_history.append({"role": "user", "content": chat.query})
    assistant_reply = chat_model.invoke(conversation_history)
    conversation_history.append(assistant_reply)
    visible_history.append({"role": "assistant", "content": assistant_reply.content})

    return {"query": chat.query, "response": assistant_reply.content}

@router.post("/exit")
async def exit_chat(request: Request):
    username = request.query_params.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Username missing in exit request.")

    history_to_save = user_visible_histories.get(username, [])
    chat_id = save_chat_history(username, history_to_save)
    logger.info(f"Chat history saved for {username} with chat_id: {chat_id}")

    user_conversations[username] = [SystemMessage(content=SYSTEM_PROMPT)]
    user_visible_histories[username] = []

    return {"message": "Conversation saved and chat reset.", "chat_id": chat_id}

@router.get("/history")
async def list_saved_chats(request: Request):
    username = request.query_params.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Username missing in history request.")

    chats = get_chat_history(user_id=username)
    return {"saved_chats": [item for item in chats]}

@router.get("/resume/{chat_id}")
async def resume_conversation(chat_id: str, request: Request):
    username = request.query_params.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Username missing in resume request.")

    record = get_chat_history(chat_id=chat_id)
    if not record:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conversation = record["history"]
    full_convo = [SystemMessage(content=SYSTEM_PROMPT)]
    visible_history = []

    for message in conversation:
        role = message["role"]
        content = message["content"]
        if role == "user":
            full_convo.append(HumanMessage(content=content))
        elif role == "assistant":
            full_convo.append(AIMessage(content=content))
        visible_history.append({"role": role, "content": content})

    user_conversations[username] = full_convo
    user_visible_histories[username] = visible_history

    logger.info(f"Conversation '{chat_id}' resumed successfully")

    return {
        "message": f"Conversation '{chat_id}' resumed successfully.",
        "conversation": visible_history
    }
