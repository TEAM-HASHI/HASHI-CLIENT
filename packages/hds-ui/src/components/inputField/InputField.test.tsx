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

  it('renders rightElement', () => {
    render(
      <InputField
        aria-label="contact"
        rightElement={<button type="button">인증하기</button>}
      />,
    )

    expect(screen.getByRole('button', { name: '인증하기' })).toBeTruthy()
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
