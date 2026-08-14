import {
  ShieldCheck,
  Globe,
  Users,
  MagnifyingGlass,
  PuzzlePiece,
  SignIn,
  EnvelopeSimple,
  ChatCircle,
  Headset,
  MapPin,
  TwitterLogo,
  GithubLogo,
  LinkedinLogo,
  ArrowRight,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import LandingHeader from '../components/LandingHeader'
import WorldDotMap from '../components/WorldDotMap'
import StatusBadge from '../components/StatusBadge'

const HERO_THREATS = [
  { x: 22, y: 38, level: 'critico', size: 12 },
  { x: 48, y: 42, level: 'alto', size: 10 },
  { x: 72, y: 36, level: 'medio', size: 11 },
  { x: 82, y: 58, level: 'bajo', size: 8 },
  { x: 28, y: 62, level: 'alto', size: 9 },
]

const PILLARS = [
  {
    icon: MagnifyingGlass,
    title: 'Análisis integral',
    desc: 'Más de 10 módulos de detección para cubrir cada tipo de amenaza en la web.',
  },
  {
    icon: Globe,
    title: 'Infraestructura',
    desc: 'Motor liviano, mapa de alertas de la comunidad y panel con historial de enlaces analizados.',
  },
  {
    icon: Users,
    title: 'El equipo',
    desc: 'Comunidad activa de usuarios que comparte detecciones para proteger a todos.',
  },
  {
    icon: ShieldCheck,
    title: 'Protección 24/7',
    desc: 'La extensión vigila cada clic y Google Search antes de que entres a un sitio.',
  },
]

const QUICK_SERVICES = [
  { icon: MagnifyingGlass, title: 'Analizar URL', hint: 'Revisión instantánea', to: '/analyze' },
  { icon: PuzzlePiece, title: 'Extensión Chrome', hint: 'Semáforo en el navegador', to: '/extension' },
  { icon: SignIn, title: 'Portal SafeLink', hint: 'Dashboard y historial', to: '/login' },
  { icon: Globe, title: 'Mapa de alertas', hint: 'Detecciones de la comunidad', to: '/threat-map' },
]

const STEPS = [
  {
    n: '01',
    title: 'Pegá el enlace',
    desc: 'SafeLink evalúa dominio, reputación y patrones sospechosos. El veredicto llega en segundos.',
  },
  {
    n: '02',
    title: 'Leé el semáforo',
    desc: 'Verde, amarillo o rojo: el mismo lenguaje en la extensión, el historial y el mapa.',
  },
  {
    n: '03',
    title: 'Seguí el rastro',
    desc: 'Todo queda en tu portal: historial, reportes a la comunidad y alertas del equipo.',
  },
]

const TOOLS = [
  { title: 'Análisis de URLs', desc: 'Heurísticas, entropía y typosquatting en un solo escaneo.', to: '/analyze' },
  { title: 'Revisión de PDF', desc: 'Extrae y analiza enlaces ocultos dentro de archivos adjuntos.', to: '/analyze/pdf' },
  { title: 'Guardia DNS', desc: 'Comprueba si el dominio apunta a servidores de confianza.', to: '/analyze/dns' },
  { title: 'Sentinela Web3', desc: 'Detecta páginas sospechosas que piden conectar tu billetera.', to: '/analyze/web3' },
  { title: 'Typosquatting', desc: 'Identifica dominios que imitan marcas conocidas.', to: '/analyze/typosquatting' },
  { title: 'Seguridad avanzada', desc: 'NLP, headers HTTP, OAuth falso y formularios maliciosos.', to: '/analyze/security' },
]

const TESTIMONIALS = [
  { initials: 'MR', name: 'María R.', role: 'CISO, fintech', quote: 'SafeLink nos da visibilidad inmediata sobre enlaces sospechosos sin fricción para el equipo.' },
  { initials: 'JL', name: 'Julián L.', role: 'DevOps Lead', quote: 'La extensión detectó un sitio de phishing antes de que alguien ingresara credenciales.' },
  { initials: 'AP', name: 'Ana P.', role: 'Security Analyst', quote: 'El mapa de alertas de la comunidad y los reportes nos ayudan a ver tendencias, con ubicaciones aproximadas.' },
]

const PLANS = [
  { name: 'Standard', price: 'Gratis', period: 'Para uso personal', desc: 'Extensión, análisis básico y semáforo de seguridad.', featured: false, to: '/extension' },
  { name: 'Enterprise', price: 'Pro', period: 'Equipos y empresas', desc: 'Panel admin, mapa de alertas de la comunidad y reportes avanzados.', featured: true, to: '/login' },
  { name: 'SafeLink Prime', price: 'Custom', period: 'Infraestructura crítica', desc: 'API, SLA dedicado y despliegue on-premise.', featured: false, to: '/login' },
]

const FAQS = [
  { q: '¿Cómo funciona el análisis de enlaces?', a: 'SafeLink evalúa la URL con heurísticas, reputación DNS y señales de la comunidad en milisegundos.' },
  { q: '¿El mapa de alertas es un radar mundial de ataques?', a: 'No. Muestra detecciones reales de usuarios de SafeLink. Las ubicaciones son aproximadas por IP (país o región), como suele ser en ciberseguridad.' },
  { q: '¿Protege transacciones Web3?', a: 'Sí. Detectamos sitios que imitan wallets, contratos maliciosos y firmas sospechosas.' },
  { q: '¿Mis datos de navegación se comparten?', a: 'No enviamos historial completo. Solo analizamos el enlace que revisás.' },
  { q: '¿Puedo usar SafeLink en equipo?', a: 'El plan Enterprise incluye panel admin y gestión de usuarios.' },
  { q: '¿Qué navegadores soporta?', a: 'Chrome y navegadores basados en Chromium.' },
  { q: '¿Cómo reporto una amenaza?', a: 'Desde la extensión o el dashboard podés marcar enlaces peligrosos.' },
]

const FOOTER_LINKS = {
  Plataforma: [
    { label: 'Iniciar sesión', to: '/login' },
    { label: 'Registrarse', to: '/register' },
    { label: 'Extensión', to: '/extension' },
    { label: 'Dashboard', to: '/login' },
  ],
  Servicios: [
    { label: 'Análisis de URLs', to: '/analyze' },
    { label: 'Revisión PDF', to: '/analyze/pdf' },
    { label: 'Seguridad Web3', to: '/analyze/web3' },
  ],
  Recursos: [
    { label: 'Mapa de alertas', to: '/threat-map' },
    { label: 'Mis enlaces', to: '/enlaces' },
    { label: 'Soporte', to: '#' },
  ],
  Legal: [
    { label: 'Privacidad', to: '#' },
    { label: 'Términos', to: '#' },
    { label: 'Cookies', to: '#' },
  ],
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />

      <section className="landing-hero" id="institucion">
        <div className="landing-wrap landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="section-tag">Inteligencia de amenazas</span>
            <h1 className="landing-hero-title">
              Sabé si un enlace es seguro <em>antes</em> de hacer clic.
            </h1>
            <p className="landing-hero-desc">
              SafeLink analiza URLs, PDFs y sitios Web3, y marca el riesgo con un semáforo
              en Chrome. Sin ruido, sin terminal verde, sin plantilla genérica.
            </p>
            <div className="landing-hero-actions">
              <Link to="/extension" className="btn-gradient">
                Instalar extensión
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link to="/register" className="btn-outline-gradient">
                Crear cuenta
              </Link>
            </div>
            <div className="landing-hero-metrics">
              <div>
                <strong data-numeric>10+</strong>
                <span>módulos de análisis</span>
              </div>
              <div>
                <strong data-numeric>&lt;2s</strong>
                <span>para un veredicto</span>
              </div>
              <div>
                <strong data-numeric>24/7</strong>
                <span>en el navegador</span>
              </div>
            </div>
          </div>

          <div id="network" className="landing-map-card">
            <div className="landing-map-inner sl-map">
              <WorldDotMap />
              <div className="sl-map__meridians" aria-hidden="true" />
              <div className="sl-map__equator" aria-hidden="true" />
              <div className="sl-map__sweep" aria-hidden="true" />
              {HERO_THREATS.map((point) => (
                <div
                  key={`${point.x}-${point.y}`}
                  className={`sl-threat sl-threat--${point.level}`}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    width: point.size,
                    height: point.size,
                  }}
                />
              ))}
              <div className="sl-map__vignette" aria-hidden="true" />
              <div className="landing-map-caption">
                <span>
                  <MapPin size={14} weight="fill" />
                  Vista ilustrativa
                </span>
                <Link to="/threat-map">Ver mapa de la comunidad</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Plataforma</span>
            <h2>Hecho para decidir rápido, no para decorar un dashboard</h2>
          </div>
          <div className="landing-pillars">
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="landing-pillar">
                <span className="sl-icon sl-icon--sm sl-icon--accent">
                  <Icon size={16} weight="bold" />
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="servicios" className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Servicios</span>
            <h2>Empezá por donde te haga falta</h2>
          </div>
          <div className="landing-quick-grid">
            {QUICK_SERVICES.map(({ icon: Icon, title, hint, to }) => (
              <Link key={title} to={to} className="landing-quick-card">
                <span className="sl-icon sl-icon--sm sl-icon--accent">
                  <Icon size={16} weight="bold" />
                </span>
                <h3>{title}</h3>
                <span>{hint}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="investigacion">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Cómo funciona</span>
            <h2>Tres pasos. El mismo semáforo en todos lados.</h2>
          </div>
          <div className="landing-steps">
            {STEPS.map(({ n, title, desc }) => (
              <article key={n} className="landing-step">
                <span className="landing-step__n" data-numeric>
                  {n}
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
          <div className="landing-semaphore">
            <StatusBadge tone="safe" size="lg">
              Seguro
            </StatusBadge>
            <StatusBadge tone="warn" size="lg">
              Precaución
            </StatusBadge>
            <StatusBadge tone="danger" size="lg">
              Peligroso
            </StatusBadge>
            <p>El color no es decoración: es el veredicto.</p>
          </div>
        </div>
      </section>

      <section className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Herramientas</span>
            <h2>Análisis especializado</h2>
          </div>
          <div className="landing-tools-grid">
            {TOOLS.map(({ title, desc, to }) => (
              <Link key={title} to={to} className="landing-tool-link">
                <h3>{title}</h3>
                <p>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="portal">
        <div className="landing-wrap">
          <div className="landing-portal-banner">
            <span className="section-tag">Portal SafeLink</span>
            <h2>Historial, alertas y más de 10 herramientas en un solo lugar</h2>
            <p>
              Creá una cuenta para guardar cada análisis, reportar sitios y seguir la conversación
              con el equipo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/login" className="btn-gradient">
                Ir a mi portal
              </Link>
              <Link to="/register" className="btn-outline-gradient">
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="equipo">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Comunidad</span>
            <h2>Quienes ya lo usan</h2>
          </div>
          <div className="landing-testimonial-grid">
            {TESTIMONIALS.map(({ initials, name, role, quote }) => (
              <article key={name} className="landing-testimonial">
                <div className="landing-testimonial-avatar">{initials}</div>
                <h4>{name}</h4>
                <p className="role">{role}</p>
                <blockquote>&ldquo;{quote}&rdquo;</blockquote>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Planes</span>
            <h2>Elegí tu nivel de protección</h2>
          </div>
          <div className="landing-pricing-grid">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.featured
                    ? 'landing-price-card landing-price-card--featured'
                    : 'landing-price-card'
                }
              >
                <h3>{plan.name}</h3>
                <div>
                  <div className="price-amount">{plan.price}</div>
                  <div className="price-period">{plan.period}</div>
                </div>
                <p className="price-desc">{plan.desc}</p>
                <Link to={plan.to} className="btn-price">
                  {plan.featured ? 'Comenzar ahora' : 'Seleccionar'}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Soporte</span>
            <h2>Estamos para vos</h2>
          </div>
          <div className="landing-contact-grid">
            <div className="landing-contact-item">
              <span className="sl-icon sl-icon--sm sl-icon--accent">
                <Headset size={16} weight="bold" />
              </span>
              <p>Soporte técnico</p>
              <a href="mailto:soporte@safelink.app">Contactanos</a>
            </div>
            <div className="landing-contact-item">
              <span className="sl-icon sl-icon--sm sl-icon--accent">
                <ChatCircle size={16} weight="bold" />
              </span>
              <p>Reportar amenaza</p>
              <Link to="/enlaces">Desde el dashboard</Link>
            </div>
            <div className="landing-contact-item">
              <span className="sl-icon sl-icon--sm sl-icon--accent">
                <EnvelopeSimple size={16} weight="bold" />
              </span>
              <p>Consultas</p>
              <a href="mailto:soporte@safelink.app">Enviar email</a>
            </div>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">FAQ</span>
            <h2>Preguntas frecuentes</h2>
          </div>
          <div className="landing-faq-grid">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="landing-faq-item">
                <h4>{q}</h4>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-wrap">
          <div className="landing-footer-grid">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title} className="landing-footer-col">
                <h5>{title}</h5>
                <ul>
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="landing-status-widget">
              <h5>SafeLink Status</h5>
              <div className="landing-status-row">
                <span className="landing-status-label">Uptime</span>
                <span className="landing-status-value">99,99%</span>
              </div>
              <div className="landing-status-bars">
                <span style={{ height: '45%' }} />
                <span style={{ height: '70%' }} />
                <span style={{ height: '55%' }} />
                <span style={{ height: '85%' }} />
                <span style={{ height: '60%' }} />
                <span style={{ height: '92%' }} />
                <span style={{ height: '75%' }} />
              </div>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <div className="landing-social">
              <a href="#" aria-label="Twitter">
                <TwitterLogo size={16} weight="fill" />
              </a>
              <a href="#" aria-label="GitHub">
                <GithubLogo size={16} weight="fill" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <LinkedinLogo size={16} weight="fill" />
              </a>
            </div>
            <p className="landing-copyright">© 2026 SafeLink. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
