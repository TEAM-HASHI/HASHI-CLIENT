import { useEffect, useRef, useState } from 'react'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Button, Dialog } from '@hashi/hds-ui'
import { mapRegionApi } from '@/features/mapRegion/api/mapRegionApi'
import {
  regionAssignmentOptions,
  regionChoiceOptions,
  regionKeys,
} from '@/features/mapRegion/queries/mapRegionQueries'

export const RestaurantRegionAssignment = ({
  restaurantId,
  disabled = false,
}: {
  restaurantId: number
  disabled?: boolean
}) => {
  const regions = useInfiniteQuery(regionChoiceOptions())
  const assignment = useQuery(regionAssignmentOptions(restaurantId))
  const queryClient = useQueryClient()
  const items = regions.data?.pages.flatMap((page) => page.content) ?? []
  const currentRegionId = assignment.data?.mapRegionId
  const currentRegion = items.find(
    (item) => item.mapRegionId === currentRegionId,
  )
  const currentValue = currentRegionId == null ? '' : String(currentRegionId)
  const [draft, setDraft] = useState<string>()
  const selected = draft ?? currentValue
  const [target, setTarget] = useState<number | null | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  const { fetchNextPage, hasNextPage, isFetching, isError } = regions
  useEffect(() => {
    if (
      currentRegionId != null &&
      !currentRegion &&
      hasNextPage &&
      !isFetching &&
      !isError
    )
      void fetchNextPage()
  }, [
    currentRegionId,
    currentRegion,
    hasNextPage,
    isFetching,
    isError,
    fetchNextPage,
  ])

  const assignmentLabel = assignment.isError
    ? '조회 실패'
    : assignment.isPending
      ? '조회 중'
      : currentRegionId === null
        ? '미배정'
        : currentRegion
          ? `${currentRegion.name}${currentRegion.active ? '' : ' (비공개)'}`
          : `지역 ID ${currentRegionId}`

  const save = async () => {
    if (
      target === undefined ||
      controller.current ||
      disabled ||
      !assignment.isSuccess
    )
      return
    const active = new AbortController()
    controller.current = active
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await mapRegionApi.assign(
        restaurantId,
        target,
        active.signal,
      )
      const queryKey = regionKeys.assignment(restaurantId)
      if (!active.signal.aborted) await queryClient.cancelQueries({ queryKey })
      if (!active.signal.aborted) {
        queryClient.setQueryData(queryKey, result)
        setDraft(undefined)
        setMessage(
          result.mapRegionId === null
            ? '지역 소속을 해제했습니다.'
            : `지역 배정을 저장했습니다. 지역 ID ${result.mapRegionId}`,
        )
        setTarget(undefined)
      }
    } catch (cause) {
      if (!active.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : '지역 배정을 저장하지 못했습니다.',
        )
    } finally {
      if (controller.current === active) controller.current = null
      if (!active.signal.aborted) setBusy(false)
    }
  }
  return (
    <section
      className="border-cool-gray-100 mt-6 space-y-3 border-t pt-5"
      aria-label="식당 관광 지역 배정"
    >
      <h3 className="text-cool-gray-900 text-sm font-bold">관광 지역 배정</h3>
      <p role="status" className="text-cool-gray-900 text-sm">
        현재 배정: {assignmentLabel}
      </p>
      {assignment.isError && (
        <div role="alert" className="text-error text-sm">
          <p>{assignment.error.message}</p>
          <Button
            size="sm"
            variant="neutral"
            onClick={() => void assignment.refetch()}
          >
            현재 배정 다시 조회
          </Button>
        </div>
      )}
      <fieldset
        disabled={disabled || busy || !assignment.isSuccess}
        className="min-w-0 space-y-3"
      >
        <label className="text-cool-gray-500 flex flex-col gap-1 text-xs font-semibold">
          배정할 관광 지역
          <select
            aria-label="배정할 관광 지역"
            value={selected}
            disabled={regions.isPending || regions.isError}
            className="border-cool-gray-100 text-cool-gray-900 h-10 rounded-md border bg-white px-3 text-sm"
            onChange={(e) => {
              setDraft(e.target.value)
              setMessage('')
            }}
          >
            <option value="">지역 선택</option>
            {currentValue && !currentRegion && (
              <option value={currentValue}>지역 ID {currentRegionId}</option>
            )}
            {items.map((region) => (
              <option key={region.mapRegionId} value={region.mapRegionId}>
                {region.name} ({region.code}){region.active ? '' : ' — 비공개'}
              </option>
            ))}
          </select>
        </label>
        {regions.hasNextPage && (
          <Button
            size="sm"
            variant="neutral"
            disabled={regions.isFetchingNextPage}
            onClick={() => void regions.fetchNextPage()}
          >
            지역 더 불러오기
          </Button>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!selected || selected === currentValue || regions.isError}
            onClick={() => {
              setError('')
              setTarget(Number(selected))
            }}
          >
            지역 배정
          </Button>
          <Button
            size="sm"
            variant="neutral"
            disabled={currentRegionId === null}
            onClick={() => {
              setError('')
              setTarget(null)
            }}
          >
            소속 해제
          </Button>
        </div>
      </fieldset>
      <p className="text-cool-gray-500 text-xs leading-5">
        배정·해제는 식당 정보 저장과 별도로 적용되며 주소와 좌표는 변경하지
        않습니다. 비공개 지역에도 배정할 수 있습니다.
      </p>
      {regions.isError && (
        <div role="alert" className="text-error text-sm">
          <p>{regions.error.message}</p>
          <Button
            size="sm"
            variant="neutral"
            onClick={() =>
              void (regions.isFetchNextPageError
                ? fetchNextPage()
                : regions.refetch())
            }
          >
            지역 목록 다시 조회
          </Button>
        </div>
      )}
      {message && (
        <p role="status" className="text-cool-gray-900 text-sm">
          {message}
        </p>
      )}
      <Dialog.Root
        type="alertdialog"
        open={target !== undefined}
        onOpenChange={(open) => {
          if (!open && !busy) setTarget(undefined)
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {target === null
                ? '지역 소속을 해제할까요?'
                : '관광 지역을 배정할까요?'}
            </Dialog.Title>
            <Dialog.Description>
              식당 #{restaurantId}
              {target != null
                ? ` → ${items.find((item) => item.mapRegionId === target)?.name ?? target}`
                : ''}
              . 주소와 좌표는 유지됩니다.
            </Dialog.Description>
          </Dialog.Header>
          {error && (
            <p role="alert" className="text-error text-sm">
              {error}
            </p>
          )}
          <Dialog.Footer>
            <Button
              size="sm"
              variant="neutral"
              disabled={busy}
              onClick={() => setTarget(undefined)}
            >
              취소
            </Button>
            <Button
              size="sm"
              loading={busy}
              disabled={busy || disabled || !assignment.isSuccess}
              onClick={() => void save()}
            >
              {target === null ? '해제' : '배정'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </section>
  )
}
