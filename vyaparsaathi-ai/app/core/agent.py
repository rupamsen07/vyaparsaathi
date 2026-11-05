import asyncio
import json
import os
import time
from collections import deque
from pathlib import Path

from dotenv import load_dotenv
from deep_translator import GoogleTranslator
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.chat_profile import localized_question, next_profile_field, rule_based_extraction
from app.models.state import VyaparState


env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path, override=True)
google_api_key = os.getenv("GOOGLE_API_KEY")

extractor = (
    ChatGoogleGenerativeAI(
        model="gemini-3.6-flash",
        temperature=0.0,
        google_api_key=google_api_key,
    )
    if google_api_key
    else None
)
speaker = (
    ChatGoogleGenerativeAI(
        model="gemini-3.6-flash",
        temperature=0.4,
        google_api_key=google_api_key,
    )
    if google_api_key
    else None
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

EXTRACT_PROMPT = """You extract explicit facts for a city small-business planning app.
Update only values that the user stated. Never guess or infer a number, city, area, business,
skill, work time, or loan preference. Keep existing values when the user did not change them.
Use empty lists for `skills` and `assets`. Put other details in `business_context.additional_details`.

Current State:
{current_state}

User Message:
"{user_message}"

Return ONLY valid JSON matching this schema:
{{
    "user_profile": {{"language": null, "city": null, "district": null, "available_capital": null, "skills": [], "assets": [], "working_hours": null, "loan_needed": null}},
    "business_context": {{"mode": null, "category": null, "business_name": null, "candidate_zones": [], "competitor_count": null, "supply_distance_km": null, "daily_input_cost": null, "additional_details": {{}}}},
    "financial_evaluation": {{"total_project_cost": null, "startup_cost": null, "unit_cost": null, "selling_price": null, "fixed_monthly_cost": null, "expected_daily_units": null, "funding_gap": null, "margin_money_10pct": null, "loan_required_90pct": null, "loan_required": null, "break_even_units_per_day": null, "scheme_matched": null, "estimated_monthly_emi": null, "estimated_monthly_profit": null, "break_even_days": null}}
}}
"""

SPEAK_PROMPT = """You are VyaparSaathi City, a practical, empathetic business-planning advisor
for small businesses in Indian cities.

CRITICAL: Respond entirely in {language}. Do not use English unless English was requested.

Profile:
{state_json}

Conversation:
{chat_history}

The user just said: "{user_message}"
Your next task: {target_topic}

Rules:
- Ask only the requested onboarding question until the profile is complete.
- In Discover mode, do not ask the user to choose a business; they need help finding an idea.
- Never calculate money, invent local market facts, promise profit, or say a user is eligible for a loan.
- Call estimates estimates and sample data sample data.
- After onboarding, ask whether the user wants to explore location, busy hours, costs, or a launch plan.
- Keep it short, acknowledge the user's message, and end with one clear question.
"""


def _merge_state_values(existing, extracted):
    if isinstance(existing, dict) and isinstance(extracted, dict):
        merged = dict(existing)
        for key, value in extracted.items():
            merged[key] = _merge_state_values(merged.get(key), value) if key in merged else value
        return merged
    if isinstance(existing, list) and isinstance(extracted, list):
        return list(dict.fromkeys(existing + extracted)) if extracted else existing
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


def _parse_extraction(content: str) -> dict:
    if content.startswith("```json"):
        content = content[7:-3].strip()
    elif content.startswith("```"):
        content = content[3:-3].strip()
    extracted = json.loads(content)
    if "user_profile" not in extracted and len(extracted) == 1:
        extracted = next(iter(extracted.values()))
    if not isinstance(extracted, dict):
        raise ValueError("The AI extraction response was not a JSON object")
    return extracted


async def process_chat_message(
    current_state: VyaparState,
    user_message: str,
    chat_history: list,
) -> dict:
    state_dict = current_state.model_dump()
    extracted_state = None

    if extractor is not None:
        try:
            extract_chain = ChatPromptTemplate.from_template(EXTRACT_PROMPT) | extractor
            await gemini_rate_limiter.wait_for_slot()
            extraction_response = await extract_chain.ainvoke({
                "current_state": json.dumps(state_dict),
                "user_message": user_message,
            })
            extracted_state = _parse_extraction(_response_text(extraction_response.content))
        except Exception as error:
            print(f"AI extraction unavailable; using rule-based extraction: {error}")

    try:
        if extracted_state is None:
            updated_state = rule_based_extraction(current_state, user_message)
        else:
            merged_state = _merge_state_values(state_dict, extracted_state)
            profile = merged_state.get("user_profile") or {}
            profile["language"] = (state_dict.get("user_profile") or {}).get("language")
            merged_state["user_profile"] = profile
            updated_state = VyaparState(**merged_state)
    except (TypeError, ValueError, KeyError) as error:
        print(f"State extraction could not be applied; retaining the current profile: {error}")
        updated_state = current_state

    next_field = next_profile_field(updated_state)
    language = (
        updated_state.user_profile.language
        if updated_state.user_profile and updated_state.user_profile.language
        else "English"
    )
    response_text = ""
    if speaker is not None:
        try:
            speak_chain = ChatPromptTemplate.from_template(SPEAK_PROMPT) | speaker
            await gemini_rate_limiter.wait_for_slot()
            response = await speak_chain.ainvoke({
                "language": language,
                "state_json": updated_state.model_dump_json(),
                "user_message": user_message,
                "target_topic": (
                    f"Ask about the missing {next_field} profile detail."
                    if next_field
                    else "Ask which planning area the user wants to explore first."
                ),
                "chat_history": json.dumps(chat_history[-10:]),
            })
            response_text = _response_text(response.content)
        except Exception as error:
            print(f"AI response unavailable; using a localized onboarding question: {error}")
    if not response_text:
        response_text = localized_question(next_field, language, updated_state)

    return {"updated_state": updated_state, "response_text": response_text}


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

    translated_history = []
    for message in chat_history:
        text = message.get("text", "")
        translated_text = text
        for attempt in range(3):
            try:
                translated_text = await asyncio.to_thread(translate_text, text)
                break
            except Exception as error:
                if attempt == 2:
                    raise RuntimeError("Unable to translate the conversation") from error
                await asyncio.sleep(0.5 * (attempt + 1))
        translated_history.append({**message, "text": translated_text})
    return translated_history
