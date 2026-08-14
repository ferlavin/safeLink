import { useState } from 'react'
import AppShell from '../components/AppShell'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
import { SCORE_CLASS } from '../constants/labels'
import { TOOLS } from '../constants/tools'

export default function AnalyzeTyposquatting() {
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
      const { data } = await client.post('/analysis/typosquatting', { url })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo analizar')
    } finally {
      setLoading(false)
    }
  }

  const matches = result?.detalle?.matches || []

  return (
    <AppShell>
      <ToolHeader
        tag={TOOLS.typosquatting.tag}
        name={TOOLS.typosquatting.name}
        description={TOOLS.typosquatting.longDesc}
      />

      <form onSubmit={handleSubmit} className="app-form-row">
        <input
          type="text"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="bancnacion.com o https://..."
          className="app-input"
        />
        <button type="submit" disabled={loading} className="btn-gradient disabled:opacity-60">
          {loading ? 'Comparando...' : 'Verificar dominio'}
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
              <p className="text-main">
                Sitio revisado: <strong>{result.detalle?.dominio_actual}</strong>
              </p>
              <div className="mt-2">
                <RiskBadge level={result.nivel_riesgo} />
              </div>
            </div>
          </div>
          {matches.length > 0 ? (
            <div className="space-y-2">
              {matches.map((m, i) => (
                <div key={`${m.marca}-${i}`} className="app-module-card">
                  <h3>Imitacion de {m.marca}</h3>
                  <p className="mt-1 text-sm text-muted">
                    Distancia Levenshtein: {m.distancia} · Tipo: {m.tipo}
                  </p>
                  {m.dominio_legitimo && (
                    <p className="mt-1 text-sm text-muted">Legitimo: {m.dominio_legitimo}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">{result.detalle?.resumen?.[0]}</p>
          )}
        </section>
      )}
    </AppShell>
  )
}
