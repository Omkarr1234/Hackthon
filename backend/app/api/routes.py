
import json
import os
import secrets
import sqlite3
from datetime import timedelta
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, File, Form, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from app.services.chat_service import ChatProviderError, get_chat_response
from app.services.data_service import (
    get_condition_by_id,
    get_conditions_by_crop,
    get_crop_by_id,
    get_crops,
)
from app.services.screening_service import run_screening
from app.services.vision_service import analyze_plant_image
from app.services.auth_service import authenticate, create_token, hash_password, user_id_from_token
from app.services.platform_service import (
    create_user,
    get_user,
    get_user_by_email,
    insert_booking,
    insert_equipment,
    insert_job,
    insert_labour,
    list_equipment,
    list_bookings,
    list_jobs,
    list_owned_equipment,
    list_labour,
    search_places,
    save_reset_token,
    consume_reset_token,
    update_password,
    update_user,
)


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


class AuthRequest(BaseModel):
    name: str = Field(default="", max_length=100)
    email: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=8, max_length=200)


class LabourProfileRequest(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    village: str = Field(..., min_length=2, max_length=120)
    district: str = Field(..., min_length=2, max_length=120)
    skills: list[str] = Field(default_factory=list, max_length=20)
    crops: list[str] = Field(default_factory=list, max_length=20)
    availability: list[str] = Field(default_factory=list, max_length=31)
    wage: str = Field(..., min_length=1, max_length=80)
    contact_method: str = Field(..., min_length=2, max_length=30)


class LabourJobRequest(BaseModel):
    task: str = Field(..., min_length=2, max_length=120)
    location: str = Field(..., min_length=2, max_length=160)
    work_date: str = Field(..., min_length=8, max_length=30)
    workers: int = Field(..., ge=1, le=500)
    payment: str = Field(..., min_length=1, max_length=80)


class EquipmentRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., min_length=2, max_length=80)
    location: str = Field(..., min_length=2, max_length=160)
    description: str = Field(..., min_length=5, max_length=1000)
    rate: str = Field(..., min_length=1, max_length=80)
    availability: str = Field(..., min_length=2, max_length=200)
    contact_method: str = Field(..., min_length=2, max_length=30)


class BookingRequest(BaseModel):
    booking_date: str = Field(..., min_length=8, max_length=30)


class ProfileRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=200)


class PasswordResetRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=200)


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., min_length=20, max_length=200)
    password: str = Field(..., min_length=8, max_length=200)


def current_user(authorization: str | None):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in is required for this action.")
    user_id = user_id_from_token(authorization.split(" ", 1)[1])
    user = get_user(user_id) if user_id else None
    if not user:
        raise HTTPException(status_code=401, detail="Session is invalid or expired.")
    return dict(user)


@router.get("/health")
def health():
    return {"status": "ok", "service": "AgriSaathi AI backend"}


@router.post("/auth/register")
def register(request: AuthRequest):
    if not request.name.strip():
        raise HTTPException(status_code=400, detail="Name is required.")
    try:
        user_id = create_user(request.name.strip(), request.email.strip(), hash_password(request.password))
        user = get_user(user_id)
    except sqlite3.IntegrityError as exc:
        if "UNIQUE constraint failed" in str(exc):
            raise HTTPException(status_code=409, detail="An account with this email already exists.") from exc
        raise
    except sqlite3.Error as exc:
        print(f"FarmSense registration database error: {type(exc).__name__}: {exc}", flush=True)
        raise HTTPException(
            status_code=503,
            detail="Account storage is temporarily unavailable. Please try again.",
        ) from exc
    if not user:
        print(
            f"FarmSense registration error: user {user_id} was not readable after insert.",
            flush=True,
        )
        raise HTTPException(status_code=503, detail="Account was not saved. Please try again.")
    return {"user": dict(user), "token": create_token(user_id)}


@router.post("/auth/login")
def login(request: AuthRequest):
    user = authenticate(request.email.strip(), request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"user": dict(user), "token": create_token(user["id"])}


@router.post("/auth/demo")
def demo_login():
    email = "demo@agrisaathi.ai"
    user = get_user_by_email(email)
    if not user:
        user_id = create_user("Demo Farmer", email, hash_password(secrets.token_urlsafe(18)))
    else:
        user_id = user["id"]
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=503, detail="Demo account storage is unavailable.")
    return {
        "demo": True,
        "user": dict(user),
        "token": create_token(user_id),
        "notice": "Demo mode: sample listings and illustrative bookings are fictional.",
    }


@router.get("/auth/me")
def me(authorization: str | None = Header(default=None)):
    return current_user(authorization)


@router.put("/auth/profile")
def profile_update(request: ProfileRequest, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    try:
        update_user(user["id"], request.name.strip(), request.email.strip())
    except Exception as exc:
        if "UNIQUE constraint failed" in str(exc):
            raise HTTPException(status_code=409, detail="That email is already in use.") from exc
        raise
    return {"user": dict(get_user(user["id"]))}


@router.post("/auth/forgot-password")
def forgot_password(request: PasswordResetRequest):
    user = get_user_by_email(request.email.strip())
    response = {"message": "If the account exists, a reset request was created."}
    if user:
        token = secrets.token_urlsafe(32)
        save_reset_token(token, user["id"], (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat())
        if os.getenv("FARMSENSE_DEMO_MODE", "true").lower() == "true":
            response["demo_reset_token"] = token
    return response


@router.post("/auth/reset-password")
def reset_password(request: PasswordResetConfirm):
    row = consume_reset_token(request.token)
    if not row:
        raise HTTPException(status_code=400, detail="Reset token is invalid or already used.")
    update_password(row["user_id"], hash_password(request.password))
    return {"message": "Password reset successfully. You can now log in."}


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
    try:
        return await run_screening(crop_id, file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/chat")
def chat(request: ChatRequest):
    ensure_lang(request.lang)
    try:
        answer = get_chat_response(
            crop_id=request.crop_id,
            question=request.question,
            lang=request.lang,
        )
    except ChatProviderError as exc:
        status_code = 503 if "not configured" in str(exc) else 502
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc

    return {
        "answer": answer,
        "model": (
            os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
            if os.getenv("GROQ_API_KEY")
            else "demo-local"
        ),
        "demo": not bool(os.getenv("GROQ_API_KEY")),
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
        return analyze_plant_image(
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
    district: str | None = Query(default=None),
    arrival_date: str | None = Query(default=None),
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
    if district:
        params["filters[district]"] = district
    if arrival_date:
        params["filters[arrival_date]"] = arrival_date

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


DEMO_SHOPS = [
    {"name": "Sample Green Seeds Centre", "address": "Fictional address, Mandya region", "category": "Seeds", "contact": "Demo contact only", "is_demo": True},
    {"name": "Sample Kaveri Farm Supplies", "address": "Fictional address, Mysuru region", "category": "Fertilizer", "contact": "Demo contact only", "is_demo": True},
    {"name": "Sample Raitha Irrigation Hub", "address": "Fictional address, Hassan region", "category": "Irrigation", "contact": "Demo contact only", "is_demo": True},
    {"name": "Sample Mysore Seed Nursery", "address": "Fictional address, Mysuru region", "category": "Seeds and nursery", "contact": "Demo contact only", "is_demo": True},
    {"name": "Sample Deccan Farm Tools", "address": "Fictional address, Dharwad region", "category": "Farm supplies", "contact": "Demo contact only", "is_demo": True},
    {"name": "Sample Soil Care Point", "address": "Fictional address, Kolar region", "category": "Soil testing", "contact": "Demo contact only", "is_demo": True},
]


@router.get("/shops")
def shops(q: str = Query(..., min_length=2, max_length=160), mode: str = Query(default="live")):
    if mode == "demo":
        terms = [
            term for term in q.lower().replace("mysore", "mysuru").split()
            if term not in {"shop", "shops", "store", "stores", "nearby"}
        ]
        results = [
            shop for shop in DEMO_SHOPS
            if all(term in f"{shop['name']} {shop['address']} {shop['category']}".lower() for term in terms)
        ]
        return {"provider": "FarmSense fictional demo data", "demo": True, "results": results}
    try:
        places = search_places(q)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        print(f"Places provider error: {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=502, detail="OpenStreetMap search is temporarily unavailable.") from exc
    return {
        "provider": "OpenStreetMap Nominatim + Overpass",
        "results": [
            {
                "name": place.get("name", "Unnamed place"),
                "address": place.get("address", "Address unavailable"),
                "category": place.get("category", "Agricultural supply"),
                "latitude": place.get("latitude"),
                "longitude": place.get("longitude"),
                "open_in_maps": place.get("open_in_maps"),
            }
            for place in places
        ],
    }


@router.get("/news")
def news():
    return {
        "provider": "Official source links",
        "items": [
            {
                "title": "Ministry of Agriculture and Farmers Welfare",
                "summary": "Official schemes, advisories, releases and agriculture policy updates.",
                "publisher": "Government of India",
                "published": None,
                "url": "https://agriwelfare.gov.in/",
                "category": "Government",
            },
            {
                "title": "Karnataka Agriculture Department",
                "summary": "State agriculture schemes, crop advisories and department services.",
                "publisher": "Government of Karnataka",
                "published": None,
                "url": "https://raitamitra.karnataka.gov.in/",
                "category": "Karnataka",
            },
            {
                "title": "IMD Agromet Advisory Services",
                "summary": "Weather-based advisories and agrometeorological information.",
                "publisher": "India Meteorological Department",
                "published": None,
                "url": "https://mausam.imd.gov.in/",
                "category": "Weather",
            },
        ],
        "notice": "These are official source links, not generated news headlines.",
    }


@router.get("/products")
def products():
    return {
        "items": [
            {
                "id": "soil-testing-kit",
                "name": "Soil Health Card and Testing Services",
                "description": "Use the official Soil Health Card portal to locate testing guidance and services.",
                "merchant": "Government of India",
                "price": None,
                "currency": "INR",
                "url": "https://soilhealth.dac.gov.in/",
                "verified_at": "Official portal; price varies by provider",
                "category": "Soil testing",
                "safety": None,
            },
            {
                "id": "kisan-suvidha",
                "name": "Kisan Suvidha agricultural services",
                "description": "Official farmer services, advisories and market information.",
                "merchant": "Government of India",
                "price": None,
                "currency": "INR",
                "url": "https://kisansuvidha.gov.in/",
                "verified_at": "Official portal; no product price claimed",
                "category": "Services",
                "safety": "Follow label directions and local expert advice for any crop protection product.",
            },
            *[
                {
                    "id": f"demo-product-{index}",
                    "name": name,
                    "description": "Illustrative demo catalog entry; verify the merchant, specifications and price before purchase.",
                    "merchant": "FarmSense demo catalog",
                    "price": None,
                    "currency": "INR",
                    "url": url,
                    "verified_at": "Demo entry — not a current offer",
                    "category": category,
                    "safety": safety,
                    "is_demo": True,
                }
                for index, (name, category, url, safety) in enumerate([
                    ("Vegetable seed information", "Seeds", "https://icar.gov.in/", None),
                    ("Hand tools information", "Tools", "https://icar.gov.in/", None),
                    ("Drip irrigation guidance", "Irrigation", "https://pmksy.gov.in/", None),
                    ("Knapsack sprayer guidance", "Sprayers", "https://farmer.gov.in/", "Wear protective equipment and follow the product label."),
                    ("Soil testing guidance", "Soil testing", "https://soilhealth.dac.gov.in/", None),
                    ("Farm safety equipment guidance", "Protective equipment", "https://farmer.gov.in/", "Use appropriate PPE for all chemical handling."),
                    ("Small farm implements", "Implements", "https://icar.gov.in/", None),
                    ("Crop protection safety", "Crop protection", "https://ppqs.gov.in/", "Never use a pesticide without reading its label."),
                ], start=1)
            ],
        ],
        "notice": "No merchant price feed is configured. Demo entries have no claimed price or stock and link to public information sources.",
    }


@router.get("/labour")
def labour(district: str = "", skill: str = ""):
    return {"items": list_labour(district, skill), "notice": "Profiles are user-submitted and not verified."}


@router.post("/labour/profiles")
def labour_profile(request: LabourProfileRequest, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    profile_id = insert_labour(user["id"], request.model_dump())
    return {"id": profile_id, "status": "created"}


@router.post("/labour/jobs")
def labour_job(request: LabourJobRequest, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    job_id = insert_job(user["id"], request.model_dump())
    return {"id": job_id, "status": "pending"}


@router.get("/labour/jobs")
def labour_jobs(authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    return {"items": list_jobs(user["id"])}


@router.get("/equipment")
def equipment(category: str = "", location: str = ""):
    return {"items": list_equipment(category, location), "notice": "Listings are user-submitted and not verified."}


@router.post("/equipment")
def equipment_create(request: EquipmentRequest, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    listing_id = insert_equipment(user["id"], request.model_dump())
    return {"id": listing_id, "status": "created"}


@router.post("/equipment/{listing_id}/book")
def equipment_book(listing_id: int, request: BookingRequest, authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    booking_id = insert_booking(listing_id, user["id"], request.booking_date)
    return {"id": booking_id, "status": "pending"}


@router.get("/equipment/mine")
def equipment_mine(authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    return {"items": list_owned_equipment(user["id"])}


@router.get("/equipment/bookings")
def equipment_bookings(authorization: str | None = Header(default=None)):
    user = current_user(authorization)
    return {"items": list_bookings(user["id"])}
