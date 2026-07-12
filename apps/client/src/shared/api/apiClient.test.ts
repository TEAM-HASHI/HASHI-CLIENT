import { afterEach, describe, expect, it, vi } from 'vitest'

describe('apiClient', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('adds an Authorization header when accessToken exists in localStorage', async () => {
    const mockKyCreate = vi.fn((options) => options)

    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    vi.doMock('ky', () => ({
      default: {
        create: mockKyCreate,
      },
    }))

    await import('@/shared/api/apiClient')

    const options = mockKyCreate.mock.calls[0][0]
    const request = new Request('https://api.example.com/api/v1/reservations/1')

    window.localStorage.setItem('accessToken', 'test-access-token')
    options.hooks.beforeRequest[0]({
      options: {},
      request,
      retryCount: 0,
    })

    expect(request.headers.get('Authorization')).toBe(
      'Bearer test-access-token',
    )
  })
})
