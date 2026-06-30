const LABELS = {
  seguro: 'Puedes entrar con tranquilidad',
  precaucion: 'Mejor revisar antes de entrar',
  peligro: 'No te recomendamos entrar',
  unknown: 'Aun sin revisar',
}

const NIVEL_LABELS = {
  bajo: 'Parece seguro',
  medio: 'Ten cuidado',
  alto: 'Riesgo alto',
  critico: 'Muy peligroso',
}

function isGoogleSearchPage(url) {
  try {
    const u = new URL(url)
    return /(^|\.)google\.[a-z.]+$/i.test(u.hostname) && u.pathname === '/search'
  } catch {
    return false
  }
}

let historyData = { bajo: [], medio: [], alto: [] }
let activeRiskTab = 'bajo'

async function getApiBase() {
  const { apiUrl } = await chrome.storage.sync.get(['apiUrl'])
  const fallback = typeof PRODUCTION_API_URL !== 'undefined'
    ? PRODUCTION_API_URL
    : 'https://safelink-api.onrender.com'
  return (apiUrl || fallback).replace(/\/$/, '')
}

async function apiFetch(path, options = {}) {
  const base = await getApiBase()
  const { token } = await chrome.storage.local.get(['token'])
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(`${base}${path}`, { ...options, headers })
}

function showAuth(user) {
  document.getElementById('auth-guest').classList.toggle('hidden', !!user)
  document.getElementById('auth-user').classList.toggle('hidden', !user)
  document.getElementById('history-section').classList.toggle('hidden', !user)
  if (user) {
    document.getElementById('userEmail').textContent = user.email
    loadHistoryByRisk()
  }
}

async function loadHistoryByRisk() {
  try {
    const res = await apiFetch('/analysis/history/by-risk')
    if (!res.ok) return
    historyData = await res.json()
    renderHistoryTab(activeRiskTab)
  } catch {
    /* ignore */
  }
}

function renderHistoryTab(risk) {
  activeRiskTab = risk
  document.querySelectorAll('.history-tabs .tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.risk === risk)
  })
  const items = historyData[risk] || []
  const list = document.getElementById('history-list')
  const empty = document.getElementById('history-empty')
  list.innerHTML = ''
  if (items.length === 0) {
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')
  items.forEach((item) => {
    const li = document.createElement('li')
    const fecha = item.fecha_analisis
      ? new Date(item.fecha_analisis).toLocaleString()
      : ''
    li.innerHTML = `
      <span class="h-url">${item.url_analizada}</span>
      <span class="h-meta">${item.puntuacion_riesgo ?? '—'}/100 · ${fecha}</span>
    `
    list.appendChild(li)
  })
}

function renderResult(data) {
  const sem = document.getElementById('semaphore')
  sem.className = `semaphore ${data.estado}`

  document.getElementById('score-box').classList.remove('hidden')
  const scoreEl = document.getElementById('score')
  scoreEl.textContent = data.puntuacion_riesgo
  scoreEl.className = `score ${data.estado}`

  document.getElementById('level').textContent =
    NIVEL_LABELS[data.nivel_riesgo] || data.nivel_riesgo
  document.getElementById('status-label').textContent =
    LABELS[data.estado] || data.estado

  const savedHint = document.getElementById('saved-hint')
  if (data.guardado_en_historial) {
    savedHint.classList.remove('hidden')
  } else {
    savedHint.classList.add('hidden')
  }

  const list = document.getElementById('resumen')
  list.innerHTML = ''
  ;(data.resumen || []).forEach((line) => {
    const li = document.createElement('li')
    li.textContent = line
    list.appendChild(li)
  })
}

async function init() {
  const [tabs, { lastCheck, user, token }, { apiUrl }] = await Promise.all([
    chrome.tabs.query({ active: true, currentWindow: true }),
    chrome.storage.local.get(['lastCheck', 'user', 'token']),
    chrome.storage.sync.get(['apiUrl']),
  ])

  const tab = tabs[0]
  const onGoogleSerp = tab?.url && isGoogleSearchPage(tab.url)
  const serpHint = document.getElementById('serp-hint')
  const scoreBox = document.getElementById('score-box')
  const statusLabel = document.getElementById('status-label')
  const sem = document.getElementById('semaphore')

  document.getElementById('url').textContent = tab?.url || '—'
  const apiDefault = typeof PRODUCTION_API_URL !== 'undefined'
    ? PRODUCTION_API_URL
    : 'https://safelink-api.onrender.com'
  document.getElementById('apiUrl').value = apiUrl || apiDefault

  if (onGoogleSerp) {
    serpHint.classList.remove('hidden')
    scoreBox.classList.add('hidden')
    sem.className = 'semaphore seguro'
    statusLabel.textContent =
      'Mira el punto de color junto a cada resultado en Google'
    document.getElementById('resumen').innerHTML = ''
    document.getElementById('saved-hint').classList.add('hidden')
  } else {
    serpHint.classList.add('hidden')
  }

  if (user && token) {
    showAuth(user)
  } else {
    showAuth(null)
  }

  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value
    const errEl = document.getElementById('authError')
    errEl.classList.add('hidden')
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.detail || 'Login fallido')
      }
      const data = await res.json()
      await chrome.storage.local.set({
        token: data.access_token,
        user: data.user,
      })
      showAuth(data.user)
      chrome.runtime.sendMessage({ type: 'refresh' })
    } catch (e) {
      errEl.textContent = e.message
      errEl.classList.remove('hidden')
    }
  })

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'user'])
    showAuth(null)
  })

  document.querySelectorAll('.history-tabs .tab').forEach((btn) => {
    btn.addEventListener('click', () => renderHistoryTab(btn.dataset.risk))
  })

  document.getElementById('saveApi').addEventListener('click', async () => {
    const v = document.getElementById('apiUrl').value.trim()
    await chrome.storage.sync.set({ apiUrl: v })
    chrome.runtime.sendMessage({ type: 'refresh' })
  })

  if (!onGoogleSerp && lastCheck && tab?.url === lastCheck.url) {
    renderResult(lastCheck)
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'historyUpdated') {
      loadHistoryByRisk()
      chrome.storage.local.get(['lastCheck'], ({ lastCheck }) => {
        if (lastCheck) renderResult(lastCheck)
      })
    }
  })
}

init()
