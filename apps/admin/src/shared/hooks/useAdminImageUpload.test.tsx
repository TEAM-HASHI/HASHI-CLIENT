import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadApi } from '@/shared/api/uploadApi'
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

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(uploaded))
    expect(result.current.status).toEqual({ pendingCount: 0, failedCount: 0 })
  })
})
