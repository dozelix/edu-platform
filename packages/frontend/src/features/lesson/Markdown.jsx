import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Filtro de seguridad para enlaces (solo http y https)
function hrefSeguro(url) {
  return /^https?:\/\//i.test(url) ? url : '#'
}

export default function Markdown({ texto }) {
  if (!texto) return null

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Mapeo de encabezados (+2 niveles) para respetar la jerarquía de la app
        h1: ({ children }) => <h3>{children}</h3>,
        h2: ({ children }) => <h4>{children}</h4>,
        h3: ({ children }) => <h5>{children}</h5>,
        
        // Bloques de código
        pre: ({ children }) => <pre className="md-pre">{children}</pre>,
        
        // Citas (blockquotes)
        blockquote: ({ children }) => <blockquote className="md-quote">{children}</blockquote>,
        
        // Enlaces seguros (evita javascript: o data:) con target="_blank"
        a: ({ href, children }) => {
          const urlSegura = hrefSeguro(href)
          return (
            <a href={urlSegura} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          )
        }
      }}
    >
      {texto}
    </ReactMarkdown>
  )
}