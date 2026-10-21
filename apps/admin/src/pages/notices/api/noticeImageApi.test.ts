import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from '@/shared/api/request'
import { uploadNoticeImage } from '@/pages/notices/api/noticeImageApi'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
const mockedRequest = vi.mocked(request)
const fetchMock = vi.fn()
const file = new File(['image'], 'notice.png', { type: 'image/png' })
const upload = {
  uploads: [
    {
      assetId: 'asset',
      uploadUrl: 'https://storage.example/upload',
      uploadMethod: 'PUT',
      requiredHeaders: {
        'Content-Type': 'image/png',
        'x-amz-meta-test': 'required',
      },
    },
  ],
}

describe('notice asset upload', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
    fetchMock.mockReset().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('waits for READY after completing storage upload and preserves required headers', async () => {
    vi.useFakeTimers()
    mockedRequest
      .mockResolvedValueOnce(upload)
      .mockResolvedValueOnce({
        assets: [{ assetId: 'asset', status: 'PROCESSING' }],
      })
      .mockResolvedValueOnce({
        assets: [{ assetId: 'asset', status: 'READY' }],
      })
    const controller = new AbortController()
    const pending = uploadNoticeImage(file, controller.signal)
    await vi.advanceTimersByTimeAsync(2000)
    await expect(pending).resolves.toBe('asset')
    expect(mockedRequest).toHaveBeenNthCalledWith(1, '/api/v1/media/assets', {
      method: 'post',
      signal: controller.signal,
      json: {
        purpose: 'NOTICE',
        files: [{ contentType: 'image/png', fileSize: file.size }],
      },
    })
    expect(fetchMock).toHaveBeenCalledWith(upload.uploads[0].uploadUrl, {
      method: 'PUT',
      body: file,
      signal: controller.signal,
      credentials: 'omit',
      headers: upload.uploads[0].requiredHeaders,
    })
    expect(mockedRequest).toHaveBeenNthCalledWith(
      2,
      '/api/v1/media/assets/complete',
      {
        method: 'post',
        json: { assetIds: ['asset'] },
        signal: controller.signal,
      },
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(3, '/api/v1/media/assets', {
      searchParams: { assetIds: 'asset' },
      signal: controller.signal,
    })
  })

  it('does not complete or accept an asset after failed object storage upload', async () => {
    mockedRequest.mockResolvedValueOnce(upload)
    fetchMock.mockResolvedValue({ ok: false })
    await expect(
      uploadNoticeImage(file, new AbortController().signal),
    ).rejects.toThrow('업로드에 실패')
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  })

  it('stops processing polls when the attachment is removed or the page unmounts', async () => {
    vi.useFakeTimers()
    mockedRequest.mockResolvedValueOnce(upload).mockResolvedValueOnce({
      assets: [{ assetId: 'asset', status: 'PROCESSING' }],
    })
    const controller = new AbortController()
    const pending = uploadNoticeImage(file, controller.signal)
    const rejection = expect(pending).rejects.toMatchObject({
      name: 'AbortError',
    })
    await vi.advanceTimersByTimeAsync(0)
    controller.abort()
    await rejection
    await vi.advanceTimersByTimeAsync(60000)
    expect(mockedRequest).toHaveBeenCalledTimes(2)
  })
})
