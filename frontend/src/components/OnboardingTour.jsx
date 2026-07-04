import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ArrowRight, ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { usePreferences } from '../context/PreferencesContext'
import { useT } from '../i18n/I18nContext.jsx'

const STEP_META = [
  { titleKey: 'onboarding.s1Title', bodyKey: 'onboarding.s1Body' },
  {
    titleKey: 'onboarding.s2Title',
    bodyKey: 'onboarding.s2Body',
    link: '/analyze',
    linkKey: 'onboarding.s2Link',
  },
  {
    titleKey: 'onboarding.s3Title',
    bodyKey: 'onboarding.s3Body',
    link: '/enlaces',
    linkKey: 'onboarding.s3Link',
  },
  {
    titleKey: 'onboarding.s4Title',
    bodyKey: 'onboarding.s4Body',
    link: '/mensajes',
    linkKey: 'onboarding.s4Link',
  },
  {
    titleKey: 'onboarding.s5Title',
    bodyKey: 'onboarding.s5Body',
    link: '/extension',
    linkKey: 'onboarding.s5Link',
  },
]

export default function OnboardingTour({ open, onClose }) {
  const [step, setStep] = useState(0)
  const { completeTutorial } = usePreferences()
  const { t } = useT()
  const steps = useMemo(
    () =>
      STEP_META.map((meta) => ({
        title: t(meta.titleKey),
        body: t(meta.bodyKey),
        link: meta.link,
        linkLabel: meta.linkKey ? t(meta.linkKey) : null,
      })),
    [t],
  )

  if (!open) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

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
        <button
          type="button"
          className="app-tour-close"
          onClick={handleSkip}
          aria-label={t('onboarding.close')}
        >
          <X size={18} />
        </button>

        <span className="section-tag">{t('onboarding.tag')}</span>
        <p className="app-tour-progress">
          {t('onboarding.stepOf', { current: step + 1, total: steps.length })}
        </p>
        <h2 id="tour-title">{current.title}</h2>
        <p className="app-tour-body">{current.body}</p>

        {current.link && (
          <Link to={current.link} className="app-link-accent text-sm" onClick={handleSkip}>
            {current.linkLabel} →
          </Link>
        )}

        <div className="app-tour-dots">
          {steps.map((_, i) => (
            <span key={i} className={i === step ? 'active' : ''} />
          ))}
        </div>

        <div className="app-tour-actions">
          {step > 0 ? (
            <button type="button" className="btn-outline-gradient text-sm" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={14} className="inline mr-1" />
              {t('common.previous')}
            </button>
          ) : (
            <button type="button" className="btn-outline-gradient text-sm" onClick={handleSkip}>
              {t('common.skip')}
            </button>
          )}
          <button type="button" className="btn-gradient text-sm" onClick={handleNext}>
            {isLast ? (
              <>
                <CheckCircle size={14} weight="fill" className="inline mr-1" />
                {t('common.done')}
              </>
            ) : (
              <>
                {t('common.next')}
                <ArrowRight size={14} className="inline ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
