import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useT } from '../i18n/I18nContext.jsx'

export default function AntiPhishingBanner() {
  const { t } = useT()
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let active = true
    client
      .get('/users/me/anti-phishing-word')
      .then(({ data }) => {
        if (active) setMissing(!data?.word)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  if (!missing) return null

  return (
    <div className="app-alert app-alert--info mb-6">
      {t('dashboard.antiPhishingBanner')}{' '}
      <Link to="/settings#anti-phishing" className="font-semibold text-[var(--mint-400)]">
        {t('dashboard.antiPhishingLink')}
      </Link>
    </div>
  )
}
