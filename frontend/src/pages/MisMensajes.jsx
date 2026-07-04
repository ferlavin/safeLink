import AppShell from '../components/AppShell'
import ReporteInbox from '../components/ReporteInbox'
import usePageView from '../hooks/usePageView'
import { useT } from '../i18n/I18nContext.jsx'

export default function MisMensajes() {
  usePageView('mensajes_view')
  const { t } = useT()
  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">{t('mensajes.tag')}</span>
        <h1>{t('mensajes.title')}</h1>
        <p>{t('mensajes.subtitle')}</p>
      </div>
      <ReporteInbox mode="user" />
    </AppShell>
  )
}
