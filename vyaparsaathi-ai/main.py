import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel, Field
from app.models.state import VyaparState
from app.core.finance import calculate_mosje_micro_finance
from app.core.city_planner import calculate_financial_plan
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

class CityFinanceRequest(BaseModel):
    selling_price: float = Field(ge=0)
    unit_cost: float = Field(ge=0)
    fixed_monthly_cost: float = Field(ge=0)
    startup_cost: float = Field(ge=0)
    available_capital: float = Field(ge=0)
    daily_units: float = Field(default=0, ge=0)
    annual_interest_rate: float = Field(default=12, ge=0)
    loan_term_months: int = Field(default=12, ge=0)

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
        raise HTTPException(status_code=503, detail="Unable to translate the conversation right now.") from error
    return {"chat_history": translated_history}

@app.post("/api/evaluate-finance")
async def evaluate_finance(req: FinanceRequest):
    return calculate_mosje_micro_finance(req.total_project_cost)

@app.get("/api/city/business-templates")
async def city_business_templates():
    templates_path = Path(__file__).resolve().parent / "app" / "data" / "business_templates.json"
    with templates_path.open("r", encoding="utf-8") as templates_file:
        return {"business_templates": json.load(templates_file)}

@app.post("/api/city/finance")
async def evaluate_city_finance(req: CityFinanceRequest):
    try:
        return calculate_financial_plan(
            selling_price=req.selling_price,
            unit_cost=req.unit_cost,
            fixed_monthly_cost=req.fixed_monthly_cost,
            startup_cost=req.startup_cost,
            available_capital=req.available_capital,
            daily_units=req.daily_units,
            annual_interest_rate=req.annual_interest_rate,
            loan_term_months=req.loan_term_months,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error