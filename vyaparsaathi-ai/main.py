from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.models.state import VyaparState
from app.core.finance import calculate_mosje_micro_finance
from app.core.agent import process_chat_message, translate_chat_history

app = FastAPI(title="VyaparSaathi AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FinanceRequest(BaseModel):
    total_project_cost: float

# Inside main.py
class ChatRequest(BaseModel):
    state: VyaparState
    message: str
    chat_history: list = []  # Ensures the AI has memory

class TranslateChatRequest(BaseModel):
    chat_history: list
    language: str

@app.post("/api/chat-loop")
async def chat_loop_endpoint(req: ChatRequest):
    # Passes the state, the new message, and the history to the agent
    try:
        result = await process_chat_message(req.state, req.message, req.chat_history)
    except RuntimeError as error:
        if "Gemini" in str(error):
            raise HTTPException(status_code=429, detail="Gemini rate limit reached. Please try again shortly.") from error
        raise
    except Exception as error:
        error_text = str(error).lower()
        if "429" in error_text or "resource_exhausted" in error_text or "rate limit" in error_text:
            raise HTTPException(status_code=429, detail="Gemini rate limit reached. Please try again shortly.") from error
        raise
    return result

@app.post("/api/translate-chat")
async def translate_chat_endpoint(req: TranslateChatRequest):
    try:
        translated_history = await translate_chat_history(req.chat_history, req.language)
    except Exception as error:
        # Keep language switching usable if the external translator is unavailable.
        print(f"Chat translation unavailable: {error}")
        translated_history = req.chat_history
    return {"chat_history": translated_history}

@app.post("/api/evaluate-finance")
async def evaluate_finance(req: FinanceRequest):
    return calculate_mosje_micro_finance(req.total_project_cost)