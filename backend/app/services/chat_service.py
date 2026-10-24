import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

from app.services.data_service import get_chat_faq


# Load environment variables from the backend folder
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


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
    language = {
        "kn": "Kannada",
        "hi": "Hindi",
        "en": "English",
    }.get(lang, "English")

    crop_context = (
        f"The user explicitly supplied this crop context: {crop_id}. "
        "Use it only when relevant."
        if crop_id
        else (
            "No Farm Profile, soil moisture, rainfall, or field data was "
            "supplied. Answer the user's actual question independently."
        )
    )

    return f"""
You are FarmSense AI, a general-purpose agriculture assistant for farmers
in India.

Reply in {language}.

USER'S QUESTION:
{question}

CONTEXT:
{crop_context}

Instructions:
- Answer the exact question in practical, simple language.
- Support agriculture questions beyond tomatoes and local FAQs.
- Do not invent saved farm-profile details.
- For cultivation questions, give relevant step-by-step guidance.
- Ask a short clarification when essential details are missing.
- Never invent live weather, current mandi prices, scheme eligibility,
  citations, or measurements you cannot access.
- Clearly communicate uncertainty.
- Do not diagnose plant disease with certainty from insufficient evidence.
- Never invent pesticide dosages. Follow the product label and recommend
  a local agricultural expert when diagnosis or treatment is uncertain.
- For machinery safety, advise switching off and securing the machine
  before inspection.
- Use headings and numbered steps when useful.
- Finish the answer completely.
""".strip()


def get_chat_response(crop_id: str, question: str, lang: str):
    """Generate an agriculture answer using Groq only."""

    question = (question or "").strip()
    lang = lang if lang in {"en", "kn", "hi"} else "en"

    if not question:
        return "Please enter your agriculture question."

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return (
            "AI service is not configured. "
            "Please configure GROQ_API_KEY in backend/.env."
        )

    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

    try:
        client = Groq(
            api_key=api_key,
            timeout=30.0,
            max_retries=1,
        )

        prompt = _build_prompt(question, lang, crop_id or "")

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": prompt,
                },
                {
                    "role": "user",
                    "content": question,
                },
            ],
            max_completion_tokens=2500,
        )

        answer = response.choices[0].message.content

        if answer and answer.strip():
            return answer.strip()

        print(
            f"Groq returned empty content. "
            f"Finish reason: {response.choices[0].finish_reason}",
            flush=True,
        )
        return (
            "I couldn't generate a complete answer. "
            "Please try asking your question again."
        )

    except Exception as exc:
        print(
            f"Groq chat error: {type(exc).__name__}: {exc}",
            flush=True,
        )
        return (
            "The AI service is temporarily unavailable. "
            "Please try again shortly."
        )