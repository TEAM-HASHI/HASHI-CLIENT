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

  it('falls back to 0 when point balance is empty', async () => {
    mockRequest.mockResolvedValue(null)

    await expect(getMyPointBalance()).resolves.toEqual({
      availablePoint: 0,
    })
  })
})
