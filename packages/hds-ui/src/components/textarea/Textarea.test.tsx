import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Textarea } from './Textarea'

afterEach(() => {
  cleanup()
})

describe('Textarea', () => {
  it('renders placeholder and helper text', () => {
    render(
      <Textarea
        aria-label="review"
        placeholder="리뷰를 작성해 주세요."
        helperText="10자 이상"
      />,
    )

    expect(screen.getByPlaceholderText('리뷰를 작성해 주세요.')).toBeTruthy()
    expect(screen.getByText('10자 이상')).toBeTruthy()
  })

  it('shows a counter when maxLength is provided', () => {
    render(<Textarea aria-label="review" maxLength={1000} />)

    expect(screen.getByText('0')).toBeTruthy()
    expect(screen.getByText('/1000')).toBeTruthy()
  })

  it('updates the counter from user input', () => {
    render(<Textarea aria-label="review" maxLength={1000} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'review' }), {
      target: { value: '좋아요' },
    })

    expect(screen.getByText('3')).toBeTruthy()
  })

  it('limits user input to maxLength', () => {
    render(<Textarea aria-label="memo" maxLength={5} />)

    const textarea = screen.getByRole('textbox', {
      name: 'memo',
    }) as HTMLTextAreaElement

    fireEvent.change(textarea, { target: { value: 'abcdef' } })

    expect(textarea.value).toBe('abcde')
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('uses controlled value for the counter', () => {
    const { rerender } = render(
      <Textarea aria-label="review" value="처음" maxLength={1000} readOnly />,
    )

    expect(screen.getByText('2')).toBeTruthy()

    rerender(
      <Textarea
        aria-label="review"
        value="다음 내용"
        maxLength={1000}
        readOnly
      />,
    )

    expect(screen.getByText('5')).toBeTruthy()
  })

  it('limits controlled value to maxLength', () => {
    render(<Textarea aria-label="memo" value="abcdef" maxLength={5} readOnly />)

    const textarea = screen.getByRole('textbox', {
      name: 'memo',
    }) as HTMLTextAreaElement

    expect(textarea.value).toBe('abcde')
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('allows hiding the counter', () => {
    render(<Textarea aria-label="memo" maxLength={1000} showCounter={false} />)

    expect(screen.queryByText('0')).toBeNull()
    expect(screen.queryByText('/1000')).toBeNull()
  })

  it('passes native textarea props', () => {
    render(<Textarea aria-label="memo" name="memo" maxLength={5} disabled />)

    const textarea = screen.getByRole('textbox', { name: 'memo' })

    expect(textarea.getAttribute('name')).toBe('memo')
    expect(textarea.getAttribute('maxlength')).toBe('5')
    expect(textarea.hasAttribute('disabled')).toBe(true)
  })

  it('calls the provided change handler', () => {
    const handleChange = vi.fn()

    render(<Textarea aria-label="memo" maxLength={5} onChange={handleChange} />)

    const textarea = screen.getByRole('textbox', { name: 'memo' })

    fireEvent.change(textarea, { target: { value: 'hello' } })

    expect(handleChange).toHaveBeenCalledOnce()
    expect(screen.getByText('5')).toBeTruthy()
  })
})
