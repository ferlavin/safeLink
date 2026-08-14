import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell'
import RiskBadge from '../components/RiskBadge'
import StatusBadge from '../components/StatusBadge'
import ToolHeader from '../components/ToolHeader'
import client from '../api/client'
import { SCORE_CLASS } from '../constants/labels'
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
    <AppShell>
      <ToolHeader tag={TOOLS.dns.tag} name={TOOLS.dns.name} description={TOOLS.dns.longDesc} />

      <form onSubmit={handleSubmit} className="app-form-row">
        <input
          type="text"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="mercadopago.com o dominio sospechoso"
          className="app-input"
        />
        <button type="submit" disabled={loading} className="btn-gradient disabled:opacity-60">
          {loading ? 'Consultando...' : 'Analizar dominio'}
        </button>
      </form>

      {error && (
        <div className="app-alert app-alert--error mt-4">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {result && d && (
        <section className="mt-8 space-y-8">
          <div className="app-score-card">
            <span className={`app-score-value ${SCORE_CLASS[result.nivel_riesgo] || ''}`}>
              {result.puntuacion_riesgo}
            </span>
            <div className="flex-1">
              <p className="text-xl text-main">{d.dominio}</p>
              <div className="mt-2">
                <RiskBadge level={result.nivel_riesgo} />
              </div>
            </div>
          </div>

          <div id="consistencia" className="app-module-card scroll-mt-24">
            <span className="section-tag">{TOOLS.dns.tag}</span>
            <h3>{TOOLS.dns.name}</h3>
            <p className="mt-1 text-sm text-muted">{TOOLS.dns.longDesc}</p>
            <div className="mt-4">
              {dns?.suplantacion_detectada && (
                <div className="app-alert app-alert--error mb-3">
                  Los servidores no parecen los de la marca real
                </div>
              )}
              <ul className="list-inside list-disc space-y-1 text-sm">
                {(dns?.alerts || []).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              {(dns?.ip_detalle || []).map((ip) => (
                <p key={ip.ip} className="mt-2 text-xs text-muted">
                  {ip.ip} · {ip.asn} · {ip.org} {ip.hosting ? '(hosting/VPS)' : ''}
                </p>
              ))}
            </div>
          </div>

          <div id="timeline" className="app-module-card scroll-mt-24">
            <span className="section-tag">{TOOLS.timeline.tag}</span>
            <h3>{TOOLS.timeline.name}</h3>
            <p className="mt-1 text-sm text-muted">{TOOLS.timeline.longDesc}</p>
            {ficha?.blacklist && (
              <div className="mt-3">
                <StatusBadge tone={ficha.blacklist.en_lista ? 'danger' : 'safe'}>
                  {ficha.blacklist.alerta}
                </StatusBadge>
              </div>
            )}
            <ul className="mt-4 space-y-3 border-l-2 border-[var(--mint-a24)] pl-4">
              {(d.timeline || []).map((ev, i) => (
                <li key={`${ev.fecha}-${i}`}>
                  <span className="text-xs text-muted">{ev.fecha}</span>
                  <p className="text-sm">{ev.evento}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </AppShell>
  )
}
