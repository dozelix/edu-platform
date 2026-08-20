import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function hrefSeguro(url?: string): string {
  if (!url) return '#'
  return /^https?:\/\//i.test(url) ? url : '#'
}

interface MarkdownProps {
  texto: string
}

export default function Markdown({ texto }: MarkdownProps) {
  if (!texto) return null

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }: any) => <h3 {...props} />,
        h2: ({ node, ...props }: any) => <h4 {...props} />,
        h3: ({ node, ...props }: any) => <h5 {...props} />,
        pre: ({ node, ...props }: any) => <pre className="md-pre" {...props} />,
        blockquote: ({ node, ...props }: any) => <blockquote className="md-quote" {...props} />,
        a: ({ node, href, ...props }: any) => {
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
