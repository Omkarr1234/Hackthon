import React, { useEffect, useMemo, useState } from "react";
import "./MandiPrices.css";
import { DEMO_MANDI_RECORDS } from "../services/demoData";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const CROPS = ["All crops", "Paddy", "Jowar", "Maize", "Wheat", "Ragi", "Cotton", "Groundnut", "Soybean", "Turmeric", "Onion", "Tomato", "Chilli"];
const STATES = ["Karnataka", "Maharashtra", "Telangana", "Andhra Pradesh", "Tamil Nadu"];

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—";
}
function price(row) {
  return Number(row.modal_price || row.modalPrice || row.price || 0);
}

export default function MandiPrices({ language = "en", demoMode = false }) {
  const [state, setState] = useState("Karnataka");
  const [crop, setCrop] = useState("All crops");
  const [market, setMarket] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const kn = language === "kn";

  async function loadPrices(event) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (demoMode) {
        const normalizedCrop = crop.toLowerCase();
        const normalizedMarket = market.trim().toLowerCase();
        const demoRows = DEMO_MANDI_RECORDS.filter((row) => (
          (crop === "All crops" || row.commodity.toLowerCase() === normalizedCrop)
          && (!normalizedMarket || row.market.toLowerCase().includes(normalizedMarket))
        ));
        setRows(demoRows);
        setLastUpdated("2026-10-24T09:00:00.000Z");
        if (!demoRows.length) setError("No sample records match these filters.");
        return;
      }
      const params = new URLSearchParams({ state, limit: "100" });
      if (crop !== "All crops") params.set("commodity", crop);
      if (market.trim()) params.set("market", market.trim());
      const response = await fetch(`${API_BASE}/api/mandi/prices?${params.toString()}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Mandi data load nahi ho paya.");
      setRows(Array.isArray(data.records) ? data.records : []);
      setLastUpdated(data.fetched_at || new Date().toISOString());
      if (!data.records?.length) setError("Is filter ke liye recent records nahi mile. Crop/market badal kar try karein.");
    } catch (e) {
      setError(e.message || "Mandi data load nahi ho paya.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPrices(); }, [demoMode]);

  const normalized = useMemo(() => {
    const filtered = rows.filter(r => !market.trim() || String(r.market || "").toLowerCase().includes(market.trim().toLowerCase()));
    return filtered.map((r, i) => ({
      ...r,
      _key: `${r.state}-${r.market}-${r.commodity}-${r.arrival_date}-${i}`,
      _price: price(r),
      _date: r.arrival_date || r.date || "Date unavailable",
    }));
  }, [rows, market]);

  const comparison = useMemo(() => {
    const byCrop = new Map();
    for (const r of normalized) {
      const key = `${r.commodity || "Unknown"}|${r.market || "Unknown"}`;
      if (!byCrop.has(key)) byCrop.set(key, []);
      byCrop.get(key).push(r);
    }
    return [...byCrop.entries()].map(([key, list]) => {
      const sorted = list.filter(x => x._price > 0).sort((a,b) => new Date(b._date) - new Date(a._date));
      const latest = sorted[0];
      const previous = sorted.find(x => x._date !== latest?._date);
      const delta = latest && previous ? latest._price - previous._price : null;
      return { key, latest, previous, delta, percent: previous?._price ? (delta / previous._price) * 100 : null };
    }).filter(x => x.latest);
  }, [normalized]);

  return (
    <main className="mandi-page">
      <section className="mandi-hero">
        <div>
          <span className="mandi-eyebrow">FARMSENSE • MARKET INTELLIGENCE</span>
          <h1>{kn ? "ಮಂಡಿ ಬೆಲೆಗಳು" : "Mandi Prices"}</h1>
          <p>{kn ? "ಇತ್ತೀಚಿನ ಬೆಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಹಿಂದಿನ ಲಭ್ಯವಿರುವ ಬೆಲೆಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ." : "Check the latest available mandi prices and compare them with earlier reported prices."}</p>
          {demoMode && <small className="mandi-source">Demo mode: illustrative sample prices, not official market data.</small>}
        </div>
        <div className="mandi-hero-icon">₹</div>
      </section>

      <form className="mandi-filters" onSubmit={loadPrices}>
        <label>State
          <select value={state} onChange={e => setState(e.target.value)}>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Crop / Commodity
          <select value={crop} onChange={e => setCrop(e.target.value)}>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Market (optional)
          <input value={market} onChange={e => setMarket(e.target.value)} placeholder="e.g. Kalaburagi" />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Loading…" : "Find prices"}</button>
      </form>

      {error && <div className="mandi-alert" role="status">{error}</div>}
      {loading && <div className="mandi-loading">Fetching government market data…</div>}

      {!loading && comparison.length > 0 && (
        <>
          <div className="mandi-summary">
            <div><span>Markets / crop records</span><strong>{comparison.length}</strong></div>
            <div><span>Selected state</span><strong>{state}</strong></div>
            <div><span>Data status</span><strong>Latest available</strong></div>
          </div>
          <section className="mandi-results">
            <div className="mandi-section-head">
              <div><h2>Price comparison</h2><p>Prices are shown per quintal where provided by the source.</p></div>
              <span className="mandi-source">Source: data.gov.in / AGMARKNET</span>
            </div>
            <div className="mandi-table-wrap">
              <table className="mandi-table">
                <thead><tr><th>Commodity</th><th>Market</th><th>Latest modal price</th><th>Previous available price</th><th>Change</th><th>Latest date</th></tr></thead>
                <tbody>
                  {comparison.map(item => (
                    <tr key={item.key}>
                      <td><strong>{item.latest.commodity || "—"}</strong></td>
                      <td>{item.latest.market || "—"}</td>
                      <td className="mandi-price">{money(item.latest._price)}</td>
                      <td>{item.previous ? money(item.previous._price) : "No comparison record"}</td>
                      <td className={item.delta == null ? "" : item.delta > 0 ? "price-up" : item.delta < 0 ? "price-down" : ""}>
                        {item.delta == null ? "—" : `${item.delta > 0 ? "+" : ""}${money(item.delta)}${item.percent != null ? ` (${item.percent > 0 ? "+" : ""}${item.percent.toFixed(1)}%)` : ""}`}
                      </td>
                      <td>{item.latest._date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      <p className="mandi-disclaimer">Market prices are reported values, not a guaranteed selling price. Rates may vary by quality, grade, quantity and local buyer. “Previous available price” means the previous distinct dated record returned by the data source; it may not be the previous calendar day.</p>
      {lastUpdated && <p className="mandi-updated">Data fetched: {new Date(lastUpdated).toLocaleString()}</p>}
    </main>
  );
}
