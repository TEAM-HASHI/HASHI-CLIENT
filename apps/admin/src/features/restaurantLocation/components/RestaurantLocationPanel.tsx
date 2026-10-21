import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Dialog } from '@hashi/hds-ui'
import { restaurantLocationApi } from '@/features/restaurantLocation/api/restaurantLocationApi'
import type {
  PlaceCandidate,
  PlaceCandidates as CandidateResult,
} from '@/features/restaurantLocation/api/restaurantLocationApi'
import {
  locationKeys,
  locationStatusOptions,
} from '@/features/restaurantLocation/queries/locationQueries'
import {
  canSearchPlaces,
  formatLocationTime,
  locationErrorMessage,
  locationSourceLabel,
  locationStatusLabel,
} from '@/features/restaurantLocation/locationOptions'
import { PlaceCandidates } from '@/features/restaurantLocation/components/PlaceCandidates'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'
import { AdminApiRequestError } from '@/shared/api/request'

export const RestaurantLocationPanel = ({
  restaurantId,
  disabled = false,
}: {
  restaurantId: number
  disabled?: boolean
}) => {
  const client = useQueryClient()
  const [pollUntil, setPollUntil] = useState(() => Date.now() + 60_000)
  const status = useQuery({
    ...locationStatusOptions(restaurantId),
    refetchInterval: (query) =>
      query.state.data?.locationStatus === 'PENDING' && Date.now() < pollUntil
        ? 3000
        : false,
  })
  const [results, setResults] = useState<CandidateResult | null>(null)
  const [selected, setSelected] = useState<PlaceCandidate | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    if (!results?.candidates.length) return
    const expires = Math.min(
      ...results.candidates.map((item) => Date.parse(item.selectionExpiresAt)),
    )
    const timer = setTimeout(
      () => {
        setResults(null)
        setSelected(null)
        setError('장소 후보가 만료되었습니다. 다시 검색해주세요.')
      },
      Math.max(0, expires - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [results])

  const run = async (
    action: 'retry' | 'search' | 'select',
    candidate?: PlaceCandidate,
  ) => {
    if (controller.current || disabled) return
    const active = new AbortController()
    controller.current = active
    setBusy(true)
    setError('')
    try {
      if (action === 'select') {
        if (
          !candidate ||
          !results ||
          Date.parse(candidate.selectionExpiresAt) <= Date.now()
        ) {
          setResults(null)
          throw new Error('장소 후보가 만료되었습니다. 다시 검색해주세요.')
        }
        if (
          results.addressRevision !== status.data?.addressRevision ||
          !canSearchPlaces(status.data?.locationStatus)
        )
          throw new Error(
            '현재 위치 상태가 변경되었습니다. 상태를 새로고침한 뒤 다시 검색해주세요.',
          )
      }
      const current =
        action === 'select'
          ? status.data
          : (await status.refetch({ throwOnError: true })).data
      active.signal.throwIfAborted()
      if (
        current?.restaurantId !== restaurantId ||
        !Number.isSafeInteger(current.addressRevision)
      )
        throw new Error('현재 식당의 위치 상태를 확인할 수 없습니다.')
      if (action === 'search') {
        setResults(null)
        if (!canSearchPlaces(current.locationStatus))
          throw new Error('현재 상태에서는 장소 후보를 검색할 수 없습니다.')
        const response = await restaurantLocationApi.candidates(
          restaurantId,
          current.addressRevision!,
          active.signal,
        )
        if (!active.signal.aborted) setResults(response)
      } else {
        if (action === 'retry' && !current.canRetry)
          throw new Error('현재 상태에서는 재요청할 수 없습니다.')
        const response =
          action === 'retry'
            ? await restaurantLocationApi.retry(
                restaurantId,
                current.addressRevision!,
                active.signal,
              )
            : await restaurantLocationApi.select(
                restaurantId,
                results!.addressRevision,
                candidate!.selectionToken,
                active.signal,
              )
        if (active.signal.aborted) return
        if (response.restaurantId !== restaurantId)
          throw new Error('위치 처리 응답의 식당을 확인할 수 없습니다.')
        await client.cancelQueries({
          queryKey: locationKeys.status(restaurantId),
          exact: true,
        })
        if (active.signal.aborted) return
        client.setQueryData(locationKeys.status(restaurantId), response)
        setPollUntil(Date.now() + 60_000)
        setResults(null)
        void client.invalidateQueries({ queryKey: locationKeys.lists })
        void client.invalidateQueries({ queryKey: restaurantQueryKeys.lists() })
      }
    } catch (cause) {
      if (!active.signal.aborted) {
        setError(locationErrorMessage(cause))
        if (
          cause instanceof AdminApiRequestError &&
          [400, 409].includes(cause.status)
        ) {
          setResults(null)
          void status.refetch()
        }
      }
    } finally {
      if (controller.current === active) controller.current = null
      if (!active.signal.aborted) {
        setBusy(false)
        setSelected(null)
      }
    }
  }
  const location = status.data
  const blocked = disabled || busy || status.isFetching || status.isError
  const candidatesCurrent =
    results &&
    results.addressRevision === location?.addressRevision &&
    canSearchPlaces(location?.locationStatus)
  return (
    <section className="space-y-4" aria-label="지도 위치 확인">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-cool-gray-900 text-sm font-bold">지도 위치 확인</h3>
        <Button
          size="sm"
          variant="neutral"
          disabled={busy || status.isFetching}
          onClick={() => {
            setPollUntil(Date.now() + 60_000)
            void status.refetch()
          }}
        >
          상태 새로고침
        </Button>
      </div>
      {status.isPending && (
        <p role="status" className="text-cool-gray-500 text-sm">
          위치 상태를 불러오는 중입니다.
        </p>
      )}
      {status.isError && (
        <p role="alert" className="text-error text-sm">
          {locationErrorMessage(status.error)}
        </p>
      )}
      {location && (
        <>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              ['상태', locationStatusLabel(location.locationStatus)],
              ['정보 변경 번호', location.addressRevision],
              ['출처', locationSourceLabel(location.source)],
              ['검증 방식', location.verificationMode ?? '-'],
              ['유효 기한', formatLocationTime(location.validUntil)],
              ['시도 횟수', location.attempt ?? 0],
              ['다음 재시도', formatLocationTime(location.nextAttemptAt)],
              ['최근 사유', location.failureCode ?? '-'],
              ['확인 방식', location.confirmationMethod ?? '-'],
              [
                '확인 관리자',
                location.confirmedByAdminLoginId ??
                  (location.confirmedByAdminId != null
                    ? `ID ${location.confirmedByAdminId}`
                    : '-'),
              ],
              ['선택 접수 시각', formatLocationTime(location.confirmedAt)],
              ['확인 당시 변경 번호', location.confirmedRevision ?? '-'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-cool-gray-500 text-xs">{label}</dt>
                <dd className="text-cool-gray-900 mt-1 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          {location.locationStatus === 'PENDING' && (
            <p role="status" className="text-cool-gray-500 text-sm">
              위치 확인을 처리 중입니다. 접수 성공은 위치 확정이 아닙니다. 잠시
              후 상태를 확인해주세요.
            </p>
          )}
          {disabled && (
            <p className="text-cool-gray-500 text-sm">
              변경한 식당명·주소를 먼저 저장한 뒤 위치를 확인해주세요.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {location.canRetry && (
              <Button
                size="sm"
                variant="neutral"
                disabled={blocked}
                onClick={() => void run('retry')}
              >
                위치 재요청
              </Button>
            )}
            {canSearchPlaces(location.locationStatus) && (
              <Button
                size="sm"
                variant="neutral"
                disabled={blocked}
                onClick={() => void run('search')}
              >
                Google Places 후보 검색
              </Button>
            )}
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      {busy && (
        <p role="status" className="text-cool-gray-500 text-sm">
          요청을 처리 중입니다.
        </p>
      )}
      {candidatesCurrent && (
        <PlaceCandidates
          candidates={results.candidates}
          disabled={blocked}
          onSelect={(candidate) => {
            if (Date.parse(candidate.selectionExpiresAt) <= Date.now()) {
              setResults(null)
              setError('장소 후보가 만료되었습니다. 다시 검색해주세요.')
              return
            }
            setSelected(candidate)
          }}
        />
      )}
      <Dialog.Root
        type="alertdialog"
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setSelected(null)
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>이 장소로 위치를 교체할까요?</Dialog.Title>
            <Dialog.Description>
              {selected?.displayName} — {selected?.address}. 기존 승인 위치는
              즉시 제거되며, 새 위치는 상세 검증 완료 후 표시됩니다.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              size="sm"
              variant="neutral"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              취소
            </Button>
            <Button
              size="sm"
              loading={busy}
              disabled={blocked || !candidatesCurrent}
              onClick={() => void run('select', selected!)}
            >
              위치 교체 요청
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </section>
  )
}
