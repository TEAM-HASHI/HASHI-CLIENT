import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Header } from './Header'

afterEach(() => {
  cleanup()
})

describe('Header', () => {
  it('renders a text right action from its typed config', () => {
    const handleSave = vi.fn()

    render(
      <Header
        rightAction={{
          type: 'text',
          label: '저장',
          onClick: handleSave,
        }}
        title="개인정보 및 알림 설정 변경"
      />,
    )

    const action = screen.getByRole('button', { name: '저장' })

    expect(screen.getByText('개인정보 및 알림 설정 변경')).toBeInTheDocument()

    fireEvent.click(action)

    expect(handleSave).toHaveBeenCalledOnce()
  })

  it('renders an icon right action from its typed config', () => {
    const handleShare = vi.fn()

    render(
      <Header
        rightAction={{
          type: 'icon',
          icon: <span aria-hidden="true">공유</span>,
          ariaLabel: '공유하기',
          onClick: handleShare,
        }}
        title="오늘의 식당"
      />,
    )

    const action = screen.getByRole('button', { name: '공유하기' })

    fireEvent.click(action)

    expect(handleShare).toHaveBeenCalledOnce()
  })

  it('removes elevation when a visible subtitle is rendered', () => {
    render(
      <Header
        subtitle="최종 업데이트: 2026. 06. 29"
        title="개인정보 수집 및 이용 동의"
      />,
    )

    expect(screen.getByRole('banner')).toHaveClass('shadow-none')
    expect(screen.getByRole('banner')).not.toHaveClass('shadow-header')
  })

  it('renders a visible title', () => {
    render(<Header title="식당 상세 정보" />)

    expect(screen.getByText('식당 상세 정보')).toBeInTheDocument()
  })

  it('renders a caller-provided left action slot', () => {
    render(
      <Header
        title="오늘의 식당"
        leftAction={<button type="button">뒤로가기</button>}
      />,
    )

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument()
  })

  it('renders a visible subtitle', () => {
    render(
      <Header
        title="개인정보 수집 및 이용 동의"
        subtitle="최종 업데이트: 2026. 06. 29"
      />,
    )

    expect(screen.getByText('최종 업데이트: 2026. 06. 29')).toBeInTheDocument()
  })

  it('renders valid falsy subtitle content', () => {
    render(<Header title="알림" subtitle={0} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('does not render false subtitle content', () => {
    render(<Header title="알림" subtitle={false} />)

    expect(screen.getByText('알림').parentElement).toHaveTextContent('알림')
    expect(screen.getByText('알림').parentElement?.children).toHaveLength(1)
  })

  it('does not render an empty string subtitle', () => {
    render(<Header title="알림" subtitle="" />)

    expect(screen.getByText('알림').parentElement?.children).toHaveLength(1)
  })

  it('removes the header elevation when elevated is false', () => {
    render(<Header elevated={false} title="마이 리뷰" />)

    expect(screen.getByRole('banner')).toHaveClass('shadow-none')
    expect(screen.getByRole('banner')).not.toHaveClass('shadow-header')
  })
})
