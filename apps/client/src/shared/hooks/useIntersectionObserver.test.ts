import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'

const mockIntersectionObserver = () => {
  let handleIntersection: IntersectionObserverCallback | null = null
  const observe = vi.fn()
  const disconnect = vi.fn()
  const IntersectionObserverMock = vi.fn(
    (callback: IntersectionObserverCallback) => {
      handleIntersection = callback

      return {
        root: null,
        rootMargin: '',
        thresholds: [],
        observe,
        unobserve: vi.fn(),
        disconnect,
        takeRecords: vi.fn(() => []),
      } satisfies IntersectionObserver
    },
  )

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

  return {
    disconnect,
    observe,
    triggerIntersect: () => {
      handleIntersection?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    },
  }
}

describe('useIntersectionObserver', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls onIntersect when the target enters the viewport', () => {
    const { observe, triggerIntersect } = mockIntersectionObserver()
    const onIntersect = vi.fn()
    const target = document.createElement('div')

    const { result } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>({
        enabled: true,
        onIntersect,
      }),
    )

    act(() => {
      result.current(target)
    })

    expect(observe).toHaveBeenCalledWith(target)

    act(() => {
      triggerIntersect()
    })

    expect(onIntersect).toHaveBeenCalledTimes(1)
  })

  it('does not observe when disabled', () => {
    const { observe } = mockIntersectionObserver()

    renderHook(() =>
      useIntersectionObserver<HTMLDivElement>({
        enabled: false,
        onIntersect: vi.fn(),
      }),
    )

    expect(observe).not.toHaveBeenCalled()
  })
})
