import { beforeEach, describe, expect, it, vi } from 'vitest'

type ApiClientOptions = {
  hooks?: {
    beforeRequest?: Array<(state: { request: Request }) => void>
  }
}

const { mockKyCreate } = vi.hoisted(() => ({
  mockKyCreate: vi.fn(() => vi.fn()),
}))

vi.mock('ky', () => ({
  default: {
    create: mockKyCreate,
  },
}))

const getApiClientOptions = async () => {
  await import('@/shared/api/apiClient')

  const calls = mockKyCreate.mock.calls as unknown as Array<[ApiClientOptions]>

  return calls[0]?.[0]
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.hashi.test')
    mockKyCreate.mockClear()
    window.localStorage.clear()
  })

  it('attaches localStorage accessToken as a Bearer token', async () => {
    window.localStorage.setItem('accessToken', 'test-access-token')

    const options = await getApiClientOptions()
    const request = new Request(
      'https://api.hashi.test/api/v1/reviews/me/count',
    )

    options?.hooks?.beforeRequest?.[0]?.({ request })

    expect(request.headers.get('Authorization')).toBe(
      'Bearer test-access-token',
    )
  })

  it('does not attach Authorization when accessToken is empty', async () => {
    const options = await getApiClientOptions()
    const request = new Request(
      'https://api.hashi.test/api/v1/reviews/me/count',
    )

    options?.hooks?.beforeRequest?.[0]?.({ request })

    expect(request.headers.has('Authorization')).toBe(false)
  })
})
