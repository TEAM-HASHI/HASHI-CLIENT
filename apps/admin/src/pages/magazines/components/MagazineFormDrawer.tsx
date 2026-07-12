import { Button } from '@hashi/hds-ui'
import { useEffect, useState } from 'react'
import type { MagazineCatalogItem } from '@/pages/magazines/api/magazineCatalogApi'
import {
  createMagazineForm,
  createMagazineFormFromItem,
  toCreateMagazineBody,
  toUpdateMagazineBody,
  validateMagazineForm,
  type MagazineDirtyFields,
} from '@/pages/magazines/magazineForm'
import {
  useCreateMagazineMutation,
  useUpdateMagazineMutation,
} from '@/pages/magazines/mutations/useMagazineMutations'
import { AdminImageUploader } from '@/shared/components/AdminImageUploader'
import { Drawer } from '@/shared/components/Drawer'
import type { AdminImageUploadStatus } from '@/shared/hooks/useAdminImageUpload'

export const MagazineFormDrawer = ({
  open,
  mode,
  magazineId,
  item,
  onClose,
}: {
  open: boolean
  mode: 'create' | 'update'
  magazineId: number | null
  item: MagazineCatalogItem | null
  onClose: () => void
}) => {
  const [form, setForm] = useState(createMagazineForm)
  const [dirtyFields, setDirtyFields] = useState<MagazineDirtyFields>(new Set())
  const [uploadStatus, setUploadStatus] = useState<AdminImageUploadStatus>({
    pendingCount: 0,
    failedCount: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const createMutation = useCreateMagazineMutation()
  const updateMutation = useUpdateMagazineMutation()
  const activeMutation = mode === 'create' ? createMutation : updateMutation

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- drawer props define a new editing session and must reset local form state together. */
  useEffect(() => {
    if (!open) return
    setForm(item ? createMagazineFormFromItem(item) : createMagazineForm())
    setDirtyFields(new Set())
    setUploadStatus({ pendingCount: 0, failedCount: 0 })
    setErrors({})
    createMutation.reset()
    updateMutation.reset()
  }, [open, mode, item])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const setText = (key: 'title' | 'instagramRedirectUrl', value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setDirtyFields((current) => new Set(current).add(key))
  }

  const submit = () => {
    const nextErrors = validateMagazineForm(form, mode, dirtyFields)
    if (uploadStatus.pendingCount || uploadStatus.failedCount) {
      nextErrors.upload = '업로드 중이거나 실패한 배너를 확인해주세요.'
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
      description="배너 이미지를 직접 업로드하고 Instagram 이동 주소를 연결합니다."
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            취소
          </Button>
          <Button loading={activeMutation.isPending} onClick={submit}>
            {mode === 'create' ? '매거진 등록' : '변경사항 저장'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
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
        {form.existingBannerUrl && !form.banner ? (
          <div>
            <p className="text-cool-gray-500 mb-2 text-xs">현재 배너</p>
            <img
              src={form.existingBannerUrl}
              alt="현재 매거진 배너"
              className="w-full rounded-lg object-cover"
            />
          </div>
        ) : null}
        <AdminImageUploader
          label={mode === 'create' ? '배너 이미지 선택' : '새 배너로 교체'}
          usage="magazine"
          value={form.banner ? [form.banner] : []}
          onChange={(images) =>
            setForm((current) => ({ ...current, banner: images[0] ?? null }))
          }
          onStatusChange={setUploadStatus}
        />
        {mode === 'update' ? (
          <p className="text-cool-gray-500 text-xs">
            새 배너를 업로드하지 않으면 기존 배너가 유지됩니다.
          </p>
        ) : null}
      </div>
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
  maxLength: number
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
