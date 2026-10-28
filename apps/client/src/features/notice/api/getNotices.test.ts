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

  it('passes the opaque string cursor without a client page size', async () => {
    const data = { notices: [], hasNext: false, nextCursor: null }
    mockedRequest.mockResolvedValue(data)

    await expect(
      getNotices({ cursor: 'MjAyNi0xMC0wOFQwMDowMHw3' }),
    ).resolves.toEqual(data)
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/notices', {
      searchParams: { cursor: 'MjAyNi0xMC0wOFQwMDowMHw3' },
    })
    expect(mockedRequest.mock.calls[0]?.[1]?.searchParams).not.toHaveProperty(
      'size',
    )
  })

  it('omits the cursor on the first page', async () => {
    mockedRequest.mockResolvedValue({
      notices: [],
      hasNext: false,
      nextCursor: null,
    })

    await expect(getNotices({ cursor: null })).resolves.toEqual({
      notices: [],
      hasNext: false,
      nextCursor: null,
    })
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/notices', {
      searchParams: {},
    })
  })

  it('does not turn a missing list response into a successful empty page', async () => {
    mockedRequest.mockResolvedValue(null)
    await expect(getNotices({ cursor: null })).rejects.toThrow(
      'Notice list response data is empty',
    )
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
