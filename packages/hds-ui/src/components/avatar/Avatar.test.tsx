import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

afterEach(() => {
  cleanup()
})

describe('Avatar', () => {
  it('renders an image when src is provided', () => {
    render(<Avatar src="/avatar.png" alt="프로필 이미지" />)

    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      '/avatar.png',
    )
  })

  it('applies alt text to the image', () => {
    render(<Avatar src="/avatar.png" alt="사용자 프로필" />)

    expect(screen.getByRole('img', { name: '사용자 프로필' })).toHaveAttribute(
      'alt',
      '사용자 프로필',
    )
  })

  it('uses empty alt text when alt is not provided', () => {
    const { container } = render(<Avatar src="/avatar.png" />)
    const image = container.querySelector('img')

    expect(image).toHaveAttribute('alt', '')
  })

  it('renders a placeholder when src is not provided', () => {
    render(<Avatar />)

    expect(screen.getByTestId('avatar-placeholder')).toBeInTheDocument()
  })

  it('hides placeholder from assistive technologies', () => {
    render(<Avatar />)

    expect(screen.getByTestId('avatar-placeholder')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('applies sm size classes', () => {
    render(<Avatar size="sm" />)

    expect(screen.getByTestId('avatar-placeholder')).toHaveClass('h-10', 'w-10')
  })

  it('applies md size classes', () => {
    render(<Avatar size="md" />)

    expect(screen.getByTestId('avatar-placeholder')).toHaveClass(
      'h-[42px]',
      'w-[42px]',
    )
  })

  it('applies lg size classes', () => {
    render(<Avatar size="lg" />)

    expect(screen.getByTestId('avatar-placeholder')).toHaveClass(
      'h-[90px]',
      'w-[90px]',
    )
  })

  it('merges className', () => {
    render(<Avatar className="ring-2" />)

    expect(screen.getByTestId('avatar-placeholder')).toHaveClass('ring-2')
  })

  it('merges className when src is provided', () => {
    render(<Avatar src="/avatar.png" alt="프로필 이미지" className="ring-2" />)

    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveClass(
      'ring-2',
    )
  })
})
