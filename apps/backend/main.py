from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import get_chat_response

app = FastAPI(title="AI Anime Dating Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Anime Dating Simulator Engine"}

from guard import validate_input

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    # if not validate_input(request.message):
    #     return {
    #         "reply": "Are you dumb or something? I have no idea what you're talking about, stop speaking nonsense!",
    #         "emotion": "Annoyed"
    #     }
        
    response = get_chat_response(request.message)
    return response
