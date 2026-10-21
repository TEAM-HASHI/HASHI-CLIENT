import { useRef, useState } from 'react'
import { Button } from '@hashi/hds-ui'
import type { MapRegion } from '@/features/mapRegion/api/mapRegionApi'
import { useSaveRegionMutation } from '@/features/mapRegion/queries/mapRegionQueries'
import {
  createRegionForm,
  toRegionBody,
} from '@/pages/mapRegions/mapRegionForm'
import { Drawer } from '@/shared/components/Drawer'

const coordinateFields = [
  ['latitude', '대표 위도'],
  ['longitude', '대표 경도'],
  ['south', '남쪽 위도'],
  ['north', '북쪽 위도'],
  ['west', '서쪽 경도'],
  ['east', '동쪽 경도'],
] as const

export const MapRegionEditor = ({
  region,
  onClose,
}: {
  region: MapRegion | null
  onClose: () => void
}) => {
  const [form, setForm] = useState(() => createRegionForm(region ?? undefined))
  const [error, setError] = useState('')
  const saving = useRef(false)
  const mutation = useSaveRegionMutation()
  const close = () => {
    if (!saving.current) onClose()
  }
  return (
    <Drawer
      open
      title={region ? '관광 지역 수정' : '관광 지역 등록'}
      onClose={close}
      footer={
        <>
          <Button
            variant="neutral"
            onClick={close}
            disabled={mutation.isPending}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="map-region-editor"
            loading={mutation.isPending}
            disabled={mutation.isPending}
          >
            저장
          </Button>
        </>
      }
    >
      <form
        id="map-region-editor"
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault()
          if (saving.current) return
          setError('')
          try {
            const body = toRegionBody(form)
            saving.current = true
            await mutation.mutateAsync({ code: form.code.trim(), body })
            onClose()
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : '지역을 저장하지 못했습니다.',
            )
          } finally {
            saving.current = false
          }
        }}
      >
        <fieldset disabled={mutation.isPending} className="min-w-0 space-y-4">
          {!region && (
            <p className="text-cool-gray-500 text-xs leading-5">
              이미 존재하는 코드를 사용하면 해당 지역의 전체 설정이 교체됩니다.
              새 지역은 사용하지 않은 코드로 등록해주세요.
            </p>
          )}
          <label className="text-cool-gray-500 flex flex-col gap-1 text-xs font-semibold">
            지역 코드
            <input
              aria-label="지역 코드"
              value={form.code}
              disabled={region !== null}
              maxLength={40}
              className="border-cool-gray-100 text-cool-gray-900 disabled:bg-cool-gray-50 h-10 rounded-md border px-3 text-sm"
              onChange={(e) =>
                setForm((current) => ({ ...current, code: e.target.value }))
              }
            />
          </label>
          <label className="text-cool-gray-500 flex flex-col gap-1 text-xs font-semibold">
            지역명
            <input
              aria-label="지역명"
              value={form.name}
              maxLength={100}
              className="border-cool-gray-100 text-cool-gray-900 h-10 rounded-md border px-3 text-sm"
              onChange={(e) =>
                setForm((current) => ({ ...current, name: e.target.value }))
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            {coordinateFields.map(([key, label]) => (
              <label
                key={key}
                className="text-cool-gray-500 flex min-w-0 flex-col gap-1 text-xs font-semibold"
              >
                {label}
                <input
                  aria-label={label}
                  inputMode="decimal"
                  value={form[key]}
                  className="border-cool-gray-100 text-cool-gray-900 h-10 min-w-0 rounded-md border px-3 text-sm"
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <label className="text-cool-gray-500 flex flex-col gap-1 text-xs font-semibold">
            표시 순서
            <input
              aria-label="표시 순서"
              inputMode="numeric"
              value={form.displayOrder}
              className="border-cool-gray-100 text-cool-gray-900 h-10 rounded-md border px-3 text-sm"
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  displayOrder: e.target.value,
                }))
              }
            />
          </label>
          <label className="text-cool-gray-900 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((current) => ({ ...current, active: e.target.checked }))
              }
            />
            공개
          </label>
        </fieldset>
        <p className="text-cool-gray-500 text-xs leading-5">
          비공개로 저장해도 지역과 식당 배정은 유지됩니다. 공개 지역의 범위는
          서버 지원 영역 안에 있어야 하며, 비공개 전환 시 해당 지역을 이용 중인
          지도 조회가 종료될 수 있습니다.
        </p>
        {error && (
          <p role="alert" className="text-error text-sm">
            {error}
          </p>
        )}
      </form>
    </Drawer>
  )
}
