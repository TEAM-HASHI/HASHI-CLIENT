import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useReservationPoint } from '@/pages/reservationRequest/hooks/useReservationPoint'

describe('useReservationPoint', () => {
  it('clamps used points when the available balance decreases', async () => {
    const { result, rerender } = renderHook(
      ({ availablePoint }) =>
        useReservationPoint({ availablePoint, paymentAmount: 5_000 }),
      { initialProps: { availablePoint: 7_000 } },
    )

    act(() => {
      result.current.onUseAllPointsClick()
    })
    expect(result.current.usedPoint).toBe(5_000)

    rerender({ availablePoint: 2_000 })

    await waitFor(() => {
      expect(result.current.usedPoint).toBe(2_000)
    })
    expect(result.current.remainingPoint).toBe(0)
    expect(result.current.finalPaymentAmount).toBe(3_000)
  })
})
