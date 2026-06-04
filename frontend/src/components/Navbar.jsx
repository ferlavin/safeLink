import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 transition ${
    isActive
      ? 'bg-emerald-500/10 text-emerald-400'
      : 'text-slate-300 hover:text-white'
  }`

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-1 text-xl font-bold">
          <span className="text-emerald-400">Safe</span>
          <span className="text-white">Link</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/extension" className={linkClass}>
            Extension
          </NavLink>
          <NavLink to="/analyze" className={linkClass}>
            URL
          </NavLink>
          <NavLink to="/threat-map" className={linkClass}>
            Mapa
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/users" className={linkClass}>
              Usuarios
            </NavLink>
          )}
          <span className="mx-2 hidden text-slate-500 sm:inline">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-rose-500 hover:text-rose-400"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  )
}
