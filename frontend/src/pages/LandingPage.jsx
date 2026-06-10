import {
  ShieldCheck,
  MagnifyingGlass,
  CheckCircle,
  Cpu,
  CurrencyEth,
  ShieldWarning,
  LockKey,
  Fingerprint,
  GoogleChromeLogo,
  Layout,
  TwitterLogo,
  GithubLogo,
  LinkedinLogo,
  MapPin,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="bg-pitch-black text-white font-plus-jakarta overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 sm:px-8 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-4 py-3 sm:px-8 sm:py-4 rounded-full border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-neon-ice to-ocean-twilight rounded-lg flex items-center justify-center glow-neon">
              <ShieldCheck size={20} weight="fill" className="text-black" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">SafeLink</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm nav-link">
            <a href="#protection" className="hover:text-neon-ice">
              Protección
            </a>
            <a href="#heuristics" className="hover:text-neon-ice">
              Análisis
            </a>
            <a href="#network" className="hover:text-neon-ice">
              Red
            </a>
            <a href="#enterprise" className="hover:text-neon-ice">
              Empresa
            </a>
          </div>
          <Link
            to="/extension"
            className="btn-nav-install text-sm font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-full hover:bg-neon-ice"
          >
            Instalar extensión
          </Link>
        </div>
      </nav>

      <section
        id="protection"
        className="relative min-h-[75vh] sm:min-h-[80vh] flex flex-col items-center justify-center pt-20 sm:pt-24 pb-12 overflow-hidden"
      >
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

        <div className="absolute top-[-10%] left-[-10%] w-[min(500px,70vw)] h-[min(500px,70vw)] sm:w-[min(600px,55vw)] sm:h-[min(600px,55vw)] hero-blob-left rounded-full opacity-40 animate-pulse-glow" />
        <div className="absolute bottom-[10%] right-[-10%] w-[min(400px,60vw)] h-[min(400px,60vw)] sm:w-[min(480px,45vw)] sm:h-[min(480px,45vw)] hero-blob-right rounded-full opacity-20 animate-glow-pulse" />

        <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 text-center">
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full badge-live">
            <span className="w-2 h-2 rounded-full bg-neon-ice animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-white/60">
              Versión 4.0 disponible
            </span>
          </div>

          <h1 className="landing-hero-title font-bold mb-5 sm:mb-6">
            Capa invisible.
            <br />
            <span className="text-gradient-aurora">Protección absoluta.</span>
          </h1>

          <p className="landing-subtitle text-white/50 max-w-2xl mx-auto mb-8 sm:mb-10">
            Navegá sin preocupaciones. SafeLink detecta amenazas en milisegundos y
            protege tu identidad y tus datos antes de que hagas clic.
          </p>

          <div className="glass-panel-heavy p-1.5 sm:p-2 rounded-2xl sm:rounded-[28px] max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 scanner-glow-ring rounded-[30px] opacity-20 group-hover:opacity-40 transition duration-700" />
            <div className="relative bg-pitch-black/60 rounded-[26px] p-3 sm:p-4 flex flex-col md:flex-row items-center gap-3 sm:gap-4">
              <div className="flex-1 w-full relative flex items-center px-3 sm:px-4">
                <MagnifyingGlass size={20} className="text-white/30 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Revisá una URL, PDF o contrato inteligente..."
                  className="bg-transparent border-none outline-none text-white w-full py-2.5 sm:py-3 text-sm sm:text-base placeholder:text-white/20"
                />
              </div>
              <Link
                to="/analyze"
                className="btn-protect w-full md:w-auto font-semibold text-sm px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:scale-105 active:scale-95 text-center"
              >
                Proteger ahora
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/40 text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-neon-ice" />
              <span>Análisis en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-neon-ice" />
              <span>Respetamos tu privacidad</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-neon-ice" />
              <span>Protección Web3</span>
            </div>
          </div>
        </div>
      </section>

      <section id="heuristics" className="py-14 sm:py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="landing-section-title font-bold mb-4 sm:mb-6">
            Invisible e invencible
          </h2>
          <p className="landing-subtitle text-white/50 max-w-xl mx-auto mb-16 sm:mb-20">
            Un motor liviano trabaja en segundo plano y decide al instante si un
            enlace es seguro o peligroso.
          </p>

          <div className="relative h-[420px] sm:h-[520px] md:h-[580px] max-w-5xl mx-auto">
            <div className="absolute top-0 left-[5%] sm:left-[10%] animate-float-slow">
              <div className="widget-card p-6 rounded-3xl flex items-center gap-6 text-left hover:border-neon-ice/30">
                <div className="w-14 h-14 bg-neon-ice/10 rounded-2xl flex items-center justify-center border border-neon-ice/20">
                  <Cpu size={32} weight="fill" className="text-neon-ice" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-white/40 tracking-wide mb-1">
                    Análisis de scripts
                  </div>
                  <div className="text-white font-semibold text-base">Ejecución segura</div>
                  <div className="text-neon-ice text-xs mt-1">Respuesta en 0,02 ms</div>
                </div>
              </div>
            </div>

            <div className="absolute top-[20%] right-[5%] sm:right-[10%] animate-float">
              <div className="widget-card p-6 rounded-3xl flex items-center gap-6 text-left hover:border-purple-500/30">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                  <CurrencyEth size={32} weight="fill" className="text-purple-400" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-white/40 tracking-wide mb-1">
                    Guardia Web3
                  </div>
                  <div className="text-white font-semibold text-base">Firma verificada</div>
                  <div className="text-purple-400 text-xs mt-1">
                    Contrato malicioso bloqueado
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[10%] left-[10%] sm:left-[25%] animate-float-slow">
              <div className="widget-card p-6 rounded-3xl flex items-center gap-6 text-left hover:border-hot-fuchsia/30">
                <div className="w-14 h-14 bg-hot-fuchsia/10 rounded-2xl flex items-center justify-center border border-hot-fuchsia/20">
                  <ShieldWarning size={32} weight="fill" className="text-hot-fuchsia" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-white/40 tracking-wide mb-1">
                    Alerta anti-estafa
                  </div>
                  <div className="text-white font-semibold text-base">Phishing bloqueado</div>
                  <div className="text-hot-fuchsia text-xs mt-1">
                    Sitio imitador detectado
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] border border-white/5 rounded-full flex items-center justify-center">
                <div className="w-[220px] h-[220px] sm:w-[400px] sm:h-[400px] border border-white/10 rounded-full flex items-center justify-center">
                  <div className="w-[160px] h-[160px] sm:w-[300px] sm:h-[300px] border border-white/20 rounded-full flex items-center justify-center">
                    <ShieldCheck
                      size={120}
                      weight="fill"
                      className="text-white/20 sm:hidden"
                    />
                    <ShieldCheck
                      size={180}
                      weight="fill"
                      className="text-white/20 hidden sm:block"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="enterprise" className="py-16 sm:py-24 bg-pitch-black relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="landing-section-title font-bold mb-5 sm:mb-6">
                Defensa profunda para el
                <br />
                <span className="text-gradient-aurora">navegador moderno.</span>
              </h2>
              <p className="landing-subtitle text-white/50 mb-8 sm:mb-10 max-w-lg">
                SafeLink no solo bloquea enlaces: revisa cada sitio con varias capas
                de seguridad antes de que entres.
              </p>

              <ul className="space-y-6">
                <li className="flex items-start gap-4 sm:gap-5">
                  <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 glass-panel rounded-xl flex items-center justify-center">
                    <LockKey size={20} weight="fill" className="text-neon-ice" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1.5">Sin demoras perceptibles</h4>
                    <p className="text-white/40 leading-relaxed">
                      El análisis corre en paralelo mientras navegás, sin frenar la
                      carga de la página.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 sm:gap-5">
                  <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 glass-panel rounded-xl flex items-center justify-center">
                    <Fingerprint size={20} weight="fill" className="text-neon-ice" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1.5">Privacidad primero</h4>
                    <p className="text-white/40 leading-relaxed">
                      No enviamos tu historial de navegación. El análisis es rápido y
                      enfocado en el enlace que revisás.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-ocean-twilight rounded-full blur-[100px] opacity-20 pointer-events-none" />

              <div className="feature-card p-6 sm:p-8 rounded-3xl sm:rounded-[36px] hover:border-neon-ice/30 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-5 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/openmoji-named-svgs@latest/color/shield.svg"
                    className="w-8 h-8 group-hover:scale-110 transition duration-500"
                    alt=""
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Guardia DNS</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Comprueba si el dominio apunta a servidores de confianza.
                </p>
              </div>

              <div className="feature-card p-6 sm:p-8 rounded-3xl sm:rounded-[36px] sm:mt-8 hover:border-neon-ice/30 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-5 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/openmoji-named-svgs@latest/color/locked.svg"
                    className="w-8 h-8 group-hover:scale-110 transition duration-500"
                    alt=""
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Revisión de PDF</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Extrae y analiza enlaces dentro de archivos adjuntos.
                </p>
              </div>

              <div className="feature-card p-6 sm:p-8 rounded-3xl sm:rounded-[36px] hover:border-neon-ice/30 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-5 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/delapouite/power-ring.svg"
                    className="w-8 h-8 group-hover:scale-110 transition duration-500"
                    style={{
                      filter:
                        'invert(72%) sepia(87%) saturate(464%) hue-rotate(128deg) brightness(101%) contrast(92%)',
                    }}
                    alt=""
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Sentinela Web3</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Detecta páginas que piden conectar la billetera de forma sospechosa.
                </p>
              </div>

              <div className="feature-card p-6 sm:p-8 rounded-3xl sm:rounded-[36px] sm:mt-8 hover:border-neon-ice/30 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-5 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/openmoji-named-svgs@latest/color/quarantine.svg"
                    className="w-8 h-8 group-hover:scale-110 transition duration-500"
                    alt=""
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Detección de scripts</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Identifica código ofuscado o comportamiento raro en la página.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="network" className="py-16 sm:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-2/5 order-2 lg:order-1">
              <div className="glass-panel-heavy p-6 sm:p-8 rounded-3xl sm:rounded-[36px] border border-white/10">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-3.5 h-3.5 rounded-full bg-hot-fuchsia glow-fuchsia animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
                    Alertas en vivo
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="threat-card p-6 rounded-3xl hover:border-hot-fuchsia/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-hot-fuchsia text-xs font-semibold tracking-wide">
                        Neutralizado
                      </span>
                      <span className="text-white/20 text-[10px] font-mono">
                        hace 0,02 ms
                      </span>
                    </div>
                    <div className="text-white font-mono text-sm truncate mb-1">
                      api-gateway.metamask-login.site/auth
                    </div>
                    <div className="text-white/30 text-[10px] flex items-center gap-2 tracking-wide">
                      <MapPin size={12} weight="fill" />
                      Nodo Tokio · Phishing nivel 5
                    </div>
                  </div>

                  <div className="threat-card p-6 rounded-3xl hover:border-hot-fuchsia/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-hot-fuchsia text-xs font-semibold tracking-wide">
                        Neutralizado
                      </span>
                      <span className="text-white/20 text-[10px] font-mono">
                        hace 1,4 s
                      </span>
                    </div>
                    <div className="text-white font-mono text-sm truncate mb-1">
                      dex-drainer-v9.eth.io/claim
                    </div>
                    <div className="text-white/30 text-[10px] flex items-center gap-2 tracking-wide">
                      <MapPin size={12} weight="fill" />
                      Nodo Frankfurt · Exploit de contrato
                    </div>
                  </div>
                </div>

                <Link
                  to="/threat-map"
                  className="block w-full mt-10 py-5 glass-panel rounded-2xl text-white font-bold text-center hover:bg-white/5 transition duration-300"
                >
                  Ver mapa de amenazas
                </Link>
              </div>
            </div>

            <div className="lg:w-3/5 order-1 lg:order-2">
              <h2 className="landing-section-title font-bold mb-6 sm:mb-8">
                Protegemos la web,
                <br />
                <span className="text-hot-fuchsia">enlace por enlace.</span>
              </h2>
              <p className="landing-subtitle text-white/50 mb-8 sm:mb-10">
                La comunidad SafeLink comparte detecciones para anticipar estafas
                antes de que se propaguen.
              </p>

              <div className="relative h-[220px] sm:h-[260px] md:h-[300px] w-full map-panel glass-panel rounded-2xl sm:rounded-[32px] overflow-hidden border border-white/10">
                <div className="absolute top-[20%] left-[30%] group">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-hot-fuchsia rounded-full blur-xl opacity-40 animate-pulse" />
                    <div className="w-5 h-5 map-dot rounded-full relative z-10" />
                    <div className="absolute top-8 left-0 glass-panel px-3 py-1 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none whitespace-nowrap">
                      Malware: San Francisco
                    </div>
                  </div>
                </div>

                <div className="absolute top-[60%] left-[60%] group">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-hot-fuchsia rounded-full blur-xl opacity-40 animate-pulse" />
                    <div className="w-5 h-5 map-dot rounded-full relative z-10" />
                    <div className="absolute top-8 left-0 glass-panel px-3 py-1 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none whitespace-nowrap">
                      Phishing: Londres
                    </div>
                  </div>
                </div>

                <div className="absolute top-[40%] right-[15%] group">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-hot-fuchsia rounded-full blur-xl opacity-40 animate-pulse" />
                    <div className="w-5 h-5 map-dot rounded-full relative z-10" />
                    <div className="absolute top-8 left-0 glass-panel px-3 py-1 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none whitespace-nowrap">
                      Exploit: Singapur
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-6 text-hot-fuchsia font-medium text-[10px] sm:text-xs tracking-wide opacity-30">
                  Zona neutralizada
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-6 sm:-inset-8 cta-halo rounded-[48px] sm:rounded-[64px] opacity-50" />

            <div className="relative glass-panel-heavy p-8 sm:p-12 rounded-3xl sm:rounded-[40px] border border-white/10 text-center overflow-hidden">
              <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10 pointer-events-none">
                <ShieldCheck size={80} className="sm:hidden" />
                <ShieldCheck size={120} className="hidden sm:block" />
              </div>

              <h2 className="landing-section-title font-bold mb-6 sm:mb-8">
                ¿Listo para navegar
                <br />
                con confianza?
              </h2>

              <p className="landing-subtitle text-white/60 mb-10 sm:mb-12 max-w-xl mx-auto">
                Instalá la extensión en un clic y tené el semáforo de seguridad en
                Google y en cada sitio que visitás.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/extension"
                  className="w-full sm:w-auto bg-white text-black font-semibold text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-neon-ice hover:scale-105 transition duration-300 flex items-center justify-center gap-2.5"
                >
                  <GoogleChromeLogo size={20} />
                  Agregar a Chrome
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto glass-panel text-white font-semibold text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-white/10 transition duration-300 flex items-center justify-center gap-2.5"
                >
                  <Layout size={20} />
                  Iniciar sesión
                </Link>
              </div>

              <div className="mt-10 sm:mt-12 pt-10 sm:pt-12 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 sm:gap-10 grayscale opacity-40">
                <span className="font-semibold text-sm sm:text-base tracking-tight">
                  Forbes
                </span>
                <span className="font-semibold text-sm sm:text-base tracking-tight">
                  TechCrunch
                </span>
                <span className="font-semibold text-sm sm:text-base tracking-tight">
                  Wired
                </span>
                <span className="font-semibold text-sm sm:text-base tracking-tight">
                  The Verge
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 sm:py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-neon-ice to-ocean-twilight rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} weight="fill" className="text-black" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">SafeLink</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-white/40 text-sm font-medium">
              <a href="#" className="hover:text-white">
                Política de privacidad
              </a>
              <a href="#" className="hover:text-white">
                Términos de uso
              </a>
              <a href="#" className="hover:text-white">
                Cookies
              </a>
              <a href="#" className="hover:text-white">
                Soporte
              </a>
            </div>

            <div className="flex gap-6 text-white/40">
              <a
                href="#"
                className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:text-neon-ice"
                aria-label="Twitter"
              >
                <TwitterLogo size={20} weight="fill" />
              </a>
              <a
                href="#"
                className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:text-neon-ice"
                aria-label="GitHub"
              >
                <GithubLogo size={20} weight="fill" />
              </a>
              <a
                href="#"
                className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:text-neon-ice"
                aria-label="LinkedIn"
              >
                <LinkedinLogo size={20} weight="fill" />
              </a>
            </div>
          </div>

          <div className="mt-12 sm:mt-20 text-center text-white/20 text-xs">
            © 2026 SafeLink. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
