
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


def get_chat_response(crop_id: str, question: str, lang: str):
    """Answer farming questions using Gemini, then FAQ if needed."""

    lang = "kn" if lang == "kn" else "en"
    question = (question or "").strip()

    if not question:
        return {
            "answer": (
                "Please type your farming question."
                if lang == "en"
                else "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ."
            ),
            "matched_intent": "empty_question",
            "safety_note": "General guidance only.",
        }

    ai_error = False

    # Try Gemini first
    if _client:
        try:
            language = "Kannada" if lang == "kn" else "English"

            crop_context = (
                f'The currently selected crop is "{crop_id}". '
                "Use this crop as context only when relevant. "
                "If the farmer asks about another crop, answer about "
                "that crop. For general questions, answer generally."
            )

            prompt = f"""
You are FarmSense, a practical agriculture assistant for farmers in India.

Reply in {language}.

Farmer's exact question:
{question}

Context:
{crop_context}

Instructions:
- Your main purpose is to explain farming procedures step by step so
  farmers can follow them in the field.
- Answer the exact question asked, in simple, practical language.
- For questions about growing a crop, provide a complete numbered
  procedure: selecting planting material, land and soil preparation,
  planting, spacing, irrigation, nutrient management, weed control,
  pest and disease monitoring, crop care, and harvesting, as relevant.
- For each step, explain WHAT to do, HOW to do it, WHEN to do it,
  and WHY it matters.
- Include practical examples, common mistakes to avoid, low-cost options,
  and warning signs when relevant.
- For broad farming questions, aim for a detailed answer of about
  400-700 words when the topic requires it. For simple questions,
  answer proportionately. Never add irrelevant information just to
  increase length.
- For follow-up questions such as "step by step", "explain more",
  "next", or "how to do it", continue the same topic and crop from the
  conversation when that context is available. Do not switch to a
  different crop without a reason.
- Treat the selected crop as context, not as a replacement for the
  farmer's explicit question. If the farmer names another crop, use
  the crop they asked about.
- Reply entirely in the requested language: English or Kannada.
- Do not invent weather, live mandi prices, soil measurements, or other
  information you cannot access. Clearly label estimates and demo data.
- Do not diagnose plant diseases with certainty without sufficient evidence.
- Never invent pesticide dosages. Follow product labels and recommend
  local agricultural experts when diagnosis or chemical treatment is uncertain.
- Organize long answers with headings and numbered steps.
- Finish the answer completely. Do not stop mid-sentence or mid-step.
"""

            response = _client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=1200,
                ),
            )

            answer = (response.text or "").strip()

            if answer:
                return {
                    "answer": answer,
                    "matched_intent": "ai",
                    "safety_note": "General guidance only.",
                }

            ai_error = True
            print(
                "FarmSense Gemini error: Empty response",
                flush=True,
            )

        except Exception as exc:
            ai_error = True
            print(
                f"FarmSense Gemini error: "
                f"{type(exc).__name__}: {exc}",
                flush=True,
            )

    # If Gemini fails, try the existing FAQ database
    faq_item = _match_faq(crop_id, question)

    if faq_item:
        answer = (faq_item.get("answer") or "").strip()

        if answer:
            return {
                "answer": answer,
                "matched_intent": faq_item.get("intent") or "faq",
                "safety_note": "General guidance only.",
            }

    # Return an honest error message instead of misleading the farmer
    if ai_error:
        return {
            "answer": (
                "The AI service is temporarily unavailable. "
                "Please try again shortly."
                if lang == "en"
                else "AI ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. "
                     "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            ),
            "matched_intent": "ai_unavailable",
            "safety_note": "General guidance only.",
        }

    if not _client:
        return {
            "answer": (
                "The AI service is not configured. "
                "Please check the GEMINI_API_KEY setting."
                if lang == "en"
                else "AI ಸೇವೆಯನ್ನು ಹೊಂದಿಸಲಾಗಿಲ್ಲ. "
                     "GEMINI_API_KEY ಸೆಟ್ಟಿಂಗ್ ಪರಿಶೀಲಿಸಿ."
            ),
            "matched_intent": "ai_not_configured",
            "safety_note": "General guidance only.",
        }

    # Final fallback when no FAQ matches
    return {
        "answer": (
            "I couldn't find a suitable answer. Please try asking "
            "about crop care, pests, irrigation, soil, or plant symptoms."
            if lang == "en"
            else "ಸೂಕ್ತ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ. ಬೆಳೆ ಆರೈಕೆ, ಕೀಟಗಳು, "
                 "ನೀರಾವರಿ, ಮಣ್ಣು ಅಥವಾ ಸಸ್ಯದ ಲಕ್ಷಣಗಳ ಬಗ್ಗೆ ಕೇಳಿ."
        ),
        "matched_intent": "fallback",
        "safety_note": "General guidance only.",
    }
