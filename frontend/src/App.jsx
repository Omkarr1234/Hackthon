import { useEffect, useState } from "react";
import "./App.css";

const translations = {
  en: {
    title: "Smart Crop Assistant",
    subtitle: "Crop guidance, health screening, and farming assistance",
    chooseLanguage: "Choose your language",
    start: "Start",
    cropSelection: "Select Crop",
    cropGuide: "Crop Guide",
    healthCheck: "Crop Health Check",
    assistant: "Farming Assistant",
    upload: "Upload a crop image",
    analyze: "Analyze Image",
    loading: "Loading...",
    noResult: "Upload an image to check crop health.",
    send: "Send",
    placeholder: "Ask a farming question...",
    guide: "Guide",
    health: "Health",
    chat: "Assistant",
    symptoms: "Symptoms",
    prevention: "Prevention",
    management: "Management",
    conditions: "Favorable Conditions",
    expert: "When to seek expert help",
    confidence: "Confidence",
    disclaimer:
      "This tool provides general agricultural information and should not replace advice from a qualified agricultural expert.",
  },
  kn: {
    title: "ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸಹಾಯಕ",
    subtitle: "ಬೆಳೆ ಮಾರ್ಗದರ್ಶನ, ಆರೋಗ್ಯ ಪರಿಶೀಲನೆ ಮತ್ತು ಕೃಷಿ ಸಹಾಯ",
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    start: "ಪ್ರಾರಂಭಿಸಿ",
    cropSelection: "ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ",
    cropGuide: "ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ",
    healthCheck: "ಬೆಳೆ ಆರೋಗ್ಯ ಪರಿಶೀಲನೆ",
    assistant: "ಕೃಷಿ ಸಹಾಯಕ",
    upload: "ಬೆಳೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    analyze: "ಚಿತ್ರ ಪರಿಶೀಲಿಸಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    noResult: "ಬೆಳೆಯ ಆರೋಗ್ಯ ಪರಿಶೀಲಿಸಲು ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    send: "ಕಳುಹಿಸಿ",
    placeholder: "ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...",
    guide: "ಮಾರ್ಗದರ್ಶಿ",
    health: "ಆರೋಗ್ಯ",
    chat: "ಸಹಾಯಕ",
    symptoms: "ಲಕ್ಷಣಗಳು",
    prevention: "ತಡೆಗಟ್ಟುವಿಕೆ",
    management: "ನಿರ್ವಹಣೆ",
    conditions: "ಅನುಕೂಲಕರ ಪರಿಸ್ಥಿತಿಗಳು",
    expert: "ತಜ್ಞರ ಸಹಾಯ ಯಾವಾಗ ಪಡೆಯಬೇಕು",
    confidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ",
    disclaimer:
      "ಈ ಸಾಧನವು ಸಾಮಾನ್ಯ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಅಗತ್ಯವಿದ್ದರೆ ಅರ್ಹ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
  },
};

const demoCrops = [
  {
    id: "rice",
    name: "Rice",
    knName: "ಭತ್ತ",
    summary: "Guidance for rice cultivation and common crop problems.",
    guide: {
      soil: "Clay or loamy soil with good water retention",
      water: "Maintain adequate water during important growth stages",
      fertilizer: "Use soil-test-based fertilizer recommendations",
      pests: "Monitor regularly for insects and leaf damage",
      harvesting: "Harvest when grains reach appropriate maturity",
    },
  },
  {
    id: "tomato",
    name: "Tomato",
    knName: "ಟೊಮ್ಯಾಟೊ",
    summary: "Growing, watering, and disease-management guidance.",
    guide: {
      soil: "Well-drained fertile soil",
      water: "Water consistently without prolonged waterlogging",
      fertilizer: "Apply balanced nutrients based on crop requirements",
      pests: "Inspect leaves and fruits regularly",
      harvesting: "Harvest fruits according to the intended market stage",
    },
  },
  {
    id: "cotton",
    name: "Cotton",
    knName: "ಹತ್ತಿ",
    summary: "Cotton crop management and health guidance.",
    guide: {
      soil: "Well-drained black or loamy soil",
      water: "Avoid excessive irrigation",
      fertilizer: "Follow soil-test-based nutrient management",
      pests: "Monitor for bollworms and sucking pests",
      harvesting: "Pick mature open bolls at the correct stage",
    },
  },
];

function App() {
  const [language, setLanguage] = useState("en");
  const [started, setStarted] = useState(false);

  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);

  const [activeTab, setActiveTab] = useState("guide");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [screeningResult, setScreeningResult] = useState(null);
  const [conditionDetails, setConditionDetails] = useState(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = translations[language];

  useEffect(() => {
    loadCrops();
  }, []);

  function loadCrops() {
    setCrops(demoCrops);

    if (!selectedCrop) {
      setSelectedCrop(demoCrops[0]);
    }
  }

  function changeLanguage(lang) {
    setLanguage(lang);
  }

  function selectCrop(crop) {
    setSelectedCrop(crop);
    setScreeningResult(null);
    setConditionDetails(null);
    setError("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setScreeningResult(null);
    setConditionDetails(null);
    setError("");
  }

  function analyzeImage() {
    if (!image) {
      setError("Please upload a crop image first.");
      return;
    }

    if (!selectedCrop) {
      setError("Please select a crop first.");
      return;
    }

    setLoading(true);
    setError("");

    // Demo frontend result.
    // Replace this section with your backend API call later.
    setTimeout(() => {
      setScreeningResult({
        possible_condition_name:
          selectedCrop.id === "tomato"
            ? "Possible Leaf Disease"
            : "Possible Crop Stress",
        confidence: 0.82,
        disclaimer:
          "This is a preliminary screening result and should be confirmed by an agricultural expert.",
        escalation_note:
          "If the condition is spreading rapidly, contact your local agricultural officer or expert.",
      });

      setConditionDetails({
        name:
          selectedCrop.id === "tomato"
            ? "Possible Leaf Disease"
            : "Possible Crop Stress",
        type: "Preliminary screening",
        symptoms:
          "Changes in leaf colour, spots, wilting, reduced growth, or other visible abnormalities may occur.",
        favorable_conditions:
          "Stress can be associated with unsuitable moisture, nutrient imbalance, pests, diseases, or environmental conditions.",
        prevention:
          "Maintain good field hygiene, monitor crops regularly, use suitable irrigation, and follow recommended nutrient management.",
        management:
          "Remove severely affected plant material where appropriate and consult a qualified agricultural expert before applying pesticides.",
        expert_help_when:
          "Seek expert assistance when symptoms spread quickly, affect a large part of the crop, or the cause is uncertain.",
      });

      setLoading(false);
    }, 1200);
  }

  function askQuestion(event) {
    event.preventDefault();

    const text = question.trim();

    if (!text) return;

    const userMessage = {
      role: "user",
      text,
    };

    setMessages((previous) => [...previous, userMessage]);

    setQuestion("");
    setLoading(true);

    setTimeout(() => {
      const answer =
        language === "kn"
          ? `${selectedCrop?.knName || "ಬೆಳೆ"} ಕುರಿತು ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಾಮಾನ್ಯ ಸಲಹೆ: ಬೆಳೆಯನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ, ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಗಮನಿಸಿ ಮತ್ತು ಯಾವುದೇ ರೋಗ ಅಥವಾ ಕೀಟದ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.`
          : `For ${selectedCrop?.name || "your crop"}, regularly inspect the plants, monitor soil moisture and nutrient conditions, and contact an agricultural expert if you notice rapidly spreading pests or disease.`;

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: answer,
        },
      ]);

      setLoading(false);
    }, 700);
  }

  if (!started) {
    return (
      <main className="welcome-page">
        <div className="welcome-card">
          <div className="logo">🌱</div>

          <h1>{t.title}</h1>

          <p className="subtitle">{t.subtitle}</p>

          <h3>{t.chooseLanguage}</h3>

          <div className="language-selection">
            <button
              className={language === "en" ? "language active" : "language"}
              onClick={() => changeLanguage("en")}
            >
              🇬🇧 English
            </button>

            <button
              className={language === "kn" ? "language active" : "language"}
              onClick={() => changeLanguage("kn")}
            >
              🇮🇳 ಕನ್ನಡ
            </button>
          </div>

          <button
            className="primary-button start-button"
            onClick={() => setStarted(true)}
          >
            {t.start} →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand">
          <div className="logo small">🌱</div>

          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="language-selection compact">
          <button
            className={language === "en" ? "language active" : "language"}
            onClick={() => changeLanguage("en")}
          >
            EN
          </button>

          <button
            className={language === "kn" ? "language active" : "language"}
            onClick={() => changeLanguage("kn")}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <section className="card">
        <div className="section-title">
          <div>
            <h2>{t.cropSelection}</h2>
            <p>Choose the crop you want to work with.</p>
          </div>
        </div>

        <div className="crop-grid">
          {crops.map((crop) => (
            <button
              key={crop.id}
              className={
                selectedCrop?.id === crop.id
                  ? "crop-card selected"
                  : "crop-card"
              }
              onClick={() => selectCrop(crop)}
            >
              <span className="crop-icon">
                {crop.id === "rice"
                  ? "🌾"
                  : crop.id === "tomato"
                  ? "🍅"
                  : "🌿"}
              </span>

              <strong>
                {language === "kn" ? crop.knName : crop.name}
              </strong>

              <span>{crop.summary}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="tabs">
        <button
          className={activeTab === "guide" ? "tab active" : "tab"}
          onClick={() => setActiveTab("guide")}
        >
          📖 {t.guide}
        </button>

        <button
          className={activeTab === "health" ? "tab active" : "tab"}
          onClick={() => setActiveTab("health")}
        >
          🩺 {t.health}
        </button>

        <button
          className={activeTab === "chat" ? "tab active" : "tab"}
          onClick={() => setActiveTab("chat")}
        >
          💬 {t.chat}
        </button>
      </div>

      {activeTab === "guide" && selectedCrop && (
        <section className="card">
          <div className="section-title">
            <div>
              <span className="eyebrow">CROP GUIDE</span>

              <h2>
                {language === "kn"
                  ? selectedCrop.knName
                  : selectedCrop.name}
              </h2>
            </div>

            <span className="badge">✓ Ready</span>
          </div>

          <div className="guide-grid">
            {Object.entries(selectedCrop.guide).map(([key, value]) => (
              <div className="guide-item" key={key}>
                <div className="guide-icon">
                  {key === "soil"
                    ? "🌱"
                    : key === "water"
                    ? "💧"
                    : key === "fertilizer"
                    ? "🧪"
                    : key === "pests"
                    ? "🐛"
                    : "🌾"}
                </div>

                <div>
                  <h3>
                    {key.charAt(0).toUpperCase() +
                      key.slice(1)}
                  </h3>

                  <p>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "health" && (
        <section className="card">
          <div className="section-title">
            <div>
              <span className="eyebrow">AI SCREENING</span>
              <h2>{t.healthCheck}</h2>
              <p>
                Upload a clear photo of the crop leaf or affected area.
              </p>
            </div>
          </div>

          <div className="upload-area">
            {preview ? (
              <div className="image-preview">
                <img src={preview} alt="Crop preview" />

                <button
                  className="remove-image"
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                    setScreeningResult(null);
                    setConditionDetails(null);
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="upload-box">
                <span className="upload-icon">📷</span>

                <strong>{t.upload}</strong>

                <span>
                  JPG, JPEG or PNG
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {image && (
            <button
              className="primary-button analyze-button"
              onClick={analyzeImage}
              disabled={loading}
            >
              {loading ? "⏳ " + t.loading : "🔍 " + t.analyze}
            </button>
          )}

          {!screeningResult && !loading && (
            <div className="empty-state">
              <span>🌿</span>
              <p>{t.noResult}</p>
            </div>
          )}

          {screeningResult && (
            <div className="screening-result">
              <div className="result-header">
                <div>
                  <span className="eyebrow">SCREENING RESULT</span>
                  <h3>{screeningResult.possible_condition_name}</h3>
                </div>

                <div className="confidence">
                  {Math.round(screeningResult.confidence * 100)}%
                  <span>{t.confidence}</span>
                </div>
              </div>

              <div className="progress">
                <div
                  style={{
                    width: `${screeningResult.confidence * 100}%`,
                  }}
                />
              </div>

              <p className="result-text">
                {screeningResult.disclaimer}
              </p>

              <div className="notice">
                ℹ️ {screeningResult.escalation_note}
              </div>
            </div>
          )}

          {conditionDetails && (
            <div className="condition-card">
              <h3>{conditionDetails.name}</h3>

              <p>
                <strong>Type:</strong>{" "}
                {conditionDetails.type}
              </p>

              <div className="details-grid">
                <div>
                  <h4>🩺 {t.symptoms}</h4>
                  <p>{conditionDetails.symptoms}</p>
                </div>

                <div>
                  <h4>🌦️ {t.conditions}</h4>
                  <p>
                    {conditionDetails.favorable_conditions}
                  </p>
                </div>

                <div>
                  <h4>🛡️ {t.prevention}</h4>
                  <p>{conditionDetails.prevention}</p>
                </div>

                <div>
                  <h4>🔧 {t.management}</h4>
                  <p>{conditionDetails.management}</p>
                </div>

                <div className="full">
                  <h4>👨‍🌾 {t.expert}</h4>
                  <p>{conditionDetails.expert_help_when}</p>
                </div>
              </div>
            </div>
          )}

          <div className="disclaimer">
            ⚠️ {t.disclaimer}
          </div>
        </section>
      )}

      {activeTab === "chat" && (
        <section className="card chat-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">AI ASSISTANT</span>
              <h2>{t.assistant}</h2>
              <p>
                Ask questions about{" "}
                <strong>
                  {selectedCrop?.name || "your crop"}
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="chat-box">
            {messages.length === 0 && (
              <div className="chat-empty">
                <span>🤖</span>
                <h3>How can I help?</h3>
                <p>
                  Ask about watering, pests, soil, fertilizer,
                  diseases, or crop management.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "chat-message user"
                    : "chat-message assistant"
                }
              >
                <div className="message-avatar">
                  {message.role === "user" ? "👨‍🌾" : "🤖"}
                </div>

                <div className="message-content">
                  <span>
                    {message.role === "user"
                      ? "You"
                      : "Assistant"}
                  </span>

                  <p>{message.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant">
                <div className="message-avatar">🤖</div>

                <div className="typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <form
            className="chat-form"
            onSubmit={askQuestion}
          >
            <input
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder={t.placeholder}
              disabled={loading}
            />

            <button
              type="submit"
              className="primary-button"
              disabled={loading || !question.trim()}
            >
              {t.send} →
            </button>
          </form>
        </section>
      )}

      <footer>
        <p>🌱 Smart Crop Assistant</p>
        <p>For educational and general agricultural guidance.</p>
      </footer>
    </main>
  );
}

export default App;
