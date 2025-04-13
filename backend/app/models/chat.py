from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    query: str
