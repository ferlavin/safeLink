/** Puente con la web SafeLink: detectar instalación e invalidar cache al reportar. */
document.documentElement.setAttribute('data-safelink-installed', '1')
document.documentElement.setAttribute('data-safelink-extension-id', chrome.runtime.id)
window.dispatchEvent(
  new CustomEvent('safelink-extension-ready', { detail: { id: chrome.runtime.id } }),
)

window.addEventListener('safelink-url-reported', (event) => {
  const url = event.detail?.url
  if (!url) return
  chrome.runtime.sendMessage({ type: 'INVALIDATE_URL', url }).catch(() => {})
})
