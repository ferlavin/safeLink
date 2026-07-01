import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, LockKey, ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import LandingHeader from '../components/LandingHeader'

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
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join('. '))
      } else if (typeof detail === 'string') {
        setError(detail)
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(
          'No se puede conectar al servidor. Probá https://safe-link-two.vercel.app/api/health — si falla, la API en Render no está activa (revisá el deploy en render.com).',
        )
      } else {
        setError('No se pudo iniciar sesion')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <LandingHeader showNav={false} />

      <main className="auth-main">
        <div className="landing-wrap">
          <div className="auth-split">
            <div className="auth-info">
              <span className="auth-info-tag">Acceso seguro</span>
              <h1>
                Bienvenido de vuelta a{' '}
                <span className="text-gradient">SafeLink</span>
              </h1>
              <p>
                Ingresá a tu panel de inteligencia de amenazas, revisá enlaces
                analizados y gestioná alertas de seguridad en un solo lugar.
              </p>
              <div className="auth-benefits">
                <div className="auth-benefit">
                  <div className="auth-benefit-icon">
                    <ShieldCheck size={16} weight="fill" />
                  </div>
                  Protección activa en cada sesión
                </div>
                <div className="auth-benefit">
                  <div className="auth-benefit-icon">
                    <LockKey size={16} weight="fill" />
                  </div>
                  Datos cifrados y privacidad primero
                </div>
                <div className="auth-benefit">
                  <div className="auth-benefit-icon">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  Dashboard, mapa de amenazas y herramientas Pro
                </div>
              </div>
            </div>

            <div className="auth-form-card">
              <h2>Iniciar sesión</h2>
              <p className="auth-form-subtitle">Ingresá con tu email y contraseña</p>

              <form onSubmit={handleSubmit}>
                {error && <div className="auth-error">{error}</div>}

                <div className="auth-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="app-input"
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="app-input"
                    placeholder="********"
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-gradient w-full">
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>

                <p className="auth-switch">
                  ¿No tenés cuenta? <Link to="/register">Registrate gratis</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
