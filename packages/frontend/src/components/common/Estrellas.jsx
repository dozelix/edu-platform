import { Star } from 'lucide-react'

export default function Estrellas({ valor, className = 'inline-flex items-center gap-1', starSize = 13 }) {
  if (valor == null) return <span className="text-sm text-[#9ba0a6]">Sin calificación</span>
  const llenas = Math.round(valor)
  const valorFormateado = valor.toFixed(1)

  return (
    <span className={className} aria-hidden="true">
      {className.includes('cat-card__stars') && <strong>{valorFormateado}</strong>}
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={starSize}
          className={i <= llenas ? 'is-on text-[#e59819]' : 'is-off text-[#d1d7dc]'}
          fill={i <= llenas ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}