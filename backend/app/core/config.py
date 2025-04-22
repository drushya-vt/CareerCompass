import os
import logging
import sys
from dotenv import load_dotenv
from openai import OpenAI
from groq import Groq
import chromadb
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("❌ Missing GROQ_API_KEY in the .env file.")

# Initialize paths
CHROMA_DB_PATH = "careervectorstorefinal"
CHAT_HISTORY_DIR = "chat_history"
os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)

# Initialize clients
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
openai_client = OpenAI(api_key=OPENAI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

# Initialize LangChain model
chat_model = ChatOpenAI(
    model="llama3-70b-8192",
    openai_api_key=GROQ_API_KEY,
    openai_api_base="https://api.groq.com/openai/v1"
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# CORS settings
def get_cors_settings():
    return {
        "allow_origins": ["*"],
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
    }

# System prompt for chat
SYSTEM_PROMPT = "You are a helpful AI assistant. Answer strictly based on the given context."
