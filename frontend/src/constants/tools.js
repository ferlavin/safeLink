/** Herramientas SafeLink — descripciones en lenguaje claro */

export const TOOLS = {
  web3: {
    name: 'Proteccion billetera crypto',
    tag: 'Cripto',
    href: '/analyze/web3',
    category: 'Amenazas actuales',
    shortDesc:
      'Avisa si una pagina pide conectar la billetera de forma sospechosa.',
    longDesc:
      'Pega la direccion de una pagina que te pida "Conectar wallet". SafeLink revisa si intenta pedir permisos peligrosos que podrian vaciar tus fondos.',
  },
  pdf: {
    name: 'Revisar PDFs de correo',
    tag: 'Adjuntos',
    href: '/analyze/pdf',
    category: 'Amenazas actuales',
    shortDesc:
      'Revisa los enlaces dentro de un PDF sin tener que abrirlo.',
    longDesc:
      'Sube un PDF adjunto (factura, CV, contrato). SafeLink lista los enlaces que trae adentro y te dice cuales conviene no abrir.',
  },
  typosquatting: {
    name: 'Detectar sitios falsos',
    tag: 'Nombres parecidos',
    href: '/analyze/typosquatting',
    category: 'Amenazas actuales',
    shortDesc:
      'Comprueba si un sitio copia el nombre de un banco o marca conocida.',
    longDesc:
      'Escribe la direccion que ves (por ejemplo un banco con una letra cambiada). SafeLink la compara con sitios oficiales de marcas argentinas.',
  },
  dns: {
    name: 'Comprobar servidor del sitio',
    tag: 'Infraestructura',
    href: '/analyze/dns',
    category: 'Informacion de amenazas',
    shortDesc:
      'Ve si el sitio esta alojado donde corresponde para esa marca.',
    longDesc:
      'Util cuando sospechas de una copia de un sitio conocido: revisa en que servidores esta y si encaja con la marca real.',
    anchor: 'consistencia',
  },
  timeline: {
    name: 'Historial del dominio',
    tag: 'Antiguedad',
    href: '/analyze/dns',
    category: 'Informacion de amenazas',
    shortDesc:
      'Muestra cuando se registro el dominio, el certificado y si aparece en listas de alerta.',
    longDesc:
      'Sitios muy nuevos o recien listados como peligrosos son una senal de alerta. Aqui ves esa informacion reunida.',
    anchor: 'timeline',
  },
  map: {
    name: 'Mapa de alertas',
    tag: 'Comunidad',
    href: '/threat-map',
    category: 'Informacion de amenazas',
    shortDesc:
      'Mapa con sitios que otros usuarios marcaron como sospechosos.',
    longDesc:
      'Muestra en un mapa las detecciones recientes de la comunidad SafeLink. Se actualiza solo cada pocos segundos.',
  },
  url: {
    name: 'Revisar un enlace',
    tag: 'Revision general',
    href: '/analyze',
    category: 'Revision general',
    shortDesc:
      'Analisis rapido de cualquier enlace antes de hacer clic.',
    longDesc:
      'Pega una URL y obtiene un resumen sencillo: si el nombre parece falso, si el enlace es raro o si hay otras senales de estafa.',
    modules: {
      entropia:
        'Detecta enlaces muy raros o enredados que suelen ocultar trampas.',
      typosquatting:
        'Busca si el nombre del sitio imita a una marca conocida.',
      heuristicas:
        'Revisa trucos habituales en la direccion (numeros raros, @, etc.).',
    },
  },
}

export const TOOL_CATEGORIES = [
  {
    id: 'amenazas',
    title: 'Amenazas actuales',
    tools: [TOOLS.web3, TOOLS.pdf, TOOLS.typosquatting],
  },
  {
    id: 'intel',
    title: 'Informacion de amenazas',
    tools: [TOOLS.dns, TOOLS.timeline, TOOLS.map],
  },
  {
    id: 'tecnico',
    title: 'Revision general',
    tools: [TOOLS.url],
  },
]
