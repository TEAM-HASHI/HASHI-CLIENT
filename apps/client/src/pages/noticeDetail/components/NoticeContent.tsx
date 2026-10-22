import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import type { NoticeBlock, NoticeSpan } from '@/features/notice/types'

const renderSpan = (span: NoticeSpan, index: number) => {
  const text = span.bold ? <strong>{span.text}</strong> : span.text
  let url: URL | null = null
  try {
    if (span.href) url = new URL(span.href, window.location.origin)
  } catch {
    // 잘못된 링크도 본문 텍스트는 유지한다.
  }

  if (url && (url.protocol === 'https:' || url.protocol === 'http:')) {
    if (url.origin === window.location.origin) {
      return (
        <Link
          className="underline"
          key={index}
          to={`${url.pathname}${url.search}${url.hash}`}
        >
          {text}
        </Link>
      )
    }
    return (
      <a
        className="underline"
        href={url.href}
        key={index}
        rel="noopener noreferrer"
        target="_blank"
      >
        {text}
      </a>
    )
  }
  return <Fragment key={index}>{text}</Fragment>
}

// text는 HTML이 아닌 일반 텍스트다. 서버의 블록/인라인 구조만 React 요소로 렌더링한다.
export const NoticeContent = ({ body }: { body: NoticeBlock[] }) => (
  <div className="typo-caption-2 leading-normal break-keep whitespace-pre-wrap text-black">
    {body.map((block, index) => {
      if (block.type === 'PARAGRAPH') {
        return <p key={index}>{block.items[0]?.map(renderSpan)}</p>
      }
      const List = block.type === 'ORDERED_LIST' ? 'ol' : 'ul'
      return (
        <List
          className={
            block.type === 'ORDERED_LIST'
              ? 'list-decimal pl-4.5'
              : 'list-none pl-4.5 [&>li]:relative [&>li]:before:absolute [&>li]:before:top-[calc(0.5lh-1px)] [&>li]:before:left-[-11px] [&>li]:before:size-[2.5px] [&>li]:before:-translate-y-1/2 [&>li]:before:rounded-full [&>li]:before:bg-current [&>li]:before:content-[""]'
          }
          key={index}
        >
          {block.items.map((spans, itemIndex) => (
            <li key={itemIndex}>{spans.map(renderSpan)}</li>
          ))}
        </List>
      )
    })}
  </div>
)
