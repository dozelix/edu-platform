import React, { useEffect, useState } from 'react'
import Markdown from './Markdown'

// Vista 4 del Caso 3: Lección (Reproductor).
// Muestra el video (si existe), contenido y duración (con fallback porque el seed
// no los trae), los últimos 5 comentarios, permite agregar uno, marcar la lección
// como completada y avanzar a la siguiente.

function formatearFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Construye la URL de incrustacion de YouTube en modo privado (youtube-nocookie.com):
// evita las cookies de rastreo y la mayoria de las llamadas a anuncios que la CSP bloquea.
// Pasa el parametro origin, que YouTube exige para validar el sitio que incrusta y reproducir.
function urlEmbed(url) {
  if (!url) return ''

  const rawOrigin = typeof globalThis.location !== 'undefined' ? globalThis.location.origin : ''
  const origin = rawOrigin && /^https?:\/\//.test(rawOrigin) ? rawOrigin : ''
  const params = `rel=0&playsinline=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`

  const extractIdFromYoutube = (input) => {
    const embedMatch = /(?:youtube-nocookie\.com|youtube\.com)\/embed\/([\w-]+)/.exec(input)
    if (embedMatch) return embedMatch[1]

    const watchMatch = /[?&]v=([\w-]+)/.exec(input)
    if (watchMatch) return watchMatch[1]

    const shortMatch = /youtu\.be\/([\w-]+)/.exec(input)
    if (shortMatch) return shortMatch[1]

    return null
  }

  const id = extractIdFromYoutube(url)
  if (!id) return url
  return `https://www.youtube.com/embed/${id}?${params}`
}

export default function Lesson({ leccionId, user, onNavigate, onBack }) {
  const [leccion, setLeccion] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [estado, setEstado] = useState('loading') // loading | ready | error | no-api
  const [error, setError] = useState('')
  const [nuevo, setNuevo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [completando, setCompletando] = useState(false)
  // El video se incrusta desde YouTube, que necesita conexion. La leccion funciona
  // igual sin red: si esta offline, el reproductor muestra un aviso en vez del iframe.
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const marcar = () => setOnline(navigator.onLine)
    globalThis.addEventListener?.('online', marcar)
    globalThis.addEventListener?.('offline', marcar)
    return () => {
      globalThis.removeEventListener?.('online', marcar)
      globalThis.removeEventListener?.('offline', marcar)
    }
  }, [])

  async function cargar() {
    if (!globalThis.window?.api) {
      setEstado('no-api')
      return
    }
    if (!leccionId) {
      setEstado('error')
      setError('No se indicó la lección')
      return
    }
    try {
      const [lecRes, comRes] = await Promise.all([
        globalThis.window.api.invoke('leccion:obtener', { leccionId }),
        globalThis.window.api.invoke('comentario:listar', leccionId),
      ])
      if (lecRes.success) {
        setLeccion(lecRes.data)
        setComentarios(comRes.success ? comRes.data : [])
        setEstado('ready')
      } else {
        setError(lecRes.error)
        setEstado('error')
      }
    } catch (err) {
      setError(err.message)
      setEstado('error')
    }
  }

  useEffect(() => {
    setEstado('loading')
    cargar()
  }, [leccionId])

  const agregarComentario = async (e) => {
    e.preventDefault()
    if (!nuevo.trim() || !user?.id) return
    setEnviando(true)
    setError('')
    try {
      const res = await globalThis.window.api.invoke('comentario:crear', {
        leccionId,
        texto: nuevo,
      })
      if (res.success) {
        setNuevo('')
        const comRes = await globalThis.window.api.invoke('comentario:listar', leccionId)
        if (comRes.success) setComentarios(comRes.data)
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const completar = async () => {
    if (!user?.id) return
    setCompletando(true)
    setError('')
    try {
      const res = await globalThis.window.api.invoke('leccion:completar', { leccionId })
      if (res.success) {
        setLeccion((prev) => ({ ...prev, completada: true }))
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCompletando(false)
    }
  }

  return (
    <>
      <header className="db-page-header">
        <hgroup>
          <h1 className="db-page-header__title">
            {leccion ? leccion.titulo : 'Lección'}
          </h1>
          <p className="db-page-header__sub">{leccion ? leccion.cursoNombre : ''}</p>
        </hgroup>
        {onBack && (
          <button className="db-link-btn" onClick={onBack}>
            ← Mi Aprendizaje
          </button>
        )}
      </header>

      {estado === 'loading' && <p className="les-msg">Cargando...</p>}
      {estado === 'no-api' && (
        <p className="les-msg">Esta vista necesita Electron (window.api).</p>
      )}
      {estado === 'error' && <p className="les-msg les-msg--error">Error: {error}</p>}

      {estado === 'ready' && leccion && (
        <div className="les-layout">
          <section className="les-player">
            {leccion.videoUrl ? (
              online ? (
                <figure className="les-video">
                  <iframe
                    src={urlEmbed(leccion.videoUrl)}
                    title={`Video de la lección: ${leccion.titulo}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </figure>
              ) : (
                <figure className="les-video les-video--empty">
                  Video no disponible sin conexión. El resto de la lección funciona igual.
                </figure>
              )
            ) : (
              <figure className="les-video les-video--empty">Sin video</figure>
            )}

            <div className="les-meta">
              <span>Lección {leccion.numero ?? '—'}</span>
              <span>Duración: {leccion.duracion != null ? `${leccion.duracion} min` : '—'}</span>
              <span className={`les-status${leccion.completada ? ' les-status--done' : ''}`}>
                {leccion.completada ? 'Completada' : 'Pendiente'}
              </span>
            </div>

            <section className="les-content">
              <h2 className="les-content__title">Contenido</h2>
              {leccion.contenido ? (
                <div className="les-content__body">
                  <Markdown texto={leccion.contenido} />
                </div>
              ) : (
                <p>Sin contenido (no provisto en los datos).</p>
              )}
            </section>

            <div className="les-actions">
              <button className="les-btn" onClick={completar} disabled={leccion.completada || completando}>
                {leccion.completada
                  ? 'Completada'
                  : completando
                    ? 'Guardando...'
                    : 'Marcar como completada'}
              </button>
              <button
                className="les-btn les-btn--ghost"
                onClick={() => onNavigate?.(leccion.siguienteId)}
                disabled={!leccion.siguienteId}
                title={leccion.siguienteId ? '' : 'No hay más lecciones'}
              >
                Siguiente lección →
              </button>
            </div>
          </section>

          <aside className="les-comments">
            <h2 className="les-comments__title">Comentarios</h2>

            <form className="les-comment-form" onSubmit={agregarComentario}>
              <textarea
                className="les-comment-input"
                placeholder="Escribe un comentario..."
                value={nuevo}
                onChange={(e) => setNuevo(e.target.value)}
                rows={3}
                disabled={enviando || !user?.id}
              />
              <button className="les-btn" type="submit" disabled={enviando || !nuevo.trim()}>
                {enviando ? 'Enviando...' : 'Comentar'}
              </button>
            </form>

            {comentarios.length === 0 ? (
              <p className="les-msg">Aún no hay comentarios.</p>
            ) : (
              <ul className="les-comment-list">
                {comentarios.map((c) => (
                  <li className="les-comment" key={c.id}>
                    <div className="les-comment__head">
                      <span className="les-comment__author">{c.autor}</span>
                      {c.fecha && <span className="les-comment__date">{formatearFecha(c.fecha)}</span>}
                    </div>
                    <p className="les-comment__text">{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
