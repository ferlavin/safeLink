/**
 * Badge único del semáforo de amenazas. Cualquier pantalla que muestre un
 * estado (riesgo, resultado de escaneo, estado de reporte) usa este
 * componente para que el color signifique siempre lo mismo.
 */
const TONE_CLASS = {
  safe: 'sl-badge--safe',
  warn: 'sl-badge--warn',
  high: 'sl-badge--high',
  danger: 'sl-badge--danger',
  info: 'sl-badge--info',
  neutral: '',
}

export default function StatusBadge({
  tone = 'neutral',
  children,
  size,
  dot = true,
  pulse = false,
  className = '',
}) {
  const classes = [
    'sl-badge',
    TONE_CLASS[tone] ?? '',
    size === 'lg' ? 'sl-badge--lg' : '',
    pulse ? 'sl-badge--pulse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      {dot && <span className="sl-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
