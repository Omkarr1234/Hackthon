const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || 'Request failed')
  }
  return data
}

export async function fetchCrops(lang) {
  const response = await fetch(`${API_BASE}/api/crops?lang=${lang}`)
  return parseResponse(response)
}

export async function fetchCropGuide(cropId, lang) {
  const response = await fetch(`${API_BASE}/api/crops/${cropId}/guide?lang=${lang}`)
  return parseResponse(response)
}

export async function fetchCondition(conditionId, lang) {
  const response = await fetch(`${API_BASE}/api/conditions/${conditionId}?lang=${lang}`)
  return parseResponse(response)
}

export async function runScreening(cropId, imageFile, lang) {
  const formData = new FormData()
  formData.append('crop_id', cropId)
  formData.append('file', imageFile)
  const response = await fetch(`${API_BASE}/api/screening?lang=${lang}`, {
    method: 'POST',
    body: formData,
  })
  return parseResponse(response)
}

export async function askAssistant(cropId, question, lang) {
  const response = await fetch(`${API_BASE}/api/chat?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop_id: cropId, question }),
  })
  return parseResponse(response)
}
