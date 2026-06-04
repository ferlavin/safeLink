import { useState } from 'react'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <span className="text-xs font-medium uppercase tracking-wide text-violet-400">
          {TOOLS.web3.tag}
        </span>
        <ToolHeader name={TOOLS.web3.name} description={TOOLS.web3.longDesc} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://sitio-sospechoso.com"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white hover:bg-violet-400 disabled:opacity-60"
          >
            {loading ? 'Revisando...' : 'Revisar pagina'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6">
              <span className="text-4xl font-bold text-violet-400">
                {result.puntuacion_riesgo}
              </span>
              <RiskBadge level={result.nivel_riesgo} />
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              {(result.detalle?.resumen || []).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {(result.detalle?.patrones_detectados || []).length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h3 className="font-semibold text-white">Patrones detectados</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-400">
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
      </main>
    </div>
  )
}
