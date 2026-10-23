import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

from app.services.data_service import get_chat_faq


BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

TEXT_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)


def _normalize(text: str) -> str:
    return (text or "").strip().lower()


def _match_faq(crop_id: str, question: str):
    """Find a matching FAQ using its keywords."""
    normalized_question = _normalize(question)

    if not normalized_question:
        return None

    try:
        faq_items = get_chat_faq()
    except Exception as exc:
        print(
            f"AgriSaathi FAQ error: {type(exc).__name__}: {exc}",
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
    """Answer farming questions using Groq, with an FAQ fallback."""

    lang = "kn" if lang == "kn" else "en"
    question = (question or "").strip()
    crop_id = (crop_id or "unknown").strip()

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

    api_key = os.getenv("GROQ_API_KEY")

    if api_key:
        try:
            client = Groq(
                api_key=api_key,
                timeout=45.0,
                max_retries=1,
            )

            language = "Kannada" if lang == "kn" else "English"

            system_prompt = f"""
You are Agri Saathi AI, a practical agriculture assistant
for farmers in India.

Respond entirely in {language}. Use simple, clear language.

Help farmers with crop cultivation, soil, irrigation,
nutrient management, pests, diseases, harvesting and
general agriculture questions.

Give practical, numbered steps when appropriate.
Explain what to do, when to do it and why.
Consider the selected crop, but if the farmer asks about
a different crop, answer about the crop they actually named.

Selected crop context: {crop_id}

Safety requirements:
- Do not invent live weather, soil readings or mandi prices.
- Do not claim that you checked live data unless it was provided.
- Do not claim certainty when identifying plant diseases.
- Never invent pesticide dosages or chemical instructions.
- Encourage local agricultural expert advice when the diagnosis
  or treatment is uncertain.
- Distinguish general guidance from verified local recommendations.
- Keep the answer useful and focused.
"""

            completion = client.chat.completions.create(
                model=TEXT_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": question,
                    },
                ],
                temperature=0.3,
                max_completion_tokens=1200,
            )

            answer = (
                completion.choices[0].message.content or ""
            ).strip()

            if answer:
                return {
                    "answer": answer,
                    "matched_intent": "ai",
                    "safety_note": "General guidance only.",
                }

            print(
                "AgriSaathi Groq error: Empty response",
                flush=True,
            )

        except Exception as exc:
            # Keep diagnostic information in server logs only.
            # Never return the API key or secret configuration to users.
            print(
                f"AgriSaathi Groq error: "
                f"{type(exc).__name__}: {exc}",
                flush=True,
            )

    # Use the existing FAQ database when the AI is unavailable.
    faq_item = _match_faq(crop_id, question)

    if faq_item:
        answer_key = "answer_kn" if lang == "kn" else "answer_en"
        answer = (
            faq_item.get(answer_key)
            or faq_item.get("answer")
            or ""
        ).strip()

        if answer:
            return {
                "answer": answer,
                "matched_intent": faq_item.get("intent") or "faq",
                "safety_note": "General guidance only.",
            }

    if not api_key:
        message = (
            "The AI service is not configured. Please configure "
            "GROQ_API_KEY in the backend environment."
            if lang == "en"
            else "AI ಸೇವೆಯನ್ನು ಹೊಂದಿಸಲಾಗಿಲ್ಲ. "
                 "Backend environment ನಲ್ಲಿ GROQ_API_KEY ಹೊಂದಿಸಿ."
        )
        intent = "ai_not_configured"
    else:
        message = (
            "The AI service is temporarily unavailable. "
            "Please try again shortly."
            if lang == "en"
            else "AI ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. "
                 "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        )
        intent = "ai_unavailable"

    return {
        "answer": message,
        "matched_intent": intent,
        "safety_note": "General guidance only.",
    }