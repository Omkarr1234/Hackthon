import { useEffect, useState } from "react";
import { DEMO_NEWS, DEMO_SHOPS } from "../services/demoData";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const DEMO_PRODUCTS = [
  { id: "demo-seeds", name: "Vegetable seed information", description: "Illustrative demo catalog entry.", category: "Seeds", price: null, currency: "INR", url: "https://icar.gov.in/" },
  { id: "demo-tools", name: "Hand tools information", description: "Illustrative demo catalog entry.", category: "Tools", price: null, currency: "INR", url: "https://icar.gov.in/" },
  { id: "demo-irrigation", name: "Drip irrigation guidance", description: "Illustrative demo catalog entry.", category: "Irrigation", price: null, currency: "INR", url: "https://pmksy.gov.in/" },
];
const DEMO_LABOUR = [
  { id: "demo-labour-1", display_name: "Ananya (sample)", village: "Mandya region", district: "Mandya", skills: ["sugarcane", "harvesting"], wage: "Illustrative ₹650/day", contact_method: "Demo request only" },
  { id: "demo-labour-2", display_name: "Ravi (sample)", village: "Hassan region", district: "Hassan", skills: ["weeding", "irrigation"], wage: "Illustrative ₹550/day", contact_method: "Demo request only" },
];
const DEMO_EQUIPMENT = [
  { id: "demo-equipment-1", name: "Sample mini tractor", category: "Tractor", description: "Illustrative demo equipment listing.", rate: "Illustrative ₹900/day", location: "Mandya region", availability: "By request" },
  { id: "demo-equipment-2", name: "Sample drip irrigation kit", category: "Irrigation", description: "Illustrative demo equipment listing.", rate: "Illustrative ₹350/day", location: "Mysuru region", availability: "Weekdays" },
];
const DEMO_RECORDS = {
  jobs: [{ id: "demo-job-1", task: "Harvesting support", status: "Demo request", location: "Mandya region" }],
  listings: DEMO_EQUIPMENT,
  bookings: [{ id: "demo-booking-1", name: "Sample mini tractor", status: "Demo booking", booking_date: "Next available day" }],
};

async function request(path, options = {}) {
  const token = localStorage.getItem("farmsense_session_token");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(`${API}${path}`, {
    ...options,
    signal: controller.signal,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    });
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The request timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  const text = await response.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); } catch { data = { detail: text.slice(0, 200) }; }
  }
  if (!response.ok) throw new Error(data.detail || "Request failed");
  return data;
}

function Page({ eyebrow, title, children }) {
  return <main className="page-shell feature-page"><div className="eyebrow">{eyebrow}</div><h1 className="section-title">{title}</h1>{children}</main>;
}

function SearchForm({ value, setValue, onSubmit, placeholder, button = "Search" }) {
  return <form className="feature-search" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
    <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} />
    <button className="primary-button" type="submit">{button}</button>
  </form>;
}

export function ShopsPage({ demoMode = false }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState(demoMode ? "demo" : "live");
  const [results, setResults] = useState(demoMode ? DEMO_SHOPS : []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function demoSearch(value = query) {
    const terms = value.trim().toLowerCase().split(/\s+/).filter(
      (term) => term && !["shop", "shops", "store", "stores", "nearby"].includes(term),
    );
    const filtered = DEMO_SHOPS.filter((item) => {
      const haystack = `${item.name} ${item.address} ${item.category}`.toLowerCase();
      return terms.every((term) => haystack.includes(term) || (term === "mysore" && haystack.includes("mysuru")));
    });
    setResults(filtered);
    setError(filtered.length ? "" : "No fictional demo shops match that search. Try Mysore, seeds, nursery, or tools.");
  }

  function selectDemo() {
    setMode("demo");
    setError("");
    demoSearch();
  }

  async function search() {
    setError("");
    if (mode === "demo") {
      demoSearch();
      return;
    }
    const value = query.trim();
    if (!value) {
      setResults([]);
      setError("Enter a town, village, district, or PIN code before starting live search.");
      return;
    }
    setLoading(true);
    try {
      const data = await request(`/api/shops?q=${encodeURIComponent(value)}&mode=live`);
      const liveResults = Array.isArray(data.results) ? data.results : [];
      setResults(liveResults);
      if (!liveResults.length) setError("No nearby agricultural shops were found. Try a larger town or switch to Demo data.");
    } catch (e) {
      setResults([]);
      setError(`${e.message} Switch to Demo data for offline examples.`);
    } finally {
      setLoading(false);
    }
  }

  return <Page eyebrow="OPEN DATA • MAP SEARCH" title="Nearby Agri Shops">
    <p className="feature-intro">Search a town, village, district or PIN code. Live results come from OpenStreetMap and are not endorsements.</p>
    <div className="feature-toolbar">
      <button type="button" className={mode === "demo" ? "primary-button" : "secondary-button"} onClick={selectDemo}>Demo data</button>
      <button type="button" className={mode === "live" ? "primary-button" : "secondary-button"} onClick={() => { setMode("live"); setError(""); setResults([]); }}>Live search</button>
    </div>
    <SearchForm value={query} setValue={setQuery} onSubmit={search} placeholder="e.g. Mysuru seed store" button="Find shops" />
    {mode === "demo" && <div className="feature-success">Demo data — fictional examples. Prices, contacts, and availability are not real.</div>}
    {loading && <div className="feature-empty">Searching OpenStreetMap for nearby agricultural shops…</div>}
    {error && <div className="feature-alert">{error}</div>}
    <div className="feature-grid">{results.map((item) => <article className="feature-card" key={`${item.latitude}-${item.longitude}`}>
      {item.category && <span className="feature-tag">{item.category}</span>}
      <h3>{item.name}</h3><p>{item.address || "Address unavailable"}</p>
      {item.contact && <small>{item.contact}</small>}
      {item.open_in_maps && <a href={item.open_in_maps} target="_blank" rel="noreferrer">Open map directions ↗</a>}
    </article>)}</div>
    {!results.length && !error && !loading && <Empty text={mode === "demo" ? "Fictional demo shops will appear here." : "Enter a location to query live OpenStreetMap results."} />}
  </Page>;
}

export function NewsPage({ demoMode = false }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (demoMode) {
      setData({ items: DEMO_NEWS, notice: "Demo mode: sample links only; verify current articles at the linked official sources." });
      return;
    }
    request("/api/news").then(setData).catch((error) => setData({ items: [], notice: error.message }));
  }, [demoMode]);
  return <Page eyebrow="CREDIBLE SOURCES" title="Agriculture News">
    <p className="feature-intro">{data?.notice || "Loading official agriculture sources…"}</p>
    <div className="feature-grid">{(data?.items || []).map((item) => <article className="feature-card" key={item.url}><span className="feature-tag">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><small>{item.publisher}</small><a href={item.url} target="_blank" rel="noreferrer">Read original source ↗</a></article>)}</div>
  </Page>;
}

export function ProductsPage({ demoMode = false }) {
  const [data, setData] = useState(null);
  useEffect(() => { if (demoMode) { setData({ items: DEMO_PRODUCTS, notice: "Demo mode: illustrative products and public guidance links." }); return; } request("/api/products").then(setData).catch(() => setData({ items: [], notice: "Could not load product links." })); }, [demoMode]);
  return <Page eyebrow="VERIFIED LINKS ONLY" title="Agri Products & Services">
    <p className="feature-intro">{data?.notice || "Loading…"}</p>
    <div className="feature-grid">{(data?.items || []).map((item) => <article className="feature-card" key={item.id}><span className="feature-tag">{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><strong>{item.price == null ? "Price not published" : `${item.currency} ${item.price}`}</strong><a href={item.url} target="_blank" rel="noreferrer">Visit provider ↗</a>{item.safety && <small className="feature-safety">Safety: {item.safety}</small>}</article>)}</div>
  </Page>;
}

export function WeatherPage({ farm, updateFarm }) {
  const [location, setLocation] = useState(farm.location || "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  async function loadWeather() {
    setLoading(true); setStatus("");
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
      const { latitude, longitude } = position.coords;
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&forecast_days=4&timezone=auto`);
      if (!response.ok) throw new Error("Weather provider unavailable.");
      const data = await response.json(); setWeather(data); setStatus("LIVE • Open-Meteo + device location"); updateFarm("location", location || "Current location");
    } catch (error) { setStatus(error.code === 1 ? "Location permission was denied. You can continue using manual Farm Profile values." : error.message); } finally { setLoading(false); }
  }
  return <Page eyebrow="LIVE FORECAST" title="Weather & Farm Alerts">
    <div className="feature-toolbar"><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Farm location label" /><button className="primary-button" onClick={loadWeather} disabled={loading}>{loading ? "Loading…" : "Use my location"}</button></div>
    {status && <div className="feature-alert">{status}</div>}
    {weather ? <><div className="metric-grid"><Metric label="Temperature" value={`${weather.current?.temperature_2m ?? "—"} °C`} /><Metric label="Humidity" value={`${weather.current?.relative_humidity_2m ?? "—"}%`} /><Metric label="Rain now" value={`${weather.current?.precipitation ?? "—"} mm`} /><Metric label="Wind" value={`${weather.current?.wind_speed_10m ?? "—"} km/h`} /></div><div className="feature-card"><h3>Farming note</h3><p>Use rainfall and soil moisture together. Avoid spraying during rain or strong wind, and verify crop-specific advisories before irrigation or treatment.</p><small>Updated: {weather.current?.time || "provider time unavailable"} • Source: Open-Meteo</small></div></> : <Empty text="Choose to share your location to load a live forecast. No location is requested automatically." />}
  </Page>;
}

export function LabourPage({ demoMode = false }) {
  const [district, setDistrict] = useState(""); const [skill, setSkill] = useState(""); const [items, setItems] = useState(demoMode ? DEMO_LABOUR : []); const [error, setError] = useState("");
  async function search() { if (demoMode) { setItems(DEMO_LABOUR.filter((item) => (!district || item.district.toLowerCase().includes(district.toLowerCase())) && (!skill || item.skills.some((value) => value.includes(skill.toLowerCase()))))); return; } try { setItems((await request(`/api/labour?district=${encodeURIComponent(district)}&skill=${encodeURIComponent(skill)}`)).items || []); } catch (e) { setError(e.message); } }
  const [registering, setRegistering] = useState(false); const [form, setForm] = useState({ display_name: "", village: "", district: "", skills: "harvesting", crops: "vegetables", availability: "weekdays", wage: "Illustrative ₹600/day", contact_method: "in-app demo request" }); const [saved, setSaved] = useState("");
  async function register() {
    try {
      if (demoMode) {
        setItems((current) => [{ id: `demo-labour-${Date.now()}`, ...form, skills: form.skills.split(",").map((x) => x.trim()), is_demo: true }, ...current]);
        setSaved("Sample labour profile added for this demo session.");
        setRegistering(false);
        return;
      }
      await request("/api/labour/profiles", { method: "POST", body: JSON.stringify({ ...form, skills: form.skills.split(",").map((x) => x.trim()), crops: form.crops.split(",").map((x) => x.trim()), availability: form.availability.split(",").map((x) => x.trim()) }) });
      setSaved("Labour profile saved. It is marked unverified until a real verification process is added.");
      setRegistering(false);
    } catch (e) { setError(e.message); }
  }
  return <Page eyebrow="USER-SUBMITTED • NOT VERIFIED" title="Farm Labour Connect">
    <div className="feature-toolbar"><input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" /><input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Skill, e.g. harvesting" /><button className="primary-button" onClick={search}>Search labour</button></div>
    <button className="secondary-button" onClick={() => setRegistering((value) => !value)}>Register as a labourer</button>
    {registering && <div className="feature-card feature-form">{Object.keys(form).map((key) => <input key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={key.replace("_", " ")} />)}<button className="primary-button" onClick={register}>Save profile</button></div>}
    {saved && <div className="feature-success">{saved}</div>}{error && <div className="feature-alert">{error}</div>}<p className="feature-intro">Profiles never expose exact home addresses. Contact details are shared only through the consent method listed by the worker.</p>
    <div className="feature-grid">{items.map((item) => <article className="feature-card" key={item.id}><h3>{item.display_name}</h3><p>{item.village}, {item.district}</p><p>{item.skills?.join(", ")}</p><strong>{item.wage}</strong><small>Contact: {item.contact_method} • Not verified</small></article>)}</div><Empty text={items.length ? "" : "No profiles found yet. Farmers can add a listing after signing in."} />
  </Page>;
}

export function EquipmentPage({ demoMode = false }) {
  const [category, setCategory] = useState(""); const [location, setLocation] = useState(""); const [items, setItems] = useState(demoMode ? DEMO_EQUIPMENT : []); const [error, setError] = useState("");
  const [booked, setBooked] = useState("");
  async function search() { if (demoMode) { setItems(DEMO_EQUIPMENT.filter((item) => (!category || item.category.toLowerCase().includes(category.toLowerCase())) && (!location || item.location.toLowerCase().includes(location.toLowerCase())))); return; } try { setItems((await request(`/api/equipment?category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`)).items || []); } catch (e) { setError(e.message); } }
  return <Page eyebrow="USER-SUBMITTED • BOOKING REQUESTS" title="Farm Vehicles & Equipment">
    <div className="feature-toolbar"><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category, e.g. tractor" /><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Village or town" /><button className="primary-button" onClick={search}>Search equipment</button></div>
    {error && <div className="feature-alert">{error}</div>}{booked && <div className="feature-success">{booked}</div>}<div className="feature-grid">{items.map((item) => <article className="feature-card" key={item.id}><span className="feature-tag">{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><strong>{item.rate}</strong><small>{item.location} • Availability: {item.availability}</small>{demoMode && <button className="secondary-button" onClick={() => setBooked(`${item.name}: demo booking request is pending.`)}>Request demo booking</button>}</article>)}</div><Empty text={items.length ? "" : "No equipment listings found yet. Listings are owner-provided and not verified."} />
  </Page>;
}

export function AccountPage({ user, demoMode = false }) {
  const [tab, setTab] = useState("profile");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  async function load(nextTab) {
    setTab(nextTab); setError("");
    if (demoMode) { setItems(DEMO_RECORDS[nextTab]); return; }
    try {
      const path = nextTab === "listings" ? "/api/equipment/mine" : nextTab === "bookings" ? "/api/equipment/bookings" : "/api/labour/jobs";
      setItems((await request(path)).items || []);
    } catch (e) { setError(e.message); }
  }
  return <Page eyebrow="PRIVATE WORKSPACE" title="Profile, Listings & Bookings">
    <div className="feature-card account-card"><h3>{user?.name || "Farmer"}</h3><p>{user?.email}</p><small>Your exact address and contact details are not shown publicly.</small></div>
    <div className="feature-toolbar"><button className="secondary-button" onClick={() => load("jobs")}>My labour requests</button><button className="secondary-button" onClick={() => load("listings")}>My equipment listings</button><button className="secondary-button" onClick={() => load("bookings")}>My equipment bookings</button></div>
    {error && <div className="feature-alert">{error}</div>}
    <div className="feature-grid">{items.map((item) => <article className="feature-card" key={item.id}><h3>{item.name || item.task || "Record"}</h3><p>Status: {item.status}</p><small>{item.location || item.booking_date || item.created_at}</small></article>)}</div>
    {!items.length && !error && <Empty text={`Select a tab to load ${tab === "profile" ? "your records" : "your " + tab}.`} />}
  </Page>;
}

export function SettingsPage({ language, setLanguage }) {
  return <Page eyebrow="PREFERENCES" title="Settings & Language">
    <div className="feature-card"><h3>Language</h3><p>Choose the language used by FarmSense guidance and supported provider requests.</p><div className="feature-toolbar"><button className={language === "en" ? "primary-button" : "secondary-button"} onClick={() => setLanguage("en")}>English</button><button className={language === "kn" ? "primary-button" : "secondary-button"} onClick={() => setLanguage("kn")}>ಕನ್ನಡ</button><button className={language === "hi" ? "primary-button" : "secondary-button"} onClick={() => setLanguage("hi")}>हिन्दी</button></div></div>
    <div className="feature-card"><h3>Privacy</h3><p>Provider credentials stay on the backend. Browser location is requested only when you choose a live weather or map search action.</p></div>
  </Page>;
}

function Metric({ label, value }) { return <div className="metric-card"><span>{label}</span><strong>{value}</strong></div>; }
function Empty({ text }) { return text ? <div className="feature-empty">{text}</div> : null; }
