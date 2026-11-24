import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotificationLayout } from '@/features/notification/components/NotificationLayout'

afterEach(cleanup)

describe('shared NotificationLayout', () => {
  it('lets either panel provide content and control the selected tab', () => {
    const onTabChange = vi.fn()
    const { rerender } = render(
      <NotificationLayout
        activeTab="news"
        onBack={vi.fn()}
        onTabChange={onTabChange}
      >
        <p>소식 본문</p>
      </NotificationLayout>,
    )
    expect(screen.getByText('알림')).toBeVisible()
    expect(screen.getByRole('tab', { name: '소식 알림' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    fireEvent.click(screen.getByRole('tab', { name: '서비스 공지' }))
    expect(onTabChange).toHaveBeenCalledWith('notice')
    expect(screen.getByRole('tab', { name: '소식 알림' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    rerender(
      <NotificationLayout
        activeTab="notice"
        onBack={vi.fn()}
        onTabChange={onTabChange}
      >
        <p>공지 본문</p>
      </NotificationLayout>,
    )
    expect(screen.getByRole('tab', { name: '서비스 공지' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('공지 본문')).toBeVisible()
    expect(screen.queryByText('소식 본문')).not.toBeInTheDocument()
  })

  it('delegates back to the owning page without requiring a router', () => {
    const onBack = vi.fn()
    render(
      <NotificationLayout
        activeTab="notice"
        onBack={onBack}
        onTabChange={vi.fn()}
      >
        본문
      </NotificationLayout>,
    )
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
