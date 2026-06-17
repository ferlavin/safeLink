import { ESTADO_LABELS } from '../constants/labels'

const LEVEL_STYLES = {
  Seguro: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Precaucion: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Peligroso: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Pendiente: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

export default function EstadoBadge({ estado }) {
  const label = ESTADO_LABELS[estado] || estado || '—'
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[estado] || LEVEL_STYLES.Pendiente}`}
    >
      {label}
    </span>
  )
}
