import { afterEach, describe, expect, it, vi } from 'vitest'

import { getNoticeDetail } from '@/features/notice/api/getNoticeDetail'
import { getNotices } from '@/features/notice/api/getNotices'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

const mockedRequest = vi.mocked(request)

describe('notice api', () => {
  afterEach(() => {
    mockedRequest.mockReset()
  })

  it('requests the notice list with cursor and size', async () => {
    const data = { notices: [], hasNext: false, nextCursor: null }
    mockedRequest.mockResolvedValue(data)

    await expect(getNotices({ cursor: 7, size: 20 })).resolves.toEqual(data)
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/notices', {
      searchParams: { cursor: 7, size: 20 },
    })
  })

  it('omits the cursor on the first page and falls back to an empty page', async () => {
    mockedRequest.mockResolvedValue(null)

    await expect(getNotices({ cursor: null, size: 20 })).resolves.toEqual({
      notices: [],
      hasNext: false,
      nextCursor: null,
    })
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/notices', {
      searchParams: { size: 20 },
    })
  })

  it('requests a notice detail and rejects an empty success response', async () => {
    mockedRequest.mockResolvedValueOnce({ noticeId: 3 })

    await expect(getNoticeDetail(3)).resolves.toEqual({ noticeId: 3 })
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/notices/3')

    mockedRequest.mockResolvedValueOnce(null)

    await expect(getNoticeDetail(3)).rejects.toThrow(
      'Notice detail response data is empty',
    )
  })
})
