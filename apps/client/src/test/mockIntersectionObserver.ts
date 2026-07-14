import { act } from '@testing-library/react'
import { vi } from 'vitest'

interface MockIntersectionObserverOptions {
  isIntersecting?: boolean
}

export const mockIntersectionObserver = ({
  isIntersecting = true,
}: MockIntersectionObserverOptions = {}) => {
  const observerRecords: Array<{
    callback: IntersectionObserverCallback
    observer: IntersectionObserver
    targets: Set<Element>
  }> = []
  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()
  const takeRecords = vi.fn(() => [])
  const IntersectionObserverMock = vi.fn(
    (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) => {
      const targets = new Set<Element>()
      const observer = {
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? '',
        thresholds:
          options?.threshold === undefined
            ? []
            : Array.isArray(options.threshold)
              ? options.threshold
              : [options.threshold],
        observe: (target: Element) => {
          observe(target)
          targets.add(target)
        },
        unobserve: (target: Element) => {
          unobserve(target)
          targets.delete(target)
        },
        disconnect: () => {
          disconnect()
          targets.clear()
        },
        takeRecords,
      } satisfies IntersectionObserver

      observerRecords.push({
        callback,
        observer,
        targets,
      })

      return observer
    },
  )

  const createEntries = (targets: Set<Element>) =>
    Array.from(targets).map(
      (target) =>
        ({
          isIntersecting,
          target,
        }) as IntersectionObserverEntry,
    )

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

  return {
    IntersectionObserverMock,
    disconnect,
    observe,
    triggerIntersect: (observerIndex = observerRecords.length - 1) => {
      act(() => {
        const record = observerRecords[observerIndex]

        if (!record || record.targets.size === 0) {
          return
        }

        record.callback(createEntries(record.targets), record.observer)
      })
    },
    triggerAllIntersects: () => {
      act(() => {
        observerRecords.forEach((record) => {
          if (record.targets.size === 0) {
            return
          }

          record.callback(createEntries(record.targets), record.observer)
        })
      })
    },
    unobserve,
  }
}
