import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { NoticeContent } from '@/pages/noticeDetail/components/NoticeContent'

const renderContent = (html: string) =>
  render(
    <MemoryRouter>
      <NoticeContent html={html} />
    </MemoryRouter>,
  )

describe('NoticeContent', () => {
  afterEach(cleanup)

  it('renders bold text, line breaks, and bullet and numbered lists', () => {
    const { container } = renderContent(
      '<p>시스템 <strong>점검</strong> 안내<br>감사합니다.</p><ul><li>일시</li><li>범위</li></ul><ol><li>첫째</li></ol>',
    )

    expect(screen.getByText('점검').tagName).toBe('STRONG')
    expect(container.querySelector('p br')).not.toBeNull()
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['일시', '범위', '첫째'])
    expect(container.querySelector('ul')).toHaveClass('list-disc')
    expect(container.querySelector('ol')).toHaveClass('list-decimal')
  })

  it('opens internal links in the app and external links in a new tab', () => {
    renderContent(
      `<p><a href="/restaurants/1">식당 보기</a> <a href="${window.location.origin}/magazines">매거진</a> <a href="https://instagram.com/hashi">인스타</a></p>`,
    )

    expect(screen.getByRole('link', { name: '식당 보기' })).toHaveAttribute(
      'href',
      '/restaurants/1',
    )
    expect(screen.getByRole('link', { name: '식당 보기' })).not.toHaveAttribute(
      'target',
    )
    expect(screen.getByRole('link', { name: '매거진' })).toHaveAttribute(
      'href',
      '/magazines',
    )

    const externalLink = screen.getByRole('link', { name: '인스타' })

    expect(externalLink).toHaveAttribute('href', 'https://instagram.com/hashi')
    expect(externalLink).toHaveAttribute('target', '_blank')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps text but drops unsupported tags, attributes, and unsafe links', () => {
    const { container } = renderContent(
      '<p style="color:red" onclick="alert(1)"><span>표 없이</span> <table><tr><td>셀</td></tr></table></p><script>alert(1)</script><p><a href="javascript:alert(1)">위험</a><img src=x onerror="alert(1)"></p>',
    )

    expect(
      container.querySelector('script, table, img, span, [style], [onclick]'),
    ).toBeNull()
    expect(container).not.toHaveTextContent('alert(1)')
    expect(container).toHaveTextContent('표 없이')
    expect(container).toHaveTextContent('셀')
    expect(screen.getByText('위험').tagName).not.toBe('A')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
