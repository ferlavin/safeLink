import { RISK_LABELS } from '../constants/labels'

const LEVEL_STYLES = {
  bajo: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  medio: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  alto: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  critico: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

export default function RiskBadge({ level }) {
  const label = RISK_LABELS[level] || level
  return (
    <span
      className={`rounded-full border px-3 py-1 text-sm font-medium ${LEVEL_STYLES[level] || LEVEL_STYLES.bajo}`}
    >
      {label}
    </span>
  )
}
