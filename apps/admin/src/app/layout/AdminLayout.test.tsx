import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AdminLayout } from '@/app/layout/AdminLayout'

describe('AdminLayout', () => {
  it('links to member management in the sidebar', () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<p>대시보드</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const userLinks = screen.getAllByRole('link', { name: '회원 관리' })

    expect(userLinks).toHaveLength(2)
    userLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', '/admin/users'),
    )
  })
})
