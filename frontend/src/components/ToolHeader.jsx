export default function ToolHeader({ name, description }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-[var(--app-text)]">{name}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--app-text-muted)]">
        {description}
      </p>
    </header>
  )
}
