import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ArrowRight, ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { ONBOARDING_STEPS } from '../constants/onboarding'
import { usePreferences } from '../context/PreferencesContext'

export default function OnboardingTour({ open, onClose }) {
  const [step, setStep] = useState(0)
  const { completeTutorial } = usePreferences()

  if (!open) return null

  const current = ONBOARDING_STEPS[step]
  const isLast = step === ONBOARDING_STEPS.length - 1

  const finish = async () => {
    await completeTutorial()
    onClose()
  }

  const handleNext = async () => {
    if (isLast) {
      await finish()
      return
    }
    setStep((s) => s + 1)
  }

  const handleSkip = async () => {
    await completeTutorial()
    onClose()
  }

  return (
    <div className="app-tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="app-tour-card">
        <button type="button" className="app-tour-close" onClick={handleSkip} aria-label="Cerrar tutorial">
          <X size={18} />
        </button>

        <span className="section-tag">Guía rápida</span>
        <p className="app-tour-progress">
          Paso {step + 1} de {ONBOARDING_STEPS.length}
        </p>
        <h2 id="tour-title">{current.title}</h2>
        <p className="app-tour-body">{current.body}</p>

        {current.link && (
          <Link to={current.link} className="app-link-accent text-sm" onClick={handleSkip}>
            {current.linkLabel} →
          </Link>
        )}

        <div className="app-tour-dots">
          {ONBOARDING_STEPS.map((_, i) => (
            <span key={i} className={i === step ? 'active' : ''} />
          ))}
        </div>

        <div className="app-tour-actions">
          {step > 0 ? (
            <button type="button" className="btn-outline-gradient text-sm" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={14} className="inline mr-1" />
              Anterior
            </button>
          ) : (
            <button type="button" className="btn-outline-gradient text-sm" onClick={handleSkip}>
              Omitir
            </button>
          )}
          <button type="button" className="btn-gradient text-sm" onClick={handleNext}>
            {isLast ? (
              <>
                <CheckCircle size={14} weight="fill" className="inline mr-1" />
                Listo
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight size={14} className="inline ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
