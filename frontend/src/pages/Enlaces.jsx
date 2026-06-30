import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretDown, CaretRight, Flag, LinkSimple } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import EstadoBadge from '../components/EstadoBadge'
import client from '../api/client'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function Enlaces() {
  const [enlaces, setEnlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [escaneos, setEscaneos] = useState({})
  const [loadingEscaneos, setLoadingEscaneos] = useState(null)
  const [reportTarget, setReportTarget] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [reporting, setReporting] = useState(false)
  const [reportMsg, setReportMsg] = useState('')

  const loadEnlaces = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await client.get('/enlaces')
      setEnlaces(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar los enlaces')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnlaces()
  }, [])

  const toggleEscaneos = async (enlaceId) => {
    if (expandedId === enlaceId) {
      setExpandedId(null)
      return
    }
    setExpandedId(enlaceId)
    if (escaneos[enlaceId]) return

    setLoadingEscaneos(enlaceId)
    try {
      const { data } = await client.get(`/enlaces/${enlaceId}/escaneos`)
      setEscaneos((prev) => ({ ...prev, [enlaceId]: data }))
    } catch {
      setEscaneos((prev) => ({ ...prev, [enlaceId]: [] }))
    } finally {
      setLoadingEscaneos(null)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!reportTarget) return
    setReporting(true)
    setReportMsg('')
    try {
      await client.post('/reportes', {
        enlace_id: reportTarget.id,
        motivo: motivo.trim(),
      })
      setReportMsg('Reporte enviado correctamente')
      setMotivo('')
      setTimeout(() => {
        setReportTarget(null)
        setReportMsg('')
      }, 1500)
    } catch (err) {
      setReportMsg(err.response?.data?.detail || 'No se pudo enviar el reporte')
    } finally {
      setReporting(false)
    }
  }

  return (
    <AppShell>
      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">Enlaces</span>
          <h1>Mis enlaces</h1>
          <p>URLs que escaneaste, con historial de escaneos y opción de reportar sitios sospechosos.</p>
        </div>
        <Link to="/analyze" className="btn-gradient shrink-0 text-sm px-4 py-2">
          Analizar URL
        </Link>
      </div>

      {error && <div className="app-alert app-alert--error">{error}</div>}

      <div className="app-card overflow-hidden">
        {loading ? (
          <p className="app-table-empty">Cargando...</p>
        ) : enlaces.length === 0 ? (
          <div className="app-table-empty">
            <LinkSimple size={32} className="mx-auto mb-3 opacity-40" />
            <p>Todavía no escaneaste ningún enlace.</p>
            <Link to="/analyze" className="app-link-accent mt-2 inline-block text-sm">
              Analizar tu primer enlace →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {enlaces.map((enlace) => (
              <div key={enlace.id}>
                <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleEscaneos(enlace.id)}
                    className="flex min-w-0 flex-1 items-start gap-2 text-left"
                  >
                    {expandedId === enlace.id ? (
                      <CaretDown size={16} className="mt-1 shrink-0 text-muted" />
                    ) : (
                      <CaretRight size={16} className="mt-1 shrink-0 text-muted" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium cell-main">{enlace.url}</p>
                      <p className="mt-1 text-xs text-muted">
                        Último escaneo: {formatDate(enlace.fecha_analisis)}
                        {enlace.nivel_riesgo && ` · Riesgo ${enlace.nivel_riesgo}`}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2 pl-6 sm:pl-0">
                    <EstadoBadge estado={enlace.estado} />
                    <button
                      type="button"
                      onClick={() => {
                        setReportTarget(enlace)
                        setMotivo('')
                        setReportMsg('')
                      }}
                      className="app-btn-ghost inline-flex items-center gap-1 px-2.5 py-1 text-xs"
                      title="Reportar enlace"
                    >
                      <Flag size={14} />
                      Reportar
                    </button>
                  </div>
                </div>

                {expandedId === enlace.id && (
                  <div className="border-t border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3">
                    <p className="mb-2 text-xs font-medium text-muted">Historial de escaneos</p>
                    {loadingEscaneos === enlace.id ? (
                      <p className="text-xs text-muted">Cargando escaneos...</p>
                    ) : (escaneos[enlace.id] || []).length === 0 ? (
                      <p className="text-xs text-muted">Sin escaneos registrados.</p>
                    ) : (
                      <ul className="space-y-2">
                        {(escaneos[enlace.id] || []).map((esc) => (
                          <li
                            key={esc.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs"
                          >
                            <span>{formatDate(esc.fecha)}</span>
                            <div className="flex items-center gap-2">
                              <EstadoBadge estado={esc.resultado} />
                              <span className="text-muted">Riesgo {esc.porcentaje_riesgo ?? 0}%</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {reportTarget && (
        <div className="app-modal-overlay">
          <form onSubmit={handleReport} className="app-modal space-y-4">
            <h2>Reportar enlace</h2>
            <p className="truncate text-xs text-muted">{reportTarget.url}</p>
            <div className="auth-field">
              <label htmlFor="motivo">Motivo</label>
              <textarea
                id="motivo"
                required
                minLength={3}
                maxLength={1000}
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="app-input resize-none"
                placeholder="Ej: Posible phishing, sitio fraudulento..."
              />
            </div>
            {reportMsg && (
              <p className={`text-xs ${reportMsg.includes('correctamente') ? 'text-neon-ice' : 'text-hot-fuchsia'}`}>
                {reportMsg}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReportTarget(null)} className="btn-outline-gradient text-sm px-4 py-2">
                Cancelar
              </button>
              <button type="submit" disabled={reporting} className="btn-gradient text-sm px-4 py-2 disabled:opacity-60">
                {reporting ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
