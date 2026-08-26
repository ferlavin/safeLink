import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import client from '../api/client'
import { REPORTE_ESTADOS } from '../constants/labels'
import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'
import { useT } from '../i18n/I18nContext.jsx'
import { resolveAssetUrl } from '../utils/assetUrl'

const ORIGIN_LABEL = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS',
  otro: 'Otro',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const ESTADO_TONE = {
  Resuelto: 'safe',
  Respondido: 'info',
  Descartado: 'neutral',
  'En revisión': 'warn',
  Pendiente: 'high',
}

export default function ReporteInbox({ mode = 'user' }) {
  const { t } = useT()
  const isAdmin = mode === 'admin'
  const listUrl = isAdmin ? '/reportes' : '/reportes/mine'

  const [reportes, setReportes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updatingEstado, setUpdatingEstado] = useState(false)
  const threadEndRef = useRef(null)

  const loadList = useCallback(async () => {
    setLoadingList(true)
    setError('')
    try {
      const { data } = await client.get(listUrl)
      setReportes(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar los reportes')
    } finally {
      setLoadingList(false)
    }
  }, [listUrl])

  const loadDetail = useCallback(
    async (reporteId) => {
      setLoadingDetail(true)
      setError('')
      try {
        const { data } = await client.get(`/reportes/${reporteId}`)
        setDetail(data)
        await client.post(`/reportes/${reporteId}/leer`)
        setReportes((prev) =>
          prev.map((r) => (r.id === reporteId ? { ...r, unread_count: 0 } : r)),
        )
      } catch (err) {
        setError(err.response?.data?.detail || 'No se pudo cargar la conversación')
      } finally {
        setLoadingDetail(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    if (selectedId) loadDetail(selectedId)
    else setDetail(null)
  }, [selectedId, loadDetail])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.mensajes])

  const handleSelect = (id) => {
    setSelectedId(id)
    setReply('')
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!selectedId || !reply.trim()) return
    setSending(true)
    setError('')
    try {
      await client.post(`/reportes/${selectedId}/mensajes`, { cuerpo: reply.trim() })
      setReply('')
      await loadDetail(selectedId)
      await loadList()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  const handleEstadoChange = async (estado) => {
    if (!selectedId) return
    setUpdatingEstado(true)
    setError('')
    try {
      await client.put(`/reportes/${selectedId}`, { estado })
      await loadDetail(selectedId)
      await loadList()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo actualizar el estado')
    } finally {
      setUpdatingEstado(false)
    }
  }

  const closed = detail?.estado === 'Resuelto' || detail?.estado === 'Descartado'

  return (
    <div className="app-inbox">
      <aside className="app-inbox-list">
        <div className="app-inbox-list-head">
          <ChatCircle size={18} weight="fill" />
          <span>{isAdmin ? 'Bandeja de reportes' : 'Mis reportes'}</span>
        </div>

        {loadingList ? (
          <p className="app-inbox-empty">Cargando...</p>
        ) : reportes.length === 0 ? (
          <EmptyState
            compact
            icon={ChatCircle}
            title={t('mensajes.emptyTitle')}
            description={isAdmin ? t('mensajes.emptyAdmin') : t('mensajes.emptyUser')}
          />
        ) : (
          <ul>
            {reportes.map((reporte) => (
              <li key={reporte.id}>
                <button
                  type="button"
                  className={`app-inbox-item${selectedId === reporte.id ? ' app-inbox-item--active' : ''}`}
                  onClick={() => handleSelect(reporte.id)}
                >
                  <div className="app-inbox-item-top">
                    <strong>#{reporte.id}</strong>
                    <StatusBadge tone={ESTADO_TONE[reporte.estado] || 'neutral'}>
                      {reporte.estado}
                    </StatusBadge>
                    {reporte.unread_count > 0 && (
                      <span className="app-nav-badge">{reporte.unread_count}</span>
                    )}
                  </div>
                  <p className="app-inbox-item-url">{reporte.enlace_url || `Enlace #${reporte.enlace_id}`}</p>
                  <p className="app-inbox-item-preview">
                    {reporte.ultimo_mensaje || reporte.motivo}
                  </p>
                  <span className="app-inbox-item-date">{formatDate(reporte.fecha_reporte)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="app-inbox-thread">
        {!selectedId ? (
          <div className="app-inbox-placeholder">
            <EmptyState
              icon={ChatCircle}
              title={t('mensajes.pickTitle')}
              description={t('mensajes.pickBody')}
            />
          </div>
        ) : loadingDetail ? (
          <p className="app-inbox-empty">Cargando conversación...</p>
        ) : detail ? (
          <>
            <header className="app-inbox-thread-head">
              <div>
                <h2>Reporte #{detail.id}</h2>
                <p className="app-inbox-thread-url">{detail.enlace_url || `Enlace #${detail.enlace_id}`}</p>
                {(detail.origin_type || detail.origin_message || detail.screenshot_path) && (
                  <div className="mt-3 space-y-2 text-xs text-[var(--app-text-muted)]">
                    {detail.origin_type && (
                      <p>
                        Recibido por{' '}
                        <strong className="text-[var(--app-text)]">
                          {ORIGIN_LABEL[detail.origin_type] || detail.origin_type}
                        </strong>
                      </p>
                    )}
                    {detail.origin_message && (
                      <p className="whitespace-pre-wrap rounded-lg border border-[var(--app-border)] px-3 py-2 text-[var(--app-text)]">
                        {detail.origin_message}
                      </p>
                    )}
                    {detail.screenshot_path && (
                      <a
                        href={resolveAssetUrl(detail.screenshot_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={resolveAssetUrl(detail.screenshot_path)}
                          alt="Captura adjunta al reporte"
                          className="mt-1 max-h-48 rounded-lg border border-[var(--app-border)] object-contain"
                        />
                      </a>
                    )}
                  </div>
                )}
              </div>
              {isAdmin ? (
                <select
                  value={detail.estado || 'Pendiente'}
                  disabled={updatingEstado}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="app-input w-auto px-2 py-1 text-xs font-medium"
                >
                  {REPORTE_ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge tone={ESTADO_TONE[detail.estado] || 'neutral'} size="lg">
                  {detail.estado}
                </StatusBadge>
              )}
            </header>

            <div className="app-inbox-messages">
              {detail.mensajes.map((msg) => (
                <article
                  key={msg.id}
                  className={`app-message${msg.es_admin ? ' app-message--admin' : ' app-message--user'}`}
                >
                  <div className="app-message-meta">
                    <strong>{msg.es_admin ? 'SafeLink Admin' : msg.autor_nombre || 'Vos'}</strong>
                    <span>{formatDate(msg.fecha)}</span>
                  </div>
                  <p>{msg.cuerpo}</p>
                </article>
              ))}
              <div ref={threadEndRef} />
            </div>

            {closed ? (
              <p className="app-inbox-closed">Este reporte está cerrado ({detail.estado}).</p>
            ) : (
              <form className="app-inbox-compose" onSubmit={handleSend}>
                <textarea
                  className="app-input min-h-[72px] resize-y"
                  placeholder={isAdmin ? 'Escribí tu respuesta al usuario...' : 'Escribí un mensaje al equipo...'}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  maxLength={2000}
                />
                <button type="submit" className="btn-gradient" disabled={sending || !reply.trim()}>
                  <PaperPlaneTilt size={16} weight="fill" className="inline mr-1" />
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            )}
          </>
        ) : null}
      </section>

      {error && <div className="app-alert app-alert--error app-inbox-error">{error}</div>}
    </div>
  )
}
