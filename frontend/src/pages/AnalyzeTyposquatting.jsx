import { useState } from 'react'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <span className="text-xs font-medium uppercase tracking-wide text-amber-400">
          {TOOLS.typosquatting.tag}
        </span>
        <ToolHeader
          name={TOOLS.typosquatting.name}
          description={TOOLS.typosquatting.longDesc}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="bancnacion.com o https://..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
          >
            {loading ? 'Comparando...' : 'Verificar dominio'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-lg text-white">
                Sitio revisado:{' '}
                <strong>{result.detalle?.dominio_actual}</strong>
              </p>
              <div className="mt-2 flex gap-3">
                <span className="text-3xl font-bold text-amber-400">
                  {result.puntuacion_riesgo}
                </span>
                <RiskBadge level={result.nivel_riesgo} />
              </div>
            </div>
            {matches.length > 0 ? (
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <div
                    key={`${m.marca}-${i}`}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"
                  >
                    <p className="font-medium text-amber-200">
                      Imitacion de {m.marca}
                    </p>
                    <p className="text-slate-400">
                      Distancia Levenshtein: {m.distancia} · Tipo: {m.tipo}
                    </p>
                    {m.dominio_legitimo && (
                      <p className="text-slate-500">
                        Legitimo: {m.dominio_legitimo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">{result.detalle?.resumen?.[0]}</p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
