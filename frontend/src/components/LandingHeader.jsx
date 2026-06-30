import { ShieldCheck } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

export default function LandingHeader({ showNav = true }) {
  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <Link to="/" className="landing-logo">
          <div className="landing-logo-icon">
            <ShieldCheck size={18} weight="fill" className="text-black" />
          </div>
          SafeLink
        </Link>

        {showNav && (
          <nav className="landing-nav">
            <a href="/#institucion">Institución</a>
            <a href="/#servicios">Servicios</a>
            <a href="/#investigacion">Investigación</a>
            <a href="/#portal">Usuarios</a>
            <a href="/#contacto">Contacto</a>
          </nav>
        )}

        <div className="landing-header-actions">
          <Link to="/analyze" className="landing-header-link">
            Analizar
          </Link>
          <Link to="/extension" className="btn-outline-gradient">
            Extensión
          </Link>
        </div>
      </div>
    </header>
  )
}
