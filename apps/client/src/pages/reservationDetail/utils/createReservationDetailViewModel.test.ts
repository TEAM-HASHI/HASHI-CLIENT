import { describe, expect, it } from 'vitest'

import { createReservationDetailViewModel } from '@/pages/reservationDetail/utils/createReservationDetailViewModel'

describe('createReservationDetailViewModel', () => {
  it('maps missing reservation details to page fallbacks', () => {
    const viewModel = createReservationDetailViewModel({
      reservationStatus: 'REQUESTED',
    })

    expect(viewModel.requestedDate).toBe('-')
    expect(viewModel.reservationProgressSteps[0]?.requestedAt).toBeUndefined()
    expect(viewModel.reservationReceiptInfoItems).toEqual(
      expect.arrayContaining([
        { label: '인원', value: '-' },
        { label: '식당 방문 일정', value: '-' },
      ]),
    )
  })
})
