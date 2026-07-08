import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { lazyPages } from '@/app/router/lazy'

vi.mock('@/pages/loginRequired', () => new Promise(() => {}))

describe('lazyPages', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders LoadingScreen while a lazy route module is pending', () => {
    render(lazyPages.loginRequired())

    expect(screen.getByRole('status')).toHaveTextContent('로딩 중이에요')
  })
})
