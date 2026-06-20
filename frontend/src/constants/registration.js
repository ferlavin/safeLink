export const COUNTRIES = [
  { code: 'AR', label: 'Argentina' },
  { code: 'BO', label: 'Bolivia' },
  { code: 'BR', label: 'Brasil' },
  { code: 'CL', label: 'Chile' },
  { code: 'CO', label: 'Colombia' },
  { code: 'CR', label: 'Costa Rica' },
  { code: 'CU', label: 'Cuba' },
  { code: 'DO', label: 'República Dominicana' },
  { code: 'EC', label: 'Ecuador' },
  { code: 'SV', label: 'El Salvador' },
  { code: 'ES', label: 'España' },
  { code: 'GT', label: 'Guatemala' },
  { code: 'HN', label: 'Honduras' },
  { code: 'MX', label: 'México' },
  { code: 'NI', label: 'Nicaragua' },
  { code: 'PA', label: 'Panamá' },
  { code: 'PY', label: 'Paraguay' },
  { code: 'PE', label: 'Perú' },
  { code: 'PR', label: 'Puerto Rico' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'VE', label: 'Venezuela' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'CA', label: 'Canadá' },
  { code: 'OTHER', label: 'Otro país' },
]

export const EXPERIENCE_LEVELS = [
  {
    id: 'principiante',
    label: 'Principiante',
    hint: 'Recién empiezo con seguridad digital',
  },
  {
    id: 'intermedio',
    label: 'Intermedio',
    hint: 'Conozco riesgos comunes y buenas prácticas',
  },
  {
    id: 'avanzado',
    label: 'Avanzado',
    hint: 'Trabajo o estudio ciberseguridad activamente',
  },
]

export function experienceLabel(level) {
  return EXPERIENCE_LEVELS.find((item) => item.id === level)?.label || '—'
}

export function countryLabel(codeOrName) {
  if (!codeOrName) return '—'
  const match = COUNTRIES.find((c) => c.code === codeOrName || c.label === codeOrName)
  return match?.label || codeOrName
}

export function calcAge(birthDate) {
  if (!birthDate) return null
  const born = new Date(birthDate)
  if (Number.isNaN(born.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - born.getFullYear()
  const monthDiff = today.getMonth() - born.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1
  }
  return age
}
