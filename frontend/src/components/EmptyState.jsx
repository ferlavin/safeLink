/**
 * Estado vacío del sistema: anillos concéntricos + icono enmarcado, título
 * con la tipografía display, texto de apoyo y acciones. Se usa en lugar de
 * dejar un párrafo suelto en medio de la pantalla.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  compact = false,
  className = '',
}) {
  return (
    <div className={`sl-empty${compact ? ' sl-empty--compact' : ''} ${className}`.trim()}>
      <div className="sl-empty__art" aria-hidden="true">
        <span className="sl-empty__icon">
          {Icon && <Icon size={compact ? 22 : 30} weight="duotone" />}
        </span>
      </div>
      <h2 className="sl-empty__title">{title}</h2>
      {description && <p className="sl-empty__text">{description}</p>}
      {actions && <div className="sl-empty__actions">{actions}</div>}
    </div>
  )
}
