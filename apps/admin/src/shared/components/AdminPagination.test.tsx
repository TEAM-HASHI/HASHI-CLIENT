import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminPagination } from '@/shared/components/AdminPagination'

describe('AdminPagination', () => {
  it('marks the current page and moves directly to a selected page', () => {
    const onPageChange = vi.fn()

    render(
      <AdminPagination
        currentPage={0}
        totalPages={3}
        isDisabled={false}
        onPageChange={onPageChange}
      />,
    )

    expect(screen.getByRole('button', { name: '1페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '3페이지' }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('keeps edge pages and condenses omitted ranges', () => {
    render(
      <AdminPagination
        currentPage={5}
        totalPages={10}
        isDisabled={false}
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '1페이지' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10페이지' })).toBeInTheDocument()
    expect(screen.getAllByText('…')).toHaveLength(2)
  })

  it('disables every page control during a list update', () => {
    render(
      <AdminPagination
        currentPage={1}
        totalPages={3}
        isDisabled
        onPageChange={vi.fn()}
      />,
    )

    expect(
      screen
        .getAllByRole('button')
        .every((button) => button.hasAttribute('disabled')),
    ).toBe(true)
  })

  it('renders nothing when there are no result pages', () => {
    render(
      <AdminPagination
        currentPage={0}
        totalPages={0}
        isDisabled={false}
        onPageChange={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('navigation', { name: '관리자 목록 페이지' }),
    ).not.toBeInTheDocument()
  })
})
