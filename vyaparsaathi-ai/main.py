import asyncio
import json
import time
from typing import Literal
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel, Field
import requests
from app.models.state import VyaparState
from app.core.finance import calculate_mosje_micro_finance
from app.core.city_data import load_city_market_data
from app.core.city_planner import (
    calculate_financial_plan,
    calculate_market_gap,
    calculate_opportunity_score,
    estimate_daily_sales,
    find_best_sales_window,
    weather_advice,
)
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

class OpportunityScoreRequest(BaseModel):
    demand: float = Field(ge=0, le=100)
    competition: float = Field(ge=0, le=100)
    skill: float = Field(ge=0, le=100)
    budget: float = Field(ge=0, le=100)
    supply: float = Field(ge=0, le=100)
    timing: float = Field(ge=0, le=100)

class MarketGapRequest(BaseModel):
    place_count: int = Field(ge=0)
    population: int = Field(gt=0)
    city_median_places_per_10000: float = Field(ge=0)

class RushClockRequest(BaseModel):
    hourly_rush_index: dict[str, float]
    working_hours: Literal["morning", "lunch", "evening", "full_day"]

class FootfallForecastRequest(BaseModel):
    people_count: float = Field(ge=0)
    minutes_counted: float = Field(gt=0)
    selling_hours: float = Field(ge=0)
    buying_rate: float = Field(default=0.015, ge=0, le=1)

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

@app.get("/api/city/market-data")
async def city_market_data(city: Literal["Bengaluru", "Pune"] = Query(...)):
    return load_city_market_data(city)

@app.post("/api/city/opportunity-score")
async def city_opportunity_score(req: OpportunityScoreRequest):
    return calculate_opportunity_score(req.model_dump())

@app.post("/api/city/market-gap")
async def city_market_gap(req: MarketGapRequest):
    return calculate_market_gap(
        req.place_count,
        req.population,
        req.city_median_places_per_10000,
    )

@app.post("/api/city/rush-clock")
async def city_rush_clock(req: RushClockRequest):
    try:
        return find_best_sales_window(req.hourly_rush_index, req.working_hours)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

@app.post("/api/city/footfall-forecast")
async def city_footfall_forecast(req: FootfallForecastRequest):
    try:
        return estimate_daily_sales(
            req.people_count,
            req.minutes_counted,
            req.selling_hours,
            req.buying_rate,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

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


weather_cache: dict[tuple[float, float], tuple[float, dict]] = {}


@app.get("/api/city/weather")
async def city_weather(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    cache_key = (round(latitude, 2), round(longitude, 2))
    cached = weather_cache.get(cache_key)
    if cached and time.monotonic() - cached[0] < 3600:
        return cached[1]

    try:
        response = await asyncio.to_thread(
            requests.get,
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "hourly": "temperature_2m,precipitation_probability",
                "forecast_days": 1,
                "timezone": "auto",
            },
            timeout=(3, 10),
        )
        response.raise_for_status()
        payload = response.json()
        hourly = payload["hourly"]
        forecasts = [
            {
                "time": forecast_time,
                "temperature_celsius": temperature,
                "precipitation_probability": rain_probability,
                "advice": weather_advice(temperature, rain_probability),
            }
            for forecast_time, temperature, rain_probability in zip(
                hourly["time"],
                hourly["temperature_2m"],
                hourly["precipitation_probability"],
                strict=True,
            )
        ]
    except (requests.RequestException, ValueError, KeyError, TypeError) as error:
        raise HTTPException(
            status_code=503,
            detail="Weather forecast is temporarily unavailable.",
        ) from error

    result = {
        "timezone": payload.get("timezone"),
        "hourly": forecasts,
        "confidence": "Live forecast",
    }
    weather_cache[cache_key] = (time.monotonic(), result)
    return result