import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

describe('mockIntersectionObserver', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('triggers callbacks only for observed targets', () => {
    const { IntersectionObserverMock, triggerAllIntersects } =
      mockIntersectionObserver()
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()
    const firstTarget = document.createElement('div')

    const firstObserver = new IntersectionObserverMock(firstCallback)
    new IntersectionObserverMock(secondCallback)

    firstObserver.observe(firstTarget)

    triggerAllIntersects()

    expect(firstCallback).toHaveBeenCalledTimes(1)
    expect(secondCallback).not.toHaveBeenCalled()
    expect(firstCallback.mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({
        isIntersecting: true,
        target: firstTarget,
      }),
    ])
  })

  it('does not trigger callbacks after unobserve or disconnect', () => {
    const { IntersectionObserverMock, triggerAllIntersects } =
      mockIntersectionObserver()
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()
    const firstTarget = document.createElement('div')
    const secondTarget = document.createElement('div')

    const firstObserver = new IntersectionObserverMock(firstCallback)
    const secondObserver = new IntersectionObserverMock(secondCallback)

    firstObserver.observe(firstTarget)
    secondObserver.observe(secondTarget)
    firstObserver.unobserve(firstTarget)
    secondObserver.disconnect()

    triggerAllIntersects()

    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).not.toHaveBeenCalled()
  })
})
