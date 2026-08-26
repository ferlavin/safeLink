import {
  ShieldCheck,
  MagnifyingGlass,
  PuzzlePiece,
  SignIn,
  EnvelopeSimple,
  ChatCircle,
  Headset,
  TwitterLogo,
  GithubLogo,
  LinkedinLogo,
  ArrowRight,
  ChatText,
  Bank,
  LinkSimple,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import LandingHeader from '../components/LandingHeader'
import WorldDotMap from '../components/WorldDotMap'
import StatusBadge from '../components/StatusBadge'

// Ilustración del semáforo, no un feed de amenazas en vivo.
const HERO_THREATS = [
  { x: 22, y: 38, level: 'critico', size: 12 },
  { x: 48, y: 42, level: 'alto', size: 10 },
  { x: 72, y: 36, level: 'medio', size: 11 },
  { x: 82, y: 58, level: 'bajo', size: 8 },
  { x: 28, y: 62, level: 'alto', size: 9 },
]

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Semáforo antes de hacer clic',
    desc: 'Verde, amarillo o rojo. Una señal clara para decidir si conviene abrir el enlace.',
    to: '/info/semaforo',
  },
  {
    icon: ChatText,
    title: 'Hecho para el día a día en Argentina',
    desc: 'WhatsApp, home banking y marcas locales. El caso típico es un dominio trucho que imita uno oficial.',
    to: '/info/typosquatting',
  },
  {
    icon: PuzzlePiece,
    title: 'Extensión en Chrome',
    desc: 'Un punto de color al lado de los resultados de Google y en la barra, cuando estás por entrar.',
    to: '/info/extension',
  },
  {
    icon: ShieldCheck,
    title: 'Historial si tenés cuenta',
    desc: 'Sin cuenta no hay historial. Con cuenta, cada análisis queda en Mis enlaces para consultarlo o reportarlo.',
    to: '/info/portal',
  },
]

const QUICK_SERVICES = [
  { icon: MagnifyingGlass, title: 'Analizar un enlace', hint: 'Pegá la URL y leé el semáforo', to: '/info/analisis-url' },
  { icon: PuzzlePiece, title: 'Extensión Chrome', hint: 'Semáforo en el navegador', to: '/extension' },
  { icon: SignIn, title: 'Crear cuenta', hint: 'Gratis: historial y reportes', to: '/register' },
]

const STEPS = [
  {
    n: '01',
    title: 'Pegá el enlace',
    desc: 'La dirección completa, como la ves en WhatsApp, el mail o el navegador.',
    to: '/info/analisis-url',
  },
  {
    n: '02',
    title: 'Leé el semáforo',
    desc: 'Verde: razonable. Amarillo: no pongas contraseñas sin revisar. Rojo: mejor no entrar.',
    to: '/info/semaforo',
  },
  {
    n: '03',
    title: 'Guardá o reportá',
    desc: 'Con cuenta, el resultado queda en Mis enlaces. Si el sitio te parece falso, podés reportarlo.',
    to: '/info/portal',
  },
]

const FAQS = [
  {
    q: '¿Qué es SafeLink?',
    a: 'Un semáforo para enlaces: te dice si conviene hacer clic antes de abrir un sitio. Es un MVP gratis (extensión + análisis), no un producto Enterprise.',
  },
  {
    q: '¿Cómo funciona el verde, amarillo y rojo?',
    a: 'Revisa cómo está escrita la URL y si imita una marca conocida. Verde: se ve razonable. Amarillo: hay señales dudosas. Rojo: alto riesgo; no te recomendamos entrar. Ningún semáforo es infalible.',
  },
  {
    q: '¿Qué URL se manda?',
    a: 'Solo la que vos pegás para analizar, o la que la extensión revisa en ese momento (resultado de Google o página que estás por abrir). No enviamos tu historial de navegación completo.',
  },
  {
    q: '¿Hace falta una cuenta?',
    a: 'Para usar el portal (analizar, guardar historial y reportar) sí. La extensión puede marcar resultados en Chrome; si no iniciás sesión, ese check no se guarda en tu historial.',
  },
  {
    q: '¿Hay planes pagos, SLA o on-premise?',
    a: 'No. Hay un solo producto: gratis / MVP. Extensión, análisis de enlaces y semáforo. Nada de precios inventados.',
  },
  {
    q: '¿Qué navegadores soporta?',
    a: 'Chrome y navegadores basados en Chromium, con la extensión instalada. El análisis desde la web pide cuenta.',
  },
  {
    q: '¿Cómo reporto un sitio?',
    a: 'Desde Mis enlaces, después de analizarlo. El equipo ve el reporte en Mensajes. No hace falta un mail aparte para el caso típico.',
  },
]

const FOOTER_LINKS = {
  Plataforma: [
    { label: 'Iniciar sesión', to: '/login' },
    { label: 'Registrarse', to: '/register' },
    { label: 'Extensión', to: '/extension' },
    { label: 'Portal SafeLink', to: '/info/portal' },
  ],
  Producto: [
    { label: 'Analizar un enlace', to: '/info/analisis-url' },
    { label: 'El semáforo', to: '/info/semaforo' },
    { label: 'Revisión de PDF', to: '/info/pdf' },
  ],
  Recursos: [
    { label: 'Cómo reportar', to: '/info/reportes' },
    { label: 'El semáforo', to: '/info/semaforo' },
    { label: 'Cookies', to: '/info/cookies' },
  ],
  Legal: [
    { label: 'Privacidad', to: '/info/privacidad' },
    { label: 'Términos', to: '/info/terminos' },
    { label: 'Cookies', to: '/info/cookies' },
  ],
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />

      <section className="landing-hero" id="institucion">
        <div className="landing-wrap landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="section-tag">Semáforo de enlaces</span>
            <h1 className="landing-hero-title">
              Sabé si un enlace es seguro <em>antes</em> de hacer clic.
            </h1>
            <p className="landing-hero-desc">
              SafeLink es un MVP gratis: pegás una URL o usás la extensión en Chrome
              y ves verde, amarillo o rojo. Pensado para WhatsApp, home banking y
              marcas locales, no para un radar mundial de ciberataques.
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
                <strong>Gratis</strong>
                <span>un solo producto, sin planes</span>
              </div>
              <div>
                <strong>Chrome</strong>
                <span>semáforo en el navegador</span>
              </div>
              <div>
                <strong>AR</strong>
                <span>marcas y bancos locales</span>
              </div>
            </div>
          </div>

          <div id="network" className="landing-map-card">
            <div className="landing-map-inner sl-map">
              <WorldDotMap />
              <div className="sl-map__meridians" aria-hidden="true" />
              <div className="sl-map__equator" aria-hidden="true" />
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
                  <ShieldCheck size={14} weight="fill" />
                  Ilustración del semáforo — no es un feed de amenazas en vivo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Qué es</span>
            <h2>Un semáforo. No una suite de inteligencia.</h2>
          </div>
          <div className="landing-pillars">
            {PILLARS.map(({ icon: Icon, title, desc, to }) => (
              <Link key={title} to={to} className="landing-pillar">
                <span className="sl-icon sl-icon--sm sl-icon--accent">
                  <Icon size={16} weight="bold" />
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="servicios" className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Cómo empezar</span>
            <h2>Extensión, análisis o cuenta. Eso es el producto.</h2>
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
            <h2>Tres pasos. El mismo semáforo en la web y en Chrome.</h2>
          </div>
          <div className="landing-steps">
            {STEPS.map(({ n, title, desc, to }) => (
              <Link key={n} to={to} className="landing-step">
                <span className="landing-step__n" data-numeric>
                  {n}
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Link>
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
            <span className="section-tag">Un ejemplo</span>
            <h2>Dominio oficial vs dominio trucho</h2>
          </div>
          <div className="landing-tools-grid">
            <article className="landing-tool-link">
              <h3>
                <Bank size={18} weight="bold" className="inline" /> Oficiales
              </h3>
              <p>
                <code>www.galicia.ar</code> o <code>www.mercadopago.com.ar</code> son
                sitios de marcas conocidas. Si el enlace coincide con el dominio
                oficial, el semáforo suele ir a verde.
              </p>
            </article>
            <article className="landing-tool-link">
              <h3>
                <LinkSimple size={18} weight="bold" className="inline" /> Truchos
              </h3>
              <p>
                <code>galicia-seguridad-login.com</code> o{' '}
                <code>mercadopago-ayuda.xyz</code> imitan el nombre. Una letra, un
                guión o un <code>.com</code> en vez de <code>.com.ar</code> alcanzan
                para una estafa.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="portal">
        <div className="landing-wrap">
          <div className="landing-portal-banner">
            <span className="section-tag">Gratis / MVP</span>
            <h2>Un solo producto: extensión, análisis y semáforo</h2>
            <p>
              No hay plan Enterprise, Prime, SLA ni on-premise. Creá una cuenta
              para guardar el historial y reportar sitios, o instalá la extensión
              para ver el semáforo en Chrome.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/extension" className="btn-gradient">
                Instalar extensión
              </Link>
              <Link to="/register" className="btn-outline-gradient">
                Crear cuenta gratis
              </Link>
            </div>
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
              <p>Reportar un sitio</p>
              <Link to="/info/reportes">Cómo reportar</Link>
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
