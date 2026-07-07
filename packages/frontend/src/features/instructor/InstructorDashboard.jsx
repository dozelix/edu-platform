import React, { useEffect, useState } from 'react'
import { BookOpen, Users, Star, LogOut, GraduationCap } from 'lucide-react'

function Barra({ valor }) {
  return (
    <span
      className="inline-flex items-center gap-2"
      role="progressbar"
      aria-valuenow={valor}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="block w-28 h-2 bg-primary-soft rounded-full overflow-hidden">
        <span className="block h-full bg-primary rounded-full" style={{ width: `${valor}%` }} />
      </span>
      <span className="text-xs font-semibold text-body w-9 text-right">{valor}%</span>
    </span>
  )
}

function Estrellas({ valor }) {
  if (valor == null) return <span className="text-sm text-subtle">Sin calificación</span>
  const llenas = Math.round(valor)
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-sm font-bold text-star">{valor.toFixed(1)}</span>
      <span aria-hidden="true" className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            className={s <= llenas ? 'text-star' : 'text-subtle'}
            fill={s <= llenas ? '#e59819' : '#d1d7dc'}
          />
        ))}
      </span>
    </span>
  )
}

function EstadoBadge({ estado }) {
  const activo = estado === 'activo'
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full"
      style={{
        background: activo ? 'var(--color-success-soft)' : '#f7f9fa',
        color: activo ? 'var(--color-success)' : 'var(--color-text-muted)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: activo ? 'var(--color-success)' : 'var(--color-text-subtle)' }}
        aria-hidden="true"
      />
      {estado || 'sin estado'}
    </span>
  )
}

export default function InstructorDashboard({ user, onLogout }) {
  const [data, setData] = useState(null)
  const [estado, setEstado] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    async function cargar() {
      if (!globalThis.window?.api) {
        setEstado('no-api')
        return
      }
      if (!user?.id) {
        setEstado('no-user')
        return
      }
      try {
        const res = await globalThis.window.api.invoke('instructor:resumen')
        if (!activo) return
        if (res.success) {
          setData(res.data)
          setEstado('ready')
        } else {
          setError(res.error)
          setEstado('error')
        }
      } catch (err) {
        if (!activo) return
        setError(err.message)
        setEstado('error')
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [user])

  const nombre = user?.nombre || 'Instructor'
  const totales = data?.totales
  const stats = [
    {
      icon: BookOpen,
      label: 'Cursos publicados',
      value: totales ? totales.cursos : '—',
      color: '#dabf27',
      bg: 'var(--color-primary-soft)',
    },
    {
      icon: Users,
      label: 'Estudiantes',
      value: totales ? totales.estudiantes : '—',
      color: '#ac2199',
      bg: 'var(--color-success-soft)',
    },
    {
      icon: Star,
      label: 'Calificación promedio',
      value: totales?.calificacionPromedio ?? 'Sin calificación',
      color: '#b4690e',
      bg: 'var(--color-warning-soft)',
    },
  ]

  return (
    <div className="min-h-screen bg-body flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white border-b border-default sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center gap-3">
          <BookOpen size={20} className="text-primary" />
          <span className="text-lg font-extrabold text-primary">EduPlatform</span>
          <span className="text-xs font-semibold text-white bg-primary px-2 py-0.5 rounded-full">
            Instructor
          </span>
          <button
            onClick={onLogout}
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-color hover:text-danger border border-default hover:border-danger px-3 py-1.5 transition-colors"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-6 py-8 space-y-8">
        <section className="bg-gradient-to-r from-[#3b1c8c] to-[#5a2db8] text-white p-6 flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={24} />
          </span>
          <hgroup>
            <p className="text-sm text-on-primary mb-0.5">Bienvenido, instructor</p>
            <h1 className="text-2xl font-extrabold text-white">{nombre}</h1>
            <p className="text-sm text-on-primary mt-0.5">Tus cursos y quién está aprendiendo.</p>
          </hgroup>
        </section>

        {estado === 'loading' && <p className="text-muted-color">Cargando...</p>}
        {estado === 'no-api' && (
          <p className="text-muted-color">
            Esta vista necesita Electron (window.api). Ejecuta la app con <code>npm run dev</code>.
          </p>
        )}
        {estado === 'no-user' && <p className="text-muted-color">Inicia sesión como instructor.</p>}
        {estado === 'error' && <p className="text-danger">Error: {error}</p>}

        {estado === 'ready' && data && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Resumen">
              {stats.map(({ icon: Icon, label, value, color, bg }) => (
                <article key={label} className="bg-white border border-default p-5">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
                    style={{ background: bg }}
                  >
                    <Icon size={16} style={{ color }} />
                  </span>
                  <p className="text-2xl font-extrabold text-body">{value}</p>
                  <p className="text-xs font-semibold text-muted-color mt-0.5">{label}</p>
                </article>
              ))}
            </section>

            <section className="space-y-6" aria-label="Mis cursos">
              <h2 className="text-xl font-extrabold text-body">
                Mis cursos <span className="text-muted-color font-normal text-base">({data.cursos.length})</span>
              </h2>

              {data.cursos.length === 0 ? (
                <p className="text-muted-color">Aún no tienes cursos publicados.</p>
              ) : (
                data.cursos.map((curso) => (
                  <article key={curso.id} className="bg-white border border-default">
                    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 border-b border-default">
                      <h3 className="text-base font-bold text-body">{curso.nombre}</h3>
                      <Estrellas valor={curso.calificacion} />
                      <EstadoBadge estado={curso.estado} />
                      <span className="ml-auto flex items-center gap-2 text-sm text-muted-color">
                        <Users size={15} /> {curso.nEstudiantes} estudiantes
                      </span>
                      <span className="flex items-center gap-2 text-sm text-muted-color">
                        Progreso promedio <Barra valor={curso.progresoPromedio} />
                      </span>
                    </header>

                    {curso.estudiantes.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-muted-color">
                        Aún no hay estudiantes inscritos.
                      </p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-body border-b border-default">
                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-color uppercase tracking-wide">
                              Estudiante
                            </th>
                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-color uppercase tracking-wide">
                              Progreso
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {curso.estudiantes.map((e, i) => (
                            <tr key={i} className="border-b border-[#f7f9fa] last:border-0">
                              <td className="px-5 py-2.5 text-body">{e.nombre}</td>
                              <td className="px-5 py-2.5">
                                <Barra valor={e.progreso} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
