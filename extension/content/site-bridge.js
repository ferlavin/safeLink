/** Permite a la web detectar si la extension ya esta instalada. */
document.documentElement.setAttribute('data-safelink-installed', '1')
window.dispatchEvent(new CustomEvent('safelink-extension-ready'))
