import { useEffect, useMemo, useState } from 'react' // 👈 Issue #27: Eliminado 'React'
import { Search, Star } from 'lucide-react'

// Vista 2 del Caso 3: Catalogo de Cursos.
// Lee los cursos reales desde Mongo via IPC (curso:listar), permite buscar por
// nombre y filtrar por instructor. El handler resuelve el instructor null-safe.
// Incluye inscripcion (inscripcion:crear) y conversion de precio a varias monedas
// usando una API publica de tipos de cambio. Diseno tipo Udemy, marcado semantico.

const MONEDAS = ['USD', 'EUR', 'CLP', 'MXN', 'GBP', 'BRL']

// Palabras de nivel que no aportan al tema del curso (se omiten en el monograma).
const NIVELES = new Set([
  'basico', 'básico', 'intermedio', 'avanzado', 'profesional', 'practico', 'práctico',
  'completo', 'esencial', 'moderno', 'inicial', 'experto',
])

// Gradientes de portada (fallback si la imagen no carga), dentro de la identidad de marca.
const COVER_GRADIENTS = [
  'linear-gradient(135deg,#3b1c8c,#a435f0)',
  'linear-gradient(135deg,#1e1b4b,#4338ca)',
  'linear-gradient(135deg,#5b21b6,#7c3aed)',
  'linear-gradient(135deg,#0f766e,#14b8a6)',
  'linear-gradient(135deg,#1e3a8a,#3b82f6)',
  'linear-gradient(135deg,#831843,#be185d)',
  'linear-gradient(135deg,#134e4a,#0891b2)',
  'linear-gradient(135deg,#4c1d95,#6d28d9)',
]

// Fotos de portada (stock decorativo, no la portada real del curso): se elige una
// de forma determinista por curso. Si una no carga, queda el gradiente de fallback.
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713',
  'https://images.unsplash.com/photo-1619410283995-43d9134e7656',
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3',
  'https://images.unsplash.com/photo-1484417894907-623942c8ee29',
  'https://images.unsplash.com/photo-1547658719-da2b51169166',
  'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5',
  'https://images.unsplash.com/photo-1653647054667-c99dc7f914ef',
  'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
  'https://images.unsplash.com/photo-1579389083078-4e7018379f7e',
]

// Convierte el precio en USD a la moneda elegida con las tasas de la API publica.
export function formatearPrecio(precioUSD, moneda, tasas) {
  if (precioUSD == null) return 'Sin precio'
  const tasa = moneda === 'USD' ? 1 : tasas[moneda]
  if (!tasa) return `${precioUSD.toFixed(2)} USD`
  const convertido = precioUSD * tasa
  return convertido.toLocaleString('es-CL', { style: 'currency', currency: moneda })
}

// Portada generada a partir del nombre: monograma, tema y un gradiente estable por curso.
export function portadaDeCurso(nombre) {
  const palabras = (nombre || '').split(/\s+/).filter(Boolean)
  const signif = palabras.filter((p) => !NIVELES.has(p.toLowerCase()))
  const base = signif.length ? signif : palabras
  let iniciales = base.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  if (iniciales.length < 2 && base[0]) iniciales = base[0].slice(0, 2).toUpperCase()
  const tema = base.slice(0, 3).join(' ')
  let hash = 0
  for (let i = 0; i < (nombre || '').length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) | 0
  const idx = Math.abs(hash)
  const gradiente = COVER_GRADIENTS[idx % COVER_GRADIENTS.length]
  const imagen = `${COVER_IMAGES[idx % COVER_IMAGES.length]}?w=480&h=270&fit=crop&auto=format`
  return { iniciales: iniciales || '?', tema, gradiente, imagen }
}

// Estrellas de calificacion (0-5) con lucide; las llenas se pintan, el resto en gris.
function Estrellas({ valor }) {
  const llenas = Math.round(valor)
  return (
    <span className="cat-card__stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= llenas ? 'is-on' : 'is-off'}
          fill={i <= llenas ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}

export default function Catalog({ user, onRequireLogin }) {
  const [cursos, setCursos] = useState([])
  const [estado, setEstado] = useState('loading') // loading | ready | error | no-api
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [instructor, setInstructor] = useState('Todos')
  const [moneda, setMoneda] = useState('USD')
  const [tasas, setTasas] = useState({})
  const [inscribiendo, setInscribiendo] = useState(null)

  async function cargar() {
    if (!globalThis.window?.api) {
      setEstado('no-api')
      return
    }
    try {
      const res = await globalThis.window.api.invoke('curso:listar')
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

  // 🛠️ Issue #29: Modificado el useEffect para leer el endpoint desde variables de entorno.
  useEffect(() => {
    let activo = true
    const apiUrl = import.meta.env.VITE_EXCHANGE_RATE_API_URL;

    fetch(apiUrl)
      .then((r) => r.json())
      .then((d) => {
        if (activo && d && d.rates) setTasas(d.rates)
      })
      .catch((err) => {
        console.error('Error in exchange rate request:', err)
      })
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
    if (!globalThis.window?.api || !user?.id) return
    setInscribiendo(cursoId)
    setError('')
    try {
      const res = await globalThis.window.api.invoke('inscripcion:crear', { cursoId })
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
      <header className="cat-header">
        <h1 className="cat-header__title">Catálogo de Cursos</h1>
        <p className="cat-header__sub">Explora los cursos disponibles y avanza a tu ritmo</p>
      </header>

      <search className="cat-toolbar">
        <label className="cat-search">
          <Search size={16} className="cat-search__icon" aria-hidden="true" />
          <span className="sr-only">Buscar curso por nombre</span>
          <input
            type="search"
            placeholder="Busca por nombre del curso"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>

        <label className="cat-filter">
          <span className="sr-only">Filtrar por instructor</span>
          <select value={instructor} onChange={(e) => setInstructor(e.target.value)}>
            {instructores.map((nom) => (
              <option key={nom} value={nom}>
                {nom === 'Todos' ? 'Todos los instructores' : nom}
              </option>
            ))}
          </select>
        </label>

        <label className="cat-filter">
          <span className="sr-only">Moneda</span>
          <select value={moneda} onChange={(e) => setMoneda(e.target.value)}>
            {MONEDAS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </search>

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
          <ul className="cat-grid" aria-label="Cursos">
            {filtrados.map((c) => {
              const portada = portadaDeCurso(c.nombre)
              return (
                <li className="cat-card-item" key={c.id}>
                  <article className="cat-card">
                    <figure
                      className="cat-card__thumb"
                      style={{ background: portada.gradiente }}
                      aria-hidden="true"
                    >
                      <span className="cat-card__monogram">{portada.iniciales}</span>
                      <span className="cat-card__topic">{portada.tema}</span>
                      <img
                        className="cat-card__cover"
                        src={portada.imagen}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </figure>
                    <section className="cat-card__body">
                      <h3 className="cat-card__title">{c.nombre}</h3>
                      <p className="cat-card__instructor">{c.instructor}</p>
                      <p className="cat-card__rating">
                        {c.calificacion != null ? (
                          <>
                            <strong>{c.calificacion.toFixed(1)}</strong>
                            <Estrellas valor={c.calificacion} />
                          </>
                        ) : (
                          <span className="cat-card__rating--none">Sin calificacion</span>
                        )}
                      </p>
                      <p className="cat-card__price">{formatearPrecio(c.precio, moneda, tasas)}</p>
                      {c.inscrito ? (
                        <button className="cat-card__enroll cat-card__enroll--done" disabled>
                          Inscrito
                        </button>
                      ) : (
                        <button
                          className="cat-card__enroll"
                          onClick={() => (user?.id ? inscribir(c.id) : onRequireLogin?.(c.id))}
                          disabled={inscribiendo === c.id}
                        >
                          {inscribiendo === c.id ? 'Inscribiendo...' : 'Inscribirse'}
                        </button>
                      )}
                    </section>
                  </article>
                </li>
              )
            })}
          </ul>
        ))}
    </>
  )
}