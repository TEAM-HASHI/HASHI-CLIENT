import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Textarea } from './Textarea'

afterEach(() => {
  cleanup()
})

describe('Textarea', () => {
  it('allows over-limit input without truncating the change event and clears the error on recovery', () => {
    const handleChange = vi.fn()
    render(
      <Textarea
        aria-label="memo"
        maxLength={5}
        maxLengthBehavior="allow"
        helperText="안내"
        errorMessage="글자 수 제한을 초과했어요."
        onChange={(event) => handleChange(event.currentTarget.value)}
      />,
    )
    const textarea = screen.getByRole('textbox', { name: 'memo' })
    expect(textarea).not.toHaveAttribute('maxlength')
    fireEvent.change(textarea, { target: { value: 'abcdef' } })
    expect(textarea).toHaveValue('abcdef')
    expect(handleChange).toHaveBeenLastCalledWith('abcdef')
    expect(screen.getByText('6')).toBeTruthy()
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAccessibleDescription(
      '글자 수 제한을 초과했어요. 6 /5',
    )

    fireEvent.change(textarea, { target: { value: 'abcde' } })
    expect(textarea).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('글자 수 제한을 초과했어요.')).toBeNull()
    expect(screen.getByText('안내')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('preserves controlled over-limit values and responds to limit changes', () => {
    const { rerender } = render(
      <Textarea
        aria-label="memo"
        value="abcdef"
        maxLength={5}
        maxLengthBehavior="allow"
        readOnly
      />,
    )
    const textarea = screen.getByRole('textbox', { name: 'memo' })
    expect(textarea).toHaveValue('abcdef')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    rerender(
      <Textarea
        aria-label="memo"
        value="abcdef"
        maxLength={6}
        maxLengthBehavior="allow"
        readOnly
      />,
    )
    expect(textarea).toHaveValue('abcdef')
    expect(textarea).not.toHaveAttribute('aria-invalid')
  })

  it('counts an over-limit defaultValue and preserves external invalid state', () => {
    render(
      <Textarea
        aria-label="memo"
        defaultValue="abcdef"
        maxLength={5}
        maxLengthBehavior="allow"
        aria-invalid="true"
        errorMessage="입력을 확인해주세요."
      />,
    )
    const textarea = screen.getByRole('textbox', { name: 'memo' })
    expect(textarea).toHaveValue('abcdef')
    expect(screen.getByText('6')).toBeTruthy()
    fireEvent.change(textarea, { target: { value: 'a' } })
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('입력을 확인해주세요.')).toBeTruthy()
  })

  it('keeps hard limits as the default and passes the trimmed value to the caller', () => {
    const handleChange = vi.fn()
    render(
      <Textarea
        aria-label="memo"
        maxLength={5}
        defaultValue="abcdef"
        onChange={(event) => handleChange(event.currentTarget.value)}
      />,
    )
    const textarea = screen.getByRole('textbox', { name: 'memo' })
    expect(textarea).toHaveValue('abcde')
    expect(textarea).toHaveAttribute('maxlength', '5')
    fireEvent.change(textarea, { target: { value: '123456' } })
    expect(handleChange).toHaveBeenCalledWith('12345')
  })

  it('keeps counter in sync with controlled value when parent does not update value', () => {
    const handleChange = vi.fn()

    render(
      <Textarea
        aria-label="review"
        value=""
        maxLength={1000}
        onChange={handleChange}
      />,
    )

    const textarea = screen.getByRole('textbox', {
      name: 'review',
    }) as HTMLTextAreaElement

    fireEvent.change(textarea, {
      target: { value: '좋아요' },
    })

    expect(handleChange).toHaveBeenCalledOnce()
    expect(textarea.value).toBe('')
    expect(screen.getByText('0')).toBeTruthy()
  })
})
