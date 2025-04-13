import os
from fastapi import APIRouter, HTTPException
from app.core.config import logger, CHAT_HISTORY_DIR
from app.models.chat import ChatRequest
from app.services.chat import send_message, save_conversation, conversation_history
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from app.core.config import SYSTEM_PROMPT

router = APIRouter()

@router.post("/chatbot")
async def chatbot_endpoint(request: ChatRequest):
    try:
        return send_message(request.query)
    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/exit")
async def exit_chat():
    try:
        filename = save_conversation()
        global conversation_history
        conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]
        return {"message": "Conversation saved and chat reset.", "file": filename}
    except Exception as e:
        logger.error(f"Error in exit chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def list_saved_chats():
    try:
        files = [f for f in os.listdir(CHAT_HISTORY_DIR) if f.endswith(".json")]
        return {"saved_chats": files}
    except Exception as e:
        logger.error(f"Error listing saved chats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
        return {"message": f"Conversation '{filename}' resumed successfully."}
    except Exception as e:
        logger.error(f"Error resuming conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
