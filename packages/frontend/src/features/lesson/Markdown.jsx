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
        h1: ({ _node, ...props }) => <h3 {...props} />,
        h2: ({ _node, ...props }) => <h4 {...props} />,
        h3: ({ _node, ...props }) => <h5 {...props} />,
        
        // Bloques de código utilizando la clase mapeada en tu CSS
        pre: ({ _node, ...props }) => <pre className="md-pre" {...props} />,
        
        // Citas (blockquotes) utilizando la clase mapeada en tu CSS
        blockquote: ({ _node, ...props }) => <blockquote className="md-quote" {...props} />,
        
        // Enlaces seguros (evita javascript: o data:) con target="_blank"
        a: ({ _node, href, ...props }) => {
          const urlSegura = hrefSeguro(href)
          return (
            <a href={urlSegura} target="_blank" rel="noopener noreferrer" {...props} />
          )
        }
      }}
    >
      {texto}
    </ReactMarkdown>
  )
}