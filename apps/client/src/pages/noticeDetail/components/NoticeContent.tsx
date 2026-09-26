import { Fragment, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

// 텍스트까지 통째로 버리는 태그. 그 외 허용하지 않은 태그는 태그만 벗기고 텍스트는 남긴다.
const DROPPED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'template',
  'noscript',
  'svg',
  'math',
  'img',
  'video',
  'audio',
  'button',
  'input',
  'select',
  'textarea',
  'form',
])

type ResolvedLink =
  | { type: 'internal'; to: string }
  | { type: 'external'; href: string }

const resolveLink = (href: string | null): ResolvedLink | null => {
  if (!href) {
    return null
  }

  let url: URL

  try {
    url = new URL(href, window.location.origin)
  } catch {
    return null
  }

  if (url.origin === window.location.origin) {
    return { type: 'internal', to: `${url.pathname}${url.search}${url.hash}` }
  }

  if (url.protocol === 'https:' || url.protocol === 'http:') {
    return { type: 'external', href: url.href }
  }

  return null
}

const renderNodes = (nodes: NodeListOf<ChildNode>, keyPrefix: string) =>
  Array.from(nodes).map((node, index) =>
    renderNode(node, `${keyPrefix}-${index}`),
  )

const renderNode = (node: ChildNode, key: string): ReactNode => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const tag = (node as Element).tagName.toLowerCase()

  if (DROPPED_TAGS.has(tag)) {
    return null
  }

  const children = renderNodes(node.childNodes, key)

  switch (tag) {
    case 'strong':
    case 'b':
      return <strong key={key}>{children}</strong>
    case 'br':
      return <br key={key} />
    case 'p':
      return <p key={key}>{children}</p>
    case 'ul':
      return (
        <ul className="list-disc pl-4.5" key={key}>
          {children}
        </ul>
      )
    case 'ol':
      return (
        <ol className="list-decimal pl-4.5" key={key}>
          {children}
        </ol>
      )
    case 'li':
      return <li key={key}>{children}</li>
    case 'a': {
      const link = resolveLink((node as Element).getAttribute('href'))

      if (link?.type === 'internal') {
        return (
          <Link className="underline" key={key} to={link.to}>
            {children}
          </Link>
        )
      }

      if (link?.type === 'external') {
        return (
          <a
            className="underline"
            href={link.href}
            key={key}
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        )
      }

      return <Fragment key={key}>{children}</Fragment>
    }
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

interface NoticeContentProps {
  html: string
}

// 서버 HTML을 그대로 주입하지 않고 허용 태그만 React 요소로 다시 만든다.
// DOMParser 문서는 브라우징 컨텍스트가 없어 script나 이벤트 속성이 실행되지 않는다.
export const NoticeContent = ({ html }: NoticeContentProps) => {
  const content = useMemo(
    () =>
      renderNodes(
        new DOMParser().parseFromString(html, 'text/html').body.childNodes,
        'notice',
      ),
    [html],
  )

  return (
    <div className="typo-caption-2 leading-[1.5] break-keep text-black">
      {content}
    </div>
  )
}
