// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

import {
  createPublicRouteManifest,
  validateApiBaseUrl,
} from './public-route-manifest.mjs'

const createResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const success = (data) => ({ success: true, code: 'SUCCESS', data })

describe('public route manifest', () => {
  it('walks every cursor page, removes duplicates, and validates details', async () => {
    const fetchImpl = vi.fn(async (input) => {
      const url = new URL(input)

      if (url.pathname === '/api/v1/restaurants') {
        expect(url.searchParams.get('size')).toBe('10')
        return createResponse(
          200,
          success(
            url.searchParams.get('cursor') === 'next-1'
              ? {
                  content: [{ restaurantId: 2 }, { restaurantId: 3 }],
                  hasNext: false,
                }
              : {
                  content: [{ restaurantId: 1 }, { restaurantId: 2 }],
                  hasNext: true,
                  nextCursor: 'next-1',
                },
          ),
        )
      }

      return createResponse(
        200,
        success({ restaurantId: Number(url.pathname.split('/')[4]) }),
      )
    })

    const manifest = await createPublicRouteManifest({
      apiBaseUrl: 'https://api.hashi.test',
      fetchImpl,
      logger: { warn: vi.fn() },
    })

    expect(manifest.restaurantIds).toEqual([1, 2, 3])
    expect(manifest.paths).toContain('/restaurants/3')
  })

  it('skips a restaurant whose detail summary returns 404', async () => {
    const warn = vi.fn()
    const fetchImpl = vi.fn(async (input) => {
      const url = new URL(input)

      if (url.pathname === '/api/v1/restaurants') {
        return createResponse(
          200,
          success({
            content: [{ restaurantId: 1 }, { restaurantId: 2 }],
            hasNext: false,
          }),
        )
      }

      return url.pathname.endsWith('/2/summary')
        ? createResponse(404, { success: false, data: null })
        : createResponse(200, success({ restaurantId: 1 }))
    })

    const manifest = await createPublicRouteManifest({
      apiBaseUrl: 'https://api.hashi.test',
      fetchImpl,
      logger: { warn },
    })

    expect(manifest.restaurantIds).toEqual([1])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('restaurantId=2'))
  })

  it('rejects a repeated cursor instead of looping forever', async () => {
    const fetchImpl = vi.fn(async () =>
      createResponse(
        200,
        success({ content: [], hasNext: true, nextCursor: 'same-cursor' }),
      ),
    )

    await expect(
      createPublicRouteManifest({
        apiBaseUrl: 'https://api.hashi.test',
        fetchImpl,
        logger: { warn: vi.fn() },
      }),
    ).rejects.toThrow('cursor')
  })

  it('rejects malformed list data and server failures', async () => {
    await expect(
      createPublicRouteManifest({
        apiBaseUrl: 'https://api.hashi.test',
        fetchImpl: async () => createResponse(200, success({ hasNext: false })),
        logger: { warn: vi.fn() },
      }),
    ).rejects.toThrow('형식')

    await expect(
      createPublicRouteManifest({
        apiBaseUrl: 'https://api.hashi.test',
        fetchImpl: async () => createResponse(503, { success: false }),
        logger: { warn: vi.fn() },
      }),
    ).rejects.toThrow('503')
  })

  it('rejects local or development API origins for production builds', () => {
    expect(() =>
      validateApiBaseUrl({
        apiBaseUrl: 'http://localhost:8080',
        vercelEnv: 'production',
      }),
    ).toThrow('운영')
    expect(() =>
      validateApiBaseUrl({
        apiBaseUrl: 'https://dev-api.hashi.kr',
        vercelEnv: 'production',
      }),
    ).toThrow('운영')
    expect(
      validateApiBaseUrl({
        apiBaseUrl: 'https://api.hashi.kr',
        vercelEnv: 'production',
      }).origin,
    ).toBe('https://api.hashi.kr')
  })
})
