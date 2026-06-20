import { Link, NavLink } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import UserOptionsMenu from './UserOptionsMenu'

const linkClass = ({ isActive }) =>
  `rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
    isActive ? 'app-nav-active' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
  }`

export default function Navbar() {
  const { isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--app-content-max)] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-tr from-neon-ice to-ocean-twilight rounded-md flex items-center justify-center">
            <ShieldCheck size={16} weight="fill" className="text-black" />
          </div>
          <span className="text-base font-bold tracking-tight">SafeLink</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5">
          <NavLink to="/dashboard" className={linkClass}>
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
          <NavLink to="/threat-map" className={linkClass}>
            Mapa
          </NavLink>
          <NavLink to="/analyze/security" className={linkClass}>
            Avanzado
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/reportes" className={linkClass}>
              Reportes
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/users" className={linkClass}>
              Usuarios
            </NavLink>
          )}

          <UserOptionsMenu />
        </nav>
      </div>
    </header>
  )
}
