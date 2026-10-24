
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.services.data_service import get_chat_faq


# Load environment variables from the backend folder
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

# Configure Gemini with a 20-second HTTP timeout
_client = (
    genai.Client(
        api_key=API_KEY,
        http_options=types.HttpOptions(timeout=60000),
    )
    if API_KEY
    else None
)


def _normalize(text: str) -> str:
    return (text or "").strip().lower()


def _match_faq(crop_id: str, question: str):
    """Return an FAQ only when one of its keywords matches."""
    normalized_question = _normalize(question)

    if not normalized_question:
        return None

    try:
        faq_items = get_chat_faq()
    except Exception as exc:
        print(
            f"FarmSense FAQ error: {type(exc).__name__}: {exc}",
            flush=True,
        )
        return None

    for item in faq_items:
        keywords = item.get("keywords", [])

        if any(
            str(keyword).lower() in normalized_question
            for keyword in keywords
        ):
            return item

    return None


def _build_prompt(question: str, lang: str, crop_id: str = "") -> str:
    language = {"kn": "Kannada", "hi": "Hindi", "en": "English"}.get(lang, "English")
    crop_context = (
        f"The user explicitly included this crop context: {crop_id}. Use it only if relevant."
        if crop_id else
        "No saved Farm Profile, crop, soil moisture, rainfall, or field decision context is supplied. Answer the user's actual question independently."
    )
    return f"""
You are FarmSense AI, a general-purpose agriculture assistant for farmers in India. You can answer questions about crop cultivation, soil, irrigation, farm machinery, tractors, labour planning, post-harvest handling, agricultural business, market concepts, and agricultural techniques.

Reply in {language}.

USER'S EXACT QUESTION:
{question}

CONTEXT POLICY:
{crop_context}

Instructions:
- Answer the exact question in practical, simple language.
- Do not restrict answers to tomatoes or a local FAQ database.
- Do not infer or invent farm-profile details.
- For crop-growing questions, give relevant step-by-step guidance including timing and common mistakes.
- Ask a short clarification when essential information is missing.
- Do not invent live weather, current mandi prices, government scheme eligibility, citations, or measurements you cannot access.
- Clearly label uncertainty. Do not diagnose a plant disease with certainty from insufficient evidence.
- Never invent pesticide dosages. Follow product labels and recommend local agriculture experts for uncertain diagnoses or chemical treatment.
- For machinery safety questions, advise turning off the engine, securing the machine, and consulting a qualified mechanic where appropriate.
- Organize longer answers with headings and numbered steps. Finish the answer completely.
""".strip()


def get_chat_response(crop_id: str, question: str, lang: str):
    """Answer independently with Groq when configured, otherwise Gemini."""
    lang = lang if lang in {"en", "kn", "hi"} else "en"