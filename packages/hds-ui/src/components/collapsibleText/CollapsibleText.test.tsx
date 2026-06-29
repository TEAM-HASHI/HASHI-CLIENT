import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CollapsibleText } from './CollapsibleText'

const longText =
  '정말 맛있습니다 와우!!! 정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!'

afterEach(() => {
  cleanup()
})

describe('CollapsibleText', () => {
  it('renders the provided text', () => {
    render(<CollapsibleText text={longText} />)

    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('renders collapsed by default', () => {
    render(<CollapsibleText text={longText} />)

    expect(screen.getByText(longText)).toHaveClass('line-clamp-3')
  })

  it('renders expanded when defaultExpanded is true', () => {
    render(<CollapsibleText text={longText} defaultExpanded />)

    expect(screen.getByText(longText)).not.toHaveClass('line-clamp-3')
  })

  it('toggles expanded state when the button is clicked', () => {
    render(<CollapsibleText text={longText} defaultExpanded />)

    fireEvent.click(screen.getByRole('button', { name: '접기' }))

    expect(screen.getByText(longText)).toHaveClass('line-clamp-3')
  })
})
