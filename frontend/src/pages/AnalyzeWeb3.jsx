import { useState } from 'react'
import AppShell from '../components/AppShell'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
import { SCORE_CLASS } from '../constants/labels'
import { TOOLS } from '../constants/tools'

export default function AnalyzeWeb3() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await client.post('/analysis/web3', { url })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo analizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <ToolHeader tag={TOOLS.web3.tag} name={TOOLS.web3.name} description={TOOLS.web3.longDesc} />

      <form onSubmit={handleSubmit} className="app-form-row">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://sitio-sospechoso.com"
          className="app-input"
        />
        <button type="submit" disabled={loading} className="btn-gradient disabled:opacity-60">
          {loading ? 'Revisando...' : 'Revisar pagina'}
        </button>
      </form>

      {error && (
        <div className="app-alert app-alert--error mt-4">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {result && (
        <section className="mt-8 space-y-4">
          <div className="app-score-card">
            <span className={`app-score-value ${SCORE_CLASS[result.nivel_riesgo] || ''}`}>
              {result.puntuacion_riesgo}
            </span>
            <div className="flex-1">
              <RiskBadge level={result.nivel_riesgo} />
            </div>
          </div>
          <div className="app-module-card">
            <h3>Qué encontramos</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {(result.detalle?.resumen || []).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          {(result.detalle?.patrones_detectados || []).length > 0 && (
            <div className="app-module-card">
              <h3>Patrones detectados</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {result.detalle.patrones_detectados.map((p) => (
                  <li key={p.patron}>
                    {p.patron} (+{p.puntos} pts)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </AppShell>
  )
}
