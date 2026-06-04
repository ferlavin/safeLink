import { useState } from 'react'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {TOOLS.pdf.tag}
        </span>
        <ToolHeader name={TOOLS.pdf.name} description={TOOLS.pdf.longDesc} />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
          />
          <button
            type="submit"
            disabled={loading || !file}
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Revisando PDF...' : 'Revisar PDF'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <span className="text-4xl font-bold text-emerald-400">
                {result.puntuacion_riesgo}
              </span>
              <div>
                <p className="text-white">{result.detalle?.archivo}</p>
                <p className="text-sm text-slate-400">
                  {result.detalle?.total_enlaces} enlace(s) detectados
                </p>
                <RiskBadge level={result.nivel_riesgo} />
              </div>
            </div>
            <ul className="list-inside list-disc text-sm text-slate-300">
              {(result.detalle?.resumen || []).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {enlaces.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-4 py-2">URL</th>
                      <th className="px-4 py-2">Riesgo</th>
                      <th className="px-4 py-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enlaces.map((l) => (
                      <tr key={l.url} className="border-b border-slate-800/50">
                        <td className="max-w-md truncate px-4 py-2 text-slate-300">
                          {l.url}
                        </td>
                        <td className="px-4 py-2">
                          <RiskBadge level={l.nivel_riesgo} />
                        </td>
                        <td className="px-4 py-2">{l.puntuacion_riesgo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
