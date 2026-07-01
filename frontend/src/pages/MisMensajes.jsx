import AppShell from '../components/AppShell'
import ReporteInbox from '../components/ReporteInbox'

export default function MisMensajes() {
  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">Mensajes</span>
        <h1>Bandeja de reportes</h1>
        <p>
          Seguí el estado de tus reportes y chateá con el equipo SafeLink cuando necesites
          más ayuda.
        </p>
      </div>
      <ReporteInbox mode="user" />
    </AppShell>
  )
}
