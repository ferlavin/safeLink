const DEFAULT_API = 'http://localhost:8000'
const CACHE_TTL_MS = 5 * 60 * 1000

/** @type {Map<string, { data: object, ts: number }>} */
const cache = new Map()

const COLORS = {
  seguro: '#22c55e',
  precaucion: '#eab308',
  peligro: '#ef4444',
  unknown: '#64748b',
}

const LABELS = {
  seguro: 'Seguro',
  precaucion: 'Ten cuidado',
  peligro: 'Peligroso',
  unknown: 'Sin revisar',
}

const NIVEL_LABELS = {
  bajo: 'Parece seguro',
  medio: 'Ten cuidado',
  alto: 'Riesgo alto',
  critico: 'Muy peligroso',
}

function isAnalyzableUrl(url) {
  if (!url) return false
  const blocked = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'devtools://',
    'chrome-devtools://',
  ]
  if (blocked.some((p) => url.startsWith(p))) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

function isGoogleSearchPage(url) {
  try {
    const u = new URL(url)
    return /(^|\.)google\.[a-z.]+$/i.test(u.hostname) && u.pathname === '/search'
  } catch {
    return false
  }
}

async function getApiBase() {
  const { apiUrl } = await chrome.storage.sync.get(['apiUrl'])
  return (apiUrl || DEFAULT_API).replace(/\/$/, '')
}

async function getToken() {
  const { token } = await chrome.storage.local.get(['token'])
  return token || null
}

function drawSemaphoreIcon(color) {
  const size = 16
  const canvas = new OffscreenCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 1
  ctx.stroke()
  return ctx.getImageData(0, 0, size, size)
}

async function setSemaphore(estado, tooltip) {
  const color = COLORS[estado] || COLORS.unknown
  const imageData = drawSemaphoreIcon(color)
  await chrome.action.setIcon({ imageData })
  await chrome.action.setTitle({ title: tooltip })
  await chrome.action.setBadgeText({ text: '' })
}

function buildTooltip(data) {
  if (!data) return 'SafeLink — Sin datos'
  const nivel = NIVEL_LABELS[data.nivel_riesgo] || data.nivel_riesgo
  const lines = [
    `SafeLink: ${LABELS[data.estado] || data.estado}`,
    `${nivel} (${data.puntuacion_riesgo} de 100)`,
  ]
  if (data.guardado_en_historial) {
    lines.push('Guardado en tu historial')
  }
  lines.push('')
  if (data.resumen?.length) {
    data.resumen.slice(0, 3).forEach((r) => lines.push(`• ${r}`))
  } else {
    lines.push('• No vimos problemas claros')
  }
  lines.push('', 'Clic para ver mas')
  return lines.join('\n').slice(0, 900)
}

async function analyzeUrl(url) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data
  }

  const api = await getApiBase()
  const token = await getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${api}/analysis/check`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  })

  if (!res.ok) {
    throw new Error(`API ${res.status}`)
  }

  const data = await res.json()
  cache.set(url, { data, ts: Date.now() })
  await chrome.storage.local.set({ lastCheck: data })
  if (data.guardado_en_historial) {
    chrome.runtime.sendMessage({ type: 'historyUpdated' }).catch(() => {})
  }
  return data
}

async function updateTab(tab) {
  if (!tab?.id || !tab.url || !isAnalyzableUrl(tab.url)) {
    await setSemaphore('unknown', 'SafeLink — Pagina interna del navegador')
    return
  }

  if (isGoogleSearchPage(tab.url)) {
    await setSemaphore(
      'seguro',
      'SafeLink — Busqueda en Google\n\nMira el punto de color junto a cada resultado.\nPasa el cursor sobre el punto para ver si es seguro.',
    )
    return
  }

  await setSemaphore('unknown', 'SafeLink — Revisando este sitio...')

  try {
    const data = await analyzeUrl(tab.url)
    const tooltip = buildTooltip(data)
    await setSemaphore(data.estado, tooltip)
  } catch {
    await setSemaphore(
      'unknown',
      'SafeLink — No pudimos conectar.\nComprueba que SafeLink este encendido en tu PC.',
    )
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    chrome.tabs.get(tabId).then(updateTab)
  }
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId)
  updateTab(tab)
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'refresh') {
    cache.clear()
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) updateTab(tabs[0])
    })
    return
  }
  if (msg.type === 'CHECK_URL' && msg.url) {
    analyzeUrl(msg.url)
      .then((data) => sendResponse(data))
      .catch(() => sendResponse(null))
    return true
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ apiUrl: DEFAULT_API })
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) updateTab(tabs[0])
  })
})
