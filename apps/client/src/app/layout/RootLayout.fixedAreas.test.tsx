import '@testing-library/jest-dom/vitest'
import { Dialog } from '@hashi/hds-ui'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react'
import { useState, type ReactNode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'

import { RootLayout } from '@/app/layout/RootLayout'
import {
  PageFixedArea,
  PageFixedAreaProvider,
} from '@/shared/components/pageFixedArea/PageFixedArea'

vi.mock('@/app/providers/AuthSessionRestoreGate', () => ({
  AuthSessionRestoreGate: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('@/shared/lib/analytics', () => ({ trackPageView: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('keeps fixed controls outside the page scroller while preserving drafts and updating its bounds', async () => {
  const submit = vi.fn()
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      if (this.tagName === 'HEADER') return new DOMRect(0, 0, 393, 75)
      if (this.tagName === 'NAV')
        return new DOMRect(0, window.innerHeight - 84, 393, 84)
      return new DOMRect()
    },
  )
  const Page = () => {
    const [showHeader, setShowHeader] = useState(true)
    const [draft, setDraft] = useState('')
    return (
      <>
        <PageFixedArea>
          {showHeader && (
            <header style={{ position: 'fixed' }}>상단 영역</header>
          )}
          <nav
            className="app-mobile-fixed-bottom"
            style={{ position: 'fixed' }}
          >
            <button onClick={() => setShowHeader(false)}>상단 닫기</button>
            <button form="fixed-area-form" type="submit">
              제출
            </button>
          </nav>
        </PageFixedArea>
        <form
          id="fixed-area-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit(draft)
          }}
        >
          <input
            aria-label="미저장 입력"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </form>
      </>
    )
  }
  const router = createMemoryRouter([
    { element: <RootLayout />, children: [{ path: '/', element: <Page /> }] },
  ])
  render(<RouterProvider router={router} />)

  const scroller = screen.getByRole('main', { name: '페이지 콘텐츠' })
  expect(scroller).not.toContainElement(screen.getByRole('banner'))
  expect(scroller).not.toContainElement(screen.getByRole('navigation'))
  await waitFor(() => {
    expect(
      document.documentElement.style.getPropertyValue('--app-content-top'),
    ).toBe('75px')
    expect(
      document.documentElement.style.getPropertyValue('--app-content-bottom'),
    ).toBe('84px')
  })
  fireEvent.change(screen.getByLabelText('미저장 입력'), {
    target: { value: '작성 중' },
  })
  scroller.scrollTop = 240
  fireEvent.click(screen.getByRole('button', { name: '상단 닫기' }))
  await waitFor(() => {
    expect(
      document.documentElement.style.getPropertyValue('--app-content-top'),
    ).toBe('0px')
  })
  expect(screen.getByLabelText('미저장 입력')).toHaveValue('작성 중')
  expect(scroller.scrollTop).toBe(240)
  fireEvent.click(screen.getByRole('button', { name: '제출' }))
  expect(submit).toHaveBeenCalledExactlyOnceWith('작성 중')
})

it('keeps modal controls inside their modal instead of the isolated page fixed area', () => {
  const Page = () => {
    const [open, setOpen] = useState(true)
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content aria-label="전체 화면 상세">
          <PageFixedAreaProvider container={null}>
            <PageFixedArea>
              <button onClick={() => setOpen(false)}>상세 닫기</button>
            </PageFixedArea>
          </PageFixedAreaProvider>
        </Dialog.Content>
      </Dialog.Root>
    )
  }
  const router = createMemoryRouter([
    { element: <RootLayout />, children: [{ path: '/', element: <Page /> }] },
  ])
  render(<RouterProvider router={router} />)
  expect(screen.getByRole('dialog')).toContainElement(
    screen.getByRole('button', { name: '상세 닫기' }),
  )
  fireEvent.click(screen.getByRole('button', { name: '상세 닫기' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
