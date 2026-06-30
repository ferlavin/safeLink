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
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import LandingHeader from '../components/LandingHeader'

const PILLARS = [
  {
    icon: MagnifyingGlass,
    title: 'Análisis integral',
    desc: 'Más de 10 módulos de detección para cubrir cada tipo de amenaza en la web.',
  },
  {
    icon: Globe,
    title: 'Infraestructura',
    desc: 'Motor liviano, mapa global de amenazas y panel con historial de enlaces analizados.',
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
  { icon: Globe, title: 'Mapa de amenazas', hint: 'Inteligencia en vivo', to: '/threat-map' },
]

const HIGH_COMPLEXITY = [
  {
    tag: 'Análisis de URLs · Tiempo real',
    title: 'Detección heurística avanzada',
    desc: 'Evaluamos entropía, typosquatting y señales sospechosas en milisegundos antes de que hagas clic.',
    visual: 'Motor de análisis SafeLink',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c5f58b?w=900&q=80',
    to: '/analyze',
    reverse: false,
  },
  {
    tag: 'Web3 · Contratos inteligentes',
    title: 'Sentinela para billeteras digitales',
    desc: 'Detectamos sitios que imitan wallets, contratos maliciosos y firmas sospechosas en transacciones.',
    visual: 'Guardia Web3 activa',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7be93b8a?w=900&q=80',
    to: '/analyze/web3',
    reverse: true,
  },
  {
    tag: 'Red comunitaria · Alertas',
    title: 'Inteligencia compartida global',
    desc: 'La comunidad SafeLink reporta estafas para anticipar campañas antes de que se propaguen.',
    visual: 'Mapa de amenazas en vivo',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80',
    to: '/threat-map',
    reverse: false,
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
  { initials: 'AP', name: 'Ana P.', role: 'Security Analyst', quote: 'El mapa de amenazas y los reportes comunitarios son herramientas que usamos a diario.' },
]

const PLANS = [
  { name: 'Standard', price: 'Gratis', period: 'Para uso personal', desc: 'Extensión, análisis básico y semáforo de seguridad.', featured: false, to: '/extension' },
  { name: 'Enterprise', price: 'Pro', period: 'Equipos y empresas', desc: 'Panel admin, mapa de amenazas y reportes avanzados.', featured: true, to: '/login' },
  { name: 'SafeLink Prime', price: 'Custom', period: 'Infraestructura crítica', desc: 'API, SLA dedicado y despliegue on-premise.', featured: false, to: '/login' },
]

const FAQS = [
  { q: '¿Cómo funciona el análisis de enlaces?', a: 'SafeLink evalúa la URL con heurísticas, reputación DNS y señales de la comunidad en milisegundos.' },
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
    { label: 'Mapa de amenazas', to: '/threat-map' },
    { label: 'Mis enlaces', to: '/enlaces' },
    { label: 'Soporte', to: '#' },
  ],
  Legal: [
    { label: 'Privacidad', to: '#' },
    { label: 'Términos', to: '#' },
    { label: 'Cookies', to: '#' },
  ],
}

const GALLERY = [
  {
    label: 'Análisis URL',
    desc: 'Pegá un enlace y obtené un veredicto con señales de riesgo en segundos.',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80',
    to: '/analyze',
  },
  {
    label: 'Mapa global',
    desc: 'Visualizá amenazas activas por región y tendencias de ataques en tiempo real.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    to: '/threat-map',
  },
  {
    label: 'Extensión',
    desc: 'Semáforo de seguridad en cada resultado de Google y sitio que visitás.',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52964cd?w=600&q=80',
    to: '/extension',
  },
  {
    label: 'Dashboard',
    desc: 'Historial de enlaces, alertas y gestión de cuenta en un solo panel.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    to: '/login',
  },
  {
    label: 'Web3',
    desc: 'Revisión de contratos y páginas que piden conectar tu billetera.',
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&q=80',
    to: '/analyze/web3',
  },
  {
    label: 'Reportes',
    desc: 'Compartí detecciones con la comunidad y consultá reportes previos.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
    to: '/enlaces',
  },
]

const PHOTO_FEATURES = [
  {
    badge: 'Análisis',
    title: 'Centro de diagnóstico digital',
    desc: 'Como un laboratorio de ciberseguridad: cada URL pasa por múltiples capas de revisión antes de darte un resultado claro.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    to: '/analyze',
    linkLabel: 'Probar análisis',
  },
  {
    badge: 'Extensión',
    title: 'Protección en cada pestaña',
    desc: 'La extensión Chrome vigila resultados de búsqueda y sitios sospechosos sin interrumpir tu navegación diaria.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    to: '/extension',
    linkLabel: 'Ver extensión',
  },
  {
    badge: 'Comunidad',
    title: 'Inteligencia colectiva',
    desc: 'Miles de reportes alimentan el mapa de amenazas para anticipar campañas de phishing antes de que te alcancen.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    to: '/threat-map',
    linkLabel: 'Explorar mapa',
  },
]

const PHOTO_TOUR = [
  {
    tag: 'Paso 1 · Detección',
    title: 'Analizamos cada enlace antes del clic',
    desc: 'SafeLink evalúa dominio, certificados, reputación y patrones sospechosos. El resultado aparece al instante con un semáforo claro: seguro, dudoso o peligroso.',
    caption: 'Panel de análisis en tiempo real',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80',
    bullets: ['Heurísticas de entropía y typosquatting', 'Revisión DNS y certificados SSL', 'Veredicto en menos de 2 segundos'],
    to: '/analyze',
    reverse: false,
  },
  {
    tag: 'Paso 2 · Prevención',
    title: 'La extensión te avisa en el navegador',
    desc: 'Instalás la extensión una vez y SafeLink marca enlaces peligrosos directamente en Google, redes sociales y cualquier página que visites.',
    caption: 'Semáforo integrado al navegador',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52964cd?w=900&q=80',
    bullets: ['Icono verde, amarillo o rojo en cada link', 'Alertas antes de ingresar credenciales', 'Compatible con Chrome y derivados'],
    to: '/extension',
    reverse: true,
  },
  {
    tag: 'Paso 3 · Seguimiento',
    title: 'Tu historial y alertas en el portal',
    desc: 'Desde el dashboard revisás todos los enlaces analizados, activás alertas y gestionás reportes comunitarios sin perder el control.',
    caption: 'Portal personal SafeLink',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80',
    bullets: ['Historial completo de análisis', 'Reportes y gestión de amenazas', 'Panel admin para equipos'],
    to: '/login',
    reverse: false,
  },
]

const PHOTO_MOSAIC = {
  main: {
    title: 'Mapa de amenazas global',
    desc: 'Visualización en vivo de campañas activas, hotspots regionales y tendencias que la comunidad reporta cada hora.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&q=80',
  },
  side: [
    {
      title: 'Revisión de PDF',
      desc: 'Enlaces ocultos en adjuntos analizados automáticamente.',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80',
    },
    {
      title: 'Guardia Web3',
      desc: 'Contratos y sitios de wallets bajo vigilancia constante.',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7be93b8a?w=600&q=80',
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />

      {/* Hero — "Bienvenidos" */}
      <section className="landing-hero" id="institucion">
        <div className="landing-wrap">
          <div className="landing-hero-welcome">
            <span className="section-tag">Conocenos</span>
            <p className="text-muted text-sm font-semibold uppercase tracking-widest mb-2">
              Contá con nosotros
            </p>
            <h1 className="landing-hero-title">
              Siempre listos para{' '}
              <span className="text-gradient">protegerte</span>
            </h1>
            <p className="landing-hero-desc mx-auto">
              Bienvenidos a SafeLink — inteligencia de amenazas digital para cada clic,
              enlace y transacción Web3.
            </p>
            <p className="landing-hero-sub">
              Protección activa desde el navegador y la nube
            </p>
          </div>

          <div id="network" className="landing-map-card">
            <div className="landing-map-inner map-panel">
              <div className="absolute top-[20%] left-[28%]">
                <div className="relative">
                  <div className="absolute -inset-5 bg-hot-fuchsia rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="w-4 h-4 map-dot rounded-full relative z-10" />
                </div>
              </div>
              <div className="absolute top-[55%] left-[55%]">
                <div className="relative">
                  <div className="absolute -inset-5 bg-hot-fuchsia rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="w-4 h-4 map-dot rounded-full relative z-10" />
                </div>
              </div>
              <div className="absolute top-[35%] right-[18%]">
                <div className="relative">
                  <div className="absolute -inset-5 bg-hot-fuchsia rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="w-4 h-4 map-dot rounded-full relative z-10" />
                </div>
              </div>
              <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs text-muted">
                <MapPin size={14} weight="fill" className="text-neon-ice" />
                Inteligencia global de amenazas
              </div>
              <Link to="/threat-map" className="absolute bottom-3 right-4 text-xs font-semibold text-neon-ice hover:underline">
                Ver mapa completo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 pilares — "Bienvenido a nuestro Sanatorio" */}
      <section>
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <h2>Bienvenido a SafeLink</h2>
          </div>
          <div className="landing-pillars">
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="landing-pillar">
                <div className="landing-pillar-icon">
                  <Icon size={22} weight="fill" />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trayectoria */}
      <section className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-band">
            <p>
              El tiempo importa y mucho. Detección en milisegundos, privacidad primero y una
              red comunitaria que crece cada día para mantenerte seguro en la web.
            </p>
            <Link to="/analyze" className="btn-outline-gradient">
              Conocé nuestra plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios a un click */}
      <section id="servicios">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <h2>Servicios a un click</h2>
          </div>
          <div className="landing-quick-grid">
            {QUICK_SERVICES.map(({ icon: Icon, title, hint, to }) => (
              <Link key={title} to={to} className="landing-quick-card">
                <Icon size={28} weight="fill" />
                <h3>{title}</h3>
                <span>{hint}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fotos con explicación — cards */}
      <section className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Plataforma</span>
            <h2>Así se ve SafeLink por dentro</h2>
            <p className="text-muted text-sm max-w-2xl mx-auto mt-2">
              Cada área de la plataforma está pensada para darte claridad: qué revisamos,
              cómo te protegemos y dónde consultar el resultado.
            </p>
          </div>
          <div className="landing-photo-grid">
            {PHOTO_FEATURES.map(({ badge, title, desc, image, to, linkLabel }) => (
              <article key={title} className="landing-photo-card">
                <div className="landing-photo-card__img">
                  <img src={image} alt={title} loading="lazy" />
                  <span className="landing-photo-card__badge">{badge}</span>
                </div>
                <div className="landing-photo-card__body">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <Link to={to} className="landing-photo-card__link">
                    {linkLabel} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recorrido visual — foto + explicación alternada */}
      <section>
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Recorrido</span>
            <h2>Cómo te protegemos, paso a paso</h2>
            <p className="text-muted text-sm max-w-2xl mx-auto mt-2">
              Desde el primer análisis hasta el seguimiento en tu cuenta: tres momentos clave
              con imágenes reales de cada etapa.
            </p>
          </div>
          <div className="landing-photo-tour">
            {PHOTO_TOUR.map(({ tag, title, desc, caption, image, bullets, to, reverse }) => (
              <div
                key={title}
                className={`landing-photo-tour-item${reverse ? ' landing-photo-tour-item--reverse' : ''}`}
              >
                <figure className="landing-photo-tour__media">
                  <img src={image} alt={title} loading="lazy" />
                  <figcaption>{caption}</figcaption>
                </figure>
                <div className="landing-photo-tour__content">
                  <span className="section-tag">{tag}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <ul className="landing-photo-tour__list">
                    {bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link to={to} className="btn-outline-gradient text-sm">
                    Conocé más
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mosaico visual — destacado + dos fotos */}
      <section className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Investigación</span>
            <h2>Herramientas especializadas en acción</h2>
            <p className="text-muted text-sm max-w-2xl mt-2">
              Módulos avanzados para amenazas que van más allá de un simple enlace sospechoso.
            </p>
          </div>
          <div className="landing-photo-mosaic">
            <div className="landing-photo-mosaic__main">
              <img src={PHOTO_MOSAIC.main.image} alt={PHOTO_MOSAIC.main.title} loading="lazy" />
              <div className="landing-photo-mosaic__caption">
                <strong>{PHOTO_MOSAIC.main.title}</strong>
                <span>{PHOTO_MOSAIC.main.desc}</span>
              </div>
            </div>
            {PHOTO_MOSAIC.side.map(({ title, desc, image }) => (
              <div key={title} className="landing-photo-mosaic__side">
                <img src={image} alt={title} loading="lazy" />
                <div className="landing-photo-mosaic__caption">
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Centro de alta complejidad — splits alternados */}
      <section id="investigacion">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <span className="section-tag">Centro integral</span>
            <h2>Protección de alta complejidad</h2>
            <p className="text-muted text-sm max-w-2xl mt-2">
              Especialización en ciberseguridad e innovación tecnológica para la web moderna,
              Web3 y archivos adjuntos.
            </p>
          </div>
          <div className="space-y-16">
            {HIGH_COMPLEXITY.map(({ tag, title, desc, visual, image, to, reverse }) => (
              <div
                key={title}
                className={`landing-split${reverse ? ' landing-split--reverse' : ''}`}
              >
                <div>
                  <span className="section-tag">{tag}</span>
                  <h3 className="text-xl font-bold mb-3">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4">{desc}</p>
                  <Link to={to} className="btn-outline-gradient text-sm">
                    Conocé más
                  </Link>
                </div>
                <div className="landing-split-visual">
                  <img src={image} alt={title} loading="lazy" />
                  <span className="landing-split-visual-label">{visual}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Herramientas — grid diagnóstico */}
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
          <div className="text-center mt-8">
            <Link to="/dashboard" className="btn-outline-gradient">
              Conocé más sobre las herramientas
            </Link>
          </div>
        </div>
      </section>

      {/* Destacado Web3 — estilo "Medicina Nuclear" */}
      <section>
        <div className="landing-wrap">
          <div className="landing-split">
            <div className="landing-split-visual">
              <img
                src="https://images.unsplash.com/photo-1639762681485-074b7be93b8a?w=900&q=80"
                alt="Sentinela Web3 SafeLink"
                loading="lazy"
              />
              <span className="landing-split-visual-label">Sentinela Web3 · Activo</span>
            </div>
            <div>
              <span className="section-tag">Web3</span>
              <h2 className="text-xl font-bold mb-3">Más precisión, menos riesgo</h2>
              <p className="text-muted text-sm leading-relaxed mb-4">
                La protección Web3 de SafeLink identifica contratos maliciosos, sitios imitadores
                y solicitudes de firma sospechosas antes de que conectes tu billetera.
              </p>
              <Link to="/analyze/web3" className="btn-gradient">
                Conocé más sobre Web3
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portal del paciente → Portal SafeLink */}
      <section id="portal">
        <div className="landing-wrap">
          <div className="landing-portal-banner">
            <span className="section-tag">Portal SafeLink</span>
            <h2>Todas tus gestiones en un solo lugar</h2>
            <p>
              Reservá análisis, revisá tu historial de enlaces, gestioná alertas y accedé a más
              de 10 herramientas de seguridad desde tu cuenta personal.
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

      {/* Equipo — testimonios */}
      <section id="equipo">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Comunidad</span>
            <h2>Nuestro equipo, tu equipo</h2>
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
          <div className="landing-quote-block">
            <blockquote>
              &ldquo;Nuestra comunidad crece a diario con la idea de poner a las personas en el
              centro de la seguridad digital.&rdquo;
            </blockquote>
            <cite>Equipo SafeLink — Inteligencia de amenazas</cite>
          </div>
        </div>
      </section>

      {/* Pricing */}
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

      {/* Calidad de servicio / contacto */}
      <section id="contacto">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Calidad</span>
            <h2>Estamos para vos</h2>
            <p className="text-muted text-sm mt-2">
              Canalizamos reportes y sugerencias para optimizar permanentemente el servicio.
            </p>
          </div>
          <div className="landing-contact-grid">
            <div className="landing-contact-item">
              <Headset size={24} weight="fill" />
              <p>Soporte técnico</p>
              <a href="#">Contactanos</a>
            </div>
            <div className="landing-contact-item">
              <ChatCircle size={24} weight="fill" />
              <p>Reportar amenaza</p>
              <Link to="/enlaces">Desde el dashboard</Link>
            </div>
            <div className="landing-contact-item">
              <EnvelopeSimple size={24} weight="fill" />
              <p>Consultas</p>
              <a href="mailto:soporte@safelink.app">Enviar email</a>
            </div>
          </div>
        </div>
      </section>

      {/* Recorré la plataforma — galería con fotos */}
      <section className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Galería</span>
            <h2>Recorré SafeLink en segundos</h2>
            <p className="text-muted text-sm max-w-2xl mx-auto mt-2">
              Pasá el cursor sobre cada imagen para ver qué hace cada módulo de la plataforma.
            </p>
          </div>
          <div className="landing-gallery">
            {GALLERY.map(({ label, desc, image, to }) => (
              <Link key={label} to={to} className="landing-gallery-item">
                <img src={image} alt={label} loading="lazy" />
                <div className="landing-gallery-item__overlay">
                  <strong>{label}</strong>
                  <p>{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Avalados / confianza */}
      <section>
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <span className="section-tag">Confianza</span>
            <h2>Protección respaldada por la comunidad</h2>
          </div>
          <div className="landing-trust-row">
            <span>Forbes</span>
            <span>TechCrunch</span>
            <span>Wired</span>
            <span>The Verge</span>
          </div>
        </div>
      </section>

      {/* Dos puntos de acceso — ubicaciones */}
      <section className="landing-section-alt">
        <div className="landing-wrap">
          <div className="landing-section-head text-center">
            <h2>Estamos donde tenés que estar</h2>
          </div>
          <div className="landing-locations">
            <article className="landing-location-card">
              <h3>Extensión Chrome</h3>
              <p>Protección en cada pestaña, resultado de Google y sitio que visitás.</p>
              <Link to="/extension" className="btn-gradient text-sm">
                Instalar extensión
              </Link>
            </article>
            <article className="landing-location-card">
              <h3>Plataforma web</h3>
              <p>Dashboard, análisis profundo, mapa de amenazas y gestión de cuenta.</p>
              <Link to="/login" className="btn-outline-gradient text-sm">
                Acceder al portal
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* Footer */}
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
              <a href="#" aria-label="Twitter"><TwitterLogo size={16} weight="fill" /></a>
              <a href="#" aria-label="GitHub"><GithubLogo size={16} weight="fill" /></a>
              <a href="#" aria-label="LinkedIn"><LinkedinLogo size={16} weight="fill" /></a>
            </div>
            <p className="landing-copyright">© 2026 SafeLink. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
