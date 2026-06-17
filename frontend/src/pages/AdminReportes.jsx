import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
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
  if (estado === 'Resuelto') return 'bg-emerald-500/15 text-emerald-400'
  if (estado === 'Descartado') return 'bg-slate-500/15 text-slate-400'
  if (estado === 'En revisión') return 'bg-amber-500/15 text-amber-400'
  return 'bg-rose-500/15 text-rose-400'
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
    <div className="app-page relative">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="landing-section-title font-semibold text-white">
            Gestión de reportes
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Revisá los enlaces reportados por la comunidad y actualizá su estado.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-hot-fuchsia/40 bg-hot-fuchsia/10 px-3 py-2 text-sm text-hot-fuchsia">
            {error}
          </div>
        )}

        <div className="app-card overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--app-border)] text-white/45">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Enlace</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                    Cargando...
                  </td>
                </tr>
              ) : reportes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                    No hay reportes
                  </td>
                </tr>
              ) : (
                reportes.map((reporte) => (
                  <tr
                    key={reporte.id}
                    className="border-b border-[var(--app-border)] last:border-0"
                  >
                    <td className="px-4 py-3 text-white/70">#{reporte.id}</td>
                    <td className="px-4 py-3 text-white">#{reporte.enlace_id}</td>
                    <td className="max-w-xs px-4 py-3 text-white/70">{reporte.motivo}</td>
                    <td className="px-4 py-3 text-white/70">#{reporte.usuario_id}</td>
                    <td className="px-4 py-3 text-white/45">
                      {formatDate(reporte.fecha_reporte)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={reporte.estado || 'Pendiente'}
                        disabled={updatingId === reporte.id}
                        onChange={(e) => handleEstadoChange(reporte.id, e.target.value)}
                        className={`rounded-lg border border-[var(--app-border)] bg-[var(--app-input-bg)] px-2 py-1 text-xs font-medium outline-none focus:border-neon-ice/50 ${estadoStyle(reporte.estado)}`}
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
      </main>
    </div>
  )
}
