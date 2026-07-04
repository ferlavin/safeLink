import { usePreferences } from '../context/PreferencesContext'
import { useT } from '../i18n/I18nContext.jsx'

const OPTIONS = [
  { value: 'es', labelKey: 'settings.languageEs' },
  { value: 'en', labelKey: 'settings.languageEn' },
]

export default function LanguageSelect({ compact = false }) {
  const { t } = useT()
  const { prefs, setLocale, savingLocale } = usePreferences()

  return (
    <div className={compact ? 'flex flex-wrap gap-1' : 'flex flex-wrap gap-2'}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={savingLocale}
          onClick={() => setLocale(option.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            prefs.idioma === option.value
              ? 'bg-[var(--app-accent-muted)] text-[var(--app-accent)]'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  )
}
