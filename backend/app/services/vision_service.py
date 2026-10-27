import base64
import os

from groq import Groq


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
}


def _fallback(crop: str, symptoms: str, language: str, demo_mode: bool) -> dict:
    language_name = LANGUAGE_NAMES.get(language, "English")
    symptom_note = (
        f" The farmer also reported: {symptoms.strip()}"
        if symptoms.strip()
        else ""
    )
    if not demo_mode:
        return {
            "connected": False,
            "demo": False,
            "condition": "Vision model configuration required",
            "explanation": (
                "Live Plant Doctor image analysis is unavailable because "
                "GROQ_API_KEY and a supported GROQ_VISION_MODEL are not "
                "configured on the backend."
            ),
            "advice": (
                "Configure the backend vision provider, or use Demo Mode "
                "for a clearly labelled sample result."
            ),
        }
    return {
        "connected": False,
        "demo": True,
        "condition": "Image received — vision model not configured",
        "explanation": (
            f"The {crop or 'plant'} image was received, but no vision model "
            f"is enabled on this backend. Do not treat this photo as a "
            f"confirmed diagnosis.{symptom_note}"
        ),
        "advice": (
            f"Describe the affected plant part, symptom pattern and recent "
            f"weather in {language_name}. Compare those observations with the "
            f"Disease Guide and consult a local agriculture expert before "
            f"using any pesticide."
        ),
    }


def _prompt(crop: str, symptoms: str, language: str) -> str:
    language_name = LANGUAGE_NAMES.get(language, "English")
    return f"""
You are FarmSense Plant Doctor, an agriculture image-screening assistant.
Respond in {language_name}. The crop is {crop or "unknown"}.
Farmer's symptom notes: {symptoms.strip() or "none supplied"}.

Return a concise response with exactly these labels:
Possible condition:
What the image suggests:
Next steps:

This is screening, not a confirmed diagnosis. State uncertainty, do not
invent pesticide dosages, and recommend a local agriculture expert for
serious or spreading symptoms.
""".strip()


def _analyze_with_groq(
    image_bytes: bytes,
    content_type: str,
    crop: str,
    symptoms: str,
    language: str,
) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_VISION_MODEL")
    if not api_key or not model:
        return _fallback(
            crop,
            symptoms,
            language,
            os.getenv("FARMSENSE_DEMO_MODE", "true").lower() == "true",
        )

    client = Groq(api_key=api_key, timeout=45.0, max_retries=1)
    image_data = base64.b64encode(image_bytes).decode("ascii")
    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": _prompt(crop, symptoms, language)},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{content_type};base64,{image_data}",
                        },
                    },
                ],
            }
        ],
        max_completion_tokens=900,
    )
    answer = response.choices[0].message.content
    if not answer or not answer.strip():
        raise RuntimeError("Vision model returned an empty response.")

    return {
        "connected": True,
        "demo": False,
        "condition": "Possible condition — see screening details",
        "explanation": answer.strip(),
        "advice": (
            "This is AI-assisted screening only, not a confirmed diagnosis. "
            "Follow product labels and consult a local agriculture expert "
            "before treatment."
        ),
    }


def analyze_plant_image(
    image_bytes: bytes,
    content_type: str,
    crop: str,
    symptoms: str,
    language: str,
) -> dict:
    if language not in LANGUAGE_NAMES:
        language = "en"
    return _analyze_with_groq(
        image_bytes,
        content_type,
        crop.strip(),
        symptoms.strip(),
        language,
    )
