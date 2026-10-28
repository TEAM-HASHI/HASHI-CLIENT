import { Button } from '@hashi/hds-ui'
import { useState } from 'react'
import type {
  MagazineCatalogItem,
  MagazineDetailData,
} from '@/pages/magazines/api/magazineCatalogApi'
import { useMagazineDetailQuery } from '@/pages/magazines/queries/useMagazineDetailQuery'
import { MagazineRestaurantPicker } from '@/pages/magazines/components/MagazineRestaurantPicker'
import {
  createMagazineForm,
  createMagazineFormFromItem,
  toCreateMagazineBody,
  toUpdateMagazineBody,
  validateMagazineForm,
  type MagazineDirtyFields,
  type MagazineTextField,
  MAGAZINE_CARD_NEWS_LIMIT,
} from '@/pages/magazines/magazineForm'
import {
  useCreateMagazineMutation,
  useUpdateMagazineMutation,
} from '@/pages/magazines/mutations/useMagazineMutations'
import { AdminImageUploader } from '@/shared/components/AdminImageUploader'
import { Drawer } from '@/shared/components/Drawer'
import type { AdminImageUploadStatus } from '@/shared/hooks/useAdminImageUpload'

// 앱에서 잘려 보이는 비율: 배너는 홈·매거진 배너(353:160), 썸네일은 매거진 목록(156:88)
const MAGAZINE_BANNER_FRAMES = [
  { label: '배너', aspectRatio: '353 / 160' },
] as const
const MAGAZINE_THUMBNAIL_FRAMES = [
  { label: '목록', aspectRatio: '156 / 88' },
] as const

interface MagazineFormDrawerProps {
  open: boolean
  mode: 'create' | 'update'
  magazineId: number | null
  item: MagazineCatalogItem | null
  onClose: () => void
}

export const MagazineFormDrawer = (props: MagazineFormDrawerProps) => {
  const detail = useMagazineDetailQuery(
    props.open && props.mode === 'update' ? props.magazineId : null,
  )
  if (!props.open) return null
  if (props.mode === 'update' && !detail.data)
    return (
      <Drawer
        open
        title={`매거진 수정 #${props.magazineId ?? ''}`}
        onClose={props.onClose}
      >
        {detail.isError ? (
          <div role="alert" className="space-y-3">
            <p>매거진 상세를 불러오지 못했습니다.</p>
            <Button onClick={() => void detail.refetch()}>다시 시도</Button>
          </div>
        ) : (
          <p role="status">매거진 상세를 불러오는 중입니다.</p>
        )}
      </Drawer>
    )
  return (
    <MagazineEditor
      key={`${props.mode}:${props.magazineId}`}
      {...props}
      detail={detail.data}
    />
  )
}

const MagazineEditor = ({
  open,
  mode,
  magazineId,
  item,
  onClose,
  detail,
}: MagazineFormDrawerProps & { detail?: MagazineDetailData }) => {
  const [form, setForm] = useState(() =>
    mode === 'update'
      ? createMagazineFormFromItem(item ?? {}, detail)
      : createMagazineForm(),
  )
  const [dirtyFields, setDirtyFields] = useState<MagazineDirtyFields>(new Set())
  const [bannerUploadStatus, setBannerUploadStatus] =
    useState<AdminImageUploadStatus>({ pendingCount: 0, failedCount: 0 })
  const [thumbnailUploadStatus, setThumbnailUploadStatus] =
    useState<AdminImageUploadStatus>({ pendingCount: 0, failedCount: 0 })
  const [cardNewsUploadStatus, setCardNewsUploadStatus] =
    useState<AdminImageUploadStatus>({ pendingCount: 0, failedCount: 0 })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const createMutation = useCreateMagazineMutation()
  const updateMutation = useUpdateMagazineMutation()
  const activeMutation = mode === 'create' ? createMutation : updateMutation

  const setText = (key: MagazineTextField, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setDirtyFields((current) => new Set(current).add(key))
  }

  const submit = () => {
    if (activeMutation.isPending) return
    const nextErrors = validateMagazineForm(form, mode, dirtyFields)
    if (
      bannerUploadStatus.pendingCount ||
      bannerUploadStatus.failedCount ||
      thumbnailUploadStatus.pendingCount ||
      thumbnailUploadStatus.failedCount ||
      ((mode === 'create' || form.replaceCardNews) &&
        (cardNewsUploadStatus.pendingCount || cardNewsUploadStatus.failedCount))
    ) {
      nextErrors.upload = '업로드 중이거나 실패한 이미지를 확인해주세요.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (mode === 'create') {
      createMutation.mutate(toCreateMagazineBody(form), { onSuccess: onClose })
      return
    }
    if (magazineId == null) return
    try {
      updateMutation.mutate(
        { magazineId, input: toUpdateMagazineBody(form, dirtyFields) },
        { onSuccess: onClose },
      )
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : '요청에 실패했습니다.',
      })
    }
  }

  return (
    <Drawer
      open={open}
      title={
        mode === 'create' ? '매거진 등록' : `매거진 수정 #${magazineId ?? ''}`
      }
      onClose={() => {
        if (!activeMutation.isPending) onClose()
      }}
      footer={
        <>
          <Button
            variant="neutral"
            disabled={activeMutation.isPending}
            onClick={onClose}
          >
            취소
          </Button>
          <Button loading={activeMutation.isPending} onClick={submit}>
            {mode === 'create' ? '매거진 등록' : '변경사항 저장'}
          </Button>
        </>
      }
    >
      <fieldset
        disabled={activeMutation.isPending}
        className="min-w-0 space-y-5"
      >
        {Object.keys(errors).length ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-600"
          >
            {Object.values(errors)[0]}
          </p>
        ) : null}
        {activeMutation.isError ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-600"
          >
            {activeMutation.error instanceof Error
              ? activeMutation.error.message
              : '요청에 실패했습니다.'}
          </p>
        ) : null}
        <Field
          label="제목"
          value={form.title}
          maxLength={150}
          onChange={(value) => setText('title', value)}
        />
        <Field
          label="인스타그램 URL"
          value={form.instagramRedirectUrl}
          maxLength={255}
          placeholder="https://www.instagram.com/p/..."
          onChange={(value) => setText('instagramRedirectUrl', value)}
        />
        <label className="flex flex-col gap-1">
          <span className="text-cool-gray-500 text-xs font-semibold">본문</span>
          <textarea
            aria-label="본문"
            maxLength={2000}
            rows={6}
            value={form.content}
            onChange={(event) => setText('content', event.target.value)}
            className="border-cool-gray-100 min-h-32 w-full rounded-md border px-3 py-2 text-sm"
          />
        </label>
        <Field
          label="해시태그"
          value={form.hashtags}
          placeholder="도쿄, 이자카야"
          onChange={(value) => setText('hashtags', value)}
        />
        <MagazineRestaurantPicker
          value={form.restaurants}
          onChange={(restaurants) => {
            setForm((current) => ({ ...current, restaurants }))
            setDirtyFields((current) => new Set(current).add('restaurantIds'))
          }}
        />
        {form.existingBannerUrl && !form.banner ? (
          <div>
            <p className="text-cool-gray-500 mb-2 text-xs">현재 배너</p>
            <img
              src={form.existingBannerUrl}
              alt="현재 매거진 배너"
              className="w-full rounded-lg object-cover"
              style={{ aspectRatio: MAGAZINE_BANNER_FRAMES[0].aspectRatio }}
            />
          </div>
        ) : null}
        <AdminImageUploader
          label={mode === 'create' ? '배너 이미지 선택' : '새 배너로 교체'}
          usage="magazine"
          value={form.banner ? [form.banner] : []}
          previewFrames={MAGAZINE_BANNER_FRAMES}
          onChange={(images) =>
            setForm((current) => ({ ...current, banner: images[0] ?? null }))
          }
          onStatusChange={setBannerUploadStatus}
        />
        {form.existingThumbnailUrl && !form.thumbnail ? (
          <div>
            <p className="text-cool-gray-500 mb-2 text-xs">현재 썸네일</p>
            <img
              src={form.existingThumbnailUrl}
              alt="현재 매거진 썸네일"
              className="w-full rounded-lg object-cover"
              style={{ aspectRatio: MAGAZINE_THUMBNAIL_FRAMES[0].aspectRatio }}
            />
          </div>
        ) : null}
        <AdminImageUploader
          label={mode === 'create' ? '썸네일 이미지 선택' : '새 썸네일로 교체'}
          usage="magazine"
          value={form.thumbnail ? [form.thumbnail] : []}
          previewFrames={MAGAZINE_THUMBNAIL_FRAMES}
          onChange={(images) =>
            setForm((current) => ({
              ...current,
              thumbnail: images[0] ?? null,
            }))
          }
          onStatusChange={setThumbnailUploadStatus}
        />
        <section className="border-cool-gray-100 space-y-3 border-t pt-5">
          <h3 className="text-sm font-bold">카드뉴스</h3>
          {mode === 'update' && detail?.cardNewsImages?.length ? (
            <ol className="grid grid-cols-2 gap-3">
              {detail.cardNewsImages.map((card, index) => {
                const url = card.image
                  ? card.image.status === 'READY'
                    ? card.image.defaultSource?.url
                    : undefined
                  : card.legacyUrl
                return (
                  <li
                    key={card.cardNewsId ?? index}
                    className="border-cool-gray-100 overflow-hidden rounded-md border"
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`기존 카드뉴스 ${index + 1}`}
                        className="h-auto w-full"
                      />
                    ) : (
                      <p className="p-4 text-sm">
                        이미지 {index + 1}: {card.image?.status ?? '표시 불가'}
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          ) : null}
          {mode === 'update' ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.replaceCardNews}
                onChange={(event) => {
                  const replaceCardNews = event.target.checked
                  setForm((current) => ({ ...current, replaceCardNews }))
                  setCardNewsUploadStatus({ pendingCount: 0, failedCount: 0 })
                }}
              />
              카드뉴스 전체 교체
            </label>
          ) : null}
          {mode === 'create' || form.replaceCardNews ? (
            <>
              {mode === 'update' ? (
                <p className="text-sm text-red-600">
                  저장 시 기존 카드뉴스 전체를 교체합니다. 새 이미지가 없으면
                  모두 삭제됩니다.
                </p>
              ) : null}
              <AdminImageUploader
                label="카드뉴스 이미지 선택"
                usage="magazine"
                multiple
                preserveOrder
                maxFiles={MAGAZINE_CARD_NEWS_LIMIT}
                previewFrames={[{ label: '카드뉴스', aspectRatio: '1 / 1' }]}
                value={form.cardNews}
                onChange={(cardNews) =>
                  setForm((current) => ({ ...current, cardNews }))
                }
                onStatusChange={setCardNewsUploadStatus}
              />
            </>
          ) : null}
        </section>
        {mode === 'update' ? (
          <p className="text-cool-gray-500 text-xs">
            새 이미지를 업로드하지 않으면 기존 배너와 썸네일이 유지됩니다.
          </p>
        ) : null}
      </fieldset>
    </Drawer>
  )
}

const Field = ({
  label,
  value,
  maxLength,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  maxLength?: number
  placeholder?: string
  onChange: (value: string) => void
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-cool-gray-500 text-xs font-semibold">{label}</span>
    <input
      aria-label={label}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="border-cool-gray-100 focus:border-primary-200 h-10 rounded-md border px-3 text-sm outline-none"
    />
  </label>
)
