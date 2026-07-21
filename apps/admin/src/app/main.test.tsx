import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const renderMock = vi.fn()

vi.mock('react-dom/client', () => ({
  createRoot: () => ({ render: renderMock }),
}))

vi.mock('@/app/App', () => ({
  App: () => null,
}))

describe('admin app bootstrap', () => {
  beforeEach(() => {
    vi.resetModules()
    renderMock.mockReset()
    document.body.innerHTML = '<div id="root"></div>'
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker')
    Reflect.deleteProperty(globalThis, 'caches')
    document.body.innerHTML = ''
  })

  it('removes legacy service workers and their caches on startup', async () => {
    const unregister = vi.fn().mockResolvedValue(true)
    const getRegistrations = vi
      .fn()
      .mockResolvedValue([
        { unregister },
      ] as unknown as ServiceWorkerRegistration[])
    const deleteCache = vi.fn().mockResolvedValue(true)
    const cacheKeys = vi.fn().mockResolvedValue(['workbox-precache-v1'])

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations },
    })
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: { delete: deleteCache, keys: cacheKeys },
    })

    await import('@/app/main')

    await vi.waitFor(() => {
      expect(unregister).toHaveBeenCalledOnce()
      expect(deleteCache).toHaveBeenCalledWith('workbox-precache-v1')
    })
    expect(renderMock).toHaveBeenCalledOnce()
  })
})
