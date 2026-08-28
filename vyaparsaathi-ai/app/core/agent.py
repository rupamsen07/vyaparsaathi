import json
import os
import asyncio
import time
from collections import deque
from pathlib import Path
from dotenv import load_dotenv
from deep_translator import GoogleTranslator
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.models.state import VyaparState, UserProfile, BusinessContext, FinancialEvaluation
from app.core.finance import calculate_mosje_micro_finance

# Load the backend's .env regardless of the shell's current directory.
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path, override=True)
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise RuntimeError(f"GOOGLE_API_KEY is missing from {env_path}")

# Use a currently supported Gemini model.
extractor = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash", 
    temperature=0.0,
    google_api_key=google_api_key
)

speaker = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash", 
    temperature=0.4,
    google_api_key=google_api_key
)


class GeminiRateLimiter:
    """Keep free-tier traffic below the provider's RPM and RPD limits."""

    def __init__(self, calls_per_minute: int = 4, calls_per_day: int = 18):
        self.calls_per_minute = calls_per_minute
        self.calls_per_day = calls_per_day
        self.minute_calls = deque()
        self.day_calls = deque()
        self.lock = asyncio.Lock()

    async def wait_for_slot(self):
        async with self.lock:
            while True:
                now = time.monotonic()
                while self.minute_calls and now - self.minute_calls[0] >= 60:
                    self.minute_calls.popleft()
                while self.day_calls and now - self.day_calls[0] >= 86400:
                    self.day_calls.popleft()

                if len(self.day_calls) >= self.calls_per_day:
                    raise RuntimeError("Gemini daily safety limit reached")
                if len(self.minute_calls) < self.calls_per_minute:
                    self.minute_calls.append(now)
                    self.day_calls.append(now)
                    return

                wait_seconds = 60 - (now - self.minute_calls[0])
                if wait_seconds > 8:
                    raise RuntimeError("Gemini minute safety limit reached")
                await asyncio.sleep(max(0.2, wait_seconds))


gemini_rate_limiter = GeminiRateLimiter()

EXTRACT_PROMPT = """You are a strict data extraction bot. 
Update the Current State based on the User Message.

Rules:
- `assets` and `skills` must be lists of strings. 
- Put extra details in `business_context.additional_details`.

Current State: 
{current_state}

User Message: 
"{user_message}"

Output ONLY valid JSON matching this schema exactly:
{{
    "user_profile": {{"language": null, "district": "Pune", "available_capital": null, "skills": [], "assets": []}},
    "business_context": {{"mode": null, "category": null, "business_name": null, "candidate_zones": [], "competitor_count": 0, "supply_distance_km": 0.0, "daily_input_cost": 0.0, "additional_details": {{}}}},
    "financial_evaluation": {{"total_project_cost": null, "margin_money_10pct": null, "loan_required_90pct": null, "scheme_matched": null, "estimated_monthly_emi": null, "break_even_days": 0}}
}}
"""

# Updated speaker prompt to strictly enforce the requested language
SPEAK_PROMPT = """You are VyaparSaathi AI, an empathetic business advisor for rural Indian micro-entrepreneurs.

CRITICAL INSTRUCTION: You MUST respond ENTIRELY in {language}. Do not use English unless the requested language is English.

Review the current user state: {state_json}

Conversation so far:
{chat_history}

The user just said: "{user_message}"

You need to ask them about this specific missing detail: {target_topic}

Respond with a short, friendly conversational reply that acknowledges what they just said, and then asks a question about the target topic.
Limit your response to 2 sentences. Your response MUST end with a question mark (?).
"""

def _merge_state_values(existing, extracted):
    if isinstance(existing, dict) and isinstance(extracted, dict):
        merged = dict(existing)
        for key, value in extracted.items():
            if key not in merged:
                merged[key] = value
            else:
                merged[key] = _merge_state_values(merged[key], value)
        return merged

    if isinstance(existing, list) and isinstance(extracted, list):
        if not extracted:
            return existing
        return list(dict.fromkeys(existing + extracted))

    if extracted is None or extracted == "":
        return existing
    return extracted


def _response_text(content) -> str:
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        text_parts = []
        for block in content:
            if isinstance(block, str):
                text_parts.append(block)
            elif isinstance(block, dict) and isinstance(block.get("text"), str):
                text_parts.append(block["text"])
        return "".join(text_parts).strip()
    return str(content).strip()


def _is_translation_error(text: str) -> bool:
    error_markers = (
        "error 500",
        "server error",
        "that's an error",
        "service unavailable",
        "too many requests",
    )
    normalized = text.lower()
    return any(marker in normalized for marker in error_markers)


async def process_chat_message(current_state: VyaparState, user_message: str, chat_history: list) -> dict:
    state_dict = current_state.model_dump()
    
    # 1. EXTRACT STATE FIRST
    extract_chain = ChatPromptTemplate.from_template(EXTRACT_PROMPT) | extractor
    await gemini_rate_limiter.wait_for_slot()
    extract_resp = await extract_chain.ainvoke({
        "current_state": json.dumps(state_dict),
        "user_message": user_message
    })
    
    try:
        content = _response_text(extract_resp.content)
        # Strip markdown code blocks if Gemini adds them
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        extracted_state_dict = json.loads(content)
        if "user_profile" not in extracted_state_dict and len(extracted_state_dict.keys()) == 1:
            extracted_state_dict = list(extracted_state_dict.values())[0]
        updated_state_dict = _merge_state_values(state_dict, extracted_state_dict)
        # Language is selected by the client and must not be inferred by extraction.
        if state_dict.get("user_profile") and updated_state_dict.get("user_profile"):
            updated_state_dict["user_profile"]["language"] = state_dict["user_profile"].get("language")
        updated_state = VyaparState(**updated_state_dict)
    except Exception as e:
        print(f"Extraction Error: {e}")
        updated_state = current_state

    # 2. PYTHON STATE MACHINE
    target_topic = "Ask if they need help with any other planning."
    
    if not updated_state.business_context or not updated_state.business_context.business_name:
        target_topic = "Ask them what exact business they want to start (e.g., food cart, tailoring)."
    elif not updated_state.user_profile or not updated_state.user_profile.available_capital:
        target_topic = "Ask how much total money (capital) they currently have available to start."
    elif not updated_state.financial_evaluation or not updated_state.financial_evaluation.total_project_cost:
        target_topic = "Ask them what their estimated TOTAL setup cost will be in rupees."
    elif not updated_state.business_context or not updated_state.business_context.candidate_zones:
        target_topic = "Ask exactly where they plan to locate or open this business (which street or area)."
    elif not updated_state.user_profile or not updated_state.user_profile.skills:
        target_topic = "Ask what related skills or experience they have for this specific business."
    elif not updated_state.user_profile or not updated_state.user_profile.assets:
        target_topic = "Ask what equipment or assets they already own for this business."

    # 3. GENERATE THE TEXT RESPONSE
    # Safely get the requested language from the frontend, default to English
    current_language = updated_state.user_profile.language if updated_state.user_profile and updated_state.user_profile.language else "English"
    
    speak_chain = ChatPromptTemplate.from_template(SPEAK_PROMPT) | speaker
    await gemini_rate_limiter.wait_for_slot()
    speak_resp = await speak_chain.ainvoke({
        "language": current_language,
        "state_json": updated_state.model_dump_json(),
        "user_message": user_message,
        "target_topic": target_topic,
        "chat_history": json.dumps(chat_history[-10:])
    })
    
    reply_text = _response_text(speak_resp.content)

    # Trigger MoSJE calculation
    if updated_state.financial_evaluation and updated_state.financial_evaluation.total_project_cost:
        cost = updated_state.financial_evaluation.total_project_cost
        fin_calc = calculate_mosje_micro_finance(cost)
        updated_state.financial_evaluation.margin_money_10pct = fin_calc["beneficiary_margin"]
        updated_state.financial_evaluation.loan_required_90pct = fin_calc["loan_amount"]
        updated_state.financial_evaluation.estimated_monthly_emi = fin_calc["monthly_emi"]
        updated_state.financial_evaluation.scheme_matched = fin_calc["scheme_name"]

    return {
        "updated_state": updated_state,
        "response_text": reply_text
    }


async def translate_chat_history(chat_history: list, language: str) -> list:
    """Translate the displayed transcript without using Gemini."""
    if not chat_history:
        return []

    language_codes = {
        "English": "en",
        "Hindi": "hi",
        "Marathi": "mr",
        "Gujarati": "gu",
        "Bengali": "bn",
    }
    target = language_codes.get(language, "en")

    def translate_text(text: str) -> str:
        if not text.strip():
            return text
        translated = GoogleTranslator(source="auto", target=target).translate(text)
        if not isinstance(translated, str) or _is_translation_error(translated):
            raise RuntimeError("Translation provider returned an error response")
        return translated

    translated = []
    for message in chat_history:
        text = message.get("text", "")
        translated_text = text
        for attempt in range(3):
            try:
                translated_text = await asyncio.to_thread(translate_text, text)
                break
            except Exception as error:
                if attempt == 2:
                    print(f"Translation fallback for message: {error}")
                else:
                    await asyncio.sleep(0.5 * (attempt + 1))
        translated.append({
            **message,
            "text": translated_text,
        })
    return translated