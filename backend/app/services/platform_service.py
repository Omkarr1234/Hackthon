import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "agri.db"


def _now():
    return datetime.now(timezone.utc).isoformat()


def _connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.execute("PRAGMA busy_timeout = 5000")
    connection.row_factory = sqlite3.Row
    return connection


def init_platform_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _connect() as db:
        existing_columns = {
            row[1] for row in db.execute("PRAGMA table_info(users)").fetchall()
        }
        required_columns = {"id", "name", "email", "password_hash", "created_at"}
        if existing_columns and not required_columns.issubset(existing_columns):
            db.execute("ALTER TABLE users RENAME TO users_legacy")
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at TEXT NOT NULL,
                used INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS labour_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                display_name TEXT NOT NULL,
                village TEXT NOT NULL,
                district TEXT NOT NULL,
                skills TEXT NOT NULL,
                crops TEXT NOT NULL,
                availability TEXT NOT NULL,
                wage TEXT NOT NULL,
                contact_method TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS labour_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                task TEXT NOT NULL,
                location TEXT NOT NULL,
                work_date TEXT NOT NULL,
                workers INTEGER NOT NULL,
                payment TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS equipment_listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT NOT NULL,
                rate TEXT NOT NULL,
                availability TEXT NOT NULL,
                contact_method TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS equipment_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                listing_id INTEGER NOT NULL,
                requester_id INTEGER NOT NULL,
                booking_date TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )


def _as_dict(row):
    if row is None:
        return None
    result = dict(row)
    for key in ("skills", "crops", "availability"):
        if key in result:
            try:
                result[key] = json.loads(result[key])
            except (TypeError, json.JSONDecodeError):
                pass
    return result


def create_user(name, email, password_hash):
    init_platform_db()
    with _connect() as db:
        cursor = db.execute(
            "INSERT INTO users(name,email,password_hash,created_at) VALUES (?,?,?,?)",
            (name, email.lower(), password_hash, _now()),
        )
        return cursor.lastrowid


def get_user_by_email(email):
    init_platform_db()
    with _connect() as db:
        return db.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()


def get_user(user_id):
    init_platform_db()
    with _connect() as db:
        return db.execute("SELECT id,name,email FROM users WHERE id = ?", (user_id,)).fetchone()


def update_user(user_id, name, email):
    with _connect() as db:
        db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (name, email.lower(), user_id))


def save_reset_token(token, user_id, expires_at):
    with _connect() as db:
        db.execute("INSERT INTO password_reset_tokens(token,user_id,expires_at) VALUES (?,?,?)", (token, user_id, expires_at))


def consume_reset_token(token):
    with _connect() as db:
        row = db.execute("SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0", (token,)).fetchone()
        if row:
            db.execute("UPDATE password_reset_tokens SET used = 1 WHERE token = ?", (token,))
        return row


def update_password(user_id, password_hash):
    with _connect() as db:
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))


def insert_labour(owner_id, payload):
    with _connect() as db:
        cursor = db.execute(
            """INSERT INTO labour_profiles
            (owner_id,display_name,village,district,skills,crops,availability,wage,contact_method,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                owner_id, payload["display_name"], payload["village"], payload["district"],
                json.dumps(payload["skills"]), json.dumps(payload["crops"]),
                json.dumps(payload["availability"]), payload["wage"],
                payload["contact_method"], _now(),
            ),
        )
        return cursor.lastrowid


def list_labour(district="", skill=""):
    query = "SELECT * FROM labour_profiles WHERE 1=1"
    values = []
    if district:
        query += " AND lower(district) LIKE ?"
        values.append(f"%{district.lower()}%")
    with _connect() as db:
        rows = [_as_dict(row) for row in db.execute(query, values).fetchall()]
    if skill:
        wanted = skill.lower()
        rows = [row for row in rows if any(wanted in str(item).lower() for item in row["skills"])]
    demo = [
        row for row in DEMO_LABOUR
        if (not district or district.lower() in row["district"].lower())
        and (not skill or any(skill.lower() in item.lower() for item in row["skills"]))
    ]
    return rows + demo


DEMO_LABOUR = [
    {"id": "demo-labour-1", "display_name": "Ananya (sample)", "village": "Mandya region", "district": "Mandya", "skills": ["sugarcane", "harvesting"], "crops": ["sugarcane", "rice"], "availability": ["weekends"], "wage": "Illustrative ₹650/day", "contact_method": "Demo request only", "is_demo": True},
    {"id": "demo-labour-2", "display_name": "Ravi (sample)", "village": "Hassan region", "district": "Hassan", "skills": ["weeding", "irrigation"], "crops": ["coffee", "vegetables"], "availability": [" weekdays"], "wage": "Illustrative ₹550/day", "contact_method": "Demo request only", "is_demo": True},
    {"id": "demo-labour-3", "display_name": "Meena (sample)", "village": "Mysuru region", "district": "Mysuru", "skills": ["nursery", "transplanting"], "crops": ["tomato", "chilli"], "availability": ["seasonal"], "wage": "Illustrative ₹600/day", "contact_method": "Demo request only", "is_demo": True},
    {"id": "demo-labour-4", "display_name": "Shivappa (sample)", "village": "Dharwad region", "district": "Dharwad", "skills": ["tractor operation", "ploughing"], "crops": ["maize", "cotton"], "availability": ["by request"], "wage": "Illustrative ₹900/day", "contact_method": "Demo request only", "is_demo": True},
    {"id": "demo-labour-5", "display_name": "Farzana (sample)", "village": "Kalaburagi region", "district": "Kalaburagi", "skills": ["sorting", "post-harvest"], "crops": ["pulses", "groundnut"], "availability": ["weekdays"], "wage": "Illustrative ₹500/day", "contact_method": "Demo request only", "is_demo": True},
    {"id": "demo-labour-6", "display_name": "Kiran (sample)", "village": "Kolar region", "district": "Kolar", "skills": ["picking", "packing"], "crops": ["tomato", "grape"], "availability": ["by request"], "wage": "Illustrative ₹575/day", "contact_method": "Demo request only", "is_demo": True},
]


def insert_job(owner_id, payload):
    with _connect() as db:
        cursor = db.execute(
            """INSERT INTO labour_jobs
            (owner_id,task,location,work_date,workers,payment,status,created_at)
            VALUES (?,?,?,?,?,?,?,?)""",
            (owner_id, payload["task"], payload["location"], payload["work_date"],
             payload["workers"], payload["payment"], "pending", _now()),
        )
        return cursor.lastrowid


def insert_equipment(owner_id, payload):
    with _connect() as db:
        cursor = db.execute(
            """INSERT INTO equipment_listings
            (owner_id,name,category,location,description,rate,availability,contact_method,created_at)
            VALUES (?,?,?,?,?,?,?,?,?)""",
            (owner_id, payload["name"], payload["category"], payload["location"],
             payload["description"], payload["rate"], payload["availability"],
             payload["contact_method"], _now()),
        )
        return cursor.lastrowid


def list_equipment(category="", location=""):
    query = "SELECT * FROM equipment_listings WHERE 1=1"
    values = []
    if category:
        query += " AND lower(category) LIKE ?"
        values.append(f"%{category.lower()}%")
    if location:
        query += " AND lower(location) LIKE ?"
        values.append(f"%{location.lower()}%")
    with _connect() as db:
        rows = [dict(row) for row in db.execute(query, values).fetchall()]
    return rows + [
        row for row in DEMO_EQUIPMENT
        if (not category or category.lower() in row["category"].lower())
        and (not location or location.lower() in row["location"].lower())
    ]


def insert_booking(listing_id, requester_id, booking_date):
    with _connect() as db:
        cursor = db.execute(
            """INSERT INTO equipment_bookings
            (listing_id,requester_id,booking_date,status,created_at)
            VALUES (?,?,?,?,?)""",
            (listing_id, requester_id, booking_date, "pending", _now()),
        )
        return cursor.lastrowid


DEMO_EQUIPMENT = [
    {"id": "demo-equipment-1", "name": "Compact Tractor (sample)", "category": "tractor", "location": "Mandya region", "description": "Illustrative demo listing; owner and availability are fictional.", "rate": "Illustrative ₹1,200/day", "availability": "Example: weekends", "contact_method": "Demo booking only", "is_demo": True},
    {"id": "demo-equipment-2", "name": "Rotavator (sample)", "category": "rotavator", "location": "Hassan region", "description": "Illustrative demo listing for soil preparation.", "rate": "Illustrative ₹900/day", "availability": "Example: by request", "contact_method": "Demo booking only", "is_demo": True},
    {"id": "demo-equipment-3", "name": "Battery Sprayer (sample)", "category": "sprayer", "location": "Mysuru region", "description": "Illustrative demo listing; inspect equipment before use.", "rate": "Illustrative ₹350/day", "availability": "Example: weekdays", "contact_method": "Demo booking only", "is_demo": True},
    {"id": "demo-equipment-4", "name": "Seed Drill (sample)", "category": "seed drill", "location": "Dharwad region", "description": "Illustrative demo listing for sowing.", "rate": "Illustrative ₹1,000/day", "availability": "Example: seasonal", "contact_method": "Demo booking only", "is_demo": True},
    {"id": "demo-equipment-5", "name": "Water Pump (sample)", "category": "pump", "location": "Kolar region", "description": "Illustrative demo listing; verify power and fittings.", "rate": "Illustrative ₹450/day", "availability": "Example: by request", "contact_method": "Demo booking only", "is_demo": True},
    {"id": "demo-equipment-6", "name": "Mini Harvester (sample)", "category": "harvester", "location": "Kalaburagi region", "description": "Illustrative demo listing for hackathon demonstration.", "rate": "Illustrative ₹2,500/day", "availability": "Example: harvest season", "contact_method": "Demo booking only", "is_demo": True},
]


def list_jobs(owner_id):
    with _connect() as db:
        return [dict(row) for row in db.execute(
            "SELECT * FROM labour_jobs WHERE owner_id = ? ORDER BY created_at DESC",
            (owner_id,),
        ).fetchall()]


def list_owned_equipment(owner_id):
    with _connect() as db:
        return [dict(row) for row in db.execute(
            "SELECT * FROM equipment_listings WHERE owner_id = ? ORDER BY created_at DESC",
            (owner_id,),
        ).fetchall()]


def list_bookings(requester_id):
    with _connect() as db:
        return [dict(row) for row in db.execute(
            """SELECT equipment_bookings.*, equipment_listings.name
            FROM equipment_bookings
            JOIN equipment_listings ON equipment_listings.id = equipment_bookings.listing_id
            WHERE requester_id = ? ORDER BY equipment_bookings.created_at DESC""",
            (requester_id,),
        ).fetchall()]


def fetch_json(url, timeout=12):
    request = Request(url, headers={"User-Agent": "FarmSense/1.0 (agriculture app)"})
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def search_places(query):
    geocode_params = urlencode({
        "q": query,
        "format": "jsonv2",
        "limit": 1,
        "countrycodes": "in",
    })
    locations = fetch_json(
        f"https://nominatim.openstreetmap.org/search?{geocode_params}",
        timeout=15,
    )
    if not locations:
        return []

    location = locations[0]
    latitude = float(location["lat"])
    longitude = float(location["lon"])
    radius = 5000
    overpass_query = f"""
[out:json][timeout:15];
(
  nwr(around:{radius},{latitude},{longitude})["shop"~"agrarian|farm|garden_centre|hardware|doityourself",i];
  nwr(around:{radius},{latitude},{longitude})["amenity"~"marketplace",i]["name"~"seed|fertil|agri|farm|nursery|krishi|raitha",i];
  nwr(around:{radius},{latitude},{longitude})["name"~"seed|fertil|agri|farm supply|nursery|krishi|raitha",i];
);
out center tags;
""".strip()
    overpass_params = urlencode({"data": overpass_query})
    elements = fetch_json(
        f"https://overpass-api.de/api/interpreter?{overpass_params}",
        timeout=25,
    ).get("elements", [])

    results = []
    for element in elements[:30]:
        tags = element.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        point = element.get("center", element)
        lat = point.get("lat")
        lon = point.get("lon")
        address = ", ".join(
            value for value in (
                tags.get("addr:housenumber"),
                tags.get("addr:street"),
                tags.get("addr:city"),
                tags.get("addr:district"),
            ) if value
        ) or location.get("display_name", "Address unavailable")
        category = tags.get("shop") or tags.get("amenity") or "Agricultural supply"
        results.append({
            "name": name,
            "address": address,
            "category": category.replace("_", " ").title(),
            "latitude": lat,
            "longitude": lon,
            "open_in_maps": (
                f"https://www.openstreetmap.org/?mlat={lat}&mlon={lon}"
                if lat is not None and lon is not None
                else None
            ),
        })
    return results
