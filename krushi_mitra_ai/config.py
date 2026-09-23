from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "krushi_mitra_ai" / "data"
PROFILE_DIR = DATA_DIR / "uploads" / "profiles"
REPORT_DIR = DATA_DIR / "reports"
DB_PATH = DATA_DIR / "krushi_mitra_ai.db"
MODEL_DIR = BASE_DIR / "models"
BACKEND_DATA_DIR = BASE_DIR / "backend" / "app" / "data"

LANGUAGE_OPTIONS = [
    "English",
    "Kannada",
    "Hindi",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Marathi",
    "Bengali",
    "Gujarati",
    "Punjabi",
    "Odia",
    "Assamese",
    "Urdu",
]

DEFAULT_CROP_IMAGES = {
    "Tomato": "https://images.unsplash.com/photo-1546470427-e5ac89cd0b37?auto=format&fit=crop&w=640&q=60",
    "Rice": "https://images.unsplash.com/photo-1592997571659-0b21ff64313b?auto=format&fit=crop&w=640&q=60",
    "Wheat": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=640&q=60",
    "Maize": "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=640&q=60",
}

DEFAULT_AVATAR = "🌾"

for path in [DATA_DIR, PROFILE_DIR, REPORT_DIR, MODEL_DIR]:
    path.mkdir(parents=True, exist_ok=True)
