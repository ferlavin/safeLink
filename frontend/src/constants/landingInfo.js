/** Fichas informativas de la landing. Públicas: no piden login. */

export const LANDING_TOPICS = {
  'analisis-integral': {
    tag: 'Plataforma',
    title: 'Análisis integral',
    summary:
      'SafeLink reúne más de 10 módulos para cubrir distintos tipos de amenaza: enlaces, PDFs, sitios falsos, cripto y señales técnicas.',
    body: [
      'Un solo semáforo no alcanza si cada estafa usa un truco distinto. Por eso SafeLink combina varias revisiones: cómo se escribe la URL, si imita una marca, qué dice el DNS, si un PDF esconde enlaces y si una página pide conectar una billetera.',
      'No hace falta entender cada módulo. El resultado se resume en verde, amarillo o rojo, el mismo lenguaje en la web y en la extensión de Chrome.',
    ],
    how: [
      'Pegás un enlace o subís un archivo según la herramienta.',
      'SafeLink corre los módulos que aplican a ese caso.',
      'Recibís un veredicto claro y, si tenés cuenta, queda en tu historial.',
    ],
    appHref: '/analyze',
    appLabel: 'Probar el análisis de URL',
    related: ['analisis-url', 'seguridad-avanzada', 'extension'],
  },
  infraestructura: {
    tag: 'Plataforma',
    title: 'Infraestructura',
    summary:
      'El motor de análisis, el mapa de alertas de la comunidad y el historial de enlaces viven en un mismo sistema liviano.',
    body: [
      'SafeLink está pensado para responder en segundos: analizás, ves el semáforo y seguís. El historial guarda lo que ya revisaste. El mapa muestra detecciones recientes de la comunidad, con ubicaciones aproximadas por IP.',
      'No es un radar mundial de ciberataques. Es la infraestructura de esta plataforma: análisis, comunidad y panel, sin inventar datos.',
    ],
    how: [
      'Cada análisis se guarda asociado a tu cuenta.',
      'Las detecciones de riesgo medio o peor pueden aparecer en el mapa de alertas.',
      'Desde el portal ves historial, reportes y herramientas avanzadas.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ver el portal',
    related: ['mapa-alertas', 'portal', 'analisis-url'],
  },
  equipo: {
    tag: 'Plataforma',
    title: 'El equipo y la comunidad',
    summary:
      'SafeLink se apoya en usuarios que analizan enlaces y reportan sitios sospechosos para proteger al resto.',
    body: [
      'Cuando alguien analiza un enlace riesgoso o reporta un sitio, esa señal suma a la comunidad. El mapa de alertas y los reportes no salen de un feed inventado: salen de lo que la gente usa en la plataforma.',
      'El equipo de SafeLink revisa reportes y responde por la bandeja de mensajes. Cuanto más se usa con criterio, más útil es para todos.',
    ],
    how: [
      'Analizás o reportás un sitio desde tu cuenta.',
      'Si el riesgo es medio o peor, puede verse en el mapa (ubicación aproximada).',
      'El equipo puede responderte en Mensajes si abriste un reporte.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ver el portal',
    related: ['mapa-alertas', 'reportes', 'portal'],
  },
  proteccion: {
    tag: 'Plataforma',
    title: 'Protección 24/7',
    summary:
      'La extensión de Chrome vigila resultados de Google y el sitio que estás por abrir, con el mismo semáforo que el portal.',
    body: [
      'No hace falta entrar al dashboard cada vez que buscás algo. Con la extensión instalada ves un punto de color al lado de los resultados y en la barra del navegador.',
      'Verde: podés entrar con más tranquilidad. Amarillo: revisá antes de poner contraseñas. Rojo: no te recomendamos continuar.',
    ],
    how: [
      'Instalás SafeLink en Chrome (carpeta de la extensión o Chrome Web Store).',
      'Buscás en Google o abrís un enlace.',
      'El semáforo te avisa antes de hacer clic o de cargar la página.',
    ],
    appHref: '/extension',
    appLabel: 'Ver cómo instalarla',
    related: ['extension', 'analisis-url', 'semaforo'],
  },
  'analisis-url': {
    tag: 'Servicios',
    title: 'Analizar URL',
    summary:
      'Pegá cualquier enlace sospechoso y SafeLink te dice en segundos si conviene abrirlo, con un semáforo de riesgo.',
    body: [
      'Es la herramienta principal. Revisa cómo está escrita la dirección, si parece una marca falsa, si el enlace es raro o enredado y, si está configurado, listas de reputación como Google Safe Browsing.',
      'El resultado no es un informe para expertos: es un veredicto para decidir. Si tenés cuenta, el análisis queda en Mis enlaces para consultarlo después o reportarlo.',
    ],
    how: [
      'Entrá a Analizar URL (con tu cuenta).',
      'Pegá la dirección completa, incluyendo https.',
      'Leé el semáforo y, si hace falta, el detalle de por qué salió ese color.',
    ],
    appHref: '/analyze',
    appLabel: 'Ir a analizar un enlace',
    related: ['pdf', 'typosquatting', 'extension'],
  },
  extension: {
    tag: 'Servicios',
    title: 'Extensión Chrome',
    summary:
      'Un semáforo en el navegador: punto de color en Google y en la barra, antes de que entres a un sitio dudoso.',
    body: [
      'La extensión es la forma más directa de usar SafeLink en el día a día. No reemplaza el sentido común: te da una señal rápida para no caer en un clic impulsivo.',
      'Esta página de información no instala nada. Si querés usarla, hay una guía de instalación (modo desarrollador o Chrome Web Store, según cómo esté publicado el proyecto).',
    ],
    how: [
      'Instalá la extensión desde la guía de SafeLink.',
      'Fijá el ícono en la barra de Chrome.',
      'Opcional: iniciá sesión en el popup para guardar lo que revisás.',
    ],
    appHref: '/extension',
    appLabel: 'Abrir la guía de instalación',
    related: ['proteccion', 'analisis-url', 'semaforo'],
  },
  portal: {
    tag: 'Servicios',
    title: 'Portal SafeLink',
    summary:
      'Tu cuenta reúne historial de análisis, reportes, mensajes, encuestas y el resto de las herramientas.',
    body: [
      'Sin cuenta podés conocer SafeLink desde esta web. Para analizar, guardar y reportar hace falta registrarte: así cada resultado queda asociado a vos y no se pierde al cerrar el navegador.',
      'Si sos administrador, el portal también incluye gestión de usuarios, estadísticas y la bandeja de reportes de toda la plataforma.',
    ],
    how: [
      'Creá una cuenta o iniciá sesión.',
      'Desde el dashboard elegís la herramienta que necesitás.',
      'Mis enlaces y Mensajes guardan el rastro de lo que ya hiciste.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ir al portal',
    related: ['analisis-url', 'reportes', 'plan-standard'],
  },
  'mapa-alertas': {
    tag: 'Servicios',
    title: 'Mapa de alertas',
    summary:
      'Mapa de detecciones reales de la comunidad SafeLink. Las ubicaciones son aproximadas, como suele ser en ciberseguridad.',
    body: [
      'No es un radar mundial de ciberataques ni la dirección GPS del servidor. Cada punto sale de un análisis de riesgo medio, alto o crítico hecho por un usuario en las últimas 24 horas.',
      'Geolocalizar por IP da un país o una región, no una calle. Si no hay detecciones, el mapa queda vacío a propósito: no rellenamos con datos de ejemplo.',
    ],
    how: [
      'La comunidad analiza enlaces en SafeLink.',
      'Si el riesgo es medio o peor, el evento puede geolocalizarse de forma aproximada.',
      'En el mapa ves zonas, no direcciones exactas. Hay una guía al entrar a la herramienta.',
    ],
    appHref: '/threat-map',
    appLabel: 'Abrir el mapa (con cuenta)',
    related: ['equipo', 'analisis-url', 'reportes'],
  },
  pdf: {
    tag: 'Herramientas',
    title: 'Revisión de PDF',
    summary:
      'Revisa los enlaces escondidos dentro de un PDF de correo (factura, CV, contrato) sin tener que abrirlos uno por uno.',
    body: [
      'Muchas estafas llegan como adjunto. El PDF se ve profesional, pero adentro hay un enlace a un sitio falso. Esta herramienta lista esas URLs y las analiza con el mismo criterio que Analizar URL.',
      'Sirve cuando no querés hacer clic “por las dudas”. Subís el archivo y SafeLink te dice cuáles enlaces conviene no abrir.',
    ],
    how: [
      'Entrá a Revisar PDFs de correo (con tu cuenta).',
      'Subí el archivo que te mandaron.',
      'Revisá la lista de enlaces y el semáforo de cada uno.',
    ],
    appHref: '/analyze/pdf',
    appLabel: 'Ir a revisar un PDF',
    related: ['analisis-url', 'typosquatting', 'extension'],
  },
  dns: {
    tag: 'Herramientas',
    title: 'Guardia DNS',
    summary:
      'Comprueba en qué servidores está alojado un dominio y si encaja con lo que esperarías de esa marca.',
    body: [
      'Un sitio puede copiar el diseño de un banco y usar un nombre parecido. El DNS muestra a dónde apunta realmente: proveedores, historial del dominio y señales de que el sitio es muy nuevo o está en listas de alerta.',
      'No reemplaza al análisis de URL: lo complementa cuando sospechás de una copia de un sitio conocido.',
    ],
    how: [
      'Abrí Guardia DNS o Historial del dominio (con tu cuenta).',
      'Ingresá la dirección que ves en el mensaje o en el navegador.',
      'Compará servidores, antigüedad y alertas con lo que esperás de la marca real.',
    ],
    appHref: '/analyze/dns',
    appLabel: 'Ir a Guardia DNS',
    related: ['typosquatting', 'analisis-url', 'seguridad-avanzada'],
  },
  web3: {
    tag: 'Herramientas',
    title: 'Sentinela Web3',
    summary:
      'Revisa páginas que te piden conectar la billetera y avisa si el pedido de permisos se ve peligroso.',
    body: [
      'Las estafas cripto imitan wallets, airdrops y “conectar para verificar”. Esta herramienta mira la página y busca señales de que quieren permisos que podrían vaciar fondos.',
      'Nunca reemplaza revisar la dirección de la wallet y el contrato. Es una capa extra antes de conectar.',
    ],
    how: [
      'Copiá la URL de la página que pide “Connect wallet”.',
      'Pegala en Sentinela Web3 (con tu cuenta).',
      'Si el semáforo no es verde, no conectes la billetera.',
    ],
    appHref: '/analyze/web3',
    appLabel: 'Ir a Sentinela Web3',
    related: ['analisis-url', 'typosquatting', 'seguridad-avanzada'],
  },
  typosquatting: {
    tag: 'Herramientas',
    title: 'Typosquatting',
    summary:
      'Detecta dominios que imitan marcas conocidas cambiando una letra, un acento o un sufijo (.com vs .net).',
    body: [
      'Es una de las estafas más comunes: “banco-nacion-login.com” en vez del sitio oficial. SafeLink compara lo que pegaste con nombres de marcas (en especial del contexto argentino) y te avisa si parece una copia.',
      'Combinado con Analizar URL y DNS, ayuda a no entrar a un clon que se ve idéntico al original.',
    ],
    how: [
      'Pegá la dirección exactamente como la ves.',
      'SafeLink la compara con marcas y patrones típicos de imitación.',
      'Si hay coincidencia sospechosa, el semáforo sube el riesgo.',
    ],
    appHref: '/analyze/typosquatting',
    appLabel: 'Ir a detectar sitios falsos',
    related: ['analisis-url', 'dns', 'pdf'],
  },
  'seguridad-avanzada': {
    tag: 'Herramientas',
    title: 'Seguridad avanzada',
    summary:
      'Módulos más técnicos: clasificador NLP de URLs, cabeceras HTTP, OAuth falso y formularios que envían datos dos veces.',
    body: [
      'Pensado para quien quiere ir un poco más allá del semáforo básico. El clasificador NLP busca patrones de phishing en la propia URL. Las cabeceras muestran si el sitio se protege contra XSS o clickjacking. OAuth y formularios apuntan a logins truchos.',
      'No hace falta usarlos todos los días. Están para casos dudosos o para aprender cómo se construye una revisión más profunda.',
    ],
    how: [
      'Entrá a Seguridad avanzada (con tu cuenta).',
      'Elegí el módulo: NLP, headers, OAuth o formularios.',
      'Pegá la URL y leé el resultado junto al resto del análisis.',
    ],
    appHref: '/analyze/security',
    appLabel: 'Ir a seguridad avanzada',
    related: ['analisis-url', 'dns', 'web3'],
  },
  semaforo: {
    tag: 'Cómo funciona',
    title: 'El semáforo de SafeLink',
    summary:
      'Verde, amarillo o rojo: el mismo veredicto en la web, el historial y la extensión.',
    body: [
      'El color no es decoración. Verde significa que, con la información que SafeLink tiene, el enlace se ve razonable. Amarillo pide cuidado (no pongas contraseñas sin revisar). Rojo recomienda no entrar.',
      'Ningún analizador es infalible. El semáforo reduce el riesgo de un clic impulsivo; no garantiza que un sitio verde sea eterno ni que uno amarillo sea siempre una estafa.',
    ],
    how: [
      'Analizás un enlace, un PDF o un sitio con cualquiera de las herramientas.',
      'SafeLink resume el puntaje en un nivel de riesgo.',
      'Ese color se repite en Mis enlaces, el mapa (si aplica) y la extensión.',
    ],
    appHref: '/analyze',
    appLabel: 'Probarlo con una URL',
    related: ['analisis-url', 'extension', 'proteccion'],
  },
  reportes: {
    tag: 'Comunidad',
    title: 'Reportar una amenaza',
    summary:
      'Si un sitio te parece falso o peligroso, podés reportarlo y seguir la conversación con el equipo SafeLink.',
    body: [
      'Los reportes salen de Mis enlaces: elegís un análisis y contás qué pasó. El equipo ve la bandeja y puede responderte. No hace falta un mail aparte para el caso típico.',
      'Reportar ayuda a la comunidad, pero el mapa de alertas se alimenta sobre todo de los análisis con riesgo medio o peor, no de un clic suelto en “reportar”.',
    ],
    how: [
      'Iniciá sesión y andá a Mis enlaces.',
      'Elegí el sitio y usá Reportar, con un motivo claro.',
      'Seguí el estado en Mensajes.',
    ],
    appHref: '/enlaces',
    appLabel: 'Ir a Mis enlaces',
    related: ['portal', 'mapa-alertas', 'equipo'],
  },
  'plan-standard': {
    tag: 'Planes',
    title: 'Plan Standard',
    summary: 'Uso personal y gratuito: extensión, análisis básico y el semáforo de seguridad.',
    body: [
      'Es el punto de partida. Registrarte te da el portal, el historial y las herramientas de análisis. La extensión suma la protección en Chrome.',
      'Pensado para uso individual: revisar un mail raro, un PDF o un enlace de WhatsApp.',
    ],
    how: [
      'Creá una cuenta gratis.',
      'Instalá la extensión si usás Chrome.',
      'Analizá desde el dashboard cuando un enlace no te cierre.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ir al portal',
    related: ['extension', 'portal', 'plan-enterprise'],
  },
  'plan-enterprise': {
    tag: 'Planes',
    title: 'Plan Enterprise',
    summary:
      'Para equipos: panel de administración, mapa de alertas de la comunidad y reportes avanzados.',
    body: [
      'En este proyecto, las funciones de administración (usuarios, estadísticas, bandeja de reportes) están en el rol admin. El plan se presenta en la landing para explicar el alcance de un uso en equipo.',
      'Un administrador no analiza “por magia”: sigue usando las mismas herramientas, con visibilidad extra sobre la plataforma.',
    ],
    how: [
      'Un admin crea o invita cuentas.',
      'El equipo analiza y reporta desde el portal.',
      'El panel muestra usuarios, estadísticas y reportes abiertos.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ir al portal',
    related: ['portal', 'mapa-alertas', 'plan-prime'],
  },
  'plan-prime': {
    tag: 'Planes',
    title: 'SafeLink Prime',
    summary:
      'Enfoque para infraestructura crítica: API, acuerdos de servicio y un despliegue más controlado.',
    body: [
      'Esta ficha describe una línea de producto para organizaciones que necesitan integrar el análisis en sus propios sistemas. En el MVP académico, el análisis vive en la API de SafeLink; un despliegue on-premise o un SLA formal sería una evolución, no algo que se active con un botón.',
      'Si te interesa el modelo técnico, el backend ya expone rutas de análisis autenticadas con JWT.',
    ],
    how: [
      'Hoy: usá la plataforma web y la extensión.',
      'A futuro: integrar la API en un flujo interno.',
      'Para un equipo, el plan Enterprise cubre la operación diaria.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ir al portal',
    related: ['plan-enterprise', 'infraestructura', 'seguridad-avanzada'],
  },
  privacidad: {
    tag: 'Legal',
    title: 'Privacidad',
    summary:
      'SafeLink analiza el enlace o archivo que vos le das. No enviamos tu historial de navegación completo.',
    body: [
      'Cuando analizás una URL o un PDF, esa información se usa para darte el veredicto y, si estás logueado, para guardarla en tu historial. El mapa de alertas usa detecciones de la comunidad con geolocalización aproximada de la IP del análisis, no un rastreo de tu vida digital.',
      'No pedimos permiso para leer todo lo que visitás. La extensión marca resultados y páginas en el momento; no es un keylogger ni un recorte de pantalla.',
    ],
    how: [
      'Solo se analiza lo que pegás, subís o la extensión revisa en esa visita.',
      'Con cuenta, el historial queda en tu usuario.',
      'Podés pedir baja de la cuenta a un administrador de la plataforma.',
    ],
    appHref: '/register',
    appLabel: 'Crear cuenta',
    related: ['terminos', 'extension', 'portal'],
  },
  terminos: {
    tag: 'Legal',
    title: 'Términos de uso',
    summary:
      'SafeLink es una ayuda para decidir. No reemplaza el criterio ni garantiza que un sitio sea 100% seguro para siempre.',
    body: [
      'Al registrarte aceptás usar la plataforma de forma responsable: no para atacar sistemas, no para hostigar y no como única prueba legal de un incidente.',
      'Los veredictos son orientativos. Un falso negativo o un falso positivo pueden ocurrir. Si un enlace es crítico para vos (banco, salud, trabajo), combiná SafeLink con canales oficiales de esa organización.',
    ],
    how: [
      'Leé esta ficha antes de crear la cuenta.',
      'En el registro se pide aceptar términos y privacidad.',
      'El incumplimiento puede llevar a suspensión o ban por un admin.',
    ],
    appHref: '/register',
    appLabel: 'Ir al registro',
    related: ['privacidad', 'cookies', 'portal'],
  },
  cookies: {
    tag: 'Legal',
    title: 'Cookies y sesión',
    summary:
      'Usamos almacenamiento local para la sesión y preferencias (idioma, tema, avatar). No usamos una red de publicidad de terceros.',
    body: [
      'Al iniciar sesión, el token y los datos básicos del usuario se guardan en el navegador para no pedirte la contraseña en cada clic. El idioma y el modo simple también se recuerdan.',
      'Si borrás los datos del sitio o cerrás sesión, esa información local se limpia. La extensión puede guardar estado propio de Chrome, aparte de la web.',
    ],
    how: [
      'Iniciás sesión y la app recuerda tu sesión en este navegador.',
      'Preferencias como el idioma se asocian a tu cuenta.',
      'Cerrar sesión borra el token local.',
    ],
    appHref: '/login',
    appLabel: 'Iniciar sesión',
    related: ['privacidad', 'terminos', 'portal'],
  },
}

export function getLandingTopic(slug) {
  return LANDING_TOPICS[slug] || null
}
