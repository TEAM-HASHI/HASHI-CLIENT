import '@testing-library/jest-dom/vitest'

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SearchBar } from './SearchBar'

afterEach(cleanup)

describe('SearchBar', () => {
  it('restores the native default value and clear button after a form reset, but respects cancelled resets', async () => {
    const renderForm = (cancelReset = false) => (
      <form
        onReset={(event) => {
          if (cancelReset) event.preventDefault()
        }}
      >
        <SearchBar aria-label="검색" defaultValue="초밥" />
      </form>
    )
    const { rerender } = render(renderForm())
    const input = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.click(screen.getByRole('button'))
    expect(input).toHaveValue('')
    await act(async () => input.form!.reset())
    await waitFor(() => {
      expect(input).toHaveValue('초밥')
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
    fireEvent.change(input, { target: { value: '우동' } })
    await act(async () => input.form!.reset())
    await waitFor(() => expect(input).toHaveValue('초밥'))

    rerender(renderForm(true))
    fireEvent.click(screen.getByRole('button'))
    await act(async () => input.form!.reset())
    await waitFor(() => expect(input).toHaveValue(''))
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('preserves callback ref cleanup until unmount rather than running it on input changes', () => {
    const disposeRef = vi.fn()
    const callbackRef = vi.fn(() => disposeRef)
    const { unmount } = render(
      <SearchBar aria-label="검색" defaultValue="초밥" ref={callbackRef} />,
    )
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: '우동' },
    })
    expect(disposeRef).not.toHaveBeenCalled()
    unmount()
    expect(disposeRef).toHaveBeenCalledOnce()
  })

  it('clears uncontrolled input and restores focus without submitting the form', () => {
    const onSubmit = vi.fn()
    const inputRef = createRef<HTMLInputElement>()
    render(
      <form onSubmit={onSubmit}>
        <SearchBar ref={inputRef} aria-label="검색" defaultValue="초밥" />
      </form>,
    )
    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }))
    expect(inputRef.current).toHaveValue('')
    expect(inputRef.current).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    fireEvent.change(inputRef.current!, { target: { value: '라멘' } })
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('uses parent state for controlled clearing and subsequent input', () => {
    const Controlled = () => {
      const [value, setValue] = useState('초밥')
      return (
        <SearchBar
          aria-label="검색"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onClear={() => setValue('')}
        />
      )
    }
    render(<Controlled />)
    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }))
    const input = screen.getByRole('searchbox')
    expect(input).toHaveValue('')
    fireEvent.change(input, { target: { value: '우동' } })
    expect(input).toHaveValue('우동')
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not mutate controlled values when the parent keeps them unchanged', () => {
    const onClear = vi.fn()
    render(
      <SearchBar
        aria-label="검색"
        value="초밥"
        onClear={onClear}
        onChange={() => {}}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.getByRole('searchbox')).toHaveValue('초밥')
  })
})
