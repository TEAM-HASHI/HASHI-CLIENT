import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { App } from '@/app/App'

vi.mock('@/app/providers/AuthSessionRestoreGate', () => ({
  AuthSessionRestoreGate: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('@/app/router', () => ({
  router: {},
}))

vi.mock('react-router-dom', () => ({
  RouterProvider: () => <div>SPA route content</div>,
}))

describe('App prerender transition', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('removes the prerender snapshot after the SPA commits without replacing its sibling root', () => {
    document.body.innerHTML =
      '<div data-hashi-prerender-shell><main data-hashi-seo-snapshot>prerender content</main><div id="root"></div></div>'
    const root = document.getElementById('root')

    expect(root).not.toBeNull()

    render(<App />, { container: root! })

    expect(screen.getByText('SPA route content')).toBeInTheDocument()
    expect(
      document.querySelector('[data-hashi-seo-snapshot]'),
    ).not.toBeInTheDocument()
    expect(document.getElementById('root')).toBe(root)
  })
})
