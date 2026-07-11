import { Link, NavLink } from 'react-router-dom'
import { ShieldCheck, Question } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { useUnreadReportes } from '../hooks/useUnreadReportes'
import { useT } from '../i18n/I18nContext.jsx'
import UserOptionsMenu from './UserOptionsMenu'

const linkClass = ({ isActive }) =>
  `app-nav-link${isActive ? ' app-nav-link--active' : ''}`

export default function Navbar() {
  const { isAdmin } = useAuth()
  const { prefs } = usePreferences()
  const { t } = useT()
  const unread = useUnreadReportes()
  const simple = prefs.modo_simple

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link to="/dashboard" className="landing-logo">
          <div className="landing-logo-icon">
            <ShieldCheck size={16} weight="fill" className="text-black" />
          </div>
          SafeLink
        </Link>

        <nav className="app-navbar-nav">
          {isAdmin ? (
            <>
              <NavLink to="/dashboard" className={linkClass} end>
                {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/threat-map" className={linkClass}>
                {t('nav.map')}
              </NavLink>
              <NavLink to="/analyze/security" className={`${linkClass} app-nav-advanced`}>
                {t('nav.advanced')}
              </NavLink>
              <NavLink to="/admin/reportes" className={linkClass}>
                {t('nav.reports')}
                {unread > 0 && <span className="app-nav-badge">{unread > 9 ? '9+' : unread}</span>}
              </NavLink>
              <NavLink to="/admin/encuestas" className={linkClass}>
                {t('nav.surveys')}
              </NavLink>
              <NavLink to="/admin/estadisticas" className={linkClass}>
                {t('nav.stats')}
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                {t('nav.users')}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={linkClass} end>
                {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/extension" className={linkClass}>
                {t('nav.extension')}
              </NavLink>
              <NavLink to="/analyze" className={linkClass}>
                {simple ? t('nav.analyze') : t('nav.url')}
              </NavLink>
              <NavLink to="/enlaces" className={linkClass}>
                {t('nav.links')}
              </NavLink>
              <NavLink to="/encuestas" className={linkClass}>
                {t('nav.surveys')}
              </NavLink>
              <NavLink to="/mensajes" className={linkClass}>
                {t('nav.messages')}
                {unread > 0 && <span className="app-nav-badge">{unread > 9 ? '9+' : unread}</span>}
              </NavLink>
              {!simple && (
                <NavLink to="/threat-map" className={linkClass}>
                  {t('nav.map')}
                </NavLink>
              )}
              {!simple && (
                <NavLink to="/analyze/security" className={`${linkClass} app-nav-advanced`}>
                  {t('nav.advanced')}
                </NavLink>
              )}
              <NavLink to="/ayuda" className={linkClass}>
                <Question size={14} weight="fill" className="inline mr-0.5" />
                {t('nav.help')}
              </NavLink>
            </>
          )}
        </nav>

        <div className="app-navbar-actions">
          <UserOptionsMenu />
        </div>
      </div>
    </header>
  )
}
