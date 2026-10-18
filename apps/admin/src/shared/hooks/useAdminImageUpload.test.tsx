import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadApi, type UploadedImage } from '@/shared/api/uploadApi'
import { useAdminImageUpload } from '@/shared/hooks/useAdminImageUpload'

vi.mock('@/shared/api/uploadApi', () => ({
  uploadApi: { uploadImage: vi.fn() },
}))

describe('useAdminImageUpload', () => {
  beforeEach(() => {
    vi.mocked(uploadApi.uploadImage).mockReset()
  })

  it('rejects unsupported and oversized files before calling the API', async () => {
    const onUploaded = vi.fn()
    const { result } = renderHook(() =>
      useAdminImageUpload({ usage: 'restaurant', onUploaded }),
    )

    await act(async () => {
      await result.current.addFiles([
        new File(['text'], 'note.txt', { type: 'text/plain' }),
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
          type: 'image/png',
        }),
      ])
    })

    expect(uploadApi.uploadImage).not.toHaveBeenCalled()
    expect(result.current.status.failedCount).toBe(2)
  })

  it('uploads a valid image and reports the result', async () => {
    const uploaded = {
      fileKey: 'restaurant/a.webp',
      fileUrl: 'https://cdn.example/a.webp',
      fileName: 'a.webp',
      contentType: 'image/webp',
    }
    vi.mocked(uploadApi.uploadImage).mockResolvedValue(uploaded)
    const onUploaded = vi.fn()
    const { result } = renderHook(() =>
      useAdminImageUpload({ usage: 'restaurant', onUploaded }),
    )

    await act(async () => {
      await result.current.addFiles([
        new File(['image'], 'a.webp', { type: 'image/webp' }),
      ])
    })

    await waitFor(() =>
      expect(onUploaded).toHaveBeenCalledWith(uploaded, expect.any(Number)),
    )
    expect(result.current.status).toEqual({ pendingCount: 0, failedCount: 0 })
  })
  it.each(['remove', 'unmount'] as const)(
    'ignores a late upload after %s',
    async (action) => {
      let resolveUpload!: (image: UploadedImage) => void
      vi.mocked(uploadApi.uploadImage).mockReturnValue(
        new Promise((resolve) => {
          resolveUpload = resolve
        }),
      )
      const onUploaded = vi.fn()
      const { result, unmount } = renderHook(() =>
        useAdminImageUpload({ usage: 'restaurant', onUploaded }),
      )
      let completion!: Promise<void>
      await act(async () => {
        completion = result.current.addFiles([
          new File(['a'], 'a.png', { type: 'image/png' }),
        ])
      })
      if (action === 'remove')
        act(() => result.current.remove(result.current.items[0].id))
      else unmount()
      await act(async () => {
        resolveUpload({
          fileKey: 'a.png',
          fileUrl: 'https://example.com/a.png',
          fileName: 'a.png',
          contentType: 'image/png',
        })
        await completion
      })
      expect(onUploaded).not.toHaveBeenCalled()
      if (action === 'remove') expect(result.current.items).toHaveLength(0)
    },
  )

  it('retries a failed upload and reports the successful result once', async () => {
    const uploaded = {
      fileKey: 'a.png',
      fileUrl: 'https://example.com/a.png',
      fileName: 'a.png',
      contentType: 'image/png',
    }
    vi.mocked(uploadApi.uploadImage)
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce(uploaded)
    const onUploaded = vi.fn()
    const { result } = renderHook(() =>
      useAdminImageUpload({ usage: 'restaurant', onUploaded }),
    )
    await act(async () => {
      await result.current.addFiles([
        new File(['a'], 'a.png', { type: 'image/png' }),
      ])
    })
    expect(result.current.status.failedCount).toBe(1)
    await act(async () => {
      await result.current.retry(result.current.items[0].id)
    })
    expect(onUploaded).toHaveBeenCalledExactlyOnceWith(
      uploaded,
      expect.any(Number),
    )
    expect(result.current.items).toHaveLength(0)
  })

  it('skips removed queued uploads and keeps the remaining uploads', async () => {
    const resolvers: Array<(image: UploadedImage) => void> = []
    vi.mocked(uploadApi.uploadImage).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const onUploaded = vi.fn()
    const { result } = renderHook(() =>
      useAdminImageUpload({ usage: 'restaurant', onUploaded }),
    )
    let completion!: Promise<void>
    await act(async () => {
      completion = result.current.addFiles(
        ['a', 'b', 'c', 'd'].map(
          (name) => new File([name], `${name}.png`, { type: 'image/png' }),
        ),
      )
    })
    expect(uploadApi.uploadImage).toHaveBeenCalledTimes(3)
    act(() => {
      result.current.remove(result.current.items[0].id)
      result.current.remove(result.current.items[3].id)
    })
    await act(async () => {
      resolvers.forEach((resolve, index) =>
        resolve({
          fileKey: `${index}.png`,
          fileUrl: `https://example.com/${index}.png`,
          fileName: `${index}.png`,
          contentType: 'image/png',
        }),
      )
      await completion
    })
    expect(uploadApi.uploadImage).toHaveBeenCalledTimes(3)
    expect(onUploaded).toHaveBeenCalledTimes(2)
    expect(onUploaded).not.toHaveBeenCalledWith(
      expect.objectContaining({ fileKey: '0.png' }),
      expect.any(Number),
    )
    expect(result.current.items).toHaveLength(0)
  })
})
