
import json
import os
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from app.services.chat_service import get_chat_response
from app.services.data_service import (
    get_condition_by_id,
    get_conditions_by_crop,
    get_crop_by_id,
    get_crops,
)
from app.services.screening_service import run_screening


router = APIRouter(prefix="/api")


def ensure_lang(lang: str):
    if lang not in {"en", "kn", "hi"}:
        raise HTTPException(
            status_code=400,
            detail="Language must be 'en', 'kn', or 'hi'.",
        )


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=5000)
    crop_id: str = ""
    lang: str = "en"


@router.get("/health")
def health():
    return {"status": "ok", "service": "AgriSaathi AI backend"}


@router.get("/crops")
def list_crops(lang: str = Query(default="en")):
    ensure_lang(lang)
    crops = get_crops()

    name_key = "name_kn" if lang == "kn" else "name_en"
    summary_key = "summary_kn" if lang == "kn" else "summary_en"

    return [
        {
            "id": crop["id"],
            "name": crop[name_key],
            "summary": crop[summary_key],
        }
        for crop in crops
    ]


@router.get("/crops/{crop_id}/guide")
def crop_guide(crop_id: str, lang: str = Query(default="en")):
    ensure_lang(lang)
    crop = get_crop_by_id(crop_id)

    if crop is None:
        raise HTTPException(status_code=404, detail="Crop not found")

    suffix = "kn" if lang == "kn" else "en"

    return {
        "id": crop["id"],
        "name": crop[f"name_{suffix}"],
        "guide": crop["guide"][suffix],
        "disclaimer": "Guidance is general and may vary by local conditions.",
    }


@router.get("/conditions/{condition_id}")
def condition_detail(
    condition_id: str,
    lang: str = Query(default="en"),
):
    ensure_lang(lang)
    condition = get_condition_by_id(condition_id)

    if condition is None:
        raise HTTPException(
            status_code=404,
            detail="Condition not found.",
        )

    suffix = "kn" if lang == "kn" else "en"

    return {
        "id": condition["id"],
        "crop_id": condition["crop_id"],
        "name": condition[f"name_{suffix}"],
        "type": condition["type"],
        "details": condition["details"][suffix],
    }


@router.get("/crops/{crop_id}/conditions")
def crop_conditions(
    crop_id: str,
    lang: str = Query(default="en"),
):
    ensure_lang(lang)
    conditions = get_conditions_by_crop(crop_id)
    suffix = "kn" if lang == "kn" else "en"

    return [
        {
            "id": condition["id"],
            "name": condition[f"name_{suffix}"],
            "type": condition["type"],
        }
        for condition in conditions
    ]


@router.post("/screening")
async def screening(
    lang: str = Query(default="en"),
    crop_id: str = Form(...),
    file: UploadFile = File(...),
):
    ensure_lang(lang)
    return await run_screening(crop_id, file)


@router.post("/chat")
def chat(request: ChatRequest):
    ensure_lang(request.lang)

    answer = get_chat_response(
        crop_id=request.crop_id,
        question=request.question,
        lang=request.lang,
    )

    return {
        "answer": answer,
        "model": os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
    }




@router.post("/plant/analyze")
async def plant_analyze(
    image: UploadFile = File(...),
    crop: str = Form(default="unknown"),
    symptoms: str = Form(default=""),
    language: str = Form(default="en"),
):
    content_type = image.content_type or ""

    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file.",
        )

    raw = await image.read()

    if not raw:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    if len(raw) > 8 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be 8 MB or smaller.",
        )

    try:
        vision_service = importlib.import_module(
            "app.services.vision_service"
        )
        return vision_service.analyze_plant_image(
            raw, content_type, crop, symptoms, language
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        print(
            f"FarmSense Plant Doctor error: "
            f"{type(exc).__name__}: {exc}"
        )
        raise HTTPException(
            status_code=502,
            detail="Plant Doctor image analysis failed. Check backend logs.",
        ) from exc

@router.get("/mandi/prices")
def get_mandi_prices(
    state: str = Query(..., min_length=1),
    limit: int = Query(default=20, ge=1, le=100),
    commodity: str | None = Query(default=None),
    market: str | None = Query(default=None),
):
    api_key = os.getenv("DATA_GOV_IN_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Mandi API key is not configured on the backend.",
        )

    params = {
        "api-key": api_key,
        "format": "json",
        "limit": limit,
        "filters[state]": state,
    }

    if commodity:
        params["filters[commodity]"] = commodity

    if market:
        params["filters[market]"] = market

    url = (
        "https://api.data.gov.in/resource/"
        "9ef84268-d588-465a-a308-a864a43d0070?"
        + urlencode(params)
    )

    try:
        request = Request(
            url,
            headers={"User-Agent": "FarmSense/1.0"},
        )

        with urlopen(request, timeout=30) as response:
            raw_data = response.read().decode("utf-8")

        data = json.loads(raw_data)

        if data.get("status") != "ok":
            print(
                "Mandi API returned an unexpected response:",
                data.get("message", "Unknown response"),
            )
            raise HTTPException(
                status_code=502,
                detail="Government Mandi API returned an unsuccessful response.",
            )

        return {
            "records": data.get("records", []),
            "total": data.get("total", 0),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }

    except HTTPException:
        raise

    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print(f"Mandi HTTP error: {exc.code} - {body[:500]}")

        raise HTTPException(
            status_code=502,
            detail=f"Government Mandi API returned HTTP {exc.code}.",
        ) from exc

    except (URLError, TimeoutError, OSError, ValueError) as exc:
        print(f"Mandi provider error: {type(exc).__name__}: {exc!r}")

        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve prices from the Government Mandi API.",
        ) from exc
