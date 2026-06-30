import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, LockKey, ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES, EXPERIENCE_LEVELS } from '../constants/registration'
import LandingHeader from '../components/LandingHeader'

const initialForm = {
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  securityAlerts: true,
  firstName: '',
  lastName: '',
  birthDate: '',
  country: 'AR',
  experienceLevel: '',
}

function parseApiError(err) {
  const detail = err.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join('. ')
  }
  if (typeof detail === 'string') {
    return detail
  }
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'No se puede conectar al servidor. Verificá que el backend esté corriendo.'
  }
  return 'No se pudo crear la cuenta'
}

function StepIndicator({ step }) {
  return (
    <div className="auth-steps">
      <div className={`auth-step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
      <div className={`auth-step-line ${step > 1 ? 'active' : ''}`} />
      <div className={`auth-step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const validateStep1 = () => {
    if (!form.email.trim()) return 'Ingresá tu email'
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden'
    if (!form.acceptTerms) return 'Debés aceptar los términos y la política de privacidad'
    return null
  }

  const validateStep2 = () => {
    if (!form.firstName.trim()) return 'Ingresá tu nombre'
    if (!form.lastName.trim()) return 'Ingresá tu apellido'
    if (!form.birthDate) return 'Ingresá tu fecha de nacimiento'
    if (!form.country) return 'Seleccioná tu país'

    const born = new Date(form.birthDate)
    const today = new Date()
    if (born > today) return 'La fecha de nacimiento no puede ser futura'

    let age = today.getFullYear() - born.getFullYear()
    const monthDiff = today.getMonth() - born.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
      age -= 1
    }
    if (age < 13) return 'Debés tener al menos 13 años para registrarte'

    return null
  }

  const handleNext = (event) => {
    event.preventDefault()
    setError('')
    const validationError = validateStep1()
    if (validationError) {
      setError(validationError)
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setError('')
    setStep(1)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const validationError = validateStep2()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const selectedCountry = COUNTRIES.find((c) => c.code === form.country)
      await register({
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        birth_date: form.birthDate,
        country: selectedCountry?.label || form.country,
        experience_level: form.experienceLevel || null,
        accept_terms: form.acceptTerms,
        security_alerts: form.securityAlerts,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(parseApiError(err))
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
              <span className="auth-info-tag">Nueva cuenta</span>
              <h1>
                Unite a la red de defensa{' '}
                <span className="text-gradient">SafeLink</span>
              </h1>
              <p>
                Creá tu cuenta en dos pasos y accedé al semáforo de seguridad, análisis
                de enlaces, mapa de amenazas y alertas personalizadas.
              </p>
              <div className="auth-benefits">
                <div className="auth-benefit">
                  <div className="auth-benefit-icon">
                    <ShieldCheck size={16} weight="fill" />
                  </div>
                  Registro rápido y seguro
                </div>
                <div className="auth-benefit">
                  <div className="auth-benefit-icon">
                    <LockKey size={16} weight="fill" />
                  </div>
                  Perfil personalizado según tu experiencia
                </div>
                <div className="auth-benefit">
                  <div className="auth-benefit-icon">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  Alertas de amenazas opcionales por email
                </div>
              </div>
            </div>

            <div className="auth-form-card">
              <StepIndicator step={step} />
              <h2>{step === 1 ? 'Paso 1 · Tu cuenta' : 'Paso 2 · Tu perfil'}</h2>
              <p className="auth-form-subtitle">
                {step === 1
                  ? 'Datos de acceso y aceptación de términos.'
                  : 'Personalizamos alertas y contenido según tu perfil.'}
              </p>

              <form onSubmit={step === 1 ? handleNext : handleSubmit}>
                {error && <div className="auth-error">{error}</div>}

                {step === 1 ? (
                  <>
                    <div className="auth-field">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
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
                        minLength={6}
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        className="app-input"
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="confirmPassword">Confirmar contraseña</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        className="app-input"
                        placeholder="Repetí tu contraseña"
                        autoComplete="new-password"
                      />
                    </div>

                    <label className="auth-checkbox">
                      <input
                        type="checkbox"
                        checked={form.acceptTerms}
                        onChange={(e) => update('acceptTerms', e.target.checked)}
                      />
                      <span>
                        Acepto los términos de uso y la política de privacidad de
                        SafeLink.
                      </span>
                    </label>

                    <label className="auth-checkbox">
                      <input
                        type="checkbox"
                        checked={form.securityAlerts}
                        onChange={(e) => update('securityAlerts', e.target.checked)}
                      />
                      <span>
                        Quiero recibir alertas de seguridad y novedades de amenazas
                        (opcional).
                      </span>
                    </label>

                    <button type="submit" className="btn-gradient w-full flex items-center justify-center gap-2">
                      Continuar
                      <ArrowRight size={16} weight="bold" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="auth-field">
                        <label htmlFor="firstName">Nombre</label>
                        <input
                          id="firstName"
                          type="text"
                          required
                          value={form.firstName}
                          onChange={(e) => update('firstName', e.target.value)}
                          className="app-input"
                          placeholder="Tu nombre"
                          autoComplete="given-name"
                        />
                      </div>
                      <div className="auth-field">
                        <label htmlFor="lastName">Apellido</label>
                        <input
                          id="lastName"
                          type="text"
                          required
                          value={form.lastName}
                          onChange={(e) => update('lastName', e.target.value)}
                          className="app-input"
                          placeholder="Tu apellido"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="birthDate">Fecha de nacimiento</label>
                      <input
                        id="birthDate"
                        type="date"
                        required
                        value={form.birthDate}
                        onChange={(e) => update('birthDate', e.target.value)}
                        className="app-input"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="country">País</label>
                      <select
                        id="country"
                        required
                        value={form.country}
                        onChange={(e) => update('country', e.target.value)}
                        className="app-input"
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="auth-field">
                      <label>
                        Experiencia en ciberseguridad{' '}
                        <span className="font-normal">(opcional)</span>
                      </label>
                      <div className="space-y-2">
                        {EXPERIENCE_LEVELS.map((level) => (
                          <label
                            key={level.id}
                            className={`auth-checkbox ${
                              form.experienceLevel === level.id
                                ? 'border-[var(--accent-green)] bg-[rgba(0,255,135,0.06)]'
                                : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="experienceLevel"
                              value={level.id}
                              checked={form.experienceLevel === level.id}
                              onChange={(e) => update('experienceLevel', e.target.value)}
                            />
                            <span>
                              <strong className="block text-[var(--text-main)]">
                                {level.label}
                              </strong>
                              {level.hint}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="auth-form-actions">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="btn-outline-gradient flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={16} />
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-gradient flex items-center justify-center gap-2"
                      >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                      </button>
                    </div>
                  </>
                )}

                <p className="auth-switch">
                  ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
