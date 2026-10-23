import importlib
import os
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

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
        raise HTTPException(status_code=400, detail="Language must be 'en', 'kn', or 'hi'.")


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
        raise HTTPException(status_code=404, detail="Crop not found")
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
    return await run_screening(crop_id, file)