import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import type { NoticeBlock } from '@/features/notice/types'
import { NoticeContent } from '@/pages/noticeDetail/components/NoticeContent'

const renderContent = (body: NoticeBlock[]) =>
  render(
    <MemoryRouter>
      <NoticeContent body={body} />
    </MemoryRouter>,
  )

describe('NoticeContent', () => {
  afterEach(cleanup)

  it('renders structured paragraphs, bold spans, line breaks and ordered lists', () => {
    const { container } = renderContent([
      {
        type: 'PARAGRAPH',
        items: [
          [
            { text: '시스템 ', bold: false, href: null },
            { text: '점검', bold: true, href: null },
            { text: '\n안내', bold: false, href: null },
          ],
        ],
      },
      {
        type: 'BULLET_LIST',
        items: [
          [{ text: '일시', bold: false, href: null }],
          [{ text: '범위', bold: false, href: null }],
        ],
      },
      {
        type: 'ORDERED_LIST',
        items: [[{ text: '첫째', bold: false, href: null }]],
      },
    ])
    expect(screen.getByText('점검').tagName).toBe('STRONG')
    expect(container.querySelector('p')?.textContent).toBe('시스템 점검\n안내')
    expect(container.firstChild).toHaveClass('whitespace-pre-wrap')
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['일시', '범위', '첫째'])
    expect(container.querySelectorAll('ul > li')).toHaveLength(2)
    expect(container.querySelectorAll('ol > li')).toHaveLength(1)
  })

  it('opens internal links in the app and external links in a new tab', () => {
    renderContent([
      {
        type: 'PARAGRAPH',
        items: [
          [
            { text: '식당 보기', bold: false, href: '/restaurants/1' },
            {
              text: '매거진',
              bold: false,
              href: window.location.origin + '/magazines',
            },
            { text: '인스타', bold: true, href: 'https://instagram.com/hashi' },
          ],
        ],
      },
    ])
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
    const external = screen.getByRole('link', { name: '인스타' })
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
    expect(external.querySelector('strong')).not.toBeNull()
  })

  it('treats HTML in span text as plain text and rejects unsafe link schemes', () => {
    const { container } = renderContent([
      {
        type: 'PARAGRAPH',
        items: [
          [
            { text: '<img src=x onerror="alert(1)">', bold: false, href: null },
            { text: '위험', bold: false, href: 'javascript:alert(1)' },
            { text: '파일', bold: false, href: 'data:text/html,test' },
          ],
        ],
      },
    ])
    expect(container.querySelector('img, script, [onerror]')).toBeNull()
    expect(container).toHaveTextContent('<img src=x onerror="alert(1)">')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
