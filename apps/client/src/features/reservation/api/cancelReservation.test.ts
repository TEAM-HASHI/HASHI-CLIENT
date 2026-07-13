import { describe, expect, it, vi } from 'vitest'

import { cancelReservation } from '@/features/reservation/api/cancelReservation'
import { requestSuccessResponse } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  requestSuccessResponse: vi.fn(),
}))

const mockedRequestSuccessResponse = vi.mocked(requestSuccessResponse)

describe('cancelReservation', () => {
  it('requests reservation cancellation by reservation id and returns the server message', async () => {
    const cancelReservationResponse = {
      success: true as const,
      code: 'COMMON-200',
      message: '예약 취소 요청이 완료되었습니다',
      data: {
        reservationId: 12,
        reservationStatus: 'CANCELED',
      },
    }

    mockedRequestSuccessResponse.mockResolvedValue(cancelReservationResponse)

    await expect(cancelReservation(12)).resolves.toEqual({
      message: '예약 취소 요청이 완료되었습니다',
      reservation: {
        reservationId: 12,
        reservationStatus: 'CANCELED',
      },
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
      message: '예약 취소 요청이 완료되었습니다',
      data: null,
    })

    await expect(cancelReservation(12)).rejects.toThrow(
      'Cancel reservation response data is empty',
    )
  })
})
