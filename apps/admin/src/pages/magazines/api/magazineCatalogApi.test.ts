import { beforeEach, describe, expect, it, vi } from 'vitest'
import { magazineCatalogApi } from '@/pages/magazines/api/magazineCatalogApi'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const requestMock = vi.mocked(request)

describe('magazineCatalogApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({})
  })

  it('serializes the public magazine cursor and size', async () => {
    await magazineCatalogApi.list({ cursor: 12, size: 20 })

    const options = requestMock.mock.calls[0]?.[1]

    expect(requestMock.mock.calls[0]?.[0]).toBe('/api/v1/magazines')
    expect(options?.method).toBe('get')
    expect(options?.searchParams?.toString()).toBe('cursor=12&size=20')
  })
})
