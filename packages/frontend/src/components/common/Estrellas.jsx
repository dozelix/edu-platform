import { Star } from 'lucide-react'

export default function Estrellas({ valor, className = 'inline-flex items-center gap-1', starSize = 13 }) {
  if (valor == null) return <span className="text-sm text-subtle">Sin calificación</span>
  const llenas = Math.round(valor)
  const valorFormateado = valor.toFixed(1)

  return (
    <span className={className} aria-hidden="true">
      {className.includes('cat-card__stars') && <strong>{valorFormateado}</strong>}
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={starSize}
          className={i <= llenas ? 'is-on' : 'is-off'}
          style={{ color: i <= llenas ? 'var(--color-accent-2)' : 'var(--color-border)' }}
          fill={i <= llenas ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}