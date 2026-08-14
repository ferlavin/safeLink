import { useEffect, useState } from 'react'
import { CheckCircle, ClipboardText } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import client from '../api/client'
import usePageView from '../hooks/usePageView'
import { useT } from '../i18n/I18nContext.jsx'

function formatDate(value, locale) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(locale, { dateStyle: 'medium' })
}

export default function Encuestas() {
  const { t, dateLocale } = useT()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  usePageView('encuestas_view')

  const loadList = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await client.get('/encuestas/activas')
      setList(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar las encuestas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const openSurvey = async (encuesta) => {
    if (encuesta.ya_respondida) {
      setSelectedId(encuesta.id)
      setDetail(null)
      setAnswers({})
      return
    }
    setError('')
    setSuccessMsg('')
    setSelectedId(encuesta.id)
    try {
      const { data } = await client.get(`/encuestas/${encuesta.id}`)
      setDetail(data)
      setAnswers({})
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo abrir la encuesta')
      setSelectedId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!detail) return
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        respuestas: detail.preguntas.map((p) => ({
          pregunta_id: p.id,
          valor: answers[p.id] || '',
        })),
      }
      await client.post(`/encuestas/${detail.id}/respuestas`, payload)
      setSuccessMsg(t('common.thanks'))
      setDetail(null)
      setSelectedId(null)
      setAnswers({})
      await loadList()
    } catch (err) {
      const detailErr = err.response?.data?.detail
      setError(typeof detailErr === 'string' ? detailErr : 'No se pudo enviar la respuesta')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedMeta = list.find((item) => item.id === selectedId)

  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">{t('encuestas.tag')}</span>
        <h1>{t('encuestas.title')}</h1>
        <p>{t('encuestas.subtitle')}</p>
      </div>

      {error && <div className="app-alert app-alert--error mb-4">{error}</div>}
      {successMsg && (
        <div className="app-alert app-alert--success mb-4 flex items-center gap-2">
          <CheckCircle size={18} weight="fill" />
          {successMsg}
        </div>
      )}

      {loading ? (
        <p className="text-muted">{t('encuestas.loading')}</p>
      ) : list.length === 0 ? (
        <div className="app-section-card">
          <EmptyState
            icon={ClipboardText}
            title={t('encuestas.emptyTitle')}
            description={t('encuestas.emptyBody')}
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="space-y-2">
            {list.map((encuesta) => (
              <button
                key={encuesta.id}
                type="button"
                onClick={() => openSurvey(encuesta)}
                className={`app-tool-card w-full p-4 text-left transition ${
                  selectedId === encuesta.id ? 'ring-1 ring-[rgba(0,255,135,0.35)]' : ''
                }`}
              >
                <h2 className="text-sm font-semibold">{encuesta.titulo}</h2>
                <p className="mt-1 text-xs text-muted">
                  {encuesta.preguntas_count}{' '}
                  {encuesta.preguntas_count === 1 ? t('encuestas.question') : t('encuestas.questions')}
                  {encuesta.fecha_creacion ? ` · ${formatDate(encuesta.fecha_creacion, dateLocale)}` : ''}
                </p>
                {encuesta.ya_respondida && (
                  <span className="mt-2 inline-block">
                    <StatusBadge tone="safe">{t('common.yesAnswered')}</StatusBadge>
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className={`app-section-card ${selectedId ? 'p-5 sm:p-6' : ''}`}>
            {!selectedId ? (
              <EmptyState
                compact
                icon={ClipboardText}
                title={t('encuestas.selectTitle')}
                description={t('encuestas.selectBody')}
              />
            ) : selectedMeta?.ya_respondida ? (
              <div>
                <span className="sl-icon sl-icon--sm sl-icon--safe mb-4">
                  <CheckCircle size={16} weight="bold" />
                </span>
                <h2>{selectedMeta.titulo}</h2>
                <p className="mt-3 text-sm text-muted">{t('encuestas.alreadyAnsweredTitle')}</p>
              </div>
            ) : detail ? (
              <form onSubmit={handleSubmit}>
                <h2 className="text-base font-semibold">{detail.titulo}</h2>
                <div className="mt-5 space-y-5">
                  {detail.preguntas.map((pregunta, index) => (
                    <div key={pregunta.id}>
                      <label className="block text-sm font-medium mb-2">
                        {index + 1}. {pregunta.texto}
                      </label>
                      {pregunta.tipo === 'opcion_multiple' ? (
                        <div className="space-y-2">
                          {(pregunta.opciones || []).map((opcion) => (
                            <label key={opcion} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={`pregunta-${pregunta.id}`}
                                value={opcion}
                                checked={answers[pregunta.id] === opcion}
                                onChange={() =>
                                  setAnswers((prev) => ({ ...prev, [pregunta.id]: opcion }))
                                }
                                required
                              />
                              {opcion}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          className="app-input min-h-[96px]"
                          value={answers[pregunta.id] || ''}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [pregunta.id]: e.target.value }))
                          }
                          required
                          maxLength={2000}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gradient mt-6"
                >
                  {submitting ? t('common.sending') : t('encuestas.submit')}
                </button>
              </form>
            ) : (
              <p className="text-muted">{t('encuestas.loadDetail')}</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
