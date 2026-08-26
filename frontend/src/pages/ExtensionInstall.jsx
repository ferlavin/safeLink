import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import usePageView from '../hooks/usePageView'

const CHROME_STORE_URL = import.meta.env.VITE_CHROME_WEB_STORE_URL?.trim() || ''

const DEV_STEPS = [
  'Abrí Chrome y entrá a chrome://extensions/',
  'Activá "Modo de desarrollador" (arriba a la derecha).',
  'Clic en "Cargar descomprimida" y elegí la carpeta extension/ del proyecto SafeLink.',
  'Fijá el icono SafeLink en la barra de herramientas.',
  'Opcional: iniciá sesión en el popup para guardar los sitios que revisás.',
  'Si el login del popup falla, copiá el ID de la extensión (chrome://extensions o el popup) en CHROME_EXTENSION_ID del backend. CORS no acepta chrome-extension://* suelto.',
]

export default function ExtensionInstall() {
  const { user } = useAuth()
  const [installed, setInstalled] = useState(false)
  const [extensionId, setExtensionId] = useState('')

  usePageView('extension_page_view')

  useEffect(() => {
    const check = () => {
      setInstalled(document.documentElement.getAttribute('data-safelink-installed') === '1')
      const id = document.documentElement.getAttribute('data-safelink-extension-id') || ''
      if (id) setExtensionId(id)
    }
    check()
    window.addEventListener('safelink-extension-ready', check)
    const t = setInterval(check, 800)
    return () => {
      window.removeEventListener('safelink-extension-ready', check)
      clearInterval(t)
    }
  }, [])

  return (
    <AppShell guest={!user}>
      <div className="app-page-header">
        <span className="section-tag">Extensión</span>
        <div className="app-page-heading">
          <span className="sl-icon sl-icon--lg sl-icon--accent">
            <img src="/extension-icon.png" alt="" width="22" height="22" />
          </span>
          <div>
            <h1>SafeLink para Chrome</h1>
            <p>Google Chrome · Manifest V3 · semáforo, no bloqueo</p>
          </div>
        </div>
      </div>

      {installed && (
        <div className="app-alert app-alert--success">
          La extensión SafeLink ya está instalada en este navegador
          {extensionId ? ` (ID ${extensionId}).` : '.'}
        </div>
      )}

      <section className="app-section-card app-section-card--accent">
        <h2>Qué hace de verdad</h2>
        <p className="mt-3">
          El producto principal es el semáforo de la pestaña actual: el icono de la barra cambia a
          verde, amarillo o rojo según el enlace que estás viendo. En Google (.com y .com.ar)
          además pone un punto de color junto a cada resultado, antes de que hagas clic.
        </p>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center gap-3">
            <StatusBadge tone="safe">Seguro</StatusBadge>
            <span>podés entrar con más tranquilidad</span>
          </li>
          <li className="flex items-center gap-3">
            <StatusBadge tone="warn">Precaución</StatusBadge>
            <span>revisá antes de poner contraseñas o datos</span>
          </li>
          <li className="flex items-center gap-3">
            <StatusBadge tone="danger">Peligroso</StatusBadge>
            <span>no te recomendamos entrar</span>
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          SafeLink avisa. No bloquea la navegación: si igual querés entrar, el sitio carga.
        </p>
      </section>

      <section className="app-section-card">
        <h2>Permiso &lt;all_urls&gt;</h2>
        <p className="mt-3 text-sm">
          Hace falta para leer la URL de cualquier pestaña y pintar el semáforo en el icono. Sin
          ese permiso solo veríamos Chrome interno o los sitios listados uno por uno. También
          pedimos el host de la API y Google (.com / .ar) para el check y los puntos del buscador.
          No se piden permisos extra (no hay bloqueo de navegación).
        </p>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {CHROME_STORE_URL && !installed && (
          <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-gradient">
            Agregar a Chrome
          </a>
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

      {!CHROME_STORE_URL && (
        <p className="mt-3 text-xs text-muted">
          Esta extensión no está publicada en Chrome Web Store. Se carga en modo desarrollador,
          como abajo. No hay un botón mágico de “instalar desde la tienda”.
        </p>
      )}

      <section className="app-section-card">
        <h2>{installed ? 'Extensión activa' : 'Instalación (modo desarrollador)'}</h2>
        {!installed && (
          <ol className="mt-4 list-decimal space-y-3 pl-5">
            {DEV_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {installed && extensionId && (
          <p className="mt-4 text-sm">
            Para CORS del backend: <code>CHROME_EXTENSION_ID={extensionId}</code>
          </p>
        )}
        <p className="mt-4 text-xs">
          La API vive en Render (por defecto{' '}
          <code>https://safelink-api-csqe.onrender.com</code>). Si el servicio está dormido, el
          popup dice “calentando / reintentando”; no es un fallo mudo. En desarrollo local podés
          apuntar el popup a <code>http://localhost:8000</code>.
        </p>
      </section>

      <section className="app-section-card">
        <h3 className="text-sm font-medium text-muted">Paquete offline (opcional)</h3>
        <p className="mt-2 text-xs">
          Solo si no tenés el código del proyecto: descargá el ZIP y cargalo descomprimido en
          chrome://extensions.
        </p>
        <a href="/safelink-extension.zip" download="safelink-extension.zip" className="btn-outline-gradient mt-3">
          Descargar ZIP de respaldo
        </a>
      </section>
    </AppShell>
  )
}
