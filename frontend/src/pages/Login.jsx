import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-emerald-400">Safe</span>
            <span className="text-white">Link</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Inteligencia de amenazas digitales
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white">Iniciar sesion</h2>
          {error && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Contrasena</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <p className="text-center text-sm text-slate-400">
            No tenes cuenta?{' '}
            <Link to="/register" className="text-emerald-400 hover:underline">
              Registrate
            </Link>
          </p>
        </form>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center">
          <p className="text-sm text-slate-400">
            Protege tu navegacion con el semaforo SafeLink para Chrome.
          </p>
          <Link
            to="/extension"
            className="mt-2 inline-block text-sm font-medium text-emerald-400 hover:underline"
          >
            Instalar extension para Chrome →
          </Link>
        </div>
      </div>
    </div>
  )
}
