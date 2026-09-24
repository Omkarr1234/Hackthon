import { useMemo, useState } from "react";
import "./App.css";

/* =========================================================
   AGRI SAATHI AI - FRONTEND ONLY
   No ./data import
   No backend required for demo
========================================================= */

const CROPS = [
  ["Rice", "🌾", "Cereal", "Water-loving crop", "Kharif"],
  ["Wheat", "🌾", "Cereal", "Cool-season crop", "Rabi"],
  ["Maize", "🌽", "Cereal", "Warm-season crop", "Kharif"],
  ["Millet", "🌾", "Cereal", "Drought tolerant", "Kharif"],
  ["Sorghum", "🌾", "Cereal", "Drought tolerant", "Kharif"],
  ["Barley", "🌾", "Cereal", "Cool-season crop", "Rabi"],
  ["Ragi", "🌾", "Millet", "Suitable for dry areas", "Kharif"],
  ["Bajra", "🌾", "Millet", "Heat tolerant", "Kharif"],
  ["Chickpea", "🫘", "Pulse", "Rabi pulse crop", "Rabi"],
  ["Pigeon Pea", "🫘", "Pulse", "Long-duration pulse", "Kharif"],
  ["Green Gram", "🌱", "Pulse", "Short-duration pulse", "Kharif"],
  ["Black Gram", "🌱", "Pulse", "Pulse crop", "Kharif"],
  ["Lentil", "🌱", "Pulse", "Cool-season pulse", "Rabi"],
  ["Soybean", "🌱", "Oilseed", "Major oilseed crop", "Kharif"],
  ["Groundnut", "🥜", "Oilseed", "Oilseed and food crop", "Kharif"],
  ["Mustard", "🌼", "Oilseed", "Rabi oilseed", "Rabi"],
  ["Sunflower", "🌻", "Oilseed", "Oilseed crop", "Both"],
  ["Sesame", "🌱", "Oilseed", "Drought tolerant", "Kharif"],
  ["Cotton", "☁️", "Commercial", "Fibre crop", "Kharif"],
  ["Sugarcane", "🎋", "Commercial", "Long-duration crop", "Both"],
  ["Tobacco", "🌿", "Commercial", "Commercial crop", "Rabi"],
  ["Tomato", "🍅", "Vegetable", "Fruit vegetable", "Both"],
  ["Potato", "🥔", "Vegetable", "Tuber crop", "Rabi"],
  ["Onion", "🧅", "Vegetable", "Bulb crop", "Both"],
  ["Garlic", "🧄", "Vegetable", "Bulb crop", "Rabi"],
  ["Chilli", "🌶️", "Vegetable", "Spice crop", "Both"],
  ["Brinjal", "🍆", "Vegetable", "Fruit vegetable", "Both"],
  ["Okra", "🥬", "Vegetable", "Warm-season vegetable", "Both"],
  ["Cabbage", "🥬", "Vegetable", "Cool-season vegetable", "Rabi"],
  ["Cauliflower", "🥦", "Vegetable", "Cool-season vegetable", "Rabi"],
  ["Carrot", "🥕", "Vegetable", "Root vegetable", "Rabi"],
  ["Radish", "🌱", "Vegetable", "Root vegetable", "Rabi"],
  ["Beans", "🫘", "Vegetable", "Legume vegetable", "Both"],
  ["Peas", "🫛", "Vegetable", "Cool-season vegetable", "Rabi"],
  ["Pumpkin", "🎃", "Vegetable", "Cucurbit", "Both"],
  ["Cucumber", "🥒", "Vegetable", "Cucurbit", "Both"],
  ["Watermelon", "🍉", "Fruit", "Warm-season fruit", "Summer"],
  ["Muskmelon", "🍈", "Fruit", "Warm-season fruit", "Summer"],
  ["Banana", "🍌", "Fruit", "Tropical fruit", "Both"],
  ["Mango", "🥭", "Fruit", "Fruit tree", "Both"],
  ["Papaya", "🍊", "Fruit", "Tropical fruit", "Both"],
  ["Guava", "🍐", "Fruit", "Fruit tree", "Both"],
  ["Pomegranate", "🍎", "Fruit", "Dryland fruit", "Both"],
  ["Grapes", "🍇", "Fruit", "Fruit crop", "Both"],
  ["Coconut", "🥥", "Plantation", "Plantation crop", "Both"],
  ["Turmeric", "🟡", "Spice", "Rhizome crop", "Kharif"],
  ["Ginger", "🫚", "Spice", "Rhizome crop", "Kharif"],
  ["Cardamom", "🌿", "Spice", "Plantation spice", "Both"],
  ["Black Pepper", "🌿", "Spice", "Climbing spice", "Both"],
];

const DISEASES = [
  ["Rice Blast", "Rice", "Fungal", "Leaf lesions, neck infection"],
  ["Bacterial Leaf Blight", "Rice", "Bacterial", "Yellowing and drying leaves"],
  ["Brown Planthopper", "Rice", "Insect", "Yellowing and hopper damage"],
  ["Wheat Rust", "Wheat", "Fungal", "Orange/brown rust pustules"],
  ["Powdery Mildew", "Many crops", "Fungal", "White powder-like growth"],
  ["Early Blight", "Tomato", "Fungal", "Dark circular leaf spots"],
  ["Late Blight", "Tomato/Potato", "Fungal", "Dark water-soaked lesions"],
  ["Tomato Leaf Curl", "Tomato", "Viral", "Curling and yellowing leaves"],
  ["Fruit Borer", "Tomato/Chilli/Brinjal", "Insect", "Holes in fruits"],
  ["Aphids", "Many crops", "Insect", "Small insects and curling leaves"],
  ["Thrips", "Chilli/Onion", "Insect", "Silvery leaf damage"],
  ["Whitefly", "Many crops", "Insect", "Small white flying insects"],
  ["Fall Armyworm", "Maize", "Insect", "Windowing and holes in leaves"],
  ["Wilt", "Tomato/Chickpea", "Fungal", "Sudden wilting"],
  ["Root Rot", "Many crops", "Fungal", "Root decay and poor growth"],
  ["Anthracnose", "Mango/Chilli", "Fungal", "Dark sunken lesions"],
  ["Downy Mildew", "Vegetables", "Fungal", "Yellow patches and underside growth"],
  ["Yellow Mosaic Virus", "Soybean/Beans", "Viral", "Yellow mosaic patterns"],
  ["Purple Blotch", "Onion", "Fungal", "Purple leaf lesions"],
  ["Red Rot", "Sugarcane", "Fungal", "Red internal stalk tissue"],
];

const PLANT_DATABASE = {
  tomato: {
    name: "Tomato",
    icon: "🍅",
    type: "Vegetable",
    soil: "Well-drained loamy soil",
    water: "Regular irrigation; avoid waterlogging",
    temperature: "20–30°C",
    problems: "Early blight, leaf curl, fruit borer",
    harvest: "About 60–90 days after transplanting",
  },
  rice: {
    name: "Rice",
    icon: "🌾",
    type: "Cereal",
    soil: "Clay or clay-loam with good water retention",
    water: "Requires adequate moisture",
    temperature: "20–35°C",
    problems: "Blast, bacterial blight, planthopper",
    harvest: "Usually 100–150 days depending on variety",
  },
  wheat: {
    name: "Wheat",
    icon: "🌾",
    type: "Cereal",
    soil: "Well-drained loamy soil",
    water: "Irrigation at critical growth stages",
    temperature: "10–25°C",
    problems: "Rust, aphids, termites",
    harvest: "Usually 110–150 days",
  },
  maize: {
    name: "Maize",
    icon: "🌽",
    type: "Cereal",
    soil: "Fertile, well-drained soil",
    water: "Important around flowering and grain filling",
    temperature: "21–30°C",
    problems: "Fall armyworm, stalk borer, leaf blight",
    harvest: "Approximately 90–120 days",
  },
  potato: {
    name: "Potato",
    icon: "🥔",
    type: "Vegetable",
    soil: "Loose sandy-loam soil",
    water: "Frequent moderate irrigation",
    temperature: "15–20°C",
    problems: "Late blight, aphids, tuber moth",
    harvest: "Approximately 70–120 days",
  },
  onion: {
    name: "Onion",
    icon: "🧅",
    type: "Vegetable",
    soil: "Well-drained loamy soil",
    water: "Regular irrigation, reduce before harvest",
    temperature: "13–25°C",
    problems: "Thrips, purple blotch, bulb rot",
    harvest: "Approximately 90–150 days",
  },
  chilli: {
    name: "Chilli",
    icon: "🌶️",
    type: "Vegetable/Spice",
    soil: "Well-drained loamy soil",
    water: "Regular but avoid standing water",
    temperature: "20–30°C",
    problems: "Thrips, leaf curl, fruit rot",
    harvest: "Approximately 120–150 days",
  },
  banana: {
    name: "Banana",
    icon: "🍌",
    type: "Fruit",
    soil: "Deep fertile soil",
    water: "Regular irrigation",
    temperature: "20–35°C",
    problems: "Sigatoka, Panama wilt, bunchy top",
    harvest: "Approximately 11–14 months",
  },
  mango: {
    name: "Mango",
    icon: "🥭",
    type: "Fruit",
    soil: "Deep well-drained soil",
    water: "Moderate; manage irrigation around flowering",
    temperature: "24–30°C",
    problems: "Anthracnose, hopper, powdery mildew",
    harvest: "Variety dependent",
  },
  sugarcane: {
    name: "Sugarcane",
    icon: "🎋",
    type: "Commercial",
    soil: "Deep fertile loamy soil",
    water: "Regular irrigation",
    temperature: "20–35°C",
    problems: "Red rot, stem borer, whitefly",
    harvest: "Approximately 10–18 months",
  },
};

function getPlantData(name) {
  const key = name.toLowerCase().replaceAll(" ", "");
  return (
    PLANT_DATABASE[key] || {
      name,
      icon: "🌱",
      type: "Crop / Plant",
      soil: "Well-drained soil suited to the crop",
      water: "Irrigation should follow crop and soil conditions",
      temperature: "Depends on variety and region",
      problems: "Disease and pest risk depends on local conditions",
      harvest: "Depends on crop and variety",
    }
  );
}

function agricultureAI(question) {
  const q = question.toLowerCase();

  if (!q.trim()) {
    return "Please type an agriculture question.";
  }

  if (q.includes("npk")) {
    return "NPK means Nitrogen, Phosphorus and Potassium. Nitrogen mainly supports vegetative growth, phosphorus supports roots and reproductive growth, and potassium supports water regulation and stress response. Exact fertilizer quantities should be based on a soil test and crop requirement.";
  }

  if (q.includes("fertilizer") || q.includes("fertiliser")) {
    return "For fertilizer planning, first consider the crop, soil-test NPK, soil pH, growth stage and local recommendations. Avoid applying exact quantities without a soil test.";
  }

  if (q.includes("water") || q.includes("irrigation")) {
    return "Irrigation depends on crop, soil type, weather and growth stage. Check soil moisture before irrigating and avoid prolonged waterlogging.";
  }

  if (q.includes("disease") || q.includes("leaf") || q.includes("pest")) {
    return "For a plant problem, upload a clear photo of the affected leaf, stem or fruit in the Plant Doctor section. The demo scanner will provide a preliminary visual assessment. It is not a laboratory diagnosis.";
  }

  if (q.includes("rice")) {
    return "Rice generally performs well in warm conditions with adequate water availability. Common issues include blast, bacterial leaf blight and planthoppers.";
  }

  if (q.includes("tomato")) {
    return "Tomato prefers well-drained soil and regular irrigation. Common problems include early blight, leaf curl and fruit borer.";
  }

  if (q.includes("crop")) {
    return "Crop selection should consider soil, water availability, temperature, rainfall, season, market demand and local recommendations. Open Crop Explorer to compare crops.";
  }

  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("namaste")
  ) {
    return "Namaste! 🌱 I am Agri Saathi AI. You can ask me about crops, soil, irrigation, fertilizer, pests and plant diseases.";
  }

  return "I can help with crops, soil, irrigation, NPK, fertilizer, pests and plant diseases. Try asking: “What fertilizer does tomato need?” or “My rice leaves are yellow, what should I check?”";
}

function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agriUsers") || "{}");
    } catch {
      return {};
    }
  });

  const [user, setUser] = useState(null);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [cropSearch, setCropSearch] = useState("");
  const [cropCategory, setCropCategory] = useState("All");

  const [diseaseSearch, setDiseaseSearch] = useState("");

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantFile, setPlantFile] = useState(null);
  const [plantPreview, setPlantPreview] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const [language, setLanguage] = useState("English");

  const categories = [
    "All",
    ...new Set(CROPS.map((crop) => crop[2])),
  ];

  const filteredCrops = useMemo(() => {
    return CROPS.filter((crop) => {
      const matchesSearch = crop[0]
        .toLowerCase()
        .includes(cropSearch.toLowerCase());

      const matchesCategory =
        cropCategory === "All" || crop[2] === cropCategory;

      return matchesSearch && matchesCategory;
    });
  }, [cropSearch, cropCategory]);

  const filteredDiseases = useMemo(() => {
    return DISEASES.filter((disease) =>
      disease.join(" ").toLowerCase().includes(diseaseSearch.toLowerCase())
    );
  }, [diseaseSearch]);

  function register() {
    if (!registerName || !registerPhone || !registerPassword) {
      alert("Please fill all fields.");
      return;
    }

    const nextUsers = {
      ...users,
      [registerPhone]: {
        name: registerName,
        password: registerPassword,
      },
    };

    setUsers(nextUsers);
    localStorage.setItem("agriUsers", JSON.stringify(nextUsers));

    alert("Account created successfully.");
    setShowRegister(false);
  }

  function login() {
    const existing = users[loginPhone];

    if (!existing || existing.password !== loginPassword) {
      alert("Invalid mobile number or password.");
      return;
    }

    setUser({
      name: existing.name,
      phone: loginPhone,
    });

    setLoggedIn(true);
    setPage("home");
  }

  function logout() {
    setLoggedIn(false);
    setUser(null);
    setPage("home");
  }

  function askAI() {
    if (!question.trim()) return;

    const answer = agricultureAI(question);

    setMessages((old) => [
      ...old,
      { role: "user", text: question },
      { role: "assistant", text: answer },
    ]);

    setQuestion("");
  }

  function handlePlantFile(file) {
    if (!file) return;

    setPlantFile(file);
    setPlantPreview(URL.createObjectURL(file));
    setScanResult(null);
  }

  function analyzePlant() {
    if (!plantFile) {
      alert("Please capture or upload a plant photo.");
      return;
    }

    const name =
      selectedPlant?.name ||
      "Plant / Crop";

    setScanResult({
      plant: name,
      confidence: 72,
      condition: "Possible leaf stress / disease symptoms",
      advice:
        "The photo shows visual symptoms that may be associated with plant stress. Check the underside of leaves, irrigation, recent weather and nearby plants. For treatment decisions, confirm the diagnosis with a local agriculture expert.",
    });
  }

  function speakQuestion() {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition is not supported by this browser. You can use Chrome.");
      return;
    }

    const Recognition = window.webkitSpeechRecognition;
    const recognition = new Recognition();

    recognition.lang = language === "Kannada" ? "kn-IN" : "en-IN";
    recognition.start();

    recognition.onresult = (event) => {
      setQuestion(event.results[0][0].transcript);
    };
  }

  function home() {
    return (
      <>
        <section className="hero">
          <div>
            <div className="eyebrow">SMART FARMING PLATFORM</div>
            <h1>
              Grow smarter.
              <br />
              <span>Farm better.</span>
            </h1>
            <p>
              AI-powered crop guidance, plant health screening,
              disease information and farming assistance.
            </p>

            <div className="hero-actions">
              <button onClick={() => setPage("assistant")}>
                Ask AI Assistant
              </button>
              <button
                className="secondary"
                onClick={() => setPage("doctor")}
              >
                Plant Doctor
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="sun">☀️</div>
            <div className="big-plant">🌱</div>
            <div className="field">🌾 🌾 🌾 🌾</div>
          </div>
        </section>

        <section className="stats">
          <div>
            <strong>{CROPS.length}+</strong>
            <span>Crops</span>
          </div>
          <div>
            <strong>{DISEASES.length}+</strong>
            <span>Issues</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Assistant</span>
          </div>
          <div>
            <strong>EN / KN</strong>
            <span>Language</span>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <div>
              <span>FARM TOOLS</span>
              <h2>Everything you need</h2>
            </div>
          </div>

          <div className="feature-grid">
            <Feature
              icon="🤖"
              title="AI Assistant"
              text="Ask farming questions by text or voice."
              onClick={() => setPage("assistant")}
            />
            <Feature
              icon="📷"
              title="Plant Doctor"
              text="Capture a plant photo and check symptoms."
              onClick={() => setPage("doctor")}
            />
            <Feature
              icon="🌾"
              title="Crop Explorer"
              text="Explore crops, soil and growing information."
              onClick={() => setPage("crops")}
            />
            <Feature
              icon="🦠"
              title="Disease Guide"
              text="Search common crop diseases and pests."
              onClick={() => setPage("diseases")}
            />
          </div>
        </section>

        <section className="info-banner">
          <div className="banner-icon">🌱</div>
          <div>
            <h3>Built for farmers</h3>
            <p>
              Simple tools designed to help farmers make
              better-informed crop and plant health decisions.
            </p>
          </div>
        </section>
      </>
    );
  }

  function assistant() {
    return (
      <Page title="AI Farming Assistant" subtitle="Ask questions about your farm">
        <div className="assistant-layout">
          <div className="chat-panel">
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="avatar">🤖</div>
                  <div>
                    <strong>Namaste, {user?.name || "Farmer"}!</strong>
                    <p>
                      Ask me about crops, diseases, irrigation,
                      fertilizer, soil or farming practices.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role}`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="quick-questions">
              {[
                "What is NPK?",
                "How often should I irrigate?",
                "My tomato leaves are yellow",
                "Which crop is suitable?",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setQuestion(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="chat-input">
              <button onClick={speakQuestion} title="Voice input">
                🎙️
              </button>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askAI();
                }}
                placeholder="Ask your farming question..."
              />
              <button onClick={askAI}>➤</button>
            </div>
          </div>

          <div className="side-card">
            <h3>Try asking</h3>
            <p>🌱 How can I improve soil health?</p>
            <p>💧 When should I irrigate?</p>
            <p>🧪 What does NPK mean?</p>
            <p>🦠 How do I identify plant disease?</p>
            <p>🌾 Which crop suits my soil?</p>
          </div>
        </div>
      </Page>
    );
  }

  function crops() {
    return (
      <Page
        title="Crop Explorer"
        subtitle={`${CROPS.length} crops and plants`}
      >
        <div className="toolbar">
          <input
            value={cropSearch}
            onChange={(e) => setCropSearch(e.target.value)}
            placeholder="Search crop..."
          />
        </div>

        <div className="chips">
          {categories.map((category) => (
            <button
              key={category}
              className={cropCategory === category ? "selected" : ""}
              onClick={() => setCropCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="crop-grid">
          {filteredCrops.map((crop) => (
            <button
              className="crop-card"
              key={crop[0]}
              onClick={() =>
                setSelectedPlant({
                  name: crop[0],
                  icon: crop[1],
                })
              }
            >
              <span className="crop-icon">{crop[1]}</span>
              <strong>{crop[0]}</strong>
              <small>{crop[2]}</small>
              <p>{crop[3]}</p>
              <span className="season">{crop[4]}</span>
            </button>
          ))}
        </div>

        {selectedPlant && (
          <PlantDetails
            plant={getPlantData(selectedPlant.name)}
            onClose={() => setSelectedPlant(null)}
          />
        )}
      </Page>
    );
  }

  function diseases() {
    return (
      <Page
        title="Disease & Pest Guide"
        subtitle="Common crop health problems"
      >
        <input
          className="large-search"
          value={diseaseSearch}
          onChange={(e) => setDiseaseSearch(e.target.value)}
          placeholder="Search disease, pest or crop..."
        />

        <div className="disease-grid">
          {filteredDiseases.map((disease) => (
            <div className="disease-card" key={disease[0]}>
              <div className="disease-top">
                <span>🦠</span>
                <div>
                  <h3>{disease[0]}</h3>
                  <small>{disease[1]}</small>
                </div>
              </div>
              <span className="tag">{disease[2]}</span>
              <p>{disease[3]}</p>
              <button
                onClick={() =>
                  alert(
                    `${disease[0]}\n\nCrop: ${disease[1]}\nType: ${disease[2]}\n\nSymptoms: ${disease[3]}\n\nFor treatment, confirm the diagnosis locally before applying pesticides.`
                  )
                }
              >
                View guidance →
              </button>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  function doctor() {
    return (
      <Page
        title="Plant Doctor"
        subtitle="Capture or upload a clear plant photo"
      >
        <div className="doctor-layout">
          <div className="upload-panel">
            <div className="camera-box">
              {plantPreview ? (
                <img src={plantPreview} alt="Plant preview" />
              ) : (
                <>
                  <span>📷</span>
                  <strong>Plant photo</strong>
                  <p>
                    Take a clear picture of the affected
                    leaf, stem, fruit or pest.
                  </p>
                </>
              )}
            </div>

            <div className="upload-actions">
              <label className="upload-button">
                📁 Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    handlePlantFile(e.target.files?.[0])
                  }
                />
              </label>

              <label className="upload-button secondary-upload">
                📷 Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    handlePlantFile(e.target.files?.[0])
                  }
                />
              </label>
            </div>

            <select
              value={selectedPlant?.name || ""}
              onChange={(e) =>
                setSelectedPlant(
                  e.target.value
                    ? { name: e.target.value }
                    : null
                )
              }
            >
              <option value="">Select crop if known</option>
              {CROPS.map((crop) => (
                <option key={crop[0]} value={crop[0]}>
                  {crop[0]}
                </option>
              ))}
            </select>

            <button className="primary-wide" onClick={analyzePlant}>
              🔍 Analyze Plant
            </button>

            <div className="notice">
              ⚠️ Photo screening is a prototype and should
              not replace laboratory diagnosis or advice
              from a qualified agriculture professional.
            </div>
          </div>

          <div>
            {scanResult ? (
              <div className="result-panel">
                <div className="result-icon">🌿</div>
                <span className="result-label">
                  PRELIMINARY SCREENING
                </span>
                <h2>{scanResult.plant}</h2>

                <div className="confidence">
                  <span>Visual confidence</span>
                  <strong>{scanResult.confidence}%</strong>
                </div>

                <div className="result-condition">
                  <span>Possible issue</span>
                  <strong>{scanResult.condition}</strong>
                </div>

                <p>{scanResult.advice}</p>

                <button
                  onClick={() => setPage("diseases")}
                  className="primary-wide"
                >
                  Browse Disease Guide
                </button>
              </div>
            ) : (
              <div className="empty-panel">
                <span>🔬</span>
                <h3>Ready to inspect</h3>
                <p>
                  Upload a clear photo and select the crop
                  when possible.
                </p>
              </div>
            )}
          </div>
        </div>
      </Page>
    );
  }

  if (!loggedIn) {
    return (
      <div className="auth-screen">
        <div className="auth-decoration">🌾</div>

        <div className="auth-card">
          <div className="brand-mark">🌱</div>
          <h1>Agri Saathi AI</h1>
          <p>Your smart farming companion</p>

          {!showRegister ? (
            <>
              <h2>Welcome back</h2>

              <label>Mobile number</label>
              <input
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="Enter mobile number"
              />

              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(e.target.value)
                }
                placeholder="Enter password"
              />

              <button className="auth-submit" onClick={login}>
                Sign in
              </button>

              <button
                className="auth-switch"
                onClick={() => setShowRegister(true)}
              >
                New farmer? Create an account
              </button>
            </>
          ) : (
            <>
              <h2>Create farmer account</h2>

              <label>Full name</label>
              <input
                value={registerName}
                onChange={(e) =>
                  setRegisterName(e.target.value)
                }
                placeholder="Your name"
              />

              <label>Mobile number</label>
              <input
                value={registerPhone}
                onChange={(e) =>
                  setRegisterPhone(e.target.value)
                }
                placeholder="Mobile number"
              />

              <label>Password</label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) =>
                  setRegisterPassword(e.target.value)
                }
                placeholder="Create password"
              />

              <button
                className="auth-submit"
                onClick={register}
              >
                Create account
              </button>

              <button
                className="auth-switch"
                onClick={() => setShowRegister(false)}
              >
                Already have an account? Sign in
              </button>
            </>
          )}

          <small>
            Demo authentication stores accounts in this
            browser only.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => setPage("home")}>
          <span>🌱</span>
          <div>
            <strong>Agri Saathi AI</strong>
            <small>Smart farming platform</small>
          </div>
        </div>

        <div className="top-actions">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Kannada</option>
          </select>

          <span className="user-name">
            👨‍🌾 {user?.name}
          </span>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="mobile-nav">
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("assistant")}>AI</button>
        <button onClick={() => setPage("doctor")}>Doctor</button>
        <button onClick={() => setPage("crops")}>Crops</button>
        <button onClick={() => setPage("diseases")}>Diseases</button>
      </div>

      <main className="main-container">
        {page === "home" && home()}
        {page === "assistant" && assistant()}
        {page === "crops" && crops()}
        {page === "diseases" && diseases()}
        {page === "doctor" && doctor()}
      </main>

      <footer>
        <strong>🌱 Agri Saathi AI</strong>
        <span>Smart agriculture technology for farmers</span>
      </footer>
    </div>
  );
}

function Page({ title, subtitle, children }) {
  return (
    <>
      <div className="page-header">
        <div>
          <span>AGRI SAATHI</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </>
  );
}

function Feature({ icon, title, text, onClick }) {
  return (
    <button className="feature" onClick={onClick}>
      <span>{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <b>→</b>
    </button>
  );
}

function PlantDetails({ plant, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="plant-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={onClose}>
          ×
        </button>

        <div className="plant-title">
          <span>{plant.icon}</span>
          <div>
            <small>PLANT PROFILE</small>
            <h2>{plant.name}</h2>
          </div>
        </div>

        <div className="detail-grid">
          <Info label="Type" value={plant.type} />
          <Info label="Soil" value={plant.soil} />
          <Info label="Water" value={plant.water} />
          <Info label="Temperature" value={plant.temperature} />
          <Info label="Common problems" value={plant.problems} />
          <Info label="Harvest" value={plant.harvest} />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <small>{label}</small>
      <p>{value}</p>
    </div>
  );
}

export default App;
