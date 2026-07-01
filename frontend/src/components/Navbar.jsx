import { Link, NavLink } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { useUnreadReportes } from '../hooks/useUnreadReportes'
import UserOptionsMenu from './UserOptionsMenu'

const linkClass = ({ isActive }) =>
  `app-nav-link${isActive ? ' app-nav-link--active' : ''}`

export default function Navbar() {
  const { isAdmin } = useAuth()
  const unread = useUnreadReportes()

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
          <NavLink to="/dashboard" className={linkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/extension" className={linkClass}>
            Extensión
          </NavLink>
          <NavLink to="/analyze" className={linkClass}>
            URL
          </NavLink>
          <NavLink to="/enlaces" className={linkClass}>
            Enlaces
          </NavLink>
          {!isAdmin && (
            <NavLink to="/mensajes" className={linkClass}>
              Mensajes
              {unread > 0 && <span className="app-nav-badge">{unread > 9 ? '9+' : unread}</span>}
            </NavLink>
          )}
          <NavLink to="/threat-map" className={linkClass}>
            Mapa
          </NavLink>
          <NavLink to="/analyze/security" className={linkClass}>
            Avanzado
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/reportes" className={linkClass}>
              Reportes
              {unread > 0 && <span className="app-nav-badge">{unread > 9 ? '9+' : unread}</span>}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/users" className={linkClass}>
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="app-navbar-actions">
          <UserOptionsMenu />
        </div>
      </div>
    </header>
  )
}
