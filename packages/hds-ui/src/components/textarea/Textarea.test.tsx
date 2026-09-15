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

  it('connects helper text and counter with aria-describedby', () => {
    render(
      <Textarea aria-label="review" helperText="10자 이상" maxLength={1000} />,
    )

    const textarea = screen.getByRole('textbox', { name: 'review' })
    const helperText = screen.getByText('10자 이상')
    const counter = screen.getByText('0').closest('p')

    expect(helperText).toHaveAttribute('id')
    expect(counter).toHaveAttribute('id')
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(helperText.id),
    )
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(counter?.id ?? ''),
    )
  })

  it('preserves external aria-describedby', () => {
    render(
      <>
        <p id="external-description">외부 설명</p>
        <Textarea
          aria-label="review"
          aria-describedby="external-description"
          helperText="10자 이상"
          maxLength={1000}
        />
      </>,
    )

    expect(screen.getByRole('textbox', { name: 'review' })).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('external-description'),
    )
  })

  it('passes native textarea props', () => {
    render(<Textarea aria-label="memo" name="memo" maxLength={5} disabled />)

    const textarea = screen.getByRole('textbox', { name: 'memo' })

    expect(textarea.getAttribute('name')).toBe('memo')
    expect(textarea.getAttribute('maxlength')).toBe('5')
    expect(textarea.hasAttribute('disabled')).toBe(true)
  })

  it('applies textareaClassName to the inner textarea', () => {
    render(<Textarea aria-label="memo" textareaClassName="typo-long-body-1" />)

    expect(screen.getByRole('textbox', { name: 'memo' })).toHaveClass(
      'typo-body-4',
      'typo-long-body-1',
    )
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
