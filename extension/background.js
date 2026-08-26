importScripts('config.js')

const DEFAULT_API = typeof PRODUCTION_API_URL !== 'undefined'
  ? PRODUCTION_API_URL
  : 'https://safelink-api-csqe.onrender.com'
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX = 80
const WARMUP_DELAYS_MS = [800, 2000, 4000, 6000]

/** @type {Map<string, { data: object, ts: number }>} */
const memoryCache = new Map()
let awakeUntil = 0

const LABELS = {
  seguro: 'Seguro',
  precaucion: 'Precaución',
  peligro: 'Peligroso',
  unknown: 'Sin revisar',
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
    const host = u.hostname.replace(/^www\./, '')
    return (host === 'google.com' || host === 'google.com.ar') && u.pathname === '/search'
  } catch {
    return false
  }
}

function cacheKey(url) {
  try {
    const u = new URL(url)
    u.hash = ''
    return u.href
  } catch {
    return url
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isColdStartStatus(status) {
  return status === 502 || status === 503 || status === 504 || status === 521 || status === 522
}

async function getApiBase() {
  const { apiUrl } = await chrome.storage.sync.get(['apiUrl'])
  return (apiUrl || DEFAULT_API).replace(/\/$/, '')
}

async function getToken() {
  const { token } = await chrome.storage.local.get(['token'])
  return token || null
}

async function loadPersistedCache() {
  const { checkCache } = await chrome.storage.local.get(['checkCache'])
  if (!checkCache || typeof checkCache !== 'object') return
  const now = Date.now()
  for (const [key, entry] of Object.entries(checkCache)) {
    if (entry?.data && entry.ts && now - entry.ts < CACHE_TTL_MS) {
      memoryCache.set(key, entry)
    }
  }
}

async function persistCache() {
  const now = Date.now()
  const entries = [...memoryCache.entries()]
    .filter(([, v]) => now - v.ts < CACHE_TTL_MS)
    .sort((a, b) => b[1].ts - a[1].ts)
    .slice(0, CACHE_MAX)
  memoryCache.clear()
  const dump = {}
  for (const [key, value] of entries) {
    memoryCache.set(key, value)
    dump[key] = value
  }
  await chrome.storage.local.set({ checkCache: dump })
}

const persistReady = loadPersistedCache()

function getCached(key) {
  const hit = memoryCache.get(key)
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data
  if (hit) memoryCache.delete(key)
  return null
}

async function setCached(key, data) {
  memoryCache.set(key, { data, ts: Date.now() })
  await persistCache()
}

async function invalidateUrl(url) {
  await persistReady
  if (!url) {
    memoryCache.clear()
    await chrome.storage.local.remove(['checkCache', 'lastCheck'])
    return
  }
  const key = cacheKey(url)
  memoryCache.delete(key)
  const { lastCheck } = await chrome.storage.local.get(['lastCheck'])
  if (lastCheck?.url && cacheKey(lastCheck.url) === key) {
    await chrome.storage.local.remove(['lastCheck'])
  }
  await persistCache()
}

const ICONS = {
  seguro: {
    16: 'icons/icon-seguro-16.png',
    32: 'icons/icon-seguro-32.png',
    48: 'icons/icon-seguro-48.png',
    128: 'icons/icon-seguro-128.png',
  },
  precaucion: {
    16: 'icons/icon-precaucion-16.png',
    32: 'icons/icon-precaucion-32.png',
    48: 'icons/icon-precaucion-48.png',
    128: 'icons/icon-precaucion-128.png',
  },
  peligro: {
    16: 'icons/icon-peligro-16.png',
    32: 'icons/icon-peligro-32.png',
    48: 'icons/icon-peligro-48.png',
    128: 'icons/icon-peligro-128.png',
  },
  unknown: {
    16: 'icons/icon-unknown-16.png',
    32: 'icons/icon-unknown-32.png',
    48: 'icons/icon-unknown-48.png',
    128: 'icons/icon-unknown-128.png',
  },
}

async function setSemaphore(estado, tooltip) {
  const iconPath = ICONS[estado] || ICONS.unknown
  await chrome.action.setIcon({ path: iconPath })
  await chrome.action.setTitle({ title: tooltip })
  await chrome.action.setBadgeText({ text: '' })
}

function buildTooltip(data) {
  if (!data) return 'SafeLink — Sin datos'
  const lines = [
    `SafeLink: ${LABELS[data.estado] || data.estado}`,
    `Puntaje ${data.puntuacion_riesgo} de 100`,
  ]
  if (data.resumen?.length) {
    data.resumen.slice(0, 3).forEach((r) => lines.push(`• ${r}`))
  }
  lines.push('', 'Avisa; no bloquea la navegación.', 'Clic para ver más')
  return lines.join('\n').slice(0, 900)
}

function notifyPopup(payload) {
  chrome.runtime.sendMessage(payload).catch(() => {})
}

async function ensureApiAwake() {
  if (Date.now() < awakeUntil) return true
  const api = await getApiBase()
  for (let i = 0; i < WARMUP_DELAYS_MS.length; i += 1) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(`${api}/health`, { signal: ctrl.signal })
      clearTimeout(timer)
      if (res.ok) {
        awakeUntil = Date.now() + 10 * 60 * 1000
        return true
      }
      if (!isColdStartStatus(res.status) && res.status !== 0) {
        return false
      }
    } catch {
      /* Render dormido o red */
    }
    notifyPopup({ type: 'CHECK_PROGRESS', phase: 'warming' })
    await sleep(WARMUP_DELAYS_MS[i])
  }
  return false
}

async function postCheck(url) {
  const api = await getApiBase()
  const token = await getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  let res
  try {
    res = await fetch(`${api}/analysis/check`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url }),
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const err = new Error(`API ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

async function analyzeUrl(url) {
  await persistReady
  const key = cacheKey(url)
  const cached = getCached(key)
  if (cached) return cached

  await ensureApiAwake()

  try {
    const data = await postCheck(url)
    await setCached(key, data)
    await chrome.storage.local.set({ lastCheck: data })
    if (data.guardado_en_historial) {
      notifyPopup({ type: 'historyUpdated' })
    }
    return data
  } catch (err) {
    if (isColdStartStatus(err.status) || err.name === 'AbortError' || !err.status) {
      notifyPopup({ type: 'CHECK_PROGRESS', phase: 'warming' })
      await sleep(2500)
      const data = await postCheck(url)
      await setCached(key, data)
      await chrome.storage.local.set({ lastCheck: data })
      return data
    }
    throw err
  }
}

async function updateTab(tab) {
  if (!tab?.id || !tab.url || !isAnalyzableUrl(tab.url)) {
    await setSemaphore('unknown', 'SafeLink — Página interna del navegador')
    return
  }

  if (isGoogleSearchPage(tab.url)) {
    await setSemaphore(
      'unknown',
      'SafeLink — Resultados de Google\n\nEl semáforo está junto a cada resultado (Seguro / Precaución / Peligroso).\nNo bloqueamos clics: solo avisamos.',
    )
    return
  }

  await setSemaphore('unknown', 'SafeLink — Revisando este sitio…')

  try {
    const data = await analyzeUrl(tab.url)
    await setSemaphore(data.estado, buildTooltip(data))
  } catch {
    await setSemaphore(
      'unknown',
      'SafeLink — El servidor se está calentando o no responde.\nAbrí el popup para reintentar.',
    )
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    chrome.tabs.get(tabId).then(updateTab).catch(() => {})
  }
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId)
    updateTab(tab)
  } catch {
    /* tab cerrada */
  }
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'refresh') {
    memoryCache.clear()
    chrome.storage.local.remove(['checkCache'])
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) updateTab(tabs[0])
    })
    return
  }

  if (msg.type === 'INVALIDATE_URL') {
    ;(async () => {
      await invalidateUrl(msg.url)
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.url && msg.url && cacheKey(tab.url) === cacheKey(msg.url)) {
        await updateTab(tab)
      }
      sendResponse({ ok: true })
    })()
    return true
  }

  if (msg.type === 'CHECK_URL' && msg.url) {
    analyzeUrl(msg.url)
      .then((data) => sendResponse(data))
      .catch(() => sendResponse(null))
    return true
  }

  if (msg.type === 'GET_ACTIVE_STATUS') {
    ;(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.url) {
        sendResponse({ kind: 'none' })
        return
      }
      if (isGoogleSearchPage(tab.url)) {
        sendResponse({ kind: 'serp', url: tab.url })
        return
      }
      if (!isAnalyzableUrl(tab.url)) {
        sendResponse({ kind: 'internal', url: tab.url })
        return
      }
      try {
        const data = await analyzeUrl(tab.url)
        await setSemaphore(data.estado, buildTooltip(data))
        sendResponse({ kind: 'result', data })
      } catch (err) {
        sendResponse({
          kind: 'error',
          url: tab.url,
          cold: isColdStartStatus(err.status) || err.name === 'AbortError' || !err.status,
        })
      }
    })()
    return true
  }

  if (msg.type === 'GET_EXTENSION_ID') {
    sendResponse({ id: chrome.runtime.id })
    return
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ apiUrl: DEFAULT_API })
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) updateTab(tabs[0])
  })
})
