import { describe, expect, it, vi } from 'vitest'

import { cancelReservation } from '@/pages/reservationDetail/api/cancelReservation'
import { requestSuccessResponse } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  requestSuccessResponse: vi.fn(),
}))

const mockedRequestSuccessResponse = vi.mocked(requestSuccessResponse)

describe('cancelReservation', () => {
  it('requests reservation cancellation by reservation id', async () => {
    const canceledReservation = {
      reservationId: 12,
      reservationStatus: 'CANCELED',
    }
    const cancelReservationResponse = {
      success: true,
      code: 'COMMON-200',
      message: '예약이 취소되었습니다',
      data: canceledReservation,
    } as const

    mockedRequestSuccessResponse.mockResolvedValue(cancelReservationResponse)

    await expect(cancelReservation(12)).resolves.toEqual({
      message: cancelReservationResponse.message,
      reservation: canceledReservation,
    })
    expect(mockedRequestSuccessResponse).toHaveBeenCalledWith(
      'api/v1/reservations/12/cancel',
      { method: 'post' },
    )
  })

  it('rejects when the success response has no canceled reservation data', async () => {
    mockedRequestSuccessResponse.mockResolvedValue({
      success: true,
      code: 'COMMON-200',
      message: '예약이 취소되었습니다',
      data: null,
    })

    await expect(cancelReservation(12)).rejects.toThrow(
      'Cancel reservation response data is empty',
    )
  })
})
