import { afterEach, expect, it, vi } from 'vitest'

import { uploadProfileAsset } from '@/pages/profileEdit/api/uploadProfileAsset'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
afterEach(() => {
  vi.resetAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('uploads with the required headers and waits for READY before returning the asset', async () => {
  vi.useFakeTimers()
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
  vi.stubGlobal('fetch', fetch)
  vi.mocked(request)
    .mockResolvedValueOnce({
      uploads: [
        {
          assetId: 'asset-1',
          uploadUrl: 'https://upload.example.com',
          uploadMethod: 'PUT',
          requiredHeaders: {
            'Content-Type': 'image/png',
            'x-amz-meta-test': 'required',
          },
          expectedContentLength: 3,
        },
      ],
    })
    .mockResolvedValueOnce({
      assets: [{ assetId: 'asset-1', status: 'PROCESSING' }],
    })
    .mockResolvedValueOnce({
      assets: [{ assetId: 'asset-1', status: 'READY' }],
    })
  const file = new File(['png'], 'profile.png', { type: 'image/png' })
  const promise = uploadProfileAsset(file, new AbortController().signal)
  await vi.runAllTimersAsync()
  await expect(promise).resolves.toBe('asset-1')
  expect(fetch).toHaveBeenCalledWith(
    'https://upload.example.com',
    expect.objectContaining({
      headers: { 'Content-Type': 'image/png', 'x-amz-meta-test': 'required' },
      body: file,
    }),
  )
  expect(request).toHaveBeenLastCalledWith(
    'api/v1/media/assets',
    expect.objectContaining({ searchParams: { assetIds: 'asset-1' } }),
  )
})

it('does not treat a failed conversion as an uploaded profile image', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
  )
  vi.mocked(request)
    .mockResolvedValueOnce({
      uploads: [
        {
          assetId: 'asset-1',
          uploadUrl: 'https://upload.example.com',
          uploadMethod: 'PUT',
          requiredHeaders: {},
          expectedContentLength: 3,
        },
      ],
    })
    .mockResolvedValueOnce({
      assets: [{ assetId: 'asset-1', status: 'FAILED' }],
    })
  await expect(
    uploadProfileAsset(
      new File(['png'], 'profile.png', { type: 'image/png' }),
      new AbortController().signal,
    ),
  ).rejects.toThrow()
  expect(request).toHaveBeenCalledTimes(2)
})

it('stops polling when the editing session is aborted', async () => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
  )
  const controller = new AbortController()
  vi.mocked(request)
    .mockResolvedValueOnce({
      uploads: [
        {
          assetId: 'asset-1',
          uploadUrl: 'https://upload.example.com',
          uploadMethod: 'PUT',
          requiredHeaders: {},
          expectedContentLength: 3,
        },
      ],
    })
    .mockImplementationOnce(async () => {
      queueMicrotask(() => controller.abort())
      return { assets: [{ assetId: 'asset-1', status: 'PROCESSING' }] }
    })
  await expect(
    uploadProfileAsset(
      new File(['png'], 'profile.png', { type: 'image/png' }),
      controller.signal,
    ),
  ).rejects.toThrow()
  await vi.runAllTimersAsync()
  expect(request).toHaveBeenCalledTimes(2)
})

it('accepts READY on the last allowed status check', async () => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
  )
  let polls = 0
  vi.mocked(request).mockImplementation(async (path, options) => {
    if (path === 'api/v1/media/assets' && options?.method === 'post')
      return {
        uploads: [
          {
            assetId: 'asset-1',
            uploadUrl: 'https://upload.example.com',
            uploadMethod: 'PUT',
            requiredHeaders: {},
            expectedContentLength: 3,
          },
        ],
      }
    if (options?.method === 'post')
      return { assets: [{ assetId: 'asset-1', status: 'PROCESSING' }] }
    polls += 1
    return {
      assets: [
        { assetId: 'asset-1', status: polls === 30 ? 'READY' : 'PROCESSING' },
      ],
    }
  })
  const promise = uploadProfileAsset(
    new File(['png'], 'profile.png', { type: 'image/png' }),
    new AbortController().signal,
  )
  const outcome = promise.then(
    (value) => ({ value }),
    () => ({ value: undefined }),
  )
  await vi.runAllTimersAsync()
  expect(await outcome).toEqual({ value: 'asset-1' })
})
