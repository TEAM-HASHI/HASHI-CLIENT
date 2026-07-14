import { Button } from '@hashi/hds-ui'
import { useEffect, useMemo, useState } from 'react'
import type { RestaurantCatalogItem } from '@/pages/restaurants/api/restaurantCatalogApi'
import { useRestaurantPrefillQuery } from '@/pages/restaurants/queries/useRestaurantPrefillQuery'
import {
  createRestaurantForm,
  createRestaurantFormFromPrefill,
  toCreateRestaurantBody,
  toUpdateRestaurantBody,
  validateRestaurantForm,
  type FormUploadStatus,
  type RestaurantBusinessHourForm,
  type RestaurantDirtyFields,
  type RestaurantFormState,
  type RestaurantMenuForm,
  type RestaurantReplacementFlags,
  type RestaurantScalarFields,
} from '@/pages/restaurants/restaurantForm'
import {
  CURATION_OPTIONS,
  CURRENCY_OPTIONS,
  FOOD_CATEGORY_OPTIONS,
  GENRE_OPTIONS,
} from '@/pages/restaurants/restaurantOptions'
import {
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
} from '@/pages/restaurants/mutations/useRestaurantMutations'
import { AdminImageUploader } from '@/shared/components/AdminImageUploader'
import { AdminSelect } from '@/shared/components/AdminSelect'
import { Drawer } from '@/shared/components/Drawer'
import type { AdminImageUploadStatus } from '@/shared/hooks/useAdminImageUpload'
import { RestaurantFormStepper } from '@/pages/restaurants/components/RestaurantFormStepper'
import { RestaurantReplacementSection } from '@/pages/restaurants/components/RestaurantReplacementSection'

const emptyReplacements: RestaurantReplacementFlags = {
  images: false,
  menus: false,
  hashtags: false,
  curationTypes: false,
  businessHours: false,
}

interface RestaurantFormDrawerProps {
  open: boolean
  mode: 'create' | 'update'
  restaurantId: number | null
  listItem: RestaurantCatalogItem | null
  loadPrefill: boolean
  onClose: () => void
}

export const RestaurantFormDrawer = ({
  open,
  mode,
  restaurantId,
  listItem,
  loadPrefill,
  onClose,
}: RestaurantFormDrawerProps) => {
  const [form, setForm] = useState(createRestaurantForm)
  const [step, setStep] = useState(0)
  const [dirtyFields, setDirtyFields] = useState<RestaurantDirtyFields>(
    new Set(),
  )
  const [replacements, setReplacements] =
    useState<RestaurantReplacementFlags>(emptyReplacements)
  const [uploadStatus, setUploadStatus] = useState<FormUploadStatus>({
    pendingCount: 0,
    failedCount: 0,
  })
  const [menuUploadStatuses, setMenuUploadStatuses] = useState<
    Record<number, AdminImageUploadStatus>
  >({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const createMutation = useCreateRestaurantMutation()
  const updateMutation = useUpdateRestaurantMutation()
  const prefillQuery = useRestaurantPrefillQuery(
    open && mode === 'update' && loadPrefill ? restaurantId : null,
    listItem,
  )

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- drawer props and asynchronous prefill data define the editing session state. */
  useEffect(() => {
    if (!open) return
    setStep(0)
    setDirtyFields(new Set())
    setReplacements(emptyReplacements)
    setUploadStatus({ pendingCount: 0, failedCount: 0 })
    setMenuUploadStatuses({})
    setErrors({})
    createMutation.reset()
    updateMutation.reset()
    if (mode === 'create' || !loadPrefill) setForm(createRestaurantForm())
  }, [open, mode, loadPrefill])

  useEffect(() => {
    if (open && mode === 'update' && prefillQuery.data) {
      setForm(createRestaurantFormFromPrefill(prefillQuery.data))
    }
  }, [mode, open, prefillQuery.data])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const activeMutation = mode === 'create' ? createMutation : updateMutation
  const totalUploadStatus = useMemo(
    () =>
      Object.values(menuUploadStatuses).reduce(
        (status, menuStatus) => ({
          pendingCount: status.pendingCount + menuStatus.pendingCount,
          failedCount: status.failedCount + menuStatus.failedCount,
        }),
        uploadStatus,
      ),
    [menuUploadStatuses, uploadStatus],
  )

  const setScalar = <TKey extends keyof RestaurantScalarFields>(
    key: TKey,
    value: RestaurantScalarFields[TKey],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setDirtyFields((current) => new Set(current).add(key))
  }

  const setReplacement = (
    key: keyof RestaurantReplacementFlags,
    enabled: boolean,
  ) => setReplacements((current) => ({ ...current, [key]: enabled }))

  const handleSubmit = () => {
    const nextErrors = validateRestaurantForm(
      form,
      mode,
      replacements,
      totalUploadStatus,
      dirtyFields,
    )
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (mode === 'create') {
      createMutation.mutate(toCreateRestaurantBody(form), {
        onSuccess: onClose,
      })
      return
    }
    if (restaurantId == null) return
    try {
      updateMutation.mutate(
        {
          restaurantId,
          input: toUpdateRestaurantBody(form, dirtyFields, replacements),
        },
        { onSuccess: onClose },
      )
    } catch (error) {
      setErrors({ submit: getErrorMessage(error) })
    }
  }

  const handleNext = () => {
    const allErrors = validateRestaurantForm(
      form,
      mode,
      replacements,
      totalUploadStatus,
      dirtyFields,
    )
    const stepFields =
      [
        [
          'name',
          'localName',
          'summary',
          'description',
          'address',
          'area',
          'genre',
          'foodCategory',
        ],
        ['priceCurrency', 'priceRange', 'images', 'uploads'],
        ['businessHours'],
      ][step] ?? []
    const stepErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([key]) => stepFields.includes(key)),
    )
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length === 0) {
      setStep((value) => value + 1)
    }
  }

  const canShowForm =
    mode === 'create' || !loadPrefill || prefillQuery.isSuccess

  return (
    <Drawer
      open={open}
      size="lg"
      title={
        mode === 'create' ? '식당 등록' : `식당 수정 #${restaurantId ?? ''}`
      }
      description={
        mode === 'update'
          ? '공개 정보를 불러오되, 목록형 항목은 명시적으로 전체 교체할 때만 전송합니다.'
          : undefined
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            취소
          </Button>
          {step > 0 ? (
            <Button
              variant="neutral"
              onClick={() => setStep((value) => value - 1)}
            >
              이전
            </Button>
          ) : null}
          {step < 3 ? (
            <Button onClick={handleNext}>다음</Button>
          ) : (
            <Button loading={activeMutation.isPending} onClick={handleSubmit}>
              {mode === 'create' ? '식당 등록 완료' : '변경사항 저장'}
            </Button>
          )}
        </>
      }
    >
      <RestaurantFormStepper step={step} />
      {prefillQuery.isLoading ? (
        <p className="text-cool-gray-500 py-16 text-center text-sm">
          식당 정보를 불러오는 중입니다…
        </p>
      ) : prefillQuery.isError ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-4 text-sm text-red-600"
        >
          공개 식당 정보를 불러오지 못했습니다. ID 직접 수정으로 다시
          시도해주세요.
        </p>
      ) : canShowForm ? (
        <>
          {Object.keys(errors).length > 0 ? (
            <p
              role="alert"
              className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-600"
            >
              입력값을 확인해주세요. {Object.values(errors)[0]}
            </p>
          ) : null}
          {activeMutation.isError ? (
            <p
              role="alert"
              className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600"
            >
              {getErrorMessage(activeMutation.error)}
            </p>
          ) : null}
          {step === 0 ? <BasicStep form={form} setScalar={setScalar} /> : null}
          {step === 1 ? (
            <MediaStep
              mode={mode}
              form={form}
              replacements={replacements}
              setForm={setForm}
              setScalar={setScalar}
              setReplacement={setReplacement}
              onUploadStatus={setUploadStatus}
            />
          ) : null}
          {step === 2 ? (
            <HoursStep
              mode={mode}
              hours={form.businessHours}
              enabled={replacements.businessHours}
              onEnabledChange={(enabled) =>
                setReplacement('businessHours', enabled)
              }
              onChange={(businessHours) =>
                setForm((current) => ({ ...current, businessHours }))
              }
            />
          ) : null}
          {step === 3 ? (
            <MenuAndExposureStep
              mode={mode}
              form={form}
              replacements={replacements}
              setForm={setForm}
              setReplacement={setReplacement}
              onMenuUploadStatus={(index, status) =>
                setMenuUploadStatuses((current) => ({
                  ...current,
                  [index]: status,
                }))
              }
            />
          ) : null}
        </>
      ) : null}
    </Drawer>
  )
}

const BasicStep = ({
  form,
  setScalar,
}: {
  form: RestaurantFormState
  setScalar: <TKey extends keyof RestaurantScalarFields>(
    key: TKey,
    value: RestaurantScalarFields[TKey],
  ) => void
}) => (
  <section className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="식당명"
        value={form.name}
        maxLength={100}
        onChange={(value) => setScalar('name', value)}
      />
      <Field
        label="현지명"
        value={form.localName}
        maxLength={100}
        onChange={(value) => setScalar('localName', value)}
      />
      <Field
        label="지역"
        value={form.area}
        maxLength={20}
        onChange={(value) => setScalar('area', value)}
      />
      <Field
        label="주소"
        value={form.address}
        maxLength={255}
        onChange={(value) => setScalar('address', value)}
      />
      <AdminSelect
        label="장르"
        value={form.genre}
        options={[...GENRE_OPTIONS]}
        onChange={(value) => setScalar('genre', value)}
      />
      <AdminSelect
        label="음식 카테고리"
        value={form.foodCategory}
        options={[...FOOD_CATEGORY_OPTIONS]}
        onChange={(value) => setScalar('foodCategory', value)}
      />
    </div>
    <Field
      label="한 줄 소개"
      value={form.summary}
      maxLength={100}
      onChange={(value) => setScalar('summary', value)}
    />
    <Field
      label="매장 상세 설명"
      value={form.description}
      maxLength={500}
      multiline
      onChange={(value) => setScalar('description', value)}
    />
  </section>
)

const MediaStep = ({
  mode,
  form,
  replacements,
  setForm,
  setScalar,
  setReplacement,
  onUploadStatus,
}: {
  mode: 'create' | 'update'
  form: RestaurantFormState
  replacements: RestaurantReplacementFlags
  setForm: React.Dispatch<React.SetStateAction<RestaurantFormState>>
  setScalar: <TKey extends keyof RestaurantScalarFields>(
    key: TKey,
    value: RestaurantScalarFields[TKey],
  ) => void
  setReplacement: (
    key: keyof RestaurantReplacementFlags,
    enabled: boolean,
  ) => void
  onUploadStatus: (status: AdminImageUploadStatus) => void
}) => {
  const uploader = (
    <AdminImageUploader
      label="식당 이미지 선택"
      usage="restaurant"
      value={form.images}
      multiple
      representativeLabel
      onChange={(images) => setForm((current) => ({ ...current, images }))}
      onStatusChange={onUploadStatus}
    />
  )
  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminSelect
          label="통화"
          value={form.priceCurrency}
          options={[...CURRENCY_OPTIONS]}
          onChange={(value) => setScalar('priceCurrency', value)}
        />
        <Field
          label="최소 가격"
          type="number"
          value={form.minPrice}
          onChange={(value) => setScalar('minPrice', value)}
        />
        <Field
          label="최대 가격"
          type="number"
          value={form.maxPrice}
          onChange={(value) => setScalar('maxPrice', value)}
        />
      </div>
      {mode === 'update' ? (
        <RestaurantReplacementSection
          label="식당 이미지"
          enabled={replacements.images}
          onChange={(enabled) => setReplacement('images', enabled)}
        >
          {form.existingImageUrls.length > 0 ? (
            <ExistingImages urls={form.existingImageUrls} />
          ) : null}
          {uploader}
        </RestaurantReplacementSection>
      ) : (
        uploader
      )}
    </section>
  )
}

const ExistingImages = ({ urls }: { urls: string[] }) => (
  <div className="mb-4">
    <p className="text-cool-gray-500 mb-2 text-xs">
      현재 공개 이미지(키로 변환하지 않음)
    </p>
    <div className="flex gap-2 overflow-x-auto">
      {urls.map((url) => (
        <img
          key={url}
          src={url}
          alt="현재 식당"
          className="size-20 rounded object-cover"
        />
      ))}
    </div>
  </div>
)

const HoursStep = ({
  mode,
  hours,
  enabled,
  onEnabledChange,
  onChange,
}: {
  mode: 'create' | 'update'
  hours: RestaurantBusinessHourForm[]
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  onChange: (hours: RestaurantBusinessHourForm[]) => void
}) => {
  const content = (
    <div className="space-y-2">
      {hours.map((hour, index) => (
        <div
          key={hour.dayOfWeek}
          className="border-cool-gray-100 grid grid-cols-[5rem_1fr_1fr_1fr_1fr_auto] items-end gap-2 rounded-md border p-3"
        >
          <strong className="pb-2 text-xs">{DAY_LABELS[hour.dayOfWeek]}</strong>
          <TimeField
            label="오픈"
            value={hour.openTime}
            disabled={hour.closed}
            onChange={(value) =>
              updateHour(hours, index, { openTime: value }, onChange)
            }
          />
          <TimeField
            label="마감"
            value={hour.closeTime}
            disabled={hour.closed}
            onChange={(value) =>
              updateHour(hours, index, { closeTime: value }, onChange)
            }
          />
          <TimeField
            label="휴게 시작"
            value={hour.breakStart}
            disabled={hour.closed}
            onChange={(value) =>
              updateHour(hours, index, { breakStart: value }, onChange)
            }
          />
          <TimeField
            label="휴게 종료"
            value={hour.breakEnd}
            disabled={hour.closed}
            onChange={(value) =>
              updateHour(hours, index, { breakEnd: value }, onChange)
            }
          />
          <label className="flex h-10 items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={hour.closed}
              onChange={(event) =>
                updateHour(
                  hours,
                  index,
                  event.target.checked
                    ? {
                        closed: true,
                        openTime: '',
                        closeTime: '',
                        breakStart: '',
                        breakEnd: '',
                      }
                    : { closed: false, openTime: '11:00', closeTime: '22:00' },
                  onChange,
                )
              }
            />
            휴무
          </label>
        </div>
      ))}
    </div>
  )
  return mode === 'update' ? (
    <RestaurantReplacementSection
      label="영업시간"
      enabled={enabled}
      onChange={onEnabledChange}
    >
      {content}
    </RestaurantReplacementSection>
  ) : (
    content
  )
}

const MenuAndExposureStep = ({
  mode,
  form,
  replacements,
  setForm,
  setReplacement,
  onMenuUploadStatus,
}: {
  mode: 'create' | 'update'
  form: RestaurantFormState
  replacements: RestaurantReplacementFlags
  setForm: React.Dispatch<React.SetStateAction<RestaurantFormState>>
  setReplacement: (
    key: keyof RestaurantReplacementFlags,
    enabled: boolean,
  ) => void
  onMenuUploadStatus: (index: number, status: AdminImageUploadStatus) => void
}) => {
  const menus = (
    <MenuEditor
      menus={form.menus}
      onChange={(menus) => setForm((current) => ({ ...current, menus }))}
      onUploadStatus={onMenuUploadStatus}
    />
  )
  const hashtags = (
    <Field
      label="해시태그"
      value={form.hashtags}
      placeholder="쉼표로 구분"
      onChange={(hashtags) => setForm((current) => ({ ...current, hashtags }))}
    />
  )
  const curations = (
    <div>
      <p className="text-cool-gray-500 mb-2 text-xs font-semibold">큐레이션</p>
      <div className="flex flex-wrap gap-3">
        {CURATION_OPTIONS.map((option) => (
          <label key={option.value} className="text-sm">
            <input
              type="checkbox"
              className="mr-1"
              checked={form.curationTypes.includes(option.value)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  curationTypes: event.target.checked
                    ? [...current.curationTypes, option.value]
                    : current.curationTypes.filter(
                        (value) => value !== option.value,
                      ),
                }))
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
  return (
    <section className="space-y-4">
      {mode === 'update' ? (
        <RestaurantReplacementSection
          label="메뉴"
          enabled={replacements.menus}
          onChange={(enabled) => setReplacement('menus', enabled)}
        >
          {menus}
        </RestaurantReplacementSection>
      ) : (
        menus
      )}
      {mode === 'update' ? (
        <RestaurantReplacementSection
          label="해시태그"
          enabled={replacements.hashtags}
          onChange={(enabled) => setReplacement('hashtags', enabled)}
        >
          {hashtags}
        </RestaurantReplacementSection>
      ) : (
        hashtags
      )}
      {mode === 'update' ? (
        <RestaurantReplacementSection
          label="큐레이션"
          enabled={replacements.curationTypes}
          onChange={(enabled) => setReplacement('curationTypes', enabled)}
        >
          {curations}
        </RestaurantReplacementSection>
      ) : (
        curations
      )}
    </section>
  )
}

const MenuEditor = ({
  menus,
  onChange,
  onUploadStatus,
}: {
  menus: RestaurantMenuForm[]
  onChange: (menus: RestaurantMenuForm[]) => void
  onUploadStatus: (index: number, status: AdminImageUploadStatus) => void
}) => (
  <div className="space-y-3">
    {menus.map((menu, index) => (
      <section
        key={index}
        className="border-cool-gray-100 space-y-3 rounded-md border p-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="메뉴명"
            value={menu.name}
            maxLength={100}
            onChange={(value) =>
              updateMenu(menus, index, { name: value }, onChange)
            }
          />
          <Field
            label="설명"
            value={menu.description}
            maxLength={500}
            onChange={(value) =>
              updateMenu(menus, index, { description: value }, onChange)
            }
          />
          <AdminSelect
            label="통화"
            value={menu.priceCurrency}
            options={[...CURRENCY_OPTIONS]}
            onChange={(value) =>
              updateMenu(menus, index, { priceCurrency: value }, onChange)
            }
          />
          <Field
            label="가격"
            type="number"
            value={menu.priceAmount}
            onChange={(value) =>
              updateMenu(menus, index, { priceAmount: value }, onChange)
            }
          />
        </div>
        <label className="text-sm">
          <input
            type="checkbox"
            className="mr-1"
            checked={menu.main}
            onChange={(event) =>
              updateMenu(menus, index, { main: event.target.checked }, onChange)
            }
          />
          대표 메뉴
        </label>
        <AdminImageUploader
          label={`${menu.name || index + 1} 메뉴 이미지`}
          usage="restaurant-menu"
          value={menu.image ? [menu.image] : []}
          onChange={(images) =>
            updateMenu(menus, index, { image: images[0] ?? null }, onChange)
          }
          onStatusChange={(status) => onUploadStatus(index, status)}
        />
        <button
          type="button"
          className="text-error text-xs font-bold"
          onClick={() =>
            onChange(menus.filter((_, current) => current !== index))
          }
        >
          메뉴 삭제
        </button>
      </section>
    ))}
    <button
      type="button"
      className="border-primary-200 text-primary-200 rounded-md border px-3 py-2 text-sm font-bold"
      onClick={() =>
        onChange([
          ...menus,
          {
            name: '',
            description: '',
            image: null,
            existingImageUrl: null,
            priceCurrency: 'JPY',
            priceAmount: '',
            main: false,
          },
        ])
      }
    >
      메뉴 추가
    </button>
  </div>
)

const Field = ({
  label,
  value,
  type = 'text',
  maxLength,
  multiline = false,
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string
  value: string
  type?: string
  maxLength?: number
  multiline?: boolean
  placeholder?: string
  disabled?: boolean
  onChange: (value: string) => void
}) => (
  <label className="flex min-w-0 flex-col gap-1">
    <span className="text-cool-gray-500 text-xs font-semibold">{label}</span>
    {multiline ? (
      <textarea
        aria-label={label}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        rows={5}
        onChange={(event) => onChange(event.target.value)}
        className="border-cool-gray-100 focus:border-primary-200 disabled:bg-cool-gray-50 rounded-md border px-3 py-2 text-sm outline-none"
      />
    ) : (
      <input
        aria-label={label}
        value={value}
        type={type}
        min={type === 'number' ? 0 : undefined}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="border-cool-gray-100 focus:border-primary-200 disabled:bg-cool-gray-50 h-10 rounded-md border px-3 text-sm outline-none"
      />
    )}
  </label>
)

const TimeField = ({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) => (
  <Field
    label={label}
    value={value}
    type="time"
    disabled={disabled}
    onChange={onChange}
  />
)

const updateHour = (
  hours: RestaurantBusinessHourForm[],
  index: number,
  patch: Partial<RestaurantBusinessHourForm>,
  onChange: (hours: RestaurantBusinessHourForm[]) => void,
) =>
  onChange(
    hours.map((hour, current) =>
      current === index ? { ...hour, ...patch } : hour,
    ),
  )
const updateMenu = (
  menus: RestaurantMenuForm[],
  index: number,
  patch: Partial<RestaurantMenuForm>,
  onChange: (menus: RestaurantMenuForm[]) => void,
) =>
  onChange(
    menus.map((menu, current) =>
      current === index ? { ...menu, ...patch } : menu,
    ),
  )

const DAY_LABELS: Record<RestaurantBusinessHourForm['dayOfWeek'], string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
}
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '요청에 실패했습니다.'
