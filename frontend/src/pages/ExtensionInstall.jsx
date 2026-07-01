import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'

const CHROME_STORE_URL = import.meta.env.VITE_CHROME_WEB_STORE_URL?.trim() || ''

const DEV_STEPS = [
  'Abrí Chrome y entrá a chrome://extensions/',
  'Activá "Modo de desarrollador" (arriba a la derecha).',
  'Clic en "Cargar descomprimida" y elegí la carpeta extension/ del proyecto SafeLink.',
  'Fijá el icono SafeLink en la barra de herramientas.',
  'Opcional: iniciá sesión en el popup para guardar los sitios que revisás.',
]

export default function ExtensionInstall() {
  const { user } = useAuth()
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const check = () => {
      setInstalled(document.documentElement.getAttribute('data-safelink-installed') === '1')
    }
    check()
    window.addEventListener('safelink-extension-ready', check)
    const t = setInterval(check, 800)
    return () => {
      window.removeEventListener('safelink-extension-ready', check)
      clearInterval(t)
    }
  }, [])

  const handleInstall = () => {
    if (CHROME_STORE_URL) {
      window.open(CHROME_STORE_URL, '_blank', 'noopener,noreferrer')
      return
    }
    window.open('https://chrome.google.com/webstore/category/extensions', '_blank', 'noopener')
  }

  return (
    <AppShell guest={!user}>
      <div className="app-page-header">
        <span className="section-tag">Extensión</span>
        <div className="flex items-center gap-3">
          <img
            src="/extension-icon.png"
            alt="SafeLink"
            className="h-10 w-10 rounded-lg shadow-[0_0_16px_rgba(0,255,135,0.25)]"
          />
          <div>
            <h1>SafeLink para Chrome</h1>
            <p className="!mt-1">Google Chrome · Manifest V3</p>
          </div>
        </div>
      </div>

      {installed && (
        <div className="app-alert app-alert--success">
          La extensión SafeLink ya está instalada en este navegador.
        </div>
      )}

      <section className="app-section-card app-section-card--accent">
        <h2>Qué hace la extensión</h2>
        <p className="mt-3">
          SafeLink muestra un <strong className="text-neon-ice">punto de color</strong> en la barra
          de Chrome y al lado de cada resultado en Google, antes de que hagas clic.
        </p>
        <ul className="mt-4 space-y-2">
          <li>
            <span className="app-status-dot app-status-dot--green" />
            <strong className="text-neon-ice">Verde</strong> — podés entrar con tranquilidad
          </li>
          <li>
            <span className="app-status-dot app-status-dot--amber" />
            <strong className="text-amber-400">Amarillo</strong> — mejor revisar antes
          </li>
          <li>
            <span className="app-status-dot app-status-dot--red" />
            <strong className="text-hot-fuchsia">Rojo</strong> — no te recomendamos entrar
          </li>
        </ul>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!installed && (
          <button type="button" onClick={handleInstall} className="btn-gradient">
            {CHROME_STORE_URL ? 'Agregar a Chrome' : 'Instalar en Chrome'}
          </button>
        )}
        {user ? (
          <Link to="/dashboard" className="btn-outline-gradient">
            Volver al dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn-outline-gradient">
            Iniciar sesión en la web
          </Link>
        )}
      </div>

      {!CHROME_STORE_URL && !installed && (
        <p className="mt-3 text-xs text-muted">
          Chrome no permite instalar extensiones con un solo clic desde una web sin publicarlas en
          Chrome Web Store. Usá la instalación de desarrollador abajo o configurá{' '}
          <code className="text-neon-ice">VITE_CHROME_WEB_STORE_URL</code> en el frontend.
        </p>
      )}

      <section className="app-section-card">
        <h2>{installed ? 'Extensión activa' : 'Instalación para desarrollo'}</h2>
        {!installed && (
          <ol className="mt-4 list-decimal space-y-3 pl-5">
            {DEV_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-xs">
          Requisito: API SafeLink en la nube (por defecto{' '}
          <code className="text-neon-ice">https://safelink-api-csqe.onrender.com</code>). En desarrollo
          local podés usar <code className="text-neon-ice">http://localhost:8000</code> desde el
          popup de la extensión.
        </p>
      </section>

      <section className="app-section-card">
        <h3 className="text-sm font-medium text-muted">Paquete offline (opcional)</h3>
        <p className="mt-2 text-xs">
          Solo si no tenés el código del proyecto: descargá el ZIP y cargalo descomprimido en
          chrome://extensions.
        </p>
        <a href="/safelink-extension.zip" download="safelink-extension.zip" className="app-link-accent mt-3 inline-block text-sm">
          Descargar ZIP de respaldo →
        </a>
      </section>
    </AppShell>
  )
}
