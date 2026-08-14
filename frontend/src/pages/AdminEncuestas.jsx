import { useEffect, useState } from 'react'
import { ClipboardText, Plus, Trash } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import client from '../api/client'

const emptyQuestion = () => ({
  texto: '',
  tipo: 'texto',
  opcionesText: '',
})

const emptyForm = () => ({
  titulo: '',
  activa: false,
  preguntas: [emptyQuestion()],
})

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function toPayload(form) {
  return {
    titulo: form.titulo.trim(),
    activa: form.activa,
    preguntas: form.preguntas.map((p) => ({
      texto: p.texto.trim(),
      tipo: p.tipo,
      opciones:
        p.tipo === 'opcion_multiple'
          ? p.opcionesText
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : null,
    })),
  }
}

function fromDetail(data) {
  return {
    titulo: data.titulo,
    activa: data.activa,
    preguntas: data.preguntas.map((p) => ({
      texto: p.texto,
      tipo: p.tipo,
      opcionesText: (p.opciones || []).join(', '),
    })),
  }
}

export default function AdminEncuestas() {
  const [encuestas, setEncuestas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingHasResponses, setEditingHasResponses] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(null)

  const loadEncuestas = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await client.get('/encuestas')
      setEncuestas(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar las encuestas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEncuestas()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setEditingHasResponses(false)
    setForm(emptyForm())
    setShowModal(true)
  }

  const openEdit = async (encuesta) => {
    setError('')
    try {
      const { data } = await client.get(`/encuestas/${encuesta.id}`)
      setEditingId(encuesta.id)
      setEditingHasResponses(data.respuestas_count > 0)
      setForm(fromDetail(data))
      setShowModal(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo cargar la encuesta')
    }
  }

  const updateQuestion = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((q, i) =>
        i === index ? { ...q, [field]: value } : q,
      ),
    }))
  }

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      preguntas: [...prev.preguntas, emptyQuestion()],
    }))
  }

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = toPayload(form)
      if (editingId) {
        const updatePayload = {
          titulo: payload.titulo,
          activa: payload.activa,
        }
        if (!editingHasResponses) {
          updatePayload.preguntas = payload.preguntas
        }
        await client.put(`/encuestas/${editingId}`, updatePayload)
      } else {
        await client.post('/encuestas', payload)
      }
      setShowModal(false)
      await loadEncuestas()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'No se pudo guardar la encuesta')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (encuesta) => {
    setToggleLoading(encuesta.id)
    setError('')
    try {
      await client.patch(`/encuestas/${encuesta.id}/activa`, { activa: !encuesta.activa })
      await loadEncuestas()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo cambiar el estado')
    } finally {
      setToggleLoading(null)
    }
  }

  return (
    <AppShell>
      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">Admin</span>
          <h1>
            <ClipboardText size={28} weight="fill" className="inline mr-2 text-[var(--accent-green)]" />
            Encuestas
          </h1>
          <p>Creá encuestas para recopilar feedback de los usuarios. Solo las activas son visibles.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-gradient shrink-0 text-sm px-4 py-2">
          + Nueva encuesta
        </button>
      </div>

      {error && <div className="app-alert app-alert--error mb-4">{error}</div>}

      <div className="app-table-wrap">
        <table className="app-table min-w-[720px]">
          <thead>
            <tr>
              <th>Título</th>
              <th>Estado</th>
              <th>Preguntas</th>
              <th>Respuestas</th>
              <th>Creada</th>
              <th className="text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="app-table-empty">
                  Cargando...
                </td>
              </tr>
            ) : encuestas.length === 0 ? (
              <tr>
                <td colSpan={6} className="app-table-empty">
                  No hay encuestas creadas
                </td>
              </tr>
            ) : (
              encuestas.map((encuesta) => (
                <tr key={encuesta.id}>
                  <td className="cell-main">{encuesta.titulo}</td>
                  <td>
                    <StatusBadge tone={encuesta.activa ? 'safe' : 'neutral'}>
                      {encuesta.activa ? 'Activa' : 'Inactiva'}
                    </StatusBadge>
                  </td>
                  <td>{encuesta.preguntas_count}</td>
                  <td>{encuesta.respuestas_count}</td>
                  <td>{formatDate(encuesta.fecha_creacion)}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(encuesta)}
                        className="btn-outline-gradient text-xs px-3 py-1.5"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(encuesta)}
                        disabled={toggleLoading === encuesta.id}
                        className="btn-outline-gradient text-xs px-3 py-1.5"
                      >
                        {toggleLoading === encuesta.id
                          ? '...'
                          : encuesta.activa
                            ? 'Desactivar'
                            : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="app-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="app-modal app-modal--wide"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>{editingId ? 'Editar encuesta' : 'Nueva encuesta'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm text-muted">Título</span>
                <input
                  className="app-input mt-1"
                  value={form.titulo}
                  onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                  required
                  maxLength={200}
                />
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.activa}
                  onChange={(e) => setForm((prev) => ({ ...prev, activa: e.target.checked }))}
                />
                Publicar como activa
              </label>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Preguntas</span>
                  {!editingHasResponses && (
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="btn-outline-gradient text-xs px-3 py-1.5 inline-flex items-center gap-1"
                    >
                      <Plus size={14} weight="bold" />
                      Agregar
                    </button>
                  )}
                </div>

                {editingHasResponses && (
                  <p className="app-alert app-alert--info mb-3 text-sm">
                    Esta encuesta ya tiene respuestas. Solo podés editar título y estado.
                  </p>
                )}

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {form.preguntas.map((pregunta, index) => (
                    <div key={index} className="app-section-card p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-xs text-muted">Pregunta {index + 1}</span>
                        {!editingHasResponses && form.preguntas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-rose-400 hover:text-rose-300"
                            aria-label="Eliminar pregunta"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                      <input
                        className="app-input mb-3"
                        placeholder="Texto de la pregunta"
                        value={pregunta.texto}
                        onChange={(e) => updateQuestion(index, 'texto', e.target.value)}
                        required
                        disabled={editingHasResponses}
                      />
                      <select
                        className="app-input mb-3"
                        value={pregunta.tipo}
                        onChange={(e) => updateQuestion(index, 'tipo', e.target.value)}
                        disabled={editingHasResponses}
                      >
                        <option value="texto">Respuesta libre</option>
                        <option value="opcion_multiple">Opción múltiple</option>
                      </select>
                      {pregunta.tipo === 'opcion_multiple' && (
                        <input
                          className="app-input"
                          placeholder="Opciones separadas por coma"
                          value={pregunta.opcionesText}
                          onChange={(e) => updateQuestion(index, 'opcionesText', e.target.value)}
                          required
                          disabled={editingHasResponses}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline-gradient text-sm px-4 py-2"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-gradient text-sm px-4 py-2">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
