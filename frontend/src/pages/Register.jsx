import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES, EXPERIENCE_LEVELS } from '../constants/registration'

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
  const steps = [
    { id: 1, label: 'Cuenta' },
    { id: 2, label: 'Perfil' },
  ]

  return (
    <div className="mb-6 flex items-center justify-center gap-3">
      {steps.map((item, index) => (
        <div key={item.id} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                step >= item.id
                  ? 'bg-[var(--app-accent-muted)] text-[var(--app-accent)]'
                  : 'border border-[var(--app-border)] text-[var(--app-text-muted)]'
              }`}
            >
              {item.id}
            </span>
            <span
              className={`text-xs font-medium ${
                step >= item.id ? 'text-[var(--app-text)]' : 'text-[var(--app-text-muted)]'
              }`}
            >
              {item.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-px w-8 sm:w-12 ${
                step > item.id ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-border)]'
              }`}
            />
          )}
        </div>
      ))}
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
    <div className="app-page app-auth-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-15%] left-[-10%] w-[min(400px,70vw)] h-[min(400px,70vw)] hero-blob-left rounded-full opacity-30 animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[min(320px,55vw)] h-[min(320px,55vw)] hero-blob-right rounded-full opacity-15 animate-glow-pulse pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-2 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-neon-ice to-ocean-twilight rounded-lg flex items-center justify-center glow-neon">
              <ShieldCheck size={20} weight="fill" className="text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SafeLink</h1>
          </div>
          <p className="text-sm text-[var(--app-text-muted)]">
            {step === 1 ? 'Creá tu cuenta segura' : 'Completá tu perfil'}
          </p>
        </div>

        <StepIndicator step={step} />

        <form
          onSubmit={step === 1 ? handleNext : handleSubmit}
          className="app-card space-y-4 rounded-2xl p-6 sm:p-7"
        >
          <div>
            <h2 className="text-base font-semibold text-[var(--app-text)]">
              {step === 1 ? 'Paso 1 · Tu cuenta' : 'Paso 2 · Tu perfil'}
            </h2>
            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
              {step === 1
                ? 'Datos de acceso y aceptación de términos.'
                : 'Personalizamos alertas y contenido según tu perfil.'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-hot-fuchsia/40 bg-hot-fuchsia/10 px-3 py-2 text-sm text-hot-fuchsia">
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="app-input"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                  Contraseña
                </label>
                <input
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

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                  Confirmar contraseña
                </label>
                <input
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

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--app-border)] p-3">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => update('acceptTerms', e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--app-accent)]"
                />
                <span className="text-xs leading-relaxed text-[var(--app-text-muted)]">
                  Acepto los{' '}
                  <span className="text-[var(--app-accent)]">términos de uso</span> y la{' '}
                  <span className="text-[var(--app-accent)]">política de privacidad</span> de
                  SafeLink.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.securityAlerts}
                  onChange={(e) => update('securityAlerts', e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--app-accent)]"
                />
                <span className="text-xs leading-relaxed text-[var(--app-text-muted)]">
                  Quiero recibir alertas de seguridad y novedades de amenazas (opcional).
                </span>
              </label>

              <button
                type="submit"
                className="app-btn-primary flex w-full items-center justify-center gap-2 py-2.5 hover:brightness-110 active:scale-[0.98]"
              >
                Continuar
                <ArrowRight size={16} weight="bold" />
              </button>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    className="app-input"
                    placeholder="Tu nombre"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                    Apellido
                  </label>
                  <input
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

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  required
                  value={form.birthDate}
                  onChange={(e) => update('birthDate', e.target.value)}
                  className="app-input"
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="mt-1 text-[10px] text-[var(--app-text-muted)]">
                  Debés tener al menos 13 años.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                  País
                </label>
                <select
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

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--app-text-muted)]">
                  Experiencia en ciberseguridad{' '}
                  <span className="font-normal">(opcional)</span>
                </label>
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label
                      key={level.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                        form.experienceLevel === level.id
                          ? 'border-[var(--app-accent)] bg-[var(--app-accent-muted)]'
                          : 'border-[var(--app-border)] hover:border-[var(--app-accent)]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="experienceLevel"
                        value={level.id}
                        checked={form.experienceLevel === level.id}
                        onChange={(e) => update('experienceLevel', e.target.value)}
                        className="mt-1 accent-[var(--app-accent)]"
                      />
                      <span>
                        <span className="block text-xs font-medium text-[var(--app-text)]">
                          {level.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-[var(--app-text-muted)]">
                          {level.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleBack}
                  className="app-btn-ghost flex flex-1 items-center justify-center gap-2 py-2.5"
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="app-btn-primary flex flex-1 items-center justify-center gap-2 py-2.5 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-[var(--app-text-muted)]">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="app-link-accent hover:opacity-80">
              Iniciá sesión
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--app-text-muted)]">
          <Link to="/extension" className="app-link-accent hover:opacity-80">
            Instalar extensión para Chrome
          </Link>
        </p>
      </div>
    </div>
  )
}
