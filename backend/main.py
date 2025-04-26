from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.core.config import get_cors_settings
from app.api import auth, chat

app = FastAPI()

# Add CORS middleware
app.add_middleware(CORSMiddleware, **get_cors_settings())

# Include routers
app.include_router(auth.router, tags=["auth"])
app.include_router(chat.router, tags=["chat"])

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
