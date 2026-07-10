import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InputField } from './InputField'

afterEach(() => {
  cleanup()
})

describe('InputField', () => {
  it('renders an input', () => {
    render(<InputField aria-label="name" />)

    expect(screen.getByRole('textbox', { name: 'name' })).toBeTruthy()
  })

  it('passes placeholder to the input', () => {
    render(<InputField aria-label="name" placeholder="내용을 입력해 주세요." />)

    expect(screen.getByPlaceholderText('내용을 입력해 주세요.')).toBeTruthy()
  })

  it('styles placeholder text with the input Body4 typography', () => {
    render(<InputField aria-label="name" placeholder="내용을 입력해 주세요." />)

    const input = screen.getByPlaceholderText('내용을 입력해 주세요.')

    expect(input).toHaveClass('typo-body-4')
    expect(input).toHaveClass('placeholder:text-warm-gray-300')
  })

  it('renders a label and connects it to the input', () => {
    render(<InputField label="연락처" />)

    const input = screen.getByLabelText('연락처')
    const label = screen.getByText('연락처')

    expect(input).toBeTruthy()
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'))
  })

  it('uses a provided id for the label connection', () => {
    render(<InputField id="contact" label="연락처" />)

    expect(screen.getByLabelText('연락처').getAttribute('id')).toBe('contact')
  })

  it('renders defaultValue', () => {
    render(<InputField aria-label="contact" defaultValue="010-7875-7856" />)

    expect(screen.getByDisplayValue('010-7875-7856')).toBeTruthy()
  })

  it('renders controlled value', () => {
    render(
      <InputField aria-label="code" value="4846" onChange={() => undefined} />,
    )

    expect(screen.getByDisplayValue('4846')).toBeTruthy()
  })

  it('calls onChange when the input changes', () => {
    const handleChange = vi.fn()

    render(<InputField aria-label="name" onChange={handleChange} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'name' }), {
      target: { value: 'Hashi' },
    })

    expect(handleChange).toHaveBeenCalledOnce()
  })

  it('focuses the input when the input box is clicked', () => {
    render(<InputField aria-label="name" />)

    const input = screen.getByRole('textbox', { name: 'name' })
    const inputBox = input.parentElement

    expect(inputBox).not.toBeNull()

    fireEvent.mouseDown(inputBox!)

    expect(input).toHaveFocus()
  })

  it('does not render a focus outline on the input box', () => {
    render(<InputField aria-label="name" />)

    const inputBox = screen.getByRole('textbox', { name: 'name' }).parentElement

    expect(inputBox).not.toHaveClass('focus-within:outline-cool-gray-500')
    expect(inputBox).not.toHaveClass('focus-within:outline-2')
    expect(inputBox).not.toHaveClass('focus-within:outline-offset-0')
  })

  it('uses 13px vertical padding on the input box', () => {
    render(<InputField aria-label="name" />)

    const inputBox = screen.getByRole('textbox', { name: 'name' }).parentElement

    expect(inputBox).toHaveClass('h-[45px]')
    expect(inputBox).toHaveClass('py-3.25')
  })

  it('resets native input spacing so the wrapper owns the inner padding', () => {
    render(<InputField aria-label="name" />)

    const input = screen.getByRole('textbox', { name: 'name' })

    expect(input).toHaveClass('appearance-none')
    expect(input).toHaveClass('border-0')
    expect(input).toHaveClass('p-0')
  })

  it('does not focus the input when the disabled input box is clicked', () => {
    render(<InputField aria-label="name" disabled />)

    const input = screen.getByRole('textbox', { name: 'name' })
    const inputBox = input.parentElement

    expect(inputBox).not.toBeNull()

    fireEvent.mouseDown(inputBox!)

    expect(input).not.toHaveFocus()
  })

  it('renders rightElement', () => {
    render(
      <InputField
        aria-label="contact"
        rightElement={<button type="button">인증하기</button>}
      />,
    )
    expect(screen.getByRole('button', { name: '인증하기' })).toBeTruthy()
  })

  it('disables rightElement interaction when disabled', () => {
    render(
      <InputField
        aria-label="contact"
        disabled
        rightElement={<button type="button">인증하기</button>}
      />,
    )

    const rightElementWrapper = screen.getByRole('button', {
      name: '인증하기',
    }).parentElement

    expect(rightElementWrapper).toHaveAttribute('aria-disabled', 'true')
    expect(rightElementWrapper).toHaveAttribute('inert')
    expect(rightElementWrapper).toHaveClass('pointer-events-none')
  })

  it('renders rightIcon as decorative content', () => {
    render(
      <InputField
        aria-label="code"
        rightIcon={<span data-testid="success-icon" />}
      />,
    )

    expect(screen.getByTestId('success-icon')).toBeTruthy()
  })

  it('does not force success color on rightIcon wrapper', () => {
    render(
      <InputField
        aria-label="code"
        rightIcon={<span data-testid="status-icon" />}
      />,
    )

    const rightIconWrapper = screen.getByTestId('status-icon').parentElement

    expect(rightIconWrapper).not.toHaveClass('text-success')
  })

  it('renders rightIcon and rightElement together', () => {
    render(
      <InputField
        aria-label="code"
        rightIcon={<span data-testid="success-icon" />}
        rightElement={<button type="button">확인</button>}
      />,
    )

    expect(screen.getByTestId('success-icon')).toBeTruthy()
    expect(screen.getByRole('button', { name: '확인' })).toBeTruthy()
  })

  it('passes disabled to the input', () => {
    render(<InputField aria-label="contact" disabled />)

    expect(
      screen.getByRole('textbox', { name: 'contact' }).hasAttribute('disabled'),
    ).toBe(true)
  })

  it('merges className into the input box', () => {
    render(
      <InputField aria-label="contact" className="border-success border" />,
    )

    expect(
      screen
        .getByRole('textbox', { name: 'contact' })
        .parentElement?.className.includes('border-success'),
    ).toBe(true)
  })

  it('passes aria-label to the input', () => {
    render(<InputField aria-label="인증번호" />)

    expect(screen.getByRole('textbox', { name: '인증번호' })).toBeTruthy()
  })
})
