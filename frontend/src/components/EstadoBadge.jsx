import StatusBadge from './StatusBadge'
import { ESTADO_LABELS } from '../constants/labels'

const ESTADO_TONE = {
  Seguro: 'safe',
  Precaucion: 'warn',
  Peligroso: 'danger',
  Pendiente: 'neutral',
}

export default function EstadoBadge({ estado }) {
  return (
    <StatusBadge tone={ESTADO_TONE[estado] || 'neutral'}>
      {ESTADO_LABELS[estado] || estado || '—'}
    </StatusBadge>
  )
}
