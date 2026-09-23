import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { uiText } from './i18n/strings'
import {
  askAssistant,
  fetchCondition,
  fetchCropGuide,
  fetchCrops,
  runScreening,
} from './services/api'

function App() {
  const [language, setLanguage] = useState('en')
  const [started, setStarted] = useState(false)
  const [crops, setCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [guide, setGuide] = useState(null)
  const [activeTab, setActiveTab] = useState('guide')
  const [screeningResult, setScreeningResult] = useState(null)
  const [conditionDetails, setConditionDetails] = useState(null)
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState({
    crops: false,
    guide: false,
    screening: false,
    condition: false,
    chat: false,
  })

  const t = useMemo(() => uiText[language], [language])

  const loadCrops = useCallback(async () => {
    try {
      setError('')
      setLoading((prev) => ({ ...prev, crops: true }))
      const cropData = await fetchCrops(language)
      setCrops(cropData)
      if (cropData.length > 0 && !selectedCrop) setSelectedCrop(cropData[0])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading((prev) => ({ ...prev, crops: false }))
    }
  }, [language, selectedCrop])

  const loadGuide = useCallback(async (cropId) => {
    try {
      setError('')
      setLoading((prev) => ({ ...prev, guide: true }))
      const data = await fetchCropGuide(cropId, language)
      setGuide(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading((prev) => ({ ...prev, guide: false }))
    }
  }, [language])

  useEffect(() => {
    if (!started) return
    loadCrops()
  }, [started, loadCrops])

  useEffect(() => {
    if (!selectedCrop) return
    loadGuide(selectedCrop.id)
  }, [selectedCrop, loadGuide])

  async function handleAnalyze(event) {
    const file = event.target.files?.[0]
    if (!file || !selectedCrop) return
    try {
      setError('')
      setLoading((prev) => ({ ...prev, screening: true }))
      setConditionDetails(null)
      const result = await runScreening(selectedCrop.id, file, language)
      setScreeningResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading((prev) => ({ ...prev, screening: false }))
    }
  }

  async function handleLoadCondition() {
    if (!screeningResult?.possible_condition_id) return
    try {
      setLoading((prev) => ({ ...prev, condition: true }))
      const data = await fetchCondition(screeningResult.possible_condition_id, language)
      setConditionDetails(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading((prev) => ({ ...prev, condition: false }))
    }
  }

  async function handleAsk(event) {
    event.preventDefault()
    if (!chatQuestion.trim() || !selectedCrop) return
    try {
      setLoading((prev) => ({ ...prev, chat: true }))
      setError('')
      const question = chatQuestion.trim()
      const response = await askAssistant(selectedCrop.id, question, language)
      setChatMessages((prev) => [
        ...prev,
        { role: 'user', text: question },
        { role: 'assistant', text: response.answer, note: response.safety_note },
      ])
      setChatQuestion('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading((prev) => ({ ...prev, chat: false }))
    }
  }

  if (!started) {
    return (
      <main className="container">
        <h1>{t.appTitle}</h1>
        <p className="subtitle">{t.appSubtitle}</p>
        <div className="card">
          <p>{t.chooseLanguage}</p>
          <div className="lang-buttons">
            <button
              type="button"
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              type="button"
              className={language === 'kn' ? 'active' : ''}
              onClick={() => setLanguage('kn')}
            >
              ಕನ್ನಡ
            </button>
          </div>
          <button type="button" className="primary" onClick={() => setStarted(true)}>
            {t.start}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>{t.appTitle}</h1>
          <p className="subtitle">{t.appSubtitle}</p>
        </div>
        <div className="lang-buttons">
          <button
            type="button"
            className={language === 'en' ? 'active' : ''}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={language === 'kn' ? 'active' : ''}
            onClick={() => setLanguage('kn')}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>{t.cropSelection}</h2>
        {loading.crops ? (
          <p>{t.loading}</p>
        ) : (
          <div className="crop-list">
            {crops.map((crop) => (
              <button
                key={crop.id}
                type="button"
                className={`crop-item ${selectedCrop?.id === crop.id ? 'active' : ''}`}
                onClick={() => setSelectedCrop(crop)}
              >
                <strong>{crop.name}</strong>
                <span>{crop.summary}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <nav className="nav-tabs">
        <button
          type="button"
          className={activeTab === 'guide' ? 'active' : ''}
          onClick={() => setActiveTab('guide')}
        >
          {t.navGuide}
        </button>
        <button
          type="button"
          className={activeTab === 'health' ? 'active' : ''}
          onClick={() => setActiveTab('health')}
        >
          {t.navHealth}
        </button>
        <button
          type="button"
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => setActiveTab('chat')}
        >
          {t.navChat}
        </button>
      </nav>

      {activeTab === 'guide' && (
        <section className="card">
          <h2>{t.cropGuide}</h2>
          {loading.guide || !guide ? (
            <p>{t.loading}</p>
          ) : (
            <ul className="guide-list">
              {Object.entries(guide.guide).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.replaceAll('_', ' ')}:</strong> {value}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {activeTab === 'health' && (
        <section className="card">
          <h2>{t.healthCheck}</h2>
          <label className="upload-label">
            {t.uploadLabel}
            <input type="file" accept=".jpg,.jpeg,.png" onChange={handleAnalyze} />
          </label>
          {loading.screening && <p>{t.loading}</p>}
          {screeningResult ? (
            <div className="result">
              <h3>{t.screeningHeader}</h3>
              <p>
                <strong>{screeningResult.possible_condition_name}</strong>
              </p>
              <p>Confidence: {Math.round(screeningResult.confidence * 100)}%</p>
              <p>{screeningResult.disclaimer}</p>
              <p>{screeningResult.escalation_note}</p>
              <button type="button" className="primary" onClick={handleLoadCondition}>
                {t.viewCondition}
              </button>
            </div>
          ) : (
            <p>{t.noResult}</p>
          )}
          {loading.condition && <p>{t.loading}</p>}
          {conditionDetails && (
            <div className="condition-details">
              <h3>{conditionDetails.name}</h3>
              <p>
                <strong>Type:</strong> {conditionDetails.type}
              </p>
              <p>
                <strong>Symptoms:</strong> {conditionDetails.details.symptoms}
              </p>
              <p>
                <strong>Favorable conditions:</strong> {conditionDetails.details.favorable_conditions}
              </p>
              <p>
                <strong>Prevention:</strong> {conditionDetails.details.prevention}
              </p>
              <p>
                <strong>Management:</strong> {conditionDetails.details.management}
              </p>
              <p>
                <strong>When to seek expert help:</strong>{' '}
                {conditionDetails.details.expert_help_when}
              </p>
            </div>
          )}
          <p className="disclaimer">{t.disclaimer}</p>
        </section>
      )}

      {activeTab === 'chat' && (
        <section className="card">
          <h2>{t.assistant}</h2>
          <form onSubmit={handleAsk} className="chat-form">
            <input
              value={chatQuestion}
              onChange={(event) => setChatQuestion(event.target.value)}
              placeholder={t.askPlaceholder}
            />
            <button type="submit" className="primary" disabled={loading.chat}>
              {loading.chat ? t.loading : t.send}
            </button>
          </form>
          <div className="chat-box">
            {chatMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-item ${message.role}`}>
                <p>{message.text}</p>
                {message.note && <small>{message.note}</small>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
