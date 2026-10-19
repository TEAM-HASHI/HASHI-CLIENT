import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocationAddressEditor } from '@/features/restaurantLocation/components/LocationAddressEditor'
import { restaurantApi } from '@/shared/api/restaurantApi'
import { restaurantLocationApi } from '@/features/restaurantLocation/api/restaurantLocationApi'
import { locationKeys } from '@/features/restaurantLocation/queries/locationQueries'

vi.mock('@/shared/api/restaurantApi', () => ({
  restaurantApi: { updateRestaurant: vi.fn() },
}))
vi.mock('@/features/restaurantLocation/api/restaurantLocationApi', () => ({
  restaurantLocationApi: { status: vi.fn() },
}))
const restaurant = {
  restaurantId: 7,
  address: '東京都 ビル1F',
  geocodingAddress: '東京都',
  addressRevision: 4,
}

describe('location address correction', () => {
  beforeEach(() => {
    vi.mocked(restaurantApi.updateRestaurant).mockReset()
    vi.mocked(restaurantLocationApi.status).mockResolvedValue({
      restaurantId: 7,
      addressRevision: 4,
    })
  })
  it('preserves the explicit geocoding address on display-address changes and allows explicit clearing after a failed save', async () => {
    vi.mocked(restaurantApi.updateRestaurant)
      .mockRejectedValueOnce(new Error('저장 실패'))
      .mockResolvedValueOnce({ restaurantId: 7 })
    const onSaved = vi.fn()
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { mutations: { retry: false } } })
        }
      >
        <LocationAddressEditor
          restaurant={restaurant}
          onSaved={onSaved}
          onDirtyChange={vi.fn()}
        />
      </QueryClientProvider>,
    )
    fireEvent.change(screen.getByRole('textbox', { name: '표시 주소' }), {
      target: { value: '東京都 ビル2F' },
    })
    const form = screen
      .getByRole('button', { name: '주소 저장 및 재확인' })
      .closest('form')!
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '주소 저장 및 재확인' }),
      ).toBeEnabled(),
    )
    fireEvent.submit(form)
    fireEvent.submit(form)
    await screen.findByText('저장 실패')
    expect(restaurantApi.updateRestaurant).toHaveBeenCalledTimes(1)
    expect(restaurantApi.updateRestaurant).toHaveBeenLastCalledWith(7, {
      address: '東京都 ビル2F',
      geocodingAddress: '東京都',
    })
    expect(screen.getByRole('textbox', { name: '표시 주소' })).toHaveValue(
      '東京都 ビル2F',
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: '위치 확인용 주소' }),
      { target: { value: '' } },
    )
    fireEvent.submit(form)
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
    expect(restaurantApi.updateRestaurant).toHaveBeenLastCalledWith(7, {
      address: '東京都 ビル2F',
      geocodingAddress: '',
    })
  })
  it('keeps unsaved address edits but prevents overwriting a newer restaurant revision', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <LocationAddressEditor
          restaurant={restaurant}
          onSaved={vi.fn()}
          onDirtyChange={vi.fn()}
        />
      </QueryClientProvider>,
    )
    const input = screen.getByRole('textbox', { name: '표시 주소' })
    fireEvent.change(input, { target: { value: '내 수정 주소' } })
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '주소 저장 및 재확인' }),
      ).toBeEnabled(),
    )
    await act(async () => {
      client.setQueryData(locationKeys.status(7), {
        restaurantId: 7,
        addressRevision: 5,
      })
    })
    await screen.findByText(/다른 작업으로 식당 정보가 변경되었습니다/)
    expect(input).toHaveValue('내 수정 주소')
    expect(
      screen.getByRole('button', { name: '주소 저장 및 재확인' }),
    ).toBeDisabled()
    fireEvent.submit(input.closest('form')!)
    expect(restaurantApi.updateRestaurant).not.toHaveBeenCalled()
  })
  it('unlocks location actions only when both edited address fields return to their original values', () => {
    const onDirtyChange = vi.fn()
    render(
      <QueryClientProvider client={new QueryClient()}>
        <LocationAddressEditor
          restaurant={restaurant}
          onSaved={vi.fn()}
          onDirtyChange={onDirtyChange}
        />
      </QueryClientProvider>,
    )
    const address = screen.getByRole('textbox', { name: '표시 주소' })
    const geocoding = screen.getByRole('textbox', { name: '위치 확인용 주소' })
    fireEvent.change(address, { target: { value: '다른 표시 주소' } })
    expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    fireEvent.change(geocoding, { target: { value: '' } })
    fireEvent.change(address, { target: { value: restaurant.address } })
    expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    fireEvent.change(geocoding, {
      target: { value: restaurant.geocodingAddress },
    })
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    expect(restaurantApi.updateRestaurant).not.toHaveBeenCalled()
  })
})
