import { beforeEach, describe, expect, it, vi } from 'vitest'

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

  const calls = mockKyCreate.mock.calls as unknown as Array<
    [
      {
        baseUrl: string
        timeout: number
        retry: number
        throwHttpErrors: boolean
      },
    ]
  >

  return calls[0]?.[0]
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.hashi.test')
    mockKyCreate.mockClear()
  })

  it('creates ky client with common API options', async () => {
    const options = await getApiClientOptions()

    expect(options).toEqual({
      baseUrl: 'https://api.hashi.test',
      timeout: 10_000,
      retry: 0,
      throwHttpErrors: false,
    })
  })
})
