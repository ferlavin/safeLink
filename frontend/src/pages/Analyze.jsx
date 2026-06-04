import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
import { RISK_LABELS } from '../constants/labels'
import { TOOLS } from '../constants/tools'

const SCORE_RING = {
  bajo: 'text-emerald-400',
  medio: 'text-amber-400',
  alto: 'text-orange-400',
  critico: 'text-rose-500',
}

function ModuleCard({ title, description, data }) {
  if (!data) return null
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1 mb-3 text-xs leading-relaxed text-slate-500">{description}</p>
      )}
      {data.matches?.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-amber-300/90">
          {data.matches.map((m) => (
            <li key={m.brand}>
              Se parece a <strong>{m.brand}</strong>
            </li>
          ))}
        </ul>
      )}
      {data.alerts?.length > 0 ? (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
          {data.alerts.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Sin avisos en esta parte.</p>
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ToolHeader name={TOOLS.url.name} description={TOOLS.url.longDesc} />

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Revisando...' : 'Revisar enlace'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div
                className={`text-5xl font-bold tabular-nums ${SCORE_RING[result.nivel_riesgo] || 'text-white'}`}
              >
                {result.puntuacion_riesgo}
              </div>
              <div className="flex-1">
                <p className="break-all text-sm text-slate-400">{result.url}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RiskBadge level={result.nivel_riesgo} />
                  <span className="text-sm text-slate-500">
                    {RISK_LABELS[result.nivel_riesgo] || result.nivel_riesgo} · de 0 a 100,
                    mas alto = mas riesgo
                  </span>
                </div>
              </div>
            </div>

            {result.detalle?.resumen && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h2 className="mb-2 font-semibold text-white">Que encontramos</h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
                  {result.detalle.resumen.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <ModuleCard
                title="Enlace raro o confuso"
                description={TOOLS.url.modules.entropia}
                data={modulos?.entropia}
              />
              <ModuleCard
                title="Nombre parecido a otra marca"
                description={TOOLS.url.modules.typosquatting}
                data={modulos?.typosquatting}
              />
              <ModuleCard
                title="Trucos en la direccion"
                description={TOOLS.url.modules.heuristicas}
                data={modulos?.heuristicas}
              />
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-white">Enlaces que ya revisaste</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Enlace</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Puntos</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Todavia no guardaste ninguna revision
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-800/60 last:border-0"
                    >
                      <td className="max-w-xs truncate px-4 py-3 text-slate-300">
                        {row.url_analizada}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={row.nivel_riesgo} />
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {row.puntuacion_riesgo ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {row.fecha_analisis
                          ? new Date(row.fecha_analisis).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
