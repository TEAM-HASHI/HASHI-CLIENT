import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSearchFilterSheet } from '@/pages/search/hooks/useSearchFilterSheet'

const options = [
  { label: '기본순', value: 'default' },
  { label: '인기순', value: 'popular' },
  { label: '별점순', value: 'rating' },
] as const

describe('useSearchFilterSheet', () => {
  it('keeps selection pending and restores the applied value when reopened', () => {
    const applyValue = vi.fn()
    const initialProps: {
      appliedValue: 'default' | 'popular' | 'rating'
    } = { appliedValue: 'default' }
    const { result, rerender } = renderHook(
      ({ appliedValue }: { appliedValue: 'default' | 'popular' | 'rating' }) =>
        useSearchFilterSheet({
          appliedValue,
          defaultValue: 'default',
          onApplyValue: applyValue,
          options,
        }),
      { initialProps },
    )

    act(() => {
      result.current.onOpenChange(true)
      result.current.onSelect('rating')
    })

    expect(result.current.selectedValue).toBe('rating')
    expect(applyValue).not.toHaveBeenCalled()

    act(() => {
      result.current.onOpenChange(false)
    })
    rerender({ appliedValue: 'popular' })
    act(() => {
      result.current.onOpenChange(true)
    })

    expect(result.current.selectedValue).toBe('popular')
  })

  it('applies only supported option values and closes the sheet', () => {
    const applyValue = vi.fn()
    const { result } = renderHook(() =>
      useSearchFilterSheet({
        appliedValue: 'default',
        defaultValue: 'default',
        onApplyValue: applyValue,
        options,
      }),
    )

    act(() => {
      result.current.onOpenChange(true)
      result.current.onSelect('unsupported')
    })
    expect(result.current.selectedValue).toBe('default')

    act(() => {
      result.current.onSelect('rating')
    })
    act(() => {
      result.current.onApply()
    })

    expect(applyValue).toHaveBeenCalledWith('rating')
    expect(result.current.open).toBe(false)
  })

  it('applies the default value and closes the sheet when reset', () => {
    const applyValue = vi.fn()
    const { result } = renderHook(() =>
      useSearchFilterSheet({
        appliedValue: 'rating',
        defaultValue: 'default',
        onApplyValue: applyValue,
        options,
      }),
    )

    act(() => {
      result.current.onOpenChange(true)
      result.current.onReset()
    })

    expect(applyValue).toHaveBeenCalledWith('default')
    expect(result.current.open).toBe(false)
    expect(result.current.selectedValue).toBe('default')
  })
})
