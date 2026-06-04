import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
import { TOOLS } from '../constants/tools'

export default function AnalyzeDns() {
  const location = useLocation()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!result) return
    const hash = location.hash.replace('#', '')
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [result, location.hash])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await client.post('/analysis/dns', { url })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo analizar el dominio')
    } finally {
      setLoading(false)
    }
  }

  const d = result?.detalle
  const dns = d?.consistencia_dns
  const ficha = d?.ficha_dominio

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ToolHeader
          name="Informacion del dominio"
          description="Comprueba si un sitio esta donde deberia y que antiguedad tiene."
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="mercadopago.com o dominio sospechoso"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? 'Consultando...' : 'Analizar dominio'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {result && d && (
          <section className="mt-8 space-y-8">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <span className="text-3xl font-bold text-sky-400">
                {result.puntuacion_riesgo}
              </span>
              <div>
                <p className="text-xl text-white">{d.dominio}</p>
                <RiskBadge level={result.nivel_riesgo} />
              </div>
            </div>

            <div id="consistencia" className="scroll-mt-24">
              <span className="text-xs uppercase text-sky-400">{TOOLS.dns.tag}</span>
              <h2 className="text-lg font-semibold text-white">
                {TOOLS.dns.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{TOOLS.dns.longDesc}</p>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                {dns?.suplantacion_detectada && (
                  <p className="mb-2 text-sm font-medium text-rose-400">
                    Los servidores no parecen los de la marca real
                  </p>
                )}
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
                  {(dns?.alerts || []).map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                {(dns?.ip_detalle || []).map((ip) => (
                  <p key={ip.ip} className="mt-2 text-xs text-slate-500">
                    {ip.ip} · {ip.asn} · {ip.org}{' '}
                    {ip.hosting ? '(hosting/VPS)' : ''}
                  </p>
                ))}
              </div>
            </div>

            <div id="timeline" className="scroll-mt-24">
              <span className="text-xs uppercase text-sky-400">
                {TOOLS.timeline.tag}
              </span>
              <h2 className="text-lg font-semibold text-white">
                {TOOLS.timeline.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {TOOLS.timeline.longDesc}
              </p>
              {ficha?.blacklist && (
                <p
                  className={`mt-2 text-sm ${ficha.blacklist.en_lista ? 'text-rose-400' : 'text-slate-400'}`}
                >
                  {ficha.blacklist.alerta}
                </p>
              )}
              <ul className="mt-4 space-y-3 border-l-2 border-sky-500/40 pl-4">
                {(d.timeline || []).map((ev, i) => (
                  <li key={`${ev.fecha}-${i}`}>
                    <span className="text-xs text-slate-500">{ev.fecha}</span>
                    <p className="text-sm text-slate-300">{ev.evento}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
