import { describe, expect, it, vi } from 'vitest'

import { getReservationDetail } from '@/pages/reservationDetail/api/getReservationDetail'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('getReservationDetail', () => {
  it('requests my reservation detail by reservation id', async () => {
    const reservationDetail = {
      reservationId: 12,
      restaurantName: '스시 하시',
      reservationStatus: 'CONTACTING',
    }

    mockedRequest.mockResolvedValue(reservationDetail)

    await expect(getReservationDetail(12)).resolves.toEqual(reservationDetail)
    expect(mockedRequest).toHaveBeenCalledWith('api/v1/reservations/12')
  })

  it('rejects when the success response has no reservation detail data', async () => {
    mockedRequest.mockResolvedValue(null)

    await expect(getReservationDetail(12)).rejects.toThrow(
      'Reservation detail response data is empty',
    )
  })
})
