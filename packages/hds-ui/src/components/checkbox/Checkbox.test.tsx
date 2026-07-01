import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
})
