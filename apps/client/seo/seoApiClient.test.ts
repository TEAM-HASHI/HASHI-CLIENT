// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

import { createSeoApiClient } from './seoApiClient'

const createJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  })

describe('createSeoApiClient', () => {
  it('normalizes the base URL and unwraps a successful response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        data: { content: [], hasNext: false },
      }),
    )
    const api = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr/',
      fetchImpl,
      wait: vi.fn(),
    })

    await expect(
      api.getRestaurants({ genre: 'all', size: 10, sort: 'basic' }),
    ).resolves.toEqual({ content: [], hasNext: false })
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.hashi.kr/api/v1/restaurants?genre=all&size=10&sort=basic',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('retries network failures twice with bounded backoff', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'))
      .mockResolvedValue(
        createJsonResponse({
          success: true,
          data: { content: [], hasNext: false },
        }),
      )
    const wait = vi.fn().mockResolvedValue(undefined)
    const api = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr',
      fetchImpl,
      wait,
    })

    await api.getRestaurants({ size: 10 })

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(wait).toHaveBeenNthCalledWith(1, 500)
    expect(wait).toHaveBeenNthCalledWith(2, 1000)
  })

  it('retries HTTP 5xx but does not retry HTTP 4xx', async () => {
    const wait = vi.fn().mockResolvedValue(undefined)
    const retryingFetch = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({}, 503))
      .mockResolvedValueOnce(
        createJsonResponse({
          success: true,
          data: { content: [], hasNext: false },
        }),
      )
    const retryingApi = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr',
      fetchImpl: retryingFetch,
      wait,
    })

    await retryingApi.getRestaurants({ size: 10 })
    expect(retryingFetch).toHaveBeenCalledTimes(2)
    expect(wait).toHaveBeenCalledWith(500)

    const rejectedFetch = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ message: 'not found' }, 404))
    const rejectedApi = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr',
      fetchImpl: rejectedFetch,
      wait,
    })

    await expect(rejectedApi.getRestaurantSummary(404)).rejects.toThrow(
      'HTTP 404',
    )
    expect(rejectedFetch).toHaveBeenCalledTimes(1)
  })

  it.each([{ data: {}, success: false }, { success: true }, null])(
    'rejects a malformed or unsuccessful envelope: %j',
    async (body) => {
      const fetchImpl = vi.fn().mockResolvedValue(createJsonResponse(body))
      const api = createSeoApiClient({
        baseUrl: 'https://api.hashi.kr',
        fetchImpl,
        wait: vi.fn(),
      })

      await expect(api.getMagazineBanners()).rejects.toThrow('응답 봉투')
      expect(fetchImpl).toHaveBeenCalledTimes(1)
    },
  )

  it('rejects a successful restaurant page with missing pagination fields', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        data: {},
      }),
    )
    const api = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr',
      fetchImpl,
      wait: vi.fn(),
    })

    await expect(api.getRestaurants({ size: 10 })).rejects.toThrow(
      '응답 데이터',
    )
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid menu and magazine cursor page shapes', async () => {
    const invalidMenuFetch = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        data: { content: [], hasNext: 'false' },
      }),
    )
    const menuApi = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr',
      fetchImpl: invalidMenuFetch,
      wait: vi.fn(),
    })

    await expect(menuApi.getRestaurantMenus(1, { size: 10 })).rejects.toThrow(
      '응답 데이터',
    )

    const invalidMagazineFetch = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        data: { hasNext: true, magazines: [], nextCursor: 'wrong-cursor' },
      }),
    )
    const magazineApi = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr',
      fetchImpl: invalidMagazineFetch,
      wait: vi.fn(),
    })

    await expect(magazineApi.getMagazines({ size: 10 })).rejects.toThrow(
      '응답 데이터',
    )
  })

  it('rejects a successful banner response without a banners array', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        data: {},
      }),
    )
    const api = createSeoApiClient({
      baseUrl: 'https://api.hashi.kr',
      fetchImpl,
      wait: vi.fn(),
    })

    await expect(api.getMagazineBanners()).rejects.toThrow('응답 데이터')
  })
})
