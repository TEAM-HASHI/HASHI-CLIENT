import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Accordion } from './Accordion'

afterEach(() => {
  cleanup()
})

describe('Accordion', () => {
  it('renders the title as a heading toggle button', () => {
    render(<Accordion title="제1조 (목적)">약관 내용</Accordion>)

    const trigger = screen.getByRole('button', { name: '제1조 (목적)' })
    const heading = screen.getByRole('heading', { level: 3 })

    expect(heading).toContainElement(trigger)
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('supports custom heading level', () => {
    render(
      <Accordion title="제1조 (목적)" headingLevel={4}>
        약관 내용
      </Accordion>,
    )

    expect(screen.getByRole('heading', { level: 4 })).toContainElement(
      screen.getByRole('button', { name: '제1조 (목적)' }),
    )
  })

  it('keeps content mounted and hidden while collapsed by default', () => {
    render(<Accordion title="제1조 (목적)">약관 내용</Accordion>)

    const trigger = screen.getByRole('button', { name: '제1조 (목적)' })
    const content = screen.getByText('약관 내용')

    expect(content).toHaveAttribute('hidden')
    expect(trigger).toHaveAttribute('aria-controls', content.id)
  })

  it('renders content when expanded by default', () => {
    render(
      <Accordion title="제1조 (목적)" defaultExpanded>
        약관 내용
      </Accordion>,
    )

    expect(screen.getByText('약관 내용')).not.toHaveAttribute('hidden')
    expect(
      screen.getByRole('button', { name: '제1조 (목적)' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles expanded state when the trigger is clicked', () => {
    render(<Accordion title="제1조 (목적)">약관 내용</Accordion>)

    fireEvent.click(screen.getByRole('button', { name: '제1조 (목적)' }))

    expect(screen.getByText('약관 내용')).not.toHaveAttribute('hidden')
    expect(
      screen.getByRole('button', { name: '제1조 (목적)' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('calls onExpandedChange without changing content in controlled mode', () => {
    const handleExpandedChange = vi.fn()

    render(
      <Accordion
        title="제1조 (목적)"
        expanded={false}
        onExpandedChange={handleExpandedChange}
      >
        약관 내용
      </Accordion>,
    )

    fireEvent.click(screen.getByRole('button', { name: '제1조 (목적)' }))

    expect(handleExpandedChange).toHaveBeenCalledTimes(1)
    expect(handleExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.getByText('약관 내용')).toHaveAttribute('hidden')
  })
})
