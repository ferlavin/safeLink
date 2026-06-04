import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ full_name: fullName, email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo crear la cuenta')
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
          <p className="mt-2 text-sm text-slate-400">Crea tu cuenta</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white">Registro</h2>
          {error && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
              placeholder="Tu nombre"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
              placeholder="Minimo 6 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
          <p className="text-center text-sm text-slate-400">
            Ya tenes cuenta?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline">
              Inicia sesion
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/extension" className="text-emerald-400 hover:underline">
            Instalar extension para Chrome
          </Link>
        </p>
      </div>
    </div>
  )
}
