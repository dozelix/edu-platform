export default function Barra({ valor, isCustomCss = false }) {
  // Si usa los estilos CSS nativos de MyLearning.jsx
  if (isCustomCss) {
    return (
      <div className="lrn-progress">
        <div
          className="lrn-progress__track"
          role="progressbar"
          aria-valuenow={valor}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`lrn-progress__fill${valor === 100 ? ' lrn-progress__fill--done' : ''}`}
            style={{ width: `${valor}%` }}
          />
        </div>
        <span className="lrn-progress__pct">{valor}%</span>
      </div>
    )
  }

  // Fallback para los estilos inline de InstructorDashboard.jsx
  return (
    <span
      className="inline-flex items-center gap-2"
      role="progressbar"
      aria-valuenow={valor}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="block w-28 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-primary-soft)' }}>
        <span className="block h-full rounded-full" style={{ width: `${valor}%`, background: 'var(--color-primary)' }} />
      </span>
      <span className="text-xs font-semibold w-9 text-right" style={{ color: 'var(--color-text)' }}>{valor}%</span>
    </span>
  )
}