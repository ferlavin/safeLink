import AppShell from '../components/AppShell'
import ReporteInbox from '../components/ReporteInbox'

export default function AdminReportes() {
  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">Admin</span>
        <h1>Gestión de reportes</h1>
        <p>Respondé a los usuarios, actualizá el estado y cerrá casos resueltos.</p>
      </div>
      <ReporteInbox mode="admin" />
    </AppShell>
  )
}
