import React from 'react'

const STATS = [
  { value: '1,248', label: 'Estudiantes activos', badge: '+12 este mes', badgeType: 'success', color: '#7c3aed' },
  { value: '24', label: 'Cursos publicados', badge: '3 nuevos', badgeType: 'primary', color: '#06b6d4' },
  { value: '156', label: 'Lecciones totales', badge: 'publicadas', badgeType: 'accent', color: '#f59e0b' },
  { value: '89%', label: 'Tasa de completación', badge: '↑ 4% vs antes', badgeType: 'success', color: '#10b981' },
]

export default function StatsGrid() {
  return (
    <section className="db-stats" aria-label="Estadísticas principales">
      {STATS.map((s, i) => (
        <article key={s.label} className="db-stat" style={{ animationDelay: `${i * 0.06}s` }}>
          <div className="db-stat__bar" style={{ background: s.color }} />
          <div className="db-stat__value">{s.value}</div>
          <div className="db-stat__label">{s.label}</div>
          <span className={`db-stat__badge ${s.badgeType}`}>{s.badge}</span>
        </article>
      ))}
    </section>
  )
}