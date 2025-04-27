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

from fastapi import Request
from dynamodb_client import chat_table  
from dynamodb_client import save_chat_history, get_chat_history


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

#Initialize clients and models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROMA_DB_PATH = os.path.join(BASE_DIR, "careervectorstorefinal")
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)  # ✅ Initialize first
collections = chroma_client.list_collections()  # ✅ Now this is valid
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
                doc_lines = doc.split('\n')  # Split document into lines
                context_str += f"### 📄 Document {i+1}\n"
                context_str += f"**🧑‍💼 Title:** {doc_lines[0][6:]}\n"
                context_str += f"**📘 Description:** {doc_lines[1][12:][:200]}...\n"
                context_str += f"**🛠️ Key Skills:**\n- {doc_lines[2][7:][:100]}...\n"
                context_str += f"**🎓 Education:**\n- {doc_lines[3][10:][:100]}...\n"
                context_str += f"**💼 Work Experience:**\n- {doc_lines[4][15:][:100]}...\n" if len(doc_lines) > 4 else "**💼 Work Experience:**\n- None\n"
                context_str += f"**🧪 On-the-Job Training:**\n- {doc_lines[5][21:][:100]}...\n" if len(doc_lines) > 5 else "**🧪 On-the-Job Training:**\n- None\n"
                context_str += f"**🧰 Work Activities:**\n- {doc_lines[6][15:][:100]}...\n" if len(doc_lines) > 6 else "**🧰 Work Activities:**\n- None\n"
                context_str += f"**🔧 Technical Skills:**\n- {doc_lines[7][17:][:100]}...\n" if len(doc_lines) > 7 else "**🔧 Technical Skills:**\n- None\n"
                context_str += f"**📋 Core Tasks:**\n- {doc_lines[8][11:][:100]}...\n" if len(doc_lines) > 8 else "**📋 Core Tasks:**\n- None\n"
                context_str += f"**➕ Supplemental Tasks:**\n- {doc_lines[9][18:][:100]}...\n" if len(doc_lines) > 9 else "**➕ Supplemental Tasks:**\n- None\n"
                context_str += "\n"
   
    
    # Construct prompt with summarized context
            full_prompt = f"""You are a career guidance assistant helping users explore job roles based on their interests and goals.
Use the summarized job descriptions below as your primary knowledge source to answer the user's query.
Base your answers strictly on the provided information, but if relevant, include industry-recognized certifications or skills that are commonly required or beneficial for the role.
Always ensure your answers are specific, helpful, and actionable.

Structure your response in clean, readable **Markdown** that works well with Tailwind CSS's `prose` styling. Be clear, organized, and visually appealing.

Formatting guidelines:
- Use `##` for main section headings (e.g., Job Roles, Skills, Education)
- Use `###` for sub-sections (e.g., Core Skills, Tools, Core Tasks)
- Use `-` for bullet points
- Use `>` for tips, quotes, or suggestions
- Ensure spacing between sections for readability
- Use emojis to enhance tone and understanding, but keep them relevant

Ensure:
- No repeated or redundant roles
- Clear separation between core content and tips
- Bullet lists and spacing render correctly
- Content is concise and scannable

Output only the Markdown-formatted response.


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
async def exit_chat(request: Request):
    global conversation_history
    try:
        username = request.query_params.get("username")
        if not username:
            raise HTTPException(status_code=400, detail="Username missing in exit request.")

        history_data = [
            {"role": "system", "content": conversation_history[0].content}
        ] + [
            {"role": "user" if isinstance(msg, HumanMessage) else "assistant", "content": msg.content}
            for msg in conversation_history[1:]
        ]

        chat_id = save_chat_history(username, history_data)

        logger.info(f"Chat history saved for {username} with chat_id: {chat_id}")

        conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]

        return {"message": "Conversation saved and chat reset.", "chat_id": chat_id}
    except Exception as e:
        logger.error(f"Error in exit chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint: List saved chat histories
@router.get("/history")
async def list_saved_chats(request: Request):
    try:
        username = request.query_params.get("username")
        if not username:
            raise HTTPException(status_code=400, detail="Username missing in history request.")

        chats = get_chat_history(user_id=username)
        return {"saved_chats": [item for item in chats]}
    except Exception as e:
        logger.error(f"Error listing saved chats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint: Resume a saved conversation
@router.get("/resume/{chat_id}")
async def resume_conversation(chat_id: str, request: Request):
    try:
        username = request.query_params.get("username")
        if not username:
            raise HTTPException(status_code=400, detail="Username missing in resume request.")

        record = get_chat_history(chat_id=chat_id)
        if not record:
            raise HTTPException(status_code=404, detail="Conversation not found.")

        conversation = record["history"]

        global conversation_history
        conversation_history = []
        for message in conversation:
            role = message["role"]
            content = message["content"]
            if role == "system":
                conversation_history.append(SystemMessage(content=content))
            elif role == "user":
                conversation_history.append(HumanMessage(content=content))
            elif role == "assistant":
                conversation_history.append(AIMessage(content=content))

        logger.info(f"Conversation '{chat_id}' resumed successfully")

        return {
            "message": f"Conversation '{chat_id}' resumed successfully.",
            "conversation": conversation
        }
    except Exception as e:
        logger.error(f"Error resuming conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# @router.post("/query")
# async def process_query(request: QueryRequest):
#     query = request.query  # Extract the query from the request body
#     results = query_vector_store(query, n_results=3)
    

    
#     # results = query_vector_store(query, n_results)
    
#     # Summarize context to focus on key fields
#     context = ""

#     for i, doc in enumerate(results['documents'][0][:3]):
#          doc_lines = doc.split('\n')  # Split document into lines
#          context += f"### 📄 Document {i+1}\n"
#          context += f"**🧑‍💼 Title:** {doc_lines[0][6:]}\n"
#          context += f"**📘 Description:** {doc_lines[1][12:][:200]}...\n"
#          context += f"**🛠️ Key Skills:**\n- {doc_lines[2][7:][:100]}...\n"
#          context += f"**🎓 Education:**\n- {doc_lines[3][10:][:100]}...\n"
#          context += f"**💼 Work Experience:**\n- {doc_lines[4][15:][:100]}...\n" if len(doc_lines) > 4 else "**💼 Work Experience:**\n- None\n"
#          context += f"**🧪 On-the-Job Training:**\n- {doc_lines[5][21:][:100]}...\n" if len(doc_lines) > 5 else "**🧪 On-the-Job Training:**\n- None\n"
#          context += f"**🧰 Work Activities:**\n- {doc_lines[6][15:][:100]}...\n" if len(doc_lines) > 6 else "**🧰 Work Activities:**\n- None\n"
#          context += f"**🔧 Technical Skills:**\n- {doc_lines[7][17:][:100]}...\n" if len(doc_lines) > 7 else "**🔧 Technical Skills:**\n- None\n"
#          context += f"**📋 Core Tasks:**\n- {doc_lines[8][11:][:100]}...\n" if len(doc_lines) > 8 else "**📋 Core Tasks:**\n- None\n"
#          context += f"**➕ Supplemental Tasks:**\n- {doc_lines[9][18:][:100]}...\n" if len(doc_lines) > 9 else "**➕ Supplemental Tasks:**\n- None\n"
#          context += "\n"

   

   
    
#     # Construct prompt with summarized context
#     prompt = f"""You are a career guidance assistant helping users explore job roles based on their interests and goals.
# Use the summarized job descriptions below as your primary knowledge source to answer the user's query.
# Base your answers strictly on the provided information, but if relevant, include industry-recognized certifications or skills that are commonly required or beneficial for the role.
# Always ensure your answers are specific, helpful, and actionable.

# Structure your response in clean, readable **Markdown** that works well with Tailwind CSS's `prose` styling. Be clear, organized, and visually appealing.

# Formatting guidelines:
# - Use `##` for main section headings (e.g., Job Roles, Skills, Education)
# - Use `###` for sub-sections (e.g., Core Skills, Tools, Core Tasks)
# - Use `-` for bullet points
# - Use `>` for tips, quotes, or suggestions
# - Ensure spacing between sections for readability
# - Use emojis to enhance tone and understanding, but keep them relevant

# Ensure:
# - No repeated or redundant roles
# - Clear separation between core content and tips
# - Bullet lists and spacing render correctly
# - Content is concise and scannable

# Output only the Markdown-formatted response.


# Query: {query}

# Context:
# {context}

# Answer:"""
    
#     # prompt_tokens = len(encoder.encode(prompt))
#     # print(f"Total prompt token count (query + context): {prompt_tokens}")
    
#     # Use Groq API to call LLaMA model
#     response = groq_client.chat.completions.create(
#         model="llama3-70b-8192",  # LLaMA model via Groq
#         messages=[
#             {"role": "system", "content": "You are a chatbot named CareerCompass. You are a highly knowledgeable and supportive career assistant. You are assisting a user explore career options and make informed decisions based on their interests, education, skills, and preferences. Each time the user converses with you, make sure the context is professional and about their career and that you are providing a helpful response. If the user asks you to do something that is not about a career guidance you should refuse to respond. Keep responses concise yet informative. Use bullet points or numbered lists to break down complex topics into digestible steps."},
#             {"role": "user", "content": prompt}
#         ],
#         max_tokens=500,
#         temperature=0.7
#     )

    
#     answer = response.choices[0].message.content
#     return {"query": query, "response": answer}
