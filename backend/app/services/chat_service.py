import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

from app.services.data_service import get_chat_faq


class ChatProviderError(RuntimeError):
    """Raised when a real AI answer cannot be produced."""


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


def _demo_response(question: str, lang: str) -> str:
    responses = {
        "en": (
            "Demo FarmSense response (sample, not live AI):\n\n"
            f"For your question about “{question}”, check soil moisture at "
            "root depth, consider recent rain, and follow crop-specific "
            "guidance. Avoid applying pesticides or fertilizer without the "
            "product label and local expert advice."
        ),
        "hi": (
            "Demo FarmSense उत्तर (नमूना, लाइव AI नहीं):\n\n"
            f"“{question}” के लिए मिट्टी की नमी और हाल की बारिश जाँचें। "
            "फसल के अनुसार सलाह लें और लेबल तथा स्थानीय कृषि विशेषज्ञ की "
            "सलाह के बिना कीटनाशक या खाद न डालें।"
        ),
        "kn": (
            "Demo FarmSense ಉತ್ತರ (ಮಾದರಿ, ಲೈವ್ AI ಅಲ್ಲ):\n\n"
            f"“{question}” ಬಗ್ಗೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಇತ್ತೀಚಿನ ಮಳೆಯನ್ನು "
            "ಪರಿಶೀಲಿಸಿ. ಉತ್ಪನ್ನದ ಲೇಬಲ್ ಮತ್ತು ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆಯಿಲ್ಲದೆ "
            "ಕೀಟನಾಶಕ ಅಥವಾ ಗೊಬ್ಬರ ಬಳಸಬೇಡಿ."
        ),
    }
    return responses.get(lang, responses["en"])


def get_chat_response(crop_id: str, question: str, lang: str):
    """Generate an agriculture answer using Groq or an explicit demo mode."""

    question = (question or "").strip()
    lang = lang if lang in {"en", "kn", "hi"} else "en"

    if not question:
        return "Please enter your agriculture question."

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        if os.getenv("FARMSENSE_DEMO_MODE", "true").lower() == "true":
            return _demo_response(question, lang)
        raise ChatProviderError("AI service is not configured on the backend.")

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
        raise ChatProviderError("The AI provider returned an empty answer.")

    except Exception as exc:
        print(
            f"Groq chat error: {type(exc).__name__}: {exc}",
            flush=True,
        )
        raise ChatProviderError("The AI service is temporarily unavailable.") from exc