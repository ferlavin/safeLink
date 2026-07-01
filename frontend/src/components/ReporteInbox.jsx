import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import client from '../api/client'
import { REPORTE_ESTADOS } from '../constants/labels'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const estadoStyle = (estado) => {
  if (estado === 'Resuelto') return 'text-neon-ice'
  if (estado === 'Respondido') return 'text-neon-ice'
  if (estado === 'Descartado') return 'text-muted'
  if (estado === 'En revisión') return 'text-amber-400'
  return 'text-hot-fuchsia'
}

export default function ReporteInbox({ mode = 'user' }) {
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
          <p className="app-inbox-empty">
            {isAdmin
              ? 'No hay reportes todavía.'
              : 'Todavía no enviaste reportes. Podés hacerlo desde Mis enlaces.'}
          </p>
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
                    <span className={estadoStyle(reporte.estado)}>{reporte.estado}</span>
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
            <ChatCircle size={48} weight="duotone" className="text-muted opacity-40" />
            <p>Elegí un reporte para ver la conversación</p>
          </div>
        ) : loadingDetail ? (
          <p className="app-inbox-empty">Cargando conversación...</p>
        ) : detail ? (
          <>
            <header className="app-inbox-thread-head">
              <div>
                <h2>Reporte #{detail.id}</h2>
                <p className="app-inbox-thread-url">{detail.enlace_url || `Enlace #${detail.enlace_id}`}</p>
              </div>
              {isAdmin ? (
                <select
                  value={detail.estado || 'Pendiente'}
                  disabled={updatingEstado}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className={`app-input w-auto px-2 py-1 text-xs font-medium ${estadoStyle(detail.estado)}`}
                >
                  {REPORTE_ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`text-sm font-semibold ${estadoStyle(detail.estado)}`}>
                  {detail.estado}
                </span>
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
                <button type="submit" className="btn-gradient text-sm" disabled={sending || !reply.trim()}>
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
