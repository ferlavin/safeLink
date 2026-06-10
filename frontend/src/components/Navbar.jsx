import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const linkClass = ({ isActive }) =>
  `rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
    isActive ? 'app-nav-active' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
  }`

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
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
          <NavLink to="/threat-map" className={linkClass}>
            Mapa
          </NavLink>
          <NavLink to="/analyze/security" className={linkClass}>
            Avanzado
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Apariencia
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/users" className={linkClass}>
              Usuarios
            </NavLink>
          )}

          <ThemeToggle compact />

          <span className="hidden max-w-[140px] truncate text-xs text-[var(--app-text-muted)] lg:inline lg:max-w-[200px]">
            {user?.email}
          </span>

          <button
            onClick={handleLogout}
            className="app-btn-ghost px-2.5 py-1.5 hover:border-hot-fuchsia/40 hover:text-hot-fuchsia"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  )
}
