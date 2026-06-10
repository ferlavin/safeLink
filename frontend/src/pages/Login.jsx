import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-page app-auth-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-15%] left-[-10%] w-[min(400px,70vw)] h-[min(400px,70vw)] hero-blob-left rounded-full opacity-30 animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[min(320px,55vw)] h-[min(320px,55vw)] hero-blob-right rounded-full opacity-15 animate-glow-pulse pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-neon-ice to-ocean-twilight rounded-lg flex items-center justify-center glow-neon">
              <ShieldCheck size={20} weight="fill" className="text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SafeLink</h1>
          </div>
          <p className="text-sm text-white/45">Inteligencia de amenazas digitales</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="app-card space-y-4 rounded-2xl p-6 sm:p-7"
        >
          <h2 className="text-base font-semibold text-white">Iniciar sesión</h2>
          {error && (
            <div className="rounded-lg border border-hot-fuchsia/40 bg-hot-fuchsia/10 px-3 py-2 text-sm text-hot-fuchsia">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/55">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/55">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="app-input"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary w-full py-2.5 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <p className="text-center text-xs text-white/45">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="app-link-accent hover:opacity-80">
              Registrate
            </Link>
          </p>
        </form>

        <div className="app-card mt-4 rounded-xl p-4 text-center">
          <p className="text-xs leading-relaxed text-white/45">
            Protegé tu navegación con el semáforo SafeLink para Chrome.
          </p>
          <Link
            to="/extension"
            className="app-link-accent mt-2 inline-block text-xs font-medium hover:opacity-80"
          >
            Instalar extensión para Chrome →
          </Link>
        </div>
      </div>
    </div>
  )
}
