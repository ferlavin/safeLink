import { useState } from 'react'
import AppShell from '../components/AppShell'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
import { SCORE_CLASS } from '../constants/labels'
import { TOOLS } from '../constants/tools'

export default function AnalyzePdf() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setError('')
    setLoading(true)
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await client.post('/analysis/pdf', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo analizar el PDF')
    } finally {
      setLoading(false)
    }
  }

  const enlaces = result?.detalle?.enlaces || []

  return (
    <AppShell>
      <ToolHeader tag={TOOLS.pdf.tag} name={TOOLS.pdf.name} description={TOOLS.pdf.longDesc} />

      <form onSubmit={handleSubmit} className="app-form-row">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="app-input"
        />
        <button type="submit" disabled={loading || !file} className="btn-gradient disabled:opacity-60">
          {loading ? 'Revisando PDF...' : 'Revisar PDF'}
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
              <p className="text-main">{result.detalle?.archivo}</p>
              <p className="mt-1 text-sm text-muted">
                {result.detalle?.total_enlaces} enlace(s) detectados
              </p>
              <div className="mt-2">
                <RiskBadge level={result.nivel_riesgo} />
              </div>
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
          {enlaces.length > 0 && (
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Riesgo</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {enlaces.map((l) => (
                    <tr key={l.url}>
                      <td className="max-w-md truncate cell-main">{l.url}</td>
                      <td>
                        <RiskBadge level={l.nivel_riesgo} />
                      </td>
                      <td>{l.puntuacion_riesgo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AppShell>
  )
}
