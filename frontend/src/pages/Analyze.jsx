import { useEffect, useState } from 'react'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import AppShell from '../components/AppShell'
import client from '../api/client'
import { RISK_LABELS } from '../constants/labels'
import { TOOLS } from '../constants/tools'

const SCORE_CLASS = {
  bajo: 'app-score-value--low',
  medio: 'app-score-value--med',
  alto: 'app-score-value--high',
  critico: 'app-score-value--crit',
}

function ModuleCard({ title, description, data }) {
  if (!data) return null
  return (
    <div className="app-module-card">
      <h3>{title}</h3>
      {description && <p className="mt-1 mb-3 text-xs leading-relaxed">{description}</p>}
      {data.matches?.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {data.matches.map((m) => (
            <li key={m.brand}>
              Se parece a <strong className="text-main">{m.brand}</strong>
            </li>
          ))}
        </ul>
      )}
      {data.alerts?.length > 0 ? (
        <ul className="mt-2 list-inside list-disc space-y-1">
          {data.alerts.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm">Sin avisos en esta parte.</p>
      )}
    </div>
  )
}

export default function Analyze() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const loadHistory = async () => {
    try {
      const { data } = await client.get('/analysis/history')
      setHistory(data)
    } catch {
      /* historial opcional */
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await client.post('/analysis/url', { url })
      setResult(data)
      loadHistory()
    } catch (err) {
      setError(err.response?.data?.detail || 'No pudimos revisar ese enlace. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const modulos = result?.detalle?.modulos

  return (
    <AppShell>
      <ToolHeader tag="Análisis" name={TOOLS.url.name} description={TOOLS.url.longDesc} />

      <form onSubmit={handleSubmit} className="app-form-row">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com"
          className="app-input"
        />
        <button type="submit" disabled={loading} className="btn-gradient px-6 py-3 disabled:opacity-60">
          {loading ? 'Revisando...' : 'Revisar enlace'}
        </button>
      </form>

      {error && <div className="app-alert app-alert--error mt-4">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

      {result && (
        <section className="mt-8 space-y-6">
          <div className="app-score-card">
            <div className={`app-score-value ${SCORE_CLASS[result.nivel_riesgo] || ''}`}>
              {result.puntuacion_riesgo}
            </div>
            <div className="flex-1">
              <p className="break-all text-sm text-muted">{result.url}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RiskBadge level={result.nivel_riesgo} />
                <span className="text-sm text-muted">
                  {RISK_LABELS[result.nivel_riesgo] || result.nivel_riesgo} · de 0 a 100, más alto = más riesgo
                </span>
              </div>
            </div>
          </div>

          {result.detalle?.resumen && (
            <div className="app-module-card">
              <h3>Qué encontramos</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {result.detalle.resumen.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <ModuleCard title="Enlace raro o confuso" description={TOOLS.url.modules.entropia} data={modulos?.entropia} />
            <ModuleCard title="Nombre parecido a otra marca" description={TOOLS.url.modules.typosquatting} data={modulos?.typosquatting} />
            <ModuleCard title="Trucos en la dirección" description={TOOLS.url.modules.heuristicas} data={modulos?.heuristicas} />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Enlaces que ya revisaste</h2>
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Enlace</th>
                <th>Resultado</th>
                <th>Puntos</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="app-table-empty">
                    Todavía no guardaste ninguna revisión
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id}>
                    <td className="max-w-xs truncate cell-main">{row.url_analizada}</td>
                    <td>
                      <RiskBadge level={row.nivel_riesgo} />
                    </td>
                    <td>{row.puntuacion_riesgo ?? '—'}</td>
                    <td>
                      {row.fecha_analisis ? new Date(row.fecha_analisis).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}
