import StatusBadge from './StatusBadge'
import { RISK_LABELS } from '../constants/labels'

const LEVEL_TONE = {
  bajo: 'safe',
  medio: 'warn',
  alto: 'high',
  critico: 'danger',
}

export default function RiskBadge({ level }) {
  return (
    <StatusBadge tone={LEVEL_TONE[level] || 'safe'} size="lg">
      {RISK_LABELS[level] || level}
    </StatusBadge>
  )
}
