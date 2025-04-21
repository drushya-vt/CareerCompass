import os
import json
import datetime
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from app.core.config import logger, CHAT_HISTORY_DIR, SYSTEM_PROMPT, chat_model
from app.services.vector import query_vector_store

# Conversation state
conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]

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

    logger.info(f"Chat history saved as: {filepath}")
    return filename

def send_message(user_message):
    global conversation_history

    if len(conversation_history) == 1:  # Only system message
        context = query_vector_store(user_message)
        if not context or not context.get("documents") or not context["documents"][0]:
            fallback = (
                "I couldn't find much information on that topic. "
                "Try refining your query or check platforms like "
                "[Indeed](https://www.indeed.com) or [LinkedIn](https://www.linkedin.com/jobs/)."
            )
            save_conversation()
            return {"query": user_message, "response": fallback}

        context_str = ""
        for i, doc in enumerate(context['documents'][0][:3]):
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

        full_prompt = f"""You are an AI assistant helping with job-related queries.
Use the following summarized job descriptions to answer the query.
Focus on titles, descriptions, key skills, education, work experience, on-the-job training, work activities, technical skills, core tasks, and supplemental tasks. If the information isn't sufficient, suggest what might help.

Query: {user_message}

Context:
{context_str}

Answer:"""

        conversation_history.append(HumanMessage(content=full_prompt))
    else:
        conversation_history.append(HumanMessage(content=user_message))

    assistant_reply = chat_model.invoke(conversation_history)
    conversation_history.append(assistant_reply)

    return {"query": user_message, "response": assistant_reply.content}
