const BADGE = {
  seguro: 'Seguro',
  precaucion: 'Precaución',
  peligro: 'Peligroso',
  unknown: 'Sin revisar',
}

const SUMMARY = {
  seguro: 'Podés entrar con más tranquilidad.',
  precaucion: 'Revisá antes de poner contraseñas o datos.',
  peligro: 'No te recomendamos entrar.',
  unknown: 'Todavía no hay veredicto.',
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

function appBase() {
  return typeof PRODUCTION_APP_URL !== 'undefined'
    ? PRODUCTION_APP_URL.replace(/\/$/, '')
    : 'https://safe-link-two.vercel.app'
}

let historyData = { bajo: [], medio: [], alto: [] }
let activeRiskTab = 'bajo'

async function getApiBase() {
  const { apiUrl } = await chrome.storage.sync.get(['apiUrl'])
  const fallback = typeof PRODUCTION_API_URL !== 'undefined'
    ? PRODUCTION_API_URL
    : 'https://safelink-api-csqe.onrender.com'
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
  const openApp = document.getElementById('open-app')
  if (user) {
    document.getElementById('userEmail').textContent = user.email
    openApp.classList.remove('hidden')
    openApp.href = `${appBase()}/enlaces`
    loadHistoryByRisk()
  } else {
    openApp.classList.add('hidden')
  }
}

function setWarming(on) {
  document.getElementById('warming').classList.toggle('hidden', !on)
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
  setWarming(false)
  const estado = data.estado || 'unknown'
  const sem = document.getElementById('semaphore')
  sem.className = `semaphore ${estado}`

  const scoreBox = document.getElementById('score-box')
  scoreBox.classList.remove('hidden')
  const badge = document.getElementById('status-badge')
  badge.textContent = BADGE[estado] || estado
  badge.className = `status-badge ${estado}`

  const scoreEl = document.getElementById('score')
  scoreEl.textContent = data.puntuacion_riesgo
  scoreEl.className = `score ${estado}`

  document.getElementById('status-label').textContent = SUMMARY[estado] || SUMMARY.unknown

  const savedHint = document.getElementById('saved-hint')
  savedHint.classList.toggle('hidden', !data.guardado_en_historial)

  const list = document.getElementById('resumen')
  list.innerHTML = ''
  ;(data.resumen || []).slice(0, 4).forEach((line) => {
    const li = document.createElement('li')
    li.textContent = line
    list.appendChild(li)
  })

  const openApp = document.getElementById('open-app')
  if (!openApp.classList.contains('hidden')) {
    openApp.href = `${appBase()}/analyze`
  }
}

function renderSerp(url) {
  setWarming(false)
  document.getElementById('url').textContent = url || '—'
  document.getElementById('serp-hint').classList.remove('hidden')
  document.getElementById('score-box').classList.add('hidden')
  document.getElementById('semaphore').className = 'semaphore unknown'
  document.getElementById('status-label').textContent =
    'Mirá el punto de color al lado de cada resultado: Seguro, Precaución o Peligroso.'
  document.getElementById('resumen').innerHTML = ''
  document.getElementById('saved-hint').classList.add('hidden')
}

function renderInternal(url) {
  setWarming(false)
  document.getElementById('url').textContent = url || '—'
  document.getElementById('serp-hint').classList.add('hidden')
  document.getElementById('score-box').classList.add('hidden')
  document.getElementById('semaphore').className = 'semaphore unknown'
  document.getElementById('status-label').textContent = 'Página interna del navegador. No hay enlace para revisar.'
  document.getElementById('resumen').innerHTML = ''
}

function renderError(cold) {
  document.getElementById('score-box').classList.add('hidden')
  document.getElementById('semaphore').className = 'semaphore unknown'
  if (cold) {
    setWarming(true)
    document.getElementById('status-label').textContent =
      'El servidor (Render) está arrancando. Esperá unos segundos y se reintenta solo.'
  } else {
    setWarming(false)
    document.getElementById('status-label').textContent =
      'No pudimos revisar este sitio. Probá de nuevo en un momento.'
  }
}

async function requestStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_ACTIVE_STATUS' }, (res) => {
      if (chrome.runtime.lastError) {
        resolve({ kind: 'error', cold: true })
        return
      }
      resolve(res || { kind: 'error', cold: true })
    })
  })
}

async function init() {
  const [tabs, { lastCheck, user, token }, { apiUrl }] = await Promise.all([
    chrome.tabs.query({ active: true, currentWindow: true }),
    chrome.storage.local.get(['lastCheck', 'user', 'token']),
    chrome.storage.sync.get(['apiUrl']),
  ])

  const tab = tabs[0]
  document.getElementById('url').textContent = tab?.url || '—'
  const apiDefault = typeof PRODUCTION_API_URL !== 'undefined'
    ? PRODUCTION_API_URL
    : 'https://safelink-api-csqe.onrender.com'
  document.getElementById('apiUrl').value = apiUrl || apiDefault
  document.getElementById('ext-id').textContent = `ID para CORS: ${chrome.runtime.id}`

  if (user && token) {
    showAuth(user)
  } else {
    showAuth(null)
  }

  if (tab?.url && isGoogleSearchPage(tab.url)) {
    renderSerp(tab.url)
  } else if (lastCheck && tab?.url === lastCheck.url) {
    renderResult(lastCheck)
  }

  const status = await requestStatus()
  if (status.kind === 'serp') renderSerp(status.url)
  else if (status.kind === 'internal') renderInternal(status.url)
  else if (status.kind === 'result' && status.data) renderResult(status.data)
  else if (status.kind === 'error') renderError(!!status.cold)

  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value
    const errEl = document.getElementById('authError')
    errEl.classList.add('hidden')
    try {
      let res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok && (res.status === 502 || res.status === 503 || res.status === 504)) {
        setWarming(true)
        errEl.textContent = 'Calentando el servidor… reintentando'
        errEl.classList.remove('hidden')
        await new Promise((r) => setTimeout(r, 2500))
        res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.detail || 'Login fallido')
      }
      setWarming(false)
      const data = await res.json()
      await chrome.storage.local.set({
        token: data.access_token,
        user: data.user,
      })
      showAuth(data.user)
      chrome.runtime.sendMessage({ type: 'refresh' })
    } catch (e) {
      const network = e.message === 'Failed to fetch' || e.name === 'TypeError'
      errEl.textContent = network
        ? 'Calentando el servidor… reintentá en unos segundos. Si sigue fallando, copiá el ID de abajo en CHROME_EXTENSION_ID del backend.'
        : e.message
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

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'CHECK_PROGRESS' && msg.phase === 'warming') {
      setWarming(true)
      document.getElementById('status-label').textContent =
        'Calentando el servidor… reintentando'
    }
    if (msg.type === 'historyUpdated') {
      loadHistoryByRisk()
      chrome.storage.local.get(['lastCheck'], ({ lastCheck: latest }) => {
        if (latest) renderResult(latest)
      })
    }
  })
}

init()
