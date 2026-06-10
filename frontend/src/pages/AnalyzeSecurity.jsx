import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
import { TOOLS } from '../constants/tools'

const TABS = [
  { id: 'nlp', label: 'NLP', endpoint: '/analysis/nlp', tool: TOOLS.nlp },
  { id: 'headers', label: 'Headers', endpoint: '/analysis/headers', tool: TOOLS.headers },
  { id: 'oauth', label: 'OAuth', endpoint: '/analysis/oauth', tool: TOOLS.oauth },
  { id: 'forms', label: 'Formularios', endpoint: '/analysis/forms', tool: TOOLS.forms },
]

function ResultExtra({ tab, detalle }) {
  if (!detalle) return null

  if (tab === 'nlp' && detalle.categoria_label) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-[var(--app-text-muted)]">
          Clasificación:{' '}
          <strong className="text-[var(--app-text)]">{detalle.categoria_label}</strong>
          {detalle.confianza_pct != null && ` · ${detalle.confianza_pct}% confianza`}
        </p>
        {detalle.probabilidad_phishing != null && (
          <p className="text-xs text-[var(--app-text-muted)]">
            Probabilidad de phishing (modelo):{' '}
            {Math.round(detalle.probabilidad_phishing * 100)}%
            {detalle.modelo && ` · ${detalle.modelo}`}
          </p>
        )}
      </div>
    )
  }

  if (tab === 'headers') {
    return (
      <div className="space-y-3">
        {detalle.calificacion && (
          <p className="text-sm text-[var(--app-text-muted)]">
            Calificación headers:{' '}
            <strong className="text-[var(--app-text)]">{detalle.calificacion}</strong>
            {' · '}
            {detalle.headers_ok}/{detalle.headers_total} OK
          </p>
        )}
        {detalle.contexto_sensible && (
          <div className="rounded-lg border border-hot-fuchsia/40 bg-hot-fuchsia/10 px-4 py-3 text-sm text-hot-fuchsia">
            Sitio sensible detectado
            {detalle.contexto?.marcas_mencionadas?.length
              ? ` (menciona: ${detalle.contexto.marcas_mencionadas.join(', ')})`
              : ''}
            {detalle.headers_criticos_faltantes?.length
              ? ` — faltan controles críticos: ${detalle.headers_criticos_faltantes.join(', ')}`
              : ''}
          </div>
        )}
        {detalle.headers_analizados?.length > 0 && (
          <div className="app-card overflow-hidden rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--app-border)] text-[var(--app-text-muted)]">
                <tr>
                  <th className="px-3 py-2">Header</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {detalle.headers_analizados.map((h) => (
                  <tr key={h.header} className="border-b border-[var(--app-border)] last:border-0">
                    <td className="px-3 py-2 text-[var(--app-text)]">{h.header}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          h.estado === 'ok'
                            ? 'text-emerald-500'
                            : h.estado === 'debil'
                              ? 'text-amber-500'
                              : 'text-rose-500'
                        }
                      >
                        {h.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  if (tab === 'oauth' && detalle.es_proveedor_oficial != null) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--app-text-muted)]">
          Proveedor oficial:{' '}
          <strong className="text-[var(--app-text)]">
            {detalle.es_proveedor_oficial ? 'Sí' : 'No'}
          </strong>
          {detalle.flujo_oauth_detectado && ' · Flujo OAuth detectado'}
        </p>
        {detalle.scopes_peligrosos?.length > 0 && (
          <div className="rounded-lg border border-hot-fuchsia/40 bg-hot-fuchsia/10 px-4 py-3 text-sm text-hot-fuchsia">
            <p className="mb-1 font-semibold">Permisos excesivos solicitados:</p>
            <ul className="list-inside list-disc space-y-0.5">
              {detalle.scopes_peligrosos.map((s) => (
                <li key={s.scope}>
                  {s.scope} <span className="opacity-70">(+{s.puntos})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {detalle.scopes_solicitados?.length > 0 && (
          <p className="text-xs text-[var(--app-text-muted)]">
            Scopes pedidos: {detalle.scopes_solicitados.join(', ')}
          </p>
        )}
      </div>
    )
  }

  if (tab === 'forms' && detalle.formularios_total != null) {
    return (
      <p className="text-sm text-[var(--app-text-muted)]">
        {detalle.formularios_total} formulario(s),{' '}
        {detalle.formularios_credenciales} con credenciales
      </p>
    )
  }

  return null
}

export default function AnalyzeSecurity() {
  const [tab, setTab] = useState('nlp')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const active = TABS.find((t) => t.id === tab)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (TABS.some((t) => t.id === hash)) {
      setTab(hash)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await client.post(active.endpoint, { url })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo completar el análisis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-page relative">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ToolHeader
          name="Herramientas avanzadas"
          description="Clasificador NLP, security headers, OAuth phishing y detector de doble envío en formularios."
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                setResult(null)
                setError('')
                window.history.replaceState(null, '', `#${t.id}`)
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'app-nav-active'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] border border-[var(--app-border)]'
              }`}
            >
              {t.tool.name}
            </button>
          ))}
        </div>

        {active && (
          <p className="mb-4 text-sm text-[var(--app-text-muted)]">{active.tool.longDesc}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
            className="app-input flex-1 py-3"
          />
          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary px-6 py-3 disabled:opacity-60"
          >
            {loading ? 'Analizando...' : 'Analizar'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-hot-fuchsia/40 bg-hot-fuchsia/10 px-4 py-3 text-sm text-hot-fuchsia">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-4">
            <div className="app-card flex flex-wrap items-center gap-4 rounded-2xl p-6">
              <span className="text-4xl font-bold tabular-nums text-[var(--app-accent)]">
                {result.puntuacion_riesgo}
              </span>
              <div className="flex-1">
                <p className="break-all text-sm text-[var(--app-text-muted)]">{result.url}</p>
                <div className="mt-2">
                  <RiskBadge level={result.nivel_riesgo} />
                </div>
              </div>
            </div>

            <ResultExtra tab={tab} detalle={result.detalle} />

            <div className="app-card rounded-xl p-4">
              <h2 className="mb-2 font-semibold text-[var(--app-text)]">Resultado</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-[var(--app-text-muted)]">
                {(result.detalle?.resumen || []).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
