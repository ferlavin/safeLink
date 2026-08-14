import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import LandingHeader from '../components/LandingHeader'
import { useAuth } from '../context/AuthContext'
import { getLandingTopic, LANDING_TOPICS } from '../constants/landingInfo'

export default function LandingInfo() {
  const { slug } = useParams()
  const { user } = useAuth()
  const topic = getLandingTopic(slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!topic) {
    return <Navigate to="/" replace />
  }

  const related = (topic.related || [])
    .map((id) => ({ id, ...LANDING_TOPICS[id] }))
    .filter((item) => item.title)

  const toolHref = topic.appHref
  const needsAuth =
    toolHref &&
    !['/extension', '/login', '/register'].includes(toolHref)
  const primaryHref = user || !needsAuth ? toolHref : '/register'
  const primaryLabel = user || !needsAuth ? topic.appLabel : 'Crear cuenta para usarlo'

  return (
    <div className="landing-page">
      <LandingHeader />

      <article className="landing-info">
        <div className="landing-wrap landing-info__inner">
          <Link to="/" className="landing-info__back">
            <ArrowLeft size={14} weight="bold" />
            Volver al inicio
          </Link>

          <span className="section-tag">{topic.tag}</span>
          <h1 className="landing-hero-title">{topic.title}</h1>
          <p className="landing-info__lead">{topic.summary}</p>

          <div className="landing-info__body">
            {topic.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {topic.how?.length > 0 && (
            <section className="landing-info__how">
              <h2>Cómo se usa</h2>
              <ol>
                {topic.how.map((step, index) => (
                  <li key={step}>
                    <span data-numeric>{String(index + 1).padStart(2, '0')}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="landing-hero-actions">
            <Link to={primaryHref} className="btn-gradient">
              {primaryLabel}
              <ArrowRight size={16} weight="bold" />
            </Link>
            {!user && primaryHref !== '/login' && (
              <Link to="/login" className="btn-outline-gradient">
                Ya tengo cuenta
              </Link>
            )}
          </div>

          {related.length > 0 && (
            <section className="landing-info__related">
              <h2>También te puede interesar</h2>
              <div className="landing-tools-grid">
                {related.map((item) => (
                  <Link key={item.id} to={`/info/${item.id}`} className="landing-tool-link">
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  )
}
