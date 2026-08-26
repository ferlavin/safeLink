import { NavLink } from 'react-router-dom'
import {
  ChartLine,
  ChatCircle,
  ClipboardText,
  Flag,
  LinkSimple,
  MagnifyingGlass,
  PuzzlePiece,
  Question,
  SquaresFour,
  Users,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { useUnreadReportes } from '../hooks/useUnreadReportes'
import { useT } from '../i18n/I18nContext.jsx'

function adminItems(t) {
  return [
    { to: '/dashboard', icon: SquaresFour, label: t('nav.dashboard'), end: true },
    { to: '/admin/reportes', icon: Flag, label: t('nav.reports'), badge: true },
    { to: '/admin/users', icon: Users, label: t('nav.users') },
    { to: '/admin/estadisticas', icon: ChartLine, label: t('nav.stats') },
    { to: '/admin/encuestas', icon: ClipboardText, label: t('nav.surveys') },
  ]
}

function userItems(t) {
  return [
    { to: '/dashboard', icon: SquaresFour, label: t('nav.dashboard'), end: true },
    { to: '/extension', icon: PuzzlePiece, label: t('nav.extension') },
    { to: '/analyze', icon: MagnifyingGlass, label: t('nav.analyze') },
    { to: '/enlaces', icon: LinkSimple, label: t('nav.links') },
    { to: '/mensajes', icon: ChatCircle, label: t('nav.messages'), badge: true },
    { to: '/ayuda', icon: Question, label: t('nav.help') },
  ]
}

export default function Sidebar({ onNavigate }) {
  const { isAdmin } = useAuth()
  const { t } = useT()
  const unread = useUnreadReportes()
  const items = isAdmin ? adminItems(t) : userItems(t)

  return (
    <aside className="app-sidebar" id="app-sidebar">
      <nav className="app-sidebar-nav" aria-label={t('nav.primary')}>
        {items.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
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
