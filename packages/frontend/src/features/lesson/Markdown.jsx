import React from 'react'

// Renderiza un subconjunto seguro de Markdown como elementos React.
// No usa dangerouslySetInnerHTML ni HTML crudo, por lo que el contenido del curso
// (dato externo) no puede inyectar scripts (XSS). Soporta: encabezados, listas
// ordenadas y no ordenadas, citas, bloques y spans de codigo, negrita, cursiva,
// enlaces http(s) y parrafos con saltos de linea.

// Solo admite enlaces http/https; descarta javascript:, data: y demas esquemas.
function hrefSeguro(url) {
  return /^https?:\/\//i.test(url) ? url : null
}

// Convierte el formato inline de una linea en nodos React.
function inline(texto, base) {
  const nodos = []
  const patron = /(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g
  let ultimo = 0
  let n = 0
  let m
  while ((m = patron.exec(texto)) !== null) {
    if (m.index > ultimo) nodos.push(texto.slice(ultimo, m.index))
    const tok = m[0]
    const key = `${base}-${n++}`
    if (tok.startsWith('**')) {
      nodos.push(<strong key={key}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('`')) {
      nodos.push(<code key={key}>{tok.slice(1, -1)}</code>)
    } else if (tok.startsWith('*') || tok.startsWith('_')) {
      nodos.push(<em key={key}>{tok.slice(1, -1)}</em>)
    } else {
      const enlace = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)
      const href = hrefSeguro(enlace[2])
      nodos.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {enlace[1]}
          </a>
        ) : (
          enlace[1]
        )
      )
    }
    ultimo = m.index + tok.length
  }
  if (ultimo < texto.length) nodos.push(texto.slice(ultimo))
  return nodos
}

// Agrupa el texto en bloques (encabezado, lista, cita, codigo, parrafo) y los
// convierte en elementos semanticos.
export default function Markdown({ texto }) {
  if (!texto) return null
  const lineas = texto.replace(/\r\n/g, '\n').split('\n')
  const bloques = []
  let i = 0

  const esBloque = (l) =>
    /^```/.test(l) ||
    /^#{1,3}\s+/.test(l) ||
    /^\s*[-*]\s+/.test(l) ||
    /^\s*\d+\.\s+/.test(l) ||
    /^>\s?/.test(l) ||
    /^\s*$/.test(l)

  while (i < lineas.length) {
    const linea = lineas[i]

    if (/^```/.test(linea)) {
      const buf = []
      i++
      while (i < lineas.length && !/^```/.test(lineas[i])) buf.push(lineas[i++])
      i++
      bloques.push(
        <pre className="md-pre" key={bloques.length}>
          <code>{buf.join('\n')}</code>
        </pre>
      )
      continue
    }

    const enc = /^(#{1,3})\s+(.*)$/.exec(linea)
    if (enc) {
      // h1/h2 los reserva la vista; el contenido usa h3-h5 para no romper la jerarquia.
      const Tag = `h${enc[1].length + 2}`
      bloques.push(<Tag key={bloques.length}>{inline(enc[2], `h${bloques.length}`)}</Tag>)
      i++
      continue
    }

    if (/^>\s?/.test(linea)) {
      const buf = []
      while (i < lineas.length && /^>\s?/.test(lineas[i])) buf.push(lineas[i++].replace(/^>\s?/, ''))
      bloques.push(
        <blockquote className="md-quote" key={bloques.length}>
          {inline(buf.join(' '), `bq${bloques.length}`)}
        </blockquote>
      )
      continue
    }

    if (/^\s*[-*]\s+/.test(linea)) {
      const items = []
      while (i < lineas.length && /^\s*[-*]\s+/.test(lineas[i])) {
        items.push(lineas[i++].replace(/^\s*[-*]\s+/, ''))
      }
      bloques.push(
        <ul key={bloques.length}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `ul${bloques.length}-${j}`)}</li>
          ))}
        </ul>
      )
      continue
    }

    if (/^\s*\d+\.\s+/.test(linea)) {
      const items = []
      while (i < lineas.length && /^\s*\d+\.\s+/.test(lineas[i])) {
        items.push(lineas[i++].replace(/^\s*\d+\.\s+/, ''))
      }
      bloques.push(
        <ol key={bloques.length}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `ol${bloques.length}-${j}`)}</li>
          ))}
        </ol>
      )
      continue
    }

    if (/^\s*$/.test(linea)) {
      i++
      continue
    }

    const buf = [linea]
    i++
    while (i < lineas.length && !esBloque(lineas[i])) buf.push(lineas[i++])
    const nodos = []
    buf.forEach((ln, j) => {
      if (j > 0) nodos.push(<br key={`br-${bloques.length}-${j}`} />)
      nodos.push(...inline(ln, `p${bloques.length}-${j}`))
    })
    bloques.push(<p key={bloques.length}>{nodos}</p>)
  }

  return <>{bloques}</>
}
