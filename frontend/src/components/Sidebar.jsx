import { NavLink } from 'react-router-dom'
import {
  ChartLine,
  ChatCircle,
  ClipboardText,
  Flag,
  Globe,
  LinkSimple,
  MagnifyingGlass,
  PuzzlePiece,
  Question,
  SlidersHorizontal,
  SquaresFour,
  Users,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { useUnreadReportes } from '../hooks/useUnreadReportes'
import { useT } from '../i18n/I18nContext.jsx'

function adminItems(t) {
  return [
    { to: '/dashboard', icon: SquaresFour, label: t('nav.dashboard'), end: true },
    { to: '/threat-map', icon: Globe, label: t('nav.map') },
    { to: '/analyze/security', icon: SlidersHorizontal, label: t('nav.advanced') },
    { to: '/admin/reportes', icon: Flag, label: t('nav.reports'), badge: true },
    { to: '/admin/encuestas', icon: ClipboardText, label: t('nav.surveys') },
    { to: '/admin/estadisticas', icon: ChartLine, label: t('nav.stats') },
    { to: '/admin/users', icon: Users, label: t('nav.users') },
  ]
}

function userItems(t, simple) {
  const items = [
    { to: '/dashboard', icon: SquaresFour, label: t('nav.dashboard'), end: true },
    { to: '/extension', icon: PuzzlePiece, label: t('nav.extension') },
    { to: '/analyze', icon: MagnifyingGlass, label: simple ? t('nav.analyze') : t('nav.url') },
    { to: '/enlaces', icon: LinkSimple, label: t('nav.links') },
    { to: '/encuestas', icon: ClipboardText, label: t('nav.surveys') },
    { to: '/mensajes', icon: ChatCircle, label: t('nav.messages'), badge: true },
  ]

  if (!simple) {
    items.push({ to: '/threat-map', icon: Globe, label: t('nav.map') })
    items.push({ to: '/analyze/security', icon: SlidersHorizontal, label: t('nav.advanced') })
  }

  items.push({ to: '/ayuda', icon: Question, label: t('nav.help') })
  return items
}

export default function Sidebar({ onNavigate }) {
  const { isAdmin } = useAuth()
  const { prefs } = usePreferences()
  const { t } = useT()
  const unread = useUnreadReportes()
  const items = isAdmin ? adminItems(t) : userItems(t, prefs.modo_simple)

  return (
    <aside className="app-sidebar" id="app-sidebar">
      <nav className="app-sidebar-nav" aria-label={t('nav.primary')}>
        {items.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            // Con la barra colapsada el texto se oculta y el tooltip es la unica pista.
            title={label}
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
            }
          >
            <Icon size={18} className="app-nav-link__icon" />
            <span className="app-nav-link__label">{label}</span>
            {badge && unread > 0 && (
              <span className="app-nav-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
