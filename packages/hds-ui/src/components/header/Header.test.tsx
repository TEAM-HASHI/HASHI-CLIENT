import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Header } from './Header'

afterEach(() => {
  cleanup()
})

describe('Header', () => {
  it('renders a full-width center header with a visible title', () => {
    render(<Header title="식당 상세 정보" />)

    const header = screen.getByRole('banner')

    expect(screen.getByText('식당 상세 정보')).toBeInTheDocument()
    expect(header).toHaveClass('h-[75px]', 'shadow-header', 'w-full')
    expect(header).not.toHaveClass('w-[393px]', 'w-[394px]')
  })

  it('renders caller-provided left and right action slots', () => {
    render(
      <Header
        title="오늘의 식당"
        leftAction={<button type="button">뒤로가기</button>}
        rightAction={<button type="button">공유하기</button>}
      />,
    )

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공유하기' })).toBeInTheDocument()
  })

  it('uses the subtitle height when subtitle content is provided', () => {
    render(
      <Header
        title="개인정보 수집 및 이용 동의"
        subtitle="최종 업데이트: 2026. 06. 29"
      />,
    )

    expect(screen.getByRole('banner')).toHaveClass('h-[80px]')
    expect(screen.getByText('최종 업데이트: 2026. 06. 29')).toBeInTheDocument()
  })

  it('renders valid falsy subtitle content', () => {
    render(<Header title="알림" subtitle={0} />)

    expect(screen.getByRole('banner')).toHaveClass('h-[80px]')
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('does not reserve subtitle height for false subtitle content', () => {
    render(<Header title="알림" subtitle={false} />)

    expect(screen.getByRole('banner')).toHaveClass('h-[75px]')
    expect(screen.getByRole('banner')).not.toHaveClass('h-[80px]')
  })

  it('does not reserve subtitle height for an empty string subtitle', () => {
    render(<Header title="알림" subtitle="" />)

    expect(screen.getByRole('banner')).toHaveClass('h-[75px]')
    expect(screen.getByRole('banner')).not.toHaveClass('h-[80px]')
  })

  it('uses the large title layout for long titles', () => {
    render(
      <Header
        title="야키니쿠 리키마루 이케부쿠로 히가시구치 텐"
        variant="largeTitle"
      />,
    )

    const title = screen.getByText('야키니쿠 리키마루 이케부쿠로 히가시구치 텐')

    expect(screen.getByRole('banner')).toHaveClass('h-[97px]')
    expect(title).toHaveClass('typo-header-2', 'line-clamp-2', 'text-left')
  })

  it('merges root and content class names', () => {
    render(
      <Header
        className="data-test-root"
        contentClassName="data-test-content"
        title="리뷰 작성"
      />,
    )

    expect(screen.getByRole('banner')).toHaveClass('data-test-root')
    expect(screen.getByText('리뷰 작성').parentElement).toHaveClass(
      'data-test-content',
    )
  })
})
