const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const REQUEST_TIMEOUT_MS = 15000

async function parseResponse(response) {
  const text = await response.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { detail: text.slice(0, 200) }
    }
  }
  if (!response.ok) {
    throw new Error(data.detail || 'Request failed')
  }
  return data
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await parseResponse(await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal }))
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Please try again.')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchCrops(lang) {
  return request(`/api/crops?lang=${lang}`)
}

export async function fetchCropGuide(cropId, lang) {
  return request(`/api/crops/${cropId}/guide?lang=${lang}`)
}

export async function fetchCondition(conditionId, lang) {
  return request(`/api/conditions/${conditionId}?lang=${lang}`)
}

export async function runScreening(cropId, imageFile, lang) {
  const formData = new FormData()
  formData.append('crop_id', cropId)
  formData.append('file', imageFile)
  return request(`/api/screening?lang=${lang}`, {
    method: 'POST',
    body: formData,
  })
}

export async function askAssistant(cropId, question, lang) {
  return request(`/api/chat?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop_id: cropId, question, lang }),
  })
}
