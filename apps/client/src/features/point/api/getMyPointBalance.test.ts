import { beforeEach, describe, expect, it, vi } from 'vitest'

import { request } from '@/shared/api/request'

import { getMyPointBalance } from '@/features/point/api/getMyPointBalance'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(request)

describe('getMyPointBalance', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('maps current user point balance to availablePoint', async () => {
    mockRequest.mockResolvedValue({ balance: 7000 })

    await expect(getMyPointBalance()).resolves.toEqual({
      availablePoint: 7000,
    })
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/points/me')
  })

  it('accepts 0 when the user has no point history', async () => {
    mockRequest.mockResolvedValue({ balance: 0 })

    await expect(getMyPointBalance()).resolves.toEqual({
      availablePoint: 0,
    })
  })

  it('throws when response data is missing', async () => {
    mockRequest.mockResolvedValue(null)

    await expect(getMyPointBalance()).rejects.toThrow(
      '포인트 잔액 응답에 유효한 balance가 없습니다.',
    )
  })

  it('throws when balance is missing', async () => {
    mockRequest.mockResolvedValue({})

    await expect(getMyPointBalance()).rejects.toThrow(
      '포인트 잔액 응답에 유효한 balance가 없습니다.',
    )
  })
})
