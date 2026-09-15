import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'

afterEach(() => {
  cleanup()
})

describe('Checkbox', () => {
  it('renders label children', () => {
    render(<Checkbox>Checkbox</Checkbox>)

    expect(screen.getByText('Checkbox')).toBeInTheDocument()
  })

  it('renders a native checkbox input', () => {
    render(<Checkbox>Checkbox</Checkbox>)

    expect(screen.getByRole('checkbox', { name: 'Checkbox' })).toHaveAttribute(
      'type',
      'checkbox',
    )
  })

  it('passes ref to the native checkbox input', () => {
    const ref = createRef<HTMLInputElement>()

    render(<Checkbox ref={ref}>Checkbox</Checkbox>)

    expect(ref.current).toBe(screen.getByRole('checkbox', { name: 'Checkbox' }))
  })

  it('toggles checked state when clicked', () => {
    render(<Checkbox>Checkbox</Checkbox>)

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox' })

    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)

    expect(checkbox).not.toBeChecked()
  })

  it('does not toggle checked state when disabled', () => {
    const handleChange = vi.fn()

    render(
      <Checkbox checked disabled onChange={handleChange}>
        Checkbox
      </Checkbox>,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox' })

    expect(checkbox).toBeChecked()

    fireEvent.click(screen.getByText('Checkbox'))

    expect(checkbox).toBeChecked()
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies redesigned visual states when enabled', () => {
    const { container } = render(<Checkbox>Checkbox</Checkbox>)
    const icon = container.querySelector('svg')
    const visualBox = icon?.parentElement

    expect(visualBox).toHaveClass(
      'bg-cool-gray-100',
      'group-hover/checkbox:bg-cool-gray-200',
      'group-active/checkbox:bg-cool-gray-300',
      'peer-checked:text-cool-gray-900',
    )
    expect(icon).toHaveClass('h-[26px]', 'w-[26px]')
  })

  it('keeps disabled checkbox from applying hover and pressed visuals', () => {
    const { container } = render(<Checkbox disabled>Checkbox</Checkbox>)
    const icon = container.querySelector('svg')
    const visualBox = icon?.parentElement

    expect(visualBox).toHaveClass('bg-cool-gray-100')
    expect(visualBox).not.toHaveClass(
      'group-hover/checkbox:bg-cool-gray-200',
      'group-active/checkbox:bg-cool-gray-300',
    )
  })

  it('hides CheckIcon from assistive technologies', () => {
    const { container } = render(<Checkbox>Checkbox</Checkbox>)
    const icon = container.querySelector('svg')

    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveAttribute('focusable', 'false')
  })
})
