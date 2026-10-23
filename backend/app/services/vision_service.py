import os
import json
import base64
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

VISION_MODEL = os.getenv(
    "GROQ_VISION_MODEL",
    "qwen/qwen3.8-27b",
)


def analyze_plant_image(
    raw,
    content_type,
    crop,
    symptoms,
    language="en",
):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing from the backend environment."
        )

    if not raw:
        raise ValueError("The uploaded image is empty.")

    if not content_type or not content_type.startswith("image/"):
        raise ValueError("Please upload a valid image file.")

    # Convert the uploaded image to a base64 data URL.
    encoded_image = base64.b64encode(raw).decode("utf-8")
    image_data_url = (
        f"data:{content_type};base64,{encoded_image}"
    )

    language_name = "Kannada" if language == "kn" else "English"

    prompt = f"""
You are the Plant Doctor assistant in Agri Saathi AI.

Analyze this plant photograph for possible plant health issues.

Crop: {crop or "unknown"}
Farmer-reported symptoms: {symptoms or "not provided"}
Response language: {language_name}

Return only a valid JSON object with these string fields:
- condition
- explanation
- advice

Requirements:
- Describe only what the image and supplied symptoms support.
- If the image is unclear, say that the diagnosis is uncertain.
- Do not invent a confidence score.
- Do not claim certainty about a plant disease from an image alone.
- Do not invent pesticide dosages or chemical application instructions.
- Give safe, practical next steps and suggest local agricultural
  expert confirmation when appropriate.
- Write all three fields in {language_name}.
"""

    client = Groq(
        api_key=api_key,
        timeout=60.0,
        max_retries=1,
    )

    try:
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_data_url,
                            },
                        },
                    ],
                }
            ],
            temperature=0.2,
            max_completion_tokens=800,
            response_format={"type": "json_object"},
        )

        text = (
            response.choices[0].message.content or ""
        ).strip()

        if not text:
            raise RuntimeError(
                "Groq returned an empty image-analysis response."
            )

        result = json.loads(text)

    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Groq returned invalid JSON for the plant image."
        ) from exc

    except Exception as exc:
        print(
            f"AgriSaathi Plant Doctor error: "
            f"{type(exc).__name__}: {exc}",
            flush=True,
        )
        raise

    for field in ("condition", "explanation", "advice"):
        if (
            not isinstance(result.get(field), str)
            or not result[field].strip()
        ):
            raise RuntimeError(
                f"Groq response is missing the '{field}' field."
            )

    return {
        "condition": result["condition"].strip(),
        "explanation": result["explanation"].strip(),
        "advice": result["advice"].strip(),
    }