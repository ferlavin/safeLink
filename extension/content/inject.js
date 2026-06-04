/** Semaforos junto a enlaces y URLs visibles en resultados de Google. */

const analyzed = new WeakSet()
const urlCache = new Map()
const pending = new Set()
const MAX_TARGETS = 32
const CONCURRENCY = 4

const GOOGLE_HOST = /(^|\.)google\.[a-z.]+$/i

function resolveUrl(href) {
  if (!href) return null
  try {
    if (href.includes('/url?') || href.includes('google.com/url')) {
      const u = new URL(href, window.location.origin)
      const q = u.searchParams.get('q') || u.searchParams.get('url')
      if (q) return q
    }
    const full = new URL(href, window.location.origin).href
    if (!full.startsWith('http://') && !full.startsWith('https://')) return null
    const host = new URL(full).hostname
    if (GOOGLE_HOST.test(host)) return null
    return full
  } catch {
    return null
  }
}

function insertDotBefore(el, estado, data) {
  if (!el || analyzed.has(el)) return
  const existing = el.previousElementSibling
  if (existing?.getAttribute('data-safelink-wrap') === '1') return

  const wrap = document.createElement('span')
  wrap.className = 'safelink-dot-wrap'
  wrap.setAttribute('data-safelink-wrap', '1')
  const dot = document.createElement('span')
  dot.className = `safelink-dot ${estado}`
  if (data?.puntuacion_riesgo != null) {
    const nivel =
      { bajo: 'Parece seguro', medio: 'Ten cuidado', alto: 'Riesgo alto', critico: 'Muy peligroso' }[
        data.nivel_riesgo
      ] || data.nivel_riesgo
    const lines = [
      `SafeLink: ${nivel} (${data.puntuacion_riesgo} de 100)`,
      ...(data.resumen || []).slice(0, 3),
    ]
    dot.title = lines.join('\n')
  } else {
    dot.title = data?.title || 'SafeLink: sin datos'
  }
  wrap.appendChild(dot)
  el.parentElement?.insertBefore(wrap, el)
  analyzed.add(el)
}

function insertLoadingBefore(el) {
  if (!el || analyzed.has(el)) return
  const prev = el.previousElementSibling
  if (prev?.getAttribute('data-safelink-loading') === '1') return

  const wrap = document.createElement('span')
  wrap.className = 'safelink-dot-wrap'
  wrap.setAttribute('data-safelink-loading', '1')
  const dot = document.createElement('span')
  dot.className = 'safelink-dot loading'
  dot.title = 'SafeLink: revisando...'
  wrap.appendChild(dot)
  el.parentElement?.insertBefore(wrap, el)
}

function removeLoadingFor(el) {
  const prev = el?.previousElementSibling
  if (prev?.getAttribute('data-safelink-loading') === '1') prev.remove()
}

function findTitleLink(block) {
  const h3 = block.querySelector('h3')
  if (h3) {
    const viaH3 = h3.closest('a[href]') || h3.querySelector('a[href]')
    if (viaH3) return viaH3
  }
  return (
    block.querySelector('.yuRUbf a[href]') ||
    block.querySelector('a[href] h3')?.closest('a[href]') ||
    block.querySelector('a[href]:has(h3)') ||
    block.querySelector('a.sVqzd[href]') ||
    block.querySelector('a[href][data-ved]') ||
    block.querySelector('a[href][ping]')
  )
}

function collectTargets() {
  const out = []
  const seenKey = new Set()

  const roots = ['#search', '#tads', '#tadsb', '#bottomads']
  const blocks = new Set()
  roots.forEach((sel) => {
    const root = document.querySelector(sel)
    if (!root) return
    root.querySelectorAll('.MjjYud, .g, .uEierd, [data-sokoban-container], [data-text-ad]').forEach(
      (b) => blocks.add(b),
    )
    root.querySelectorAll('h3').forEach((h3) => {
      const card = h3.closest('.MjjYud, .g, .uEierd, li, div[data-ved]')
      if (card) blocks.add(card)
    })
  })

  blocks.forEach((block) => {
    const main = findTitleLink(block)
    const mainUrl = main ? resolveUrl(main.href) : null
    if (main && mainUrl) {
      out.push({ el: main, url: mainUrl, role: 'title' })
    }

    const cite =
      block.querySelector('cite') ||
      block.querySelector('.VuuXrf') ||
      block.querySelector('.ylgVCe') ||
      block.querySelector('.ob9lvb') ||
      block.querySelector('[role="text"]')
    if (cite && mainUrl && !cite.closest('a')) {
      out.push({ el: cite, url: mainUrl, role: 'cite' })
    }

    block.querySelectorAll(
      '.HiHjJ a[href], .wM4DSd a[href], .wbJOMb a[href], .LEwnzc a[href], table a[href], a.sVqzd[href]',
    ).forEach((a) => {
      const url = resolveUrl(a.href)
      if (url) out.push({ el: a, url, role: 'sitelink' })
    })
  })

  document.querySelectorAll('#search a[href], #tads a[href], #tadsb a[href]').forEach((a) => {
    const t = (a.textContent || '').trim()
    if (/m[aá]s resultados|more results/i.test(t)) {
      const url = resolveUrl(a.href)
      if (url) out.push({ el: a, url, role: 'more' })
    }
  })

  const deduped = []
  for (const item of out) {
    if (!item.url || !item.el) continue
    const key = `${item.url}::${item.role}::${item.el.textContent?.slice(0, 48) || ''}`
    if (seenKey.has(key)) continue
    if (analyzed.has(item.el)) continue
    seenKey.add(key)
    deduped.push(item)
    if (deduped.length >= MAX_TARGETS) break
  }
  return deduped
}

async function checkUrl(url) {
  if (urlCache.has(url)) return urlCache.get(url)
  const data = await chrome.runtime.sendMessage({ type: 'CHECK_URL', url })
  if (data) urlCache.set(url, data)
  return data
}

function applyResultToSameUrl(url, data) {
  document.querySelectorAll('[data-safelink-loading="1"]').forEach((wrap) => {
    const sib = wrap.nextElementSibling
    if (!sib || analyzed.has(sib)) return
    const u = sib.href ? resolveUrl(sib.href) : null
    if (u === url) {
      wrap.remove()
      insertDotBefore(sib, data.estado, data)
    }
  })
}

async function processOne({ el, url }) {
  if (pending.has(url) && urlCache.has(url)) {
    const cached = urlCache.get(url)
    if (cached?.estado) insertDotBefore(el, cached.estado, cached)
    return
  }
  if (pending.has(url)) return

  pending.add(url)
  insertLoadingBefore(el)
  try {
    const data = await checkUrl(url)
    removeLoadingFor(el)
    if (data?.estado) {
      insertDotBefore(el, data.estado, data)
      applyResultToSameUrl(url, data)
    } else {
      insertDotBefore(el, 'desconocido', {
        title: 'SafeLink: no pudimos revisar este enlace',
      })
    }
  } catch {
    removeLoadingFor(el)
    insertDotBefore(el, 'desconocido', {
      title: 'SafeLink: sin conexion con el servidor',
    })
  } finally {
    pending.delete(url)
  }
}

async function processTargets() {
  const targets = collectTargets()
  let i = 0
  async function worker() {
    while (i < targets.length) {
      const batch = targets[i++]
      await processOne(batch)
    }
  }
  const workers = Array.from({ length: Math.min(CONCURRENCY, targets.length) }, () => worker())
  await Promise.all(workers)
}

let scanTimer = null
function scheduleScan() {
  clearTimeout(scanTimer)
  scanTimer = setTimeout(() => {
    processTargets().catch(() => {})
  }, 350)
}

const observer = new MutationObserver(scheduleScan)
function boot() {
  observer.observe(document.body, { childList: true, subtree: true })
  scheduleScan()
}

if (document.body) {
  boot()
} else {
  document.addEventListener('DOMContentLoaded', boot)
}

document.documentElement.setAttribute('data-safelink-injected', '1')
