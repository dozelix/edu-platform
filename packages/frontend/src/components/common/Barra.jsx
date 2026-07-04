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
      <span className="block w-28 h-2 bg-[#f0ebff] rounded-full overflow-hidden">
        <span className="block h-full bg-[#3b1c8c] rounded-full" style={{ width: `${valor}%` }} />
      </span>
      <span className="text-xs font-semibold text-[#3e4143] w-9 text-right">{valor}%</span>
    </span>
  )
}