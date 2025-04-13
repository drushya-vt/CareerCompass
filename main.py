import os
import json
import datetime
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import chromadb
from openai import OpenAI
from groq import Groq

# Load API Keys
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("❌ Missing GROQ_API_KEY in the .env file.")

SYSTEM_PROMPT = "You are a helpful AI assistant. Answer strictly based on the given context."

# Initialize LangChain model
chat_model = ChatOpenAI(
    model="llama3-70b-8192",
    openai_api_key=GROQ_API_KEY,
    openai_api_base="https://api.groq.com/openai/v1"
)

CHAT_HISTORY_DIR = "chat_history"
os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)

app = FastAPI()

CHROMA_DB_PATH = "careervectorstorefinal"
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
openai_client = OpenAI(api_key=OPENAI_API_KEY or "sk-proj-...")
groq_client = Groq(api_key=GROQ_API_KEY)

# Conversation state
conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]

class ChatRequest(BaseModel):
    query: str

def get_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def save_conversation():
    timestamp = get_timestamp()
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

    print(f"\n📁 Chat history saved as: {filepath}")
    return filename

def query_vector_store(query, n_results=3):
    collection = chroma_client.get_collection(name="job_descriptions_batch")
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    ).data[0].embedding
    return collection.query(query_embeddings=[query_embedding], n_results=n_results)

def get_relevant_context(query):
    results = query_vector_store(query, n_results=3)
    if not results.get("documents") or not results["documents"][0]:
        return ""

    context = ""
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
        context += f"Supplemental Tasks: {doc_lines[9][18:][:100]}...\n" if len(doc_lines) > 9 else "Supplemental Tasks: None\n\n"

    return context

def send_message(user_message):
    global conversation_history

    if len(conversation_history) == 1:  # Only system message
        context = get_relevant_context(user_message)
        if not context.strip():
            fallback = (
                "I couldn't find much information on that topic. "
                "Try refining your query or check platforms like "
                "[Indeed](https://www.indeed.com) or [LinkedIn](https://www.linkedin.com/jobs/)."
            )
            save_conversation()
            return {"query": user_message, "response": fallback}

        full_prompt = f"""You are an AI assistant helping with job-related queries.\nUse the following summarized job descriptions to answer the query.\nFocus on titles, descriptions, key skills, education, work experience, on-the-job training, work activities, technical skills, core tasks, and supplemental tasks. If the information isn’t sufficient, suggest what might help.\n\nQuery: {user_message}\n\nContext:\n{context}\n\nAnswer:"""

        conversation_history.append(HumanMessage(content=full_prompt))
    else:
        conversation_history.append(HumanMessage(content=user_message))

    assistant_reply = chat_model.invoke(conversation_history)
    conversation_history.append(assistant_reply)

    return {"query": user_message, "response": assistant_reply.content}

@app.post("/chatbot")
async def chatbot_endpoint(request: ChatRequest):
    try:
        return send_message(request.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/exit")
async def exit_chat():
    try:
        filename = save_conversation()
        global conversation_history
        conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]
        return {"message": "Conversation saved and chat reset.", "file": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def list_saved_chats():
    try:
        files = [f for f in os.listdir(CHAT_HISTORY_DIR) if f.endswith(".json")]
        return {"saved_chats": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/resume/{filename}")
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

        return {"message": f"Conversation '{filename}' resumed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
