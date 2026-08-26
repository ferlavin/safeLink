/** Fichas informativas de la landing. Públicas: no piden login. */

export const LANDING_TOPICS = {
  'analisis-integral': {
    tag: 'Plataforma',
    title: 'Análisis de enlaces',
    summary:
      'SafeLink revisa una URL y la resume en un semáforo: verde, amarillo o rojo. Eso es el producto.',
    body: [
      'El análisis principal mira cómo está escrita la dirección y si imita una marca conocida. El resultado no es un informe para expertos: es un veredicto para decidir si conviene hacer clic.',
      'PDF y páginas que piden conectar la billetera existen como acciones secundarias dentro de Analizar, no como una suite de 10 módulos.',
    ],
    how: [
      'Pegás un enlace en Analizar.',
      'SafeLink corre las revisiones que aplican a esa URL.',
      'Recibís verde, amarillo o rojo y, si tenés cuenta, queda en tu historial.',
    ],
    appHref: '/analyze',
    appLabel: 'Probar el análisis de URL',
    related: ['analisis-url', 'semaforo', 'extension'],
  },
  infraestructura: {
    tag: 'Plataforma',
    title: 'Qué hay detrás',
    summary:
      'Un motor liviano de análisis, historial en tu cuenta y una extensión de Chrome. Nada de radar mundial.',
    body: [
      'SafeLink está pensado para responder en segundos: analizás, ves el semáforo y seguís. El historial guarda lo que ya revisaste si tenés cuenta.',
      'No hay un mapa de amenazas en vivo. Si la comunidad reporta un dominio, esa actividad se puede listar; no geolocalizamos la IP de quien escaneó.',
    ],
    how: [
      'Cada análisis se guarda asociado a tu cuenta.',
      'Los reportes salen de Mis enlaces.',
      'Desde el portal ves historial, mensajes y la extensión.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ver el portal',
    related: ['portal', 'analisis-url', 'reportes'],
  },
  equipo: {
    tag: 'Plataforma',
    title: 'El equipo y la comunidad',
    summary:
      'SafeLink se apoya en usuarios que analizan enlaces y reportan sitios sospechosos.',
    body: [
      'Cuando alguien reporta un sitio, el equipo puede responder por Mensajes. No hay un feed inventado de inteligencia global.',
      'Cuanto más se usa con criterio, más útil es el historial de reportes para todos. Eso no convierte a SafeLink en un SOC 24/7.',
    ],
    how: [
      'Analizás o reportás un sitio desde tu cuenta.',
      'El dominio puede aparecer en la actividad reciente de la comunidad.',
      'El equipo puede responderte en Mensajes si abriste un reporte.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ver el portal',
    related: ['reportes', 'portal', 'analisis-url'],
  },
  proteccion: {
    tag: 'Plataforma',
    title: 'Extensión en Chrome',
    summary:
      'La extensión marca resultados de Google y el sitio que estás por abrir, con el mismo semáforo que el portal. Funciona cuando Chrome está abierto y la extensión instalada, no “24/7 en el planeta”.',
    body: [
      'No hace falta entrar al dashboard cada vez que buscás algo. Con la extensión instalada ves un punto de color al lado de los resultados y en la barra del navegador.',
      'Verde: podés entrar con más tranquilidad. Amarillo: revisá antes de poner contraseñas. Rojo: no te recomendamos continuar.',
    ],
    how: [
      'Instalás SafeLink en Chrome.',
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
      'La extensión es la forma más directa de usar SafeLink: semáforo en la pestaña actual y puntos de color en Google (.com y .ar). Avisa; no bloquea la navegación.',
      'No está publicada en Chrome Web Store. Se instala en modo desarrollador desde la carpeta extension/, con una guía en esta web.',
    ],
    how: [
      'Cargá la carpeta extension/ en chrome://extensions (modo desarrollador).',
      'Fijá el ícono SafeLink en la barra de Chrome.',
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
      'Tu cuenta reúne historial de análisis, reportes y mensajes. Las encuestas, si hay, están en Opciones.',
    body: [
      'Sin cuenta podés leer estas fichas. Para analizar, guardar y reportar hace falta registrarte: así cada resultado queda asociado a vos y no se pierde al cerrar el navegador.',
      'Si sos administrador, el portal también incluye gestión de usuarios, estadísticas y la bandeja de reportes.',
    ],
    how: [
      'Creá una cuenta o iniciá sesión.',
      'Desde el dashboard analizás un enlace, instalás la extensión o ves el historial.',
      'Mis enlaces y Mensajes guardan el rastro de lo que ya hiciste.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ir al portal',
    related: ['analisis-url', 'reportes', 'semaforo'],
  },
  'mapa-alertas': {
    tag: 'Comunidad',
    title: 'Actividad reciente de la comunidad',
    summary:
      'Lista de dominios reportados o con riesgo alto. No es un radar mundial ni amenazas en vivo.',
    body: [
      'No geolocalizamos la IP de quien escaneó. No inventamos puntos en un mapa. Si no hay reportes, la lista queda vacía a propósito.',
      'A otros usuarios se les muestra el dominio, no la URL completa.',
    ],
    how: [
      'La comunidad analiza y reporta enlaces en SafeLink.',
      'Los reportes y los análisis alto/crítico alimentan la lista de dominios.',
      'No hay un mapa de amenazas como prueba de inteligencia en vivo.',
    ],
    appHref: '/dashboard',
    appLabel: 'Ir al portal',
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
      'Las estafas cripto imitan wallets y páginas de “conectar para verificar”. Esta herramienta mira la página y busca señales de que el pedido de permisos se ve peligroso.',
      'No afirma detectar contratos maliciosos ni firmas sospechosas. Nunca reemplaza revisar la dirección de la wallet. Es una capa extra antes de conectar.',
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
      'Módulos más técnicos: patrones de lenguaje en la URL, cabeceras HTTP, OAuth falso y formularios que envían datos dos veces.',
    body: [
      'Pensado para un caso dudoso, no para el flujo feliz. El análisis de lenguaje busca palabras típicas de estafa en la propia URL. No vendemos un transformer entrenado si ese modelo no está cargado.',
      'Las cabeceras, OAuth y formularios apuntan a logins truchos. El camino principal sigue siendo Analizar.',
    ],
    how: [
      'Entrá a Seguridad avanzada (con tu cuenta).',
      'Elegí el módulo: lenguaje, headers, OAuth o formularios.',
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
      'Analizás un enlace desde Analizar (o un PDF como acción secundaria).',
      'SafeLink resume el puntaje en un nivel de riesgo.',
      'Ese color se repite en Mis enlaces y en la extensión.',
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
      'Reportar ayuda a la comunidad: el dominio puede aparecer en la actividad reciente. No convierte a SafeLink en un radar mundial.',
    ],
    how: [
      'Iniciá sesión y andá a Mis enlaces.',
      'Elegí el sitio y usá Reportar, con un motivo claro.',
      'Seguí el estado en Mensajes.',
    ],
    appHref: '/enlaces',
    appLabel: 'Ir a Mis enlaces',
    related: ['portal', 'equipo', 'analisis-url'],
  },
  'plan-standard': {
    tag: 'Producto',
    title: 'Gratis / MVP',
    summary: 'Un solo producto: extensión, análisis de enlaces y semáforo. Sin planes pagos.',
    body: [
      'No hay Standard vs Enterprise vs Prime. SafeLink es un MVP académico gratis. Registrarte te da el portal y el historial. La extensión suma el semáforo en Chrome.',
      'Pensado para uso individual: un mail raro, un PDF o un enlace de WhatsApp.',
    ],
    how: [
      'Creá una cuenta gratis.',
      'Instalá la extensión si usás Chrome.',
      'Analizá desde el portal cuando un enlace no te cierre.',
    ],
    appHref: '/register',
    appLabel: 'Crear cuenta',
    related: ['extension', 'portal', 'analisis-url'],
  },
  'plan-enterprise': {
    tag: 'Producto',
    title: 'No hay plan Enterprise',
    summary:
      'SafeLink no vende un plan Enterprise, SLA ni panel corporativo. Hay un solo producto gratis.',
    body: [
      'Las funciones de administración (usuarios, estadísticas, bandeja de reportes) son para el rol admin de este proyecto, no un producto pago.',
      'Si llegaste acá desde un enlace viejo: no hay onboarding Enterprise ni precios inventados.',
    ],
    how: [
      'Creá una cuenta personal gratis.',
      'Instalá la extensión.',
      'Analizá enlaces con el semáforo.',
    ],
    appHref: '/register',
    appLabel: 'Crear cuenta gratis',
    related: ['portal', 'plan-standard', 'extension'],
  },
  'plan-prime': {
    tag: 'Producto',
    title: 'No hay SafeLink Prime',
    summary:
      'No hay API comercial, SLA ni despliegue on-premise. Eso sería otra etapa, no este MVP.',
    body: [
      'Hoy el análisis vive en la API de este proyecto para la web y la extensión. Un SLA o un on-premise no se activa con un botón ni se cobra.',
      'El camino real es: cuenta gratis, extensión, semáforo.',
    ],
    how: [
      'Usá la plataforma web y la extensión.',
      'No hay un plan Custom que comprar.',
      'Si sos admin del proyecto, el panel admin no es un producto Prime.',
    ],
    appHref: '/register',
    appLabel: 'Crear cuenta gratis',
    related: ['plan-standard', 'portal', 'extension'],
  },
  privacidad: {
    tag: 'Legal',
    title: 'Privacidad',
    summary:
      'SafeLink analiza el enlace o archivo que vos le das. No enviamos tu historial de navegación completo.',
    body: [
      'Cuando analizás una URL o un PDF, esa información se usa para darte el veredicto y, si estás logueado, para guardarla en tu historial. No geolocalizamos tu IP como ubicación de una amenaza ni rastreo de tu vida digital.',
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
