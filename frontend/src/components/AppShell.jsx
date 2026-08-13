import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { List, ShieldCheck } from '@phosphor-icons/react'
import LandingHeader from './LandingHeader'
import Sidebar from './Sidebar'
import UserOptionsMenu from './UserOptionsMenu'
import { useT } from '../i18n/I18nContext.jsx'

const COLLAPSED_KEY = 'safelink_nav_collapsed'
const MOBILE_QUERY = '(max-width: 900px)'

export default function AppShell({ children, guest = false }) {
  const { t } = useT()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === 'true',
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed))
  }, [collapsed])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    if (!mobileOpen) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') closeMobile()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen, closeMobile])

  if (guest) {
    return (
      <div className="app-shell">
        <div className="app-shell-bg" aria-hidden="true" />
        <LandingHeader showNav={false} />
        <main className="app-main">{children}</main>
      </div>
    )
  }

  // En escritorio la barra se reduce a iconos; en pantallas chicas no hay lugar
  // para un riel, asi que el mismo boton la abre como panel flotante.
  const toggleNav = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMobileOpen((prev) => !prev)
    } else {
      setCollapsed((prev) => !prev)
    }
  }

  return (
    <div
      className="app-shell"
      data-nav-collapsed={collapsed ? 'true' : 'false'}
      data-nav-open={mobileOpen ? 'true' : 'false'}
    >
      <div className="app-shell-bg" aria-hidden="true" />

      <header className="app-topbar">
        <button
          type="button"
          className="app-nav-toggle"
          onClick={toggleNav}
          aria-label={t('nav.toggle')}
          aria-controls="app-sidebar"
        >
          <List size={18} weight="bold" />
        </button>

        <Link to="/dashboard" className="landing-logo">
          <span className="landing-logo-icon">
            <ShieldCheck size={16} weight="fill" className="text-black" />
          </span>
          SafeLink
        </Link>

        <div className="app-topbar-actions">
          <UserOptionsMenu />
        </div>
      </header>

      <div className="app-layout">
        <Sidebar onNavigate={closeMobile} />
        <main className="app-main">{children}</main>
      </div>

      <button
        type="button"
        className="app-nav-backdrop"
        onClick={closeMobile}
        aria-label={t('common.close')}
        tabIndex={mobileOpen ? 0 : -1}
      />
    </div>
  )
}
