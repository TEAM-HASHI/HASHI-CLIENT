import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

describe('useInfiniteScrollTrigger', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls onIntersect when the target enters the viewport', () => {
    const { observe, triggerIntersect } = mockIntersectionObserver()
    const onIntersect = vi.fn()
    const target = document.createElement('div')

    const { result } = renderHook(() =>
      useInfiniteScrollTrigger<HTMLDivElement>({
        enabled: true,
        onIntersect,
      }),
    )

    act(() => {
      result.current(target)
    })

    expect(observe).toHaveBeenCalledWith(target)

    triggerIntersect()

    expect(onIntersect).toHaveBeenCalledTimes(1)
  })

  it('does not observe when disabled', () => {
    const { observe } = mockIntersectionObserver()

    renderHook(() =>
      useInfiniteScrollTrigger<HTMLDivElement>({
        enabled: false,
        onIntersect: vi.fn(),
      }),
    )

    expect(observe).not.toHaveBeenCalled()
  })

  it('does not call onIntersect while loading', () => {
    const { observe } = mockIntersectionObserver()
    const target = document.createElement('div')

    const { result } = renderHook(() =>
      useInfiniteScrollTrigger<HTMLDivElement>({
        enabled: true,
        isLoading: true,
        onIntersect: vi.fn(),
      }),
    )

    act(() => {
      result.current(target)
    })

    expect(observe).not.toHaveBeenCalled()
  })

  it('blocks duplicate intersections while pending and unlocks after completion', async () => {
    const { triggerIntersect } = mockIntersectionObserver()
    const target = document.createElement('div')
    let resolveIntersect: () => void = () => {}
    const onIntersect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveIntersect = resolve
        }),
    )

    const { result } = renderHook(() =>
      useInfiniteScrollTrigger<HTMLDivElement>({
        enabled: true,
        onIntersect,
      }),
    )

    act(() => {
      result.current(target)
    })

    triggerIntersect()
    triggerIntersect()

    expect(onIntersect).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveIntersect()
      await Promise.resolve()
    })

    triggerIntersect()

    expect(onIntersect).toHaveBeenCalledTimes(2)
  })
})
