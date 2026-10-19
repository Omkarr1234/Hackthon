import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


def analyze_plant_image(raw, content_type, crop, symptoms, language="en"):
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing in backend/.env")
    if not raw:
        raise ValueError("The uploaded image is empty.")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=60000),
    )

    language_name = "Kannada" if language == "kn" else "English"
    prompt = f"""
Analyze this plant photograph for possible plant health problems.
Crop: {crop or "unknown"}
Symptoms reported by the user: {symptoms or "not provided"}
Reply in {language_name}.

Return only valid JSON with three string fields:
condition, explanation, advice.

Be cautious. Do not invent a diagnosis or confidence score.
If the image is unclear, state that. Do not prescribe pesticide dosages.
Recommend an agricultural expert when the diagnosis is uncertain.
"""

    response = client.models.generate_content(
        model=model,
        contents=[
            types.Part.from_bytes(data=raw, mime_type=content_type),
            prompt,
        ],
        config=types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=700,
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Gemini returned invalid JSON.") from exc

    for field in ("condition", "explanation", "advice"):
        if not isinstance(result.get(field), str) or not result[field].strip():
            raise RuntimeError(f"Gemini response is missing {field}.")

    return {key: result[key] for key in ("condition", "explanation", "advice")}
