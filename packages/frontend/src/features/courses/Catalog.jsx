import React, { useEffect, useMemo, useState } from 'react'

// Vista 2 del Caso 3: Catálogo de Cursos.
// Lee los cursos reales desde Mongo vía IPC (curso:listar), permite buscar por
// nombre y filtrar por instructor. El handler resuelve el instructor null-safe,
// así que los cursos con instructor huérfano llegan como "Instructor desconocido".
// Incluye inscripción (inscripcion:crear) y conversión de precio a varias monedas
// usando una API pública de tipos de cambio.

const MONEDAS = ['USD', 'EUR', 'CLP', 'MXN', 'GBP', 'BRL']

function formatearPrecio(precioUSD, moneda, tasas) {
  if (precioUSD == null) return 'Sin precio'
  const tasa = moneda === 'USD' ? 1 : tasas[moneda]
  if (!tasa) return `${precioUSD.toFixed(2)} USD`
  const convertido = precioUSD * tasa
  return convertido.toLocaleString('es-CL', { style: 'currency', currency: moneda })
}

export default function Catalog({ user }) {
  const [cursos, setCursos] = useState([])
  const [estado, setEstado] = useState('loading') // loading | ready | error | no-api
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [instructor, setInstructor] = useState('Todos')
  const [moneda, setMoneda] = useState('USD')
  const [tasas, setTasas] = useState({})
  const [inscribiendo, setInscribiendo] = useState(null)

  async function cargar() {
    if (!window.api) {
      setEstado('no-api')
      return
    }
    try {
      const res = await window.api.invoke('curso:listar', user?.id)
      if (res.success) {
        setCursos(res.data)
        setEstado('ready')
      } else {
        setError(res.error)
        setEstado('error')
      }
    } catch (err) {
      setError(err.message)
      setEstado('error')
    }
  }

  useEffect(() => {
    cargar()
  }, [user])

  // Tipos de cambio (base USD) desde una API pública sin clave.
  useEffect(() => {
    let activo = true
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((d) => {
        if (activo && d && d.rates) setTasas(d.rates)
      })
      .catch(() => {})
    return () => {
      activo = false
    }
  }, [])

  const instructores = useMemo(
    () => ['Todos', ...Array.from(new Set(cursos.map((c) => c.instructor)))],
    [cursos]
  )

  const filtrados = cursos.filter((c) => {
    const coincideNombre = c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideInstructor = instructor === 'Todos' || c.instructor === instructor
    return coincideNombre && coincideInstructor
  })

  const inscribir = async (cursoId) => {
    if (!window.api || !user?.id) return
    setInscribiendo(cursoId)
    setError('')
    try {
      const res = await window.api.invoke('inscripcion:crear', { usuarioId: user.id, cursoId })
      if (res.success) {
        await cargar()
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setInscribiendo(null)
    }
  }

  return (
    <>
      <div className="db-page-header">
        <div>
          <h1 className="db-page-header__title">Catálogo de Cursos</h1>
          <p className="db-page-header__sub">Explora los cursos disponibles</p>
        </div>
      </div>

      <div className="cat-toolbar">
        <input
          className="cat-search"
          type="search"
          placeholder="Buscar por nombre del curso..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar curso por nombre"
        />
        <select
          className="cat-filter"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          aria-label="Filtrar por instructor"
        >
          {instructores.map((nom) => (
            <option key={nom} value={nom}>
              {nom === 'Todos' ? 'Todos los instructores' : nom}
            </option>
          ))}
        </select>
        <select
          className="cat-filter"
          value={moneda}
          onChange={(e) => setMoneda(e.target.value)}
          aria-label="Moneda"
        >
          {MONEDAS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {estado === 'loading' && <p className="cat-msg">Cargando cursos...</p>}
      {estado === 'no-api' && (
        <p className="cat-msg">
          Esta vista necesita Electron (window.api). Ejecuta la app con <code>npm run dev</code>.
        </p>
      )}
      {estado === 'error' && <p className="cat-msg cat-msg--error">Error: {error}</p>}

      {estado === 'ready' &&
        (filtrados.length === 0 ? (
          <p className="cat-msg">No se encontraron cursos.</p>
        ) : (
          <section className="cat-grid" aria-label="Cursos">
            {filtrados.map((c) => (
              <article className="cat-card" key={c.id}>
                <div className="cat-card__thumb" aria-hidden="true">
                  {c.nombre.charAt(0)}
                </div>
                <div className="cat-card__body">
                  <h3 className="cat-card__title">{c.nombre}</h3>
                  <p className="cat-card__instructor">{c.instructor}</p>
                  <div className="cat-card__meta">
                    <span className="cat-card__price">
                      {formatearPrecio(c.precio, moneda, tasas)}
                    </span>
                    <span className="cat-card__rating">
                      {c.calificacion != null ? `Calif: ${c.calificacion}` : 'Sin calificación'}
                    </span>
                  </div>
                  {c.inscrito ? (
                    <button className="cat-card__enroll" disabled>
                      Inscrito
                    </button>
                  ) : (
                    <button
                      className="cat-card__enroll"
                      onClick={() => inscribir(c.id)}
                      disabled={inscribiendo === c.id || !user?.id}
                    >
                      {inscribiendo === c.id ? 'Inscribiendo...' : 'Inscribirse'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        ))}
    </>
  )
}
