export default function ToolHeader({ tag, name, description }) {
  return (
    <header className="app-page-header">
      {tag && <span className="section-tag">{tag}</span>}
      <h1>{name}</h1>
      {description && <p>{description}</p>}
    </header>
  )
}
