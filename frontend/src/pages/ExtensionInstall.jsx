import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const CHROME_STORE_URL =
  import.meta.env.VITE_CHROME_WEB_STORE_URL?.trim() || ''

const DEV_STEPS = [
  'Abri Chrome y entra a chrome://extensions/',
  'Activa "Modo de desarrollador" (arriba a la derecha).',
  'Clic en "Cargar descomprimida" y elegi la carpeta extension/ del proyecto SafeLink.',
  'Fija el icono SafeLink en la barra de herramientas.',
  'Opcional: inicia sesion en el popup para guardar los sitios que revisas.',
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {user ? (
        <Navbar />
      ) : (
        <header className="border-b border-slate-800 px-4 py-3">
          <Link to="/login" className="text-xl font-bold">
            <span className="text-emerald-400">Safe</span>
            <span className="text-white">Link</span>
          </Link>
        </header>
      )}

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <div className="h-10 w-10 rounded-full bg-emerald-400 ring-2 ring-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Extension SafeLink para Chrome
            </h1>
            <p className="text-sm text-slate-400">Google Chrome · Manifest V3</p>
          </div>
        </div>

        {installed && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            La extension SafeLink ya esta instalada en este navegador.
          </div>
        )}

        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">Que hace la extension</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            SafeLink muestra un <strong className="text-emerald-400">punto de color</strong> en la
            barra de Chrome y al lado de cada resultado en Google, antes de que hagas clic.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <strong className="text-emerald-400">Verde</strong> — puedes entrar con tranquilidad
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-400" />
              <strong className="text-amber-400">Amarillo</strong> — mejor revisar antes
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-rose-500" />
              <strong className="text-rose-500">Rojo</strong> — no te recomendamos entrar
            </li>
          </ul>
        </section>

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {!installed && (
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              {CHROME_STORE_URL ? 'Agregar a Chrome' : 'Instalar en Chrome'}
            </button>
          )}
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-3 text-slate-300 transition hover:border-slate-500"
            >
              Volver al dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-3 text-slate-300 transition hover:border-slate-500"
            >
              Iniciar sesion en la web
            </Link>
          )}
        </section>

        {!CHROME_STORE_URL && !installed && (
          <p className="mt-3 text-xs text-slate-500">
            Chrome no permite instalar extensiones con un solo clic desde una web sin publicarlas
            en Chrome Web Store. Usa la instalacion de desarrollador abajo o publica la extension
            y configura <code className="text-slate-400">VITE_CHROME_WEB_STORE_URL</code> en el
            frontend.
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            {installed ? 'Extension activa' : 'Instalacion para desarrollo'}
          </h2>
          {!installed && (
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-300">
              {DEV_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Requisito: SafeLink encendido en tu PC (por defecto http://localhost:8000). Podes
            cambiar la direccion del servidor desde el popup de la extension.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
          <h3 className="text-sm font-medium text-slate-400">Paquete offline (opcional)</h3>
          <p className="mt-2 text-xs text-slate-500">
            Solo si no tenes el codigo del proyecto: descarga el ZIP y cargalo descomprimido en
            chrome://extensions. No hace falta si ya clonaste el repo.
          </p>
          <a
            href="/safelink-extension.zip"
            download="safelink-extension.zip"
            className="mt-3 inline-block text-sm text-emerald-400 hover:underline"
          >
            Descargar ZIP de respaldo
          </a>
        </section>
      </main>
    </div>
  )
}
