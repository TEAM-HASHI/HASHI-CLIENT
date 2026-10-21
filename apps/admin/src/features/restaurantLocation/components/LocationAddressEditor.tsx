import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@hashi/hds-ui'
import type { LocationReview } from '@/features/restaurantLocation/api/restaurantLocationApi'
import { locationErrorMessage } from '@/features/restaurantLocation/locationOptions'
import { useUpdateRestaurantMutation } from '@/pages/restaurants/mutations/useRestaurantMutations'
import type { UpdateRestaurantBody } from '@/shared/api/restaurantApi'
import { locationStatusOptions } from '@/features/restaurantLocation/queries/locationQueries'

export const LocationAddressEditor = ({
  restaurant,
  onSaved,
  onDirtyChange,
}: {
  restaurant: LocationReview
  onSaved: () => void
  onDirtyChange: (dirty: boolean) => void
}) => {
  const [original] = useState(restaurant)
  const [address, setAddress] = useState(restaurant.address ?? '')
  const [geocodingAddress, setGeocodingAddress] = useState(
    restaurant.geocodingAddress ?? '',
  )
  const [error, setError] = useState('')
  const saving = useRef(false)
  const save = useUpdateRestaurantMutation()
  const status = useQuery(locationStatusOptions(restaurant.restaurantId!))
  const dirty =
    address !== (original.address ?? '') ||
    geocodingAddress !== (original.geocodingAddress ?? '')
  const changed =
    restaurant.addressRevision !== original.addressRevision ||
    (status.data != null &&
      status.data.addressRevision !== original.addressRevision)
  return (
    <form
      className="border-cool-gray-100 space-y-3 border-t pt-5"
      aria-label="위치 주소 보정"
      onSubmit={(event) => {
        event.preventDefault()
        if (
          !restaurant.restaurantId ||
          saving.current ||
          !dirty ||
          changed ||
          status.isPending ||
          status.isError ||
          status.isFetching
        )
          return
        if (
          !address.trim() ||
          address.length > 255 ||
          geocodingAddress.length > 255
        ) {
          setError('표시 주소는 필수이며, 주소는 각각 255자 이하여야 합니다.')
          return
        }
        const body: UpdateRestaurantBody = {}
        if (address !== original.address) body.address = address
        if (
          geocodingAddress !== (original.geocodingAddress ?? '') ||
          (body.address != null && original.geocodingAddress)
        )
          body.geocodingAddress = geocodingAddress
        saving.current = true
        setError('')
        save.mutate(
          { restaurantId: restaurant.restaurantId, input: body },
          {
            onSuccess: onSaved,
            onSettled: () => {
              saving.current = false
            },
          },
        )
      }}
    >
      <h3 className="text-cool-gray-900 text-sm font-bold">주소 보정</h3>
      <fieldset disabled={save.isPending} className="min-w-0 space-y-3">
        <label className="flex flex-col gap-1">
          <span className="text-cool-gray-500 text-xs font-semibold">
            표시 주소
          </span>
          <input
            aria-label="표시 주소"
            value={address}
            className="border-cool-gray-100 focus:border-primary-200 h-10 w-full rounded-md border px-3 text-sm outline-none"
            onChange={(event) => {
              setAddress(event.target.value)
              onDirtyChange(
                event.target.value !== (original.address ?? '') ||
                  geocodingAddress !== (original.geocodingAddress ?? ''),
              )
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-cool-gray-500 text-xs font-semibold">
            위치 확인용 주소
          </span>
          <input
            aria-label="위치 확인용 주소"
            value={geocodingAddress}
            className="border-cool-gray-100 focus:border-primary-200 h-10 w-full rounded-md border px-3 text-sm outline-none"
            onChange={(event) => {
              setGeocodingAddress(event.target.value)
              onDirtyChange(
                address !== (original.address ?? '') ||
                  event.target.value !== (original.geocodingAddress ?? ''),
              )
            }}
          />
        </label>
      </fieldset>
      <p className="text-cool-gray-500 text-xs leading-5">
        위치 확인용 주소를 비우면 별도 지정 주소를 삭제하고 표시 주소를
        사용합니다. 주소가 변경되면 기존 위치와 확인 기록을 초기화하고 다시
        확인합니다.
      </p>
      {changed && (
        <p role="alert" className="text-error text-sm">
          다른 작업으로 식당 정보가 변경되었습니다. 입력을 확인한 뒤 화면을 다시
          열어주세요.
        </p>
      )}
      {(error || save.error) && (
        <p role="alert" className="text-error text-sm">
          {error || locationErrorMessage(save.error)}
        </p>
      )}
      <Button
        type="submit"
        size="sm"
        variant="neutral"
        loading={save.isPending}
        disabled={
          !dirty ||
          changed ||
          save.isPending ||
          status.isPending ||
          status.isError ||
          status.isFetching
        }
      >
        주소 저장 및 재확인
      </Button>
    </form>
  )
}
