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
    if lang not in {"en", "kn"}:
        raise HTTPException(status_code=400, detail="Language must be 'en' or 'kn'.")


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
        {"id": crop["id"], "name": crop[name_key], "summary": crop[summary_key]}
        for crop in crops
    ]


@router.get("/crops/{crop_id}/guide")
def crop_guide(crop_id: str, lang: str = Query(default="en")):
    ensure_lang(lang)
    crop = get_crop_by_id(crop_id)
    if crop is None:
        raise HTTPException(status_code=404, detail="Crop not found.")

    suffix = "kn" if lang == "kn" else "en"
    return {
        "id": crop["id"],
        "name": crop[f"name_{suffix}"],
        "guide": crop["guide"][suffix],
        "disclaimer": "Guidance is general and may vary by local conditions.",
    }


@router.get("/conditions/{condition_id}")
def condition_detail(condition_id: str, lang: str = Query(default="en")):
    ensure_lang(lang)
    condition = get_condition_by_id(condition_id)
    if condition is None:
        raise HTTPException(status_code=404, detail="Condition not found.")

    suffix = "kn" if lang == "kn" else "en"
    return {
        "id": condition["id"],
        "crop_id": condition["crop_id"],
        "name": condition[f"name_{suffix}"],
        "type": condition["type"],
        "details": condition["details"][suffix],
    }


@router.get("/crops/{crop_id}/conditions")
def crop_conditions(crop_id: str, lang: str = Query(default="en")):
    ensure_lang(lang)
    conditions = get_conditions_by_crop(crop_id)
    suffix = "kn" if lang == "kn" else "en"
    return [
        {"id": condition["id"], "name": condition[f"name_{suffix}"], "type": condition["type"]}
        for condition in conditions
    ]


@router.post("/screening")
async def screening(
    lang: str = Query(default="en"),
    crop_id: str = Form(...),
    file: UploadFile = File(...),
):
    ensure_lang(lang)
    crop = get_crop_by_id(crop_id)
    if crop is None:
        raise HTTPException(status_code=404, detail="Crop not found.")

    try:
        result = await run_screening(crop_id=crop_id, file=file)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    condition = get_condition_by_id(result["possible_condition_id"])
    suffix = "kn" if lang == "kn" else "en"

    return {
        **result,
        "possible_condition_name": condition[f"name_{suffix}"] if condition else None,
        "message": "Possible condition identified from uploaded image.",
    }


class ChatRequest(BaseModel):
    crop_id: str = Field(min_length=1)
    question: str = Field(min_length=2, max_length=500)


@router.post("/chat")
def chat(payload: ChatRequest, lang: str = Query(default="en")):
    ensure_lang(lang)
    crop = get_crop_by_id(payload.crop_id)
    if crop is None:
        raise HTTPException(status_code=404, detail="Crop not found.")

    return get_chat_response(crop_id=payload.crop_id, question=payload.question, lang=lang)
