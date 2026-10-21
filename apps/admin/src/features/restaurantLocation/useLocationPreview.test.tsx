import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useLocationPreview } from '@/features/restaurantLocation/useLocationPreview'
import { restaurantLocationApi } from '@/features/restaurantLocation/api/restaurantLocationApi'

vi.mock('@/features/restaurantLocation/api/restaurantLocationApi', () => ({
  restaurantLocationApi: { preview: vi.fn() },
}))
afterEach(() => vi.restoreAllMocks())
const input = { name: '식당', localName: '店舗', address: '東京都 1F' }
const candidate = {
  displayName: '매장',
  address: '東京都',
  latitude: 35.68,
  longitude: 139.76,
  selectionToken: 'signed',
  selectionExpiresAt: '2099-01-01T00:00:00Z',
}

describe('location preview lifecycle', () => {
  it('searches only explicitly, blocks duplicate requests and ignores late results after input changes', async () => {
    let finish!: (data: { candidates: (typeof candidate)[] }) => void
    vi.mocked(restaurantLocationApi.preview)
      .mockReset()
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            finish = resolve
          }),
      )
    const { result } = renderHook(() => useLocationPreview())
    expect(restaurantLocationApi.preview).not.toHaveBeenCalled()
    act(() => {
      void result.current.search(input)
      void result.current.search(input)
    })
    expect(restaurantLocationApi.preview).toHaveBeenCalledTimes(1)
    const signal = vi.mocked(restaurantLocationApi.preview).mock.calls[0][1]!
    act(() => result.current.clear())
    expect(signal.aborted).toBe(true)
    await act(async () => finish({ candidates: [candidate] }))
    expect(result.current.candidates).toBeNull()
    expect(result.current.getToken()).toBeUndefined()
  })

  it('keeps a selected token through unrelated form steps but prevents expired registration until explicitly cleared', async () => {
    vi.mocked(restaurantLocationApi.preview).mockResolvedValue({
      candidates: [candidate],
    })
    const { result, rerender } = renderHook(() => useLocationPreview())
    await act(async () => result.current.search(input))
    act(() => result.current.select(candidate))
    rerender()
    expect(result.current.getToken()).toBe('signed')
    vi.spyOn(Date, 'now').mockReturnValue(
      Date.parse(candidate.selectionExpiresAt) + 1,
    )
    expect(() => result.current.getToken()).toThrow(/만료/)
    act(() => result.current.clear())
    expect(result.current.getToken()).toBeUndefined()
  })

  it('does not retry provider errors and aborts a pending preview when leaving', async () => {
    vi.mocked(restaurantLocationApi.preview)
      .mockReset()
      .mockRejectedValueOnce(new Error('호출 한도 소진'))
    const { result, unmount } = renderHook(() => useLocationPreview())
    await act(async () => result.current.search(input))
    await waitFor(() => expect(result.current.error).toBe('호출 한도 소진'))
    expect(restaurantLocationApi.preview).toHaveBeenCalledTimes(1)
    expect(result.current.getToken()).toBeUndefined()
    vi.mocked(restaurantLocationApi.preview).mockImplementation(
      () => new Promise(() => {}),
    )
    act(() => {
      void result.current.search(input)
    })
    const signal = vi.mocked(restaurantLocationApi.preview).mock.calls[1][1]!
    unmount()
    expect(signal.aborted).toBe(true)
  })
})
