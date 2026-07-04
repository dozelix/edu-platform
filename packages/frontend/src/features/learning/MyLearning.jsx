import { useEffect, useState } from 'react' // 👈 Issue #27: Eliminado 'React'
import Barra from './common/Barra.jsx' // 🛠️ Issue #20: Barra de progreso unificada

export default function MyLearning({ user, onContinue }) {
  const [filas, setFilas] = useState([])
  const [estado, setEstado] = useState('loading') // loading | ready | error | no-api | no-user
  const [error, setError] = useState('')

  const primerNombre = user?.nombre ? user.nombre.split(' ')[0] : ''
  const iniciales = user?.nombre
    ? user.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : ''
  const enProgreso = filas.filter((f) => f.disponible && f.progreso > 0 && f.progreso < 100).length
  const completados = filas.filter((f) => f.disponible && f.progreso === 100).length

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
        const res = await globalThis.window.api.invoke('aprendizaje:listar')
        if (!activo) return
        if (res.success) {
          setFilas(res.data)
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

  return (
    <>
      <header className="db-page-header">
        <hgroup>
          <h1 className="db-page-header__title">Mi Aprendizaje</h1>
          <p className="db-page-header__sub">Tus cursos y tu progreso</p>
        </hgroup>
      </header>

      {estado === 'loading' && <p className="lrn-msg">Cargando...</p>}
      {estado === 'no-api' && (
        <p className="lrn-msg">
          Esta vista necesita Electron (window.api). Ejecuta la app con <code>npm run dev</code>.
        </p>
      )}
      {estado === 'no-user' && <p className="lrn-msg">Inicia sesión para ver tu aprendizaje.</p>}
      {estado === 'error' && <p className="lrn-msg lrn-msg--error">Error: {error}</p>}

      {estado === 'ready' && filas.length > 0 && (
        <section className="lrn-hero" aria-label="Resumen de tu aprendizaje">
          <div className="lrn-hero__text">
            <p className="lrn-hero__greeting">Hola, {primerNombre}</p>
            <p className="lrn-hero__sub">
              Tienes <strong>{enProgreso}</strong> {enProgreso === 1 ? 'curso' : 'cursos'} en progreso
              {completados > 0 && (
                <>
                  {' '}y <strong>{completados}</strong> {completados === 1 ? 'completado' : 'completados'}
                </>
              )}
              .
            </p>
          </div>
          <p className="lrn-hero__avatar" aria-hidden="true">
            {iniciales}
          </p>
        </section>
      )}

      {estado === 'ready' &&
        (filas.length === 0 ? (
          <p className="lrn-msg">Aún no estás inscrito en ningún curso.</p>
        ) : (
          <table className="lrn-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Instructor</th>
                <th>Progreso</th>
                <th>Última lección</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.inscripcionId} className={f.disponible ? '' : 'lrn-row--unavailable'}>
                  <td>{f.curso}</td>
                  <td>{f.instructor}</td>
                  <td>
                    <Barra valor={f.progreso} isCustomCss={true} />
                  </td>
                  <td>{f.ultimaLeccion}</td>
                  <td>
                    <button
                      className="lrn-continue"
                      onClick={() => onContinue?.(f.continuarLeccionId)}
                      disabled={!f.disponible || !f.continuarLeccionId}
                      title={
                        f.disponible
                          ? f.continuarLeccionId
                            ? ''
                            : 'El curso no tiene lecciones'
                          : 'Curso no disponible'
                      }
                    >
                      Continuar aprendiendo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </>
  )
}