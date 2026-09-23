import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def _read_json(filename: str):
    with open(DATA_DIR / filename, "r", encoding="utf-8") as file:
        return json.load(file)


def get_crops():
    return _read_json("crops.json")


def get_conditions():
    return _read_json("conditions.json")


def get_chat_faq():
    return _read_json("chat_faq.json")


def get_crop_by_id(crop_id: str):
    crops = get_crops()
    return next((crop for crop in crops if crop["id"] == crop_id), None)


def get_condition_by_id(condition_id: str):
    conditions = get_conditions()
    return next((condition for condition in conditions if condition["id"] == condition_id), None)


def get_conditions_by_crop(crop_id: str):
    return [condition for condition in get_conditions() if condition["crop_id"] == crop_id]
