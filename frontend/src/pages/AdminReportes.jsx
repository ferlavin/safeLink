import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
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
  if (estado === 'Descartado') return 'text-muted'
  if (estado === 'En revisión') return 'text-amber-400'
  return 'text-hot-fuchsia'
}

export default function AdminReportes() {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadReportes = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await client.get('/reportes')
      setReportes(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar los reportes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReportes()
  }, [])

  const handleEstadoChange = async (reporteId, estado) => {
    setUpdatingId(reporteId)
    setError('')
    try {
      await client.put(`/reportes/${reporteId}`, { estado })
      await loadReportes()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo actualizar el reporte')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">Admin</span>
        <h1>Gestión de reportes</h1>
        <p>Revisá los enlaces reportados por la comunidad y actualizá su estado.</p>
      </div>

      {error && <div className="app-alert app-alert--error">{error}</div>}

      <div className="app-table-wrap">
        <table className="app-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Enlace</th>
              <th>Motivo</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="app-table-empty">
                  Cargando...
                </td>
              </tr>
            ) : reportes.length === 0 ? (
              <tr>
                <td colSpan={6} className="app-table-empty">
                  No hay reportes
                </td>
              </tr>
            ) : (
              reportes.map((reporte) => (
                <tr key={reporte.id}>
                  <td>#{reporte.id}</td>
                  <td className="cell-main">#{reporte.enlace_id}</td>
                  <td className="max-w-xs">{reporte.motivo}</td>
                  <td>#{reporte.usuario_id}</td>
                  <td>{formatDate(reporte.fecha_reporte)}</td>
                  <td>
                    <select
                      value={reporte.estado || 'Pendiente'}
                      disabled={updatingId === reporte.id}
                      onChange={(e) => handleEstadoChange(reporte.id, e.target.value)}
                      className={`app-input w-auto px-2 py-1 text-xs font-medium ${estadoStyle(reporte.estado)}`}
                    >
                      {REPORTE_ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
