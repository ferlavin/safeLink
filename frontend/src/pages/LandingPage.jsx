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
        className="relative min-h-[920px] flex flex-col items-center justify-center pt-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] hero-blob-left rounded-full opacity-40 animate-pulse-glow" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] hero-blob-right rounded-full opacity-20 animate-glow-pulse" />

        <div className="relative z-10 w-full max-w-6xl px-6 text-center">
          <div className="mb-12 inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-live">
            <span className="w-2 h-2 rounded-full bg-neon-ice animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              Versión 4.0 disponible
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-[9rem] font-black mb-8 tracking-[-0.05em] leading-[0.85] uppercase">
            Capa invisible.
            <br />
            <span className="text-gradient-aurora">Protección absoluta.</span>
          </h1>

          <p className="text-white/50 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-16 leading-relaxed">
            Navegá sin preocupaciones. SafeLink detecta amenazas en milisegundos y
            protege tu identidad y tus datos antes de que hagas clic.
          </p>

          <div className="glass-panel-heavy p-2 rounded-[32px] max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 scanner-glow-ring rounded-[34px] opacity-20 group-hover:opacity-40 transition duration-700" />
            <div className="relative bg-pitch-black/60 rounded-[30px] p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full relative flex items-center px-4 sm:px-6">
                <MagnifyingGlass size={24} className="text-white/30 mr-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Revisá una URL, PDF o contrato inteligente..."
                  className="bg-transparent border-none outline-none text-white w-full py-4 text-base sm:text-lg placeholder:text-white/20"
                />
              </div>
              <Link
                to="/analyze"
                className="btn-protect w-full md:w-auto font-black px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:scale-105 active:scale-95 text-center"
              >
                PROTEGER AHORA
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

      <section id="heuristics" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            Invisible e invencible
          </h2>
          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-28 leading-relaxed">
            Un motor liviano trabaja en segundo plano y decide al instante si un
            enlace es seguro o peligroso.
          </p>

          <div className="relative h-[520px] sm:h-[650px] max-w-6xl mx-auto">
            <div className="absolute top-0 left-[5%] sm:left-[10%] animate-float-slow">
              <div className="widget-card p-6 rounded-3xl flex items-center gap-6 text-left hover:border-neon-ice/30">
                <div className="w-14 h-14 bg-neon-ice/10 rounded-2xl flex items-center justify-center border border-neon-ice/20">
                  <Cpu size={32} weight="fill" className="text-neon-ice" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Análisis de scripts
                  </div>
                  <div className="text-white font-bold text-lg">Ejecución segura</div>
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
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Guardia Web3
                  </div>
                  <div className="text-white font-bold text-lg">Firma verificada</div>
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
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Alerta anti-estafa
                  </div>
                  <div className="text-white font-bold text-lg">Phishing bloqueado</div>
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

      <section id="enterprise" className="py-32 bg-pitch-black relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-tight">
                Defensa profunda para el
                <br />
                <span className="text-gradient-aurora">navegador moderno.</span>
              </h2>
              <p className="text-white/50 text-lg sm:text-xl mb-12 leading-relaxed max-w-xl">
                SafeLink no solo bloquea enlaces: revisa cada sitio con varias capas
                de seguridad antes de que entres.
              </p>

              <ul className="space-y-8">
                <li className="flex items-start gap-6">
                  <div className="shrink-0 w-12 h-12 glass-panel rounded-2xl flex items-center justify-center">
                    <LockKey size={24} weight="fill" className="text-neon-ice" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Sin demoras perceptibles</h4>
                    <p className="text-white/40 leading-relaxed">
                      El análisis corre en paralelo mientras navegás, sin frenar la
                      carga de la página.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="shrink-0 w-12 h-12 glass-panel rounded-2xl flex items-center justify-center">
                    <Fingerprint size={24} weight="fill" className="text-neon-ice" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Privacidad primero</h4>
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

              <div className="feature-card p-10 rounded-[48px] hover:border-neon-ice/30 group">
                <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/openmoji-named-svgs@latest/color/shield.svg"
                    className="w-10 h-10 group-hover:scale-110 transition duration-500"
                    alt=""
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3">Guardia DNS</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Comprueba si el dominio apunta a servidores de confianza.
                </p>
              </div>

              <div className="feature-card p-10 rounded-[48px] sm:mt-12 hover:border-neon-ice/30 group">
                <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/openmoji-named-svgs@latest/color/locked.svg"
                    className="w-10 h-10 group-hover:scale-110 transition duration-500"
                    alt=""
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3">Revisión de PDF</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Extrae y analiza enlaces dentro de archivos adjuntos.
                </p>
              </div>

              <div className="feature-card p-10 rounded-[48px] hover:border-neon-ice/30 group">
                <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/delapouite/power-ring.svg"
                    className="w-10 h-10 group-hover:scale-110 transition duration-500"
                    style={{
                      filter:
                        'invert(72%) sepia(87%) saturate(464%) hue-rotate(128deg) brightness(101%) contrast(92%)',
                    }}
                    alt=""
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3">Sentinela Web3</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Detecta páginas que piden conectar la billetera de forma sospechosa.
                </p>
              </div>

              <div className="feature-card p-10 rounded-[48px] sm:mt-12 hover:border-neon-ice/30 group">
                <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-neon-ice/10 transition duration-500">
                  <img
                    src="https://cdn.jsdelivr.net/npm/openmoji-named-svgs@latest/color/quarantine.svg"
                    className="w-10 h-10 group-hover:scale-110 transition duration-500"
                    alt=""
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3">Detección de scripts</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Identifica código ofuscado o comportamiento raro en la página.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="network" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-2/5 order-2 lg:order-1">
              <div className="glass-panel-heavy p-8 sm:p-10 rounded-[48px] border border-white/10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-4 h-4 rounded-full bg-hot-fuchsia glow-fuchsia animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">
                    Alertas en vivo
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="threat-card p-6 rounded-3xl hover:border-hot-fuchsia/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-hot-fuchsia text-xs font-black uppercase tracking-widest">
                        Neutralizado
                      </span>
                      <span className="text-white/20 text-[10px] font-mono">
                        hace 0,02 ms
                      </span>
                    </div>
                    <div className="text-white font-mono text-sm truncate mb-1">
                      api-gateway.metamask-login.site/auth
                    </div>
                    <div className="text-white/30 text-[10px] flex items-center gap-2 uppercase tracking-widest">
                      <MapPin size={12} weight="fill" />
                      Nodo Tokio · Phishing nivel 5
                    </div>
                  </div>

                  <div className="threat-card p-6 rounded-3xl hover:border-hot-fuchsia/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-hot-fuchsia text-xs font-black uppercase tracking-widest">
                        Neutralizado
                      </span>
                      <span className="text-white/20 text-[10px] font-mono">
                        hace 1,4 s
                      </span>
                    </div>
                    <div className="text-white font-mono text-sm truncate mb-1">
                      dex-drainer-v9.eth.io/claim
                    </div>
                    <div className="text-white/30 text-[10px] flex items-center gap-2 uppercase tracking-widest">
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
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-10 leading-tight">
                Protegemos la web,
                <br />
                <span className="text-hot-fuchsia">enlace por enlace.</span>
              </h2>
              <p className="text-white/50 text-lg sm:text-xl mb-12 leading-relaxed">
                La comunidad SafeLink comparte detecciones para anticipar estafas
                antes de que se propaguen.
              </p>

              <div className="relative h-[300px] w-full map-panel glass-panel rounded-[40px] overflow-hidden border border-white/10">
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

                <div className="absolute bottom-6 right-8 text-hot-fuchsia font-black text-xs uppercase tracking-[0.3em] opacity-30">
                  Zona neutralizada
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-40 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto relative group">
            <div className="absolute -inset-10 cta-halo rounded-[80px] opacity-50" />

            <div className="relative glass-panel-heavy p-10 sm:p-20 rounded-[40px] sm:rounded-[60px] border border-white/10 text-center overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                <ShieldCheck size={120} className="sm:hidden" />
                <ShieldCheck size={180} className="hidden sm:block" />
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-10 leading-tight">
                ¿Listo para navegar
                <br />
                con confianza?
              </h2>

              <p className="text-white/60 text-lg sm:text-xl mb-16 max-w-2xl mx-auto leading-relaxed">
                Instalá la extensión en un clic y tené el semáforo de seguridad en
                Google y en cada sitio que visitás.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link
                  to="/extension"
                  className="w-full md:w-auto bg-white text-black font-black px-10 sm:px-12 py-5 sm:py-6 rounded-2xl hover:bg-neon-ice hover:scale-105 transition duration-300 flex items-center justify-center gap-3"
                >
                  <GoogleChromeLogo size={24} />
                  AGREGAR A CHROME
                </Link>
                <Link
                  to="/login"
                  className="w-full md:w-auto glass-panel text-white font-black px-10 sm:px-12 py-5 sm:py-6 rounded-2xl hover:bg-white/10 transition duration-300 flex items-center justify-center gap-3"
                >
                  <Layout size={24} />
                  INICIAR SESIÓN
                </Link>
              </div>

              <div className="mt-16 pt-16 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 sm:gap-12 grayscale opacity-40">
                <span className="font-bold text-xl sm:text-2xl tracking-tighter">
                  FORBES
                </span>
                <span className="font-bold text-xl sm:text-2xl tracking-tighter">
                  TECHCRUNCH
                </span>
                <span className="font-bold text-xl sm:text-2xl tracking-tighter">
                  WIRED
                </span>
                <span className="font-bold text-xl sm:text-2xl tracking-tighter">
                  VERGE
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
