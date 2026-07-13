import { act } from '@testing-library/react'
import { vi } from 'vitest'

interface MockIntersectionObserverOptions {
  isIntersecting?: boolean
}

export const mockIntersectionObserver = ({
  isIntersecting = true,
}: MockIntersectionObserverOptions = {}) => {
  const handleIntersections: IntersectionObserverCallback[] = []
  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()
  const takeRecords = vi.fn(() => [])
  const IntersectionObserverMock = vi.fn(
    (callback: IntersectionObserverCallback) => {
      handleIntersections.push(callback)

      return {
        root: null,
        rootMargin: '',
        thresholds: [],
        observe,
        unobserve,
        disconnect,
        takeRecords,
      } satisfies IntersectionObserver
    },
  )

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

  return {
    IntersectionObserverMock,
    disconnect,
    observe,
    triggerIntersect: (observerIndex = handleIntersections.length - 1) => {
      act(() => {
        handleIntersections[observerIndex]?.(
          [{ isIntersecting } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        )
      })
    },
    triggerAllIntersects: () => {
      act(() => {
        handleIntersections.forEach((handleIntersection) => {
          handleIntersection(
            [{ isIntersecting } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          )
        })
      })
    },
    unobserve,
  }
}
