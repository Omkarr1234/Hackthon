from app.services.data_service import get_chat_faq


def _normalize(text: str):
    return text.strip().lower()


def _match_faq(crop_id: str, question: str):
    normalized_question = _normalize(question)
    faq_items = [item for item in get_chat_faq() if item["crop_id"] == crop_id]
    for item in faq_items:
        keywords = item.get("keywords", [])
        if any(keyword in normalized_question for keyword in keywords):
            return item
    return None


def get_chat_response(crop_id: str, question: str, lang: str):
    faq = _match_faq(crop_id, question)
    answer_key = "answer_kn" if lang == "kn" else "answer_en"
    default_messages = {
        "en": "I could not find an exact answer. Please check crop guide sections or consult a local agricultural expert.",
        "kn": "ಖಚಿತ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ ನೋಡಿ ಅಥವಾ ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    }

    if faq:
        return {
            "answer": faq.get(answer_key, faq["answer_en"]),
            "matched_intent": faq.get("intent", "general_help"),
            "safety_note": "Advice is for general guidance. For severe crop issues, seek expert support.",
        }

    return {
        "answer": default_messages[lang],
        "matched_intent": "fallback",
        "safety_note": "This assistant provides general guidance only.",
    }
