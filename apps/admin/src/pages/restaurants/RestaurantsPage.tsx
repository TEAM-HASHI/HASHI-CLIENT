import { CameraIcon, PencilIcon, PlusIcon } from '@hashi/hds-icons'
import { Button, Checkbox } from '@hashi/hds-ui'
import {
  type ReactNode,
  type SyntheticEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  MockScenario,
  Restaurant,
  RestaurantFormData,
  RestaurantGenre,
  RestaurantStatus,
} from '@/shared/api/adminTypes'
import {
  useCreateRestaurantMutation,
  useDeleteRestaurantMutation,
  useRestaurantsQuery,
  useUpdateRestaurantMutation,
} from '@/shared/api/adminHooks'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminSearchInput } from '@/shared/components/AdminSearchInput'
import { AdminSelect, type SelectOption } from '@/shared/components/AdminSelect'
import { AdminTable } from '@/shared/components/AdminTable'
import { AdminToolbar } from '@/shared/components/AdminToolbar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Drawer } from '@/shared/components/Drawer'
import { PageHeader } from '@/shared/components/PageHeader'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { cn } from '@/shared/utils/cn'

type StatusFilter = 'all' | RestaurantStatus
type SortOption = 'latest' | 'name'
type GenreFilter = 'all' | RestaurantGenre
type RestaurantFormStepId = 'basic' | 'media' | 'hours' | 'menus'

interface RestaurantFormStep {
  id: RestaurantFormStepId
  title: string
  description: string
}

const scenarioOptions: SelectOption<MockScenario>[] = [
  { value: 'success', label: '정상' },
  { value: 'empty', label: '빈 데이터' },
  { value: 'error', label: '오류' },
]

const statusOptions: SelectOption<StatusFilter>[] = [
  { value: 'all', label: '전체' },
  { value: 'open', label: '운영중' },
  { value: 'paused', label: '일시중지' },
  { value: 'closed', label: '운영종료' },
]

const genreOptions: SelectOption<GenreFilter>[] = [
  { value: 'all', label: '전체' },
  { value: 'sushi', label: '스시' },
  { value: 'noodle', label: '면' },
  { value: 'rice-bowl', label: '덮밥' },
  { value: 'nabe', label: '나베' },
  { value: 'fried', label: '튀김' },
  { value: 'grill', label: '구이' },
  { value: 'etc', label: '기타' },
]

const genreFormOptions: SelectOption<RestaurantGenre>[] = [
  { value: 'sushi', label: '스시' },
  { value: 'noodle', label: '면' },
  { value: 'rice-bowl', label: '덮밥' },
  { value: 'nabe', label: '나베' },
  { value: 'fried', label: '튀김' },
  { value: 'grill', label: '구이' },
  { value: 'etc', label: '기타' },
]

const currencyOptions: SelectOption<
  RestaurantFormData['priceRange']['currency']
>[] = [
  { value: 'JPY', label: 'JPY' },
  { value: 'KRW', label: 'KRW' },
]

const dayOfWeekOptions: SelectOption<
  RestaurantFormData['businessHours'][number]['dayOfWeek']
>[] = [
  { value: 'MONDAY', label: '월요일' },
  { value: 'TUESDAY', label: '화요일' },
  { value: 'WEDNESDAY', label: '수요일' },
  { value: 'THURSDAY', label: '목요일' },
  { value: 'FRIDAY', label: '금요일' },
  { value: 'SATURDAY', label: '토요일' },
  { value: 'SUNDAY', label: '일요일' },
]

const curationTypeOptions: SelectOption<
  RestaurantFormData['curationTypes'][number]
>[] = [
  { value: 'sns-hot', label: 'SNS 핫플' },
  { value: 'popular', label: '인기' },
  { value: 'hashi-pick', label: '하시픽' },
  { value: 'today-restaurant', label: '오늘의 식당' },
]

const sortOptions: SelectOption<SortOption>[] = [
  { value: 'latest', label: '최신 수정순' },
  { value: 'name', label: '이름순' },
]

const timeHourOptions: SelectOption<string>[] = Array.from(
  { length: 24 },
  (_, hour) => {
    const value = String(hour).padStart(2, '0')

    return { value, label: value }
  },
)

const timeMinuteOptions: SelectOption<string>[] = ['00', '15', '30', '45'].map(
  (value) => ({ value, label: value }),
)

const restaurantFormSteps: RestaurantFormStep[] = [
  {
    id: 'basic',
    title: '기본 정보',
    description: '이름, 주소, 장르',
  },
  {
    id: 'media',
    title: '이미지/가격',
    description: 'fileKey, 예약금, 가격대',
  },
  {
    id: 'hours',
    title: '영업 시간',
    description: '요일별 운영 시간',
  },
  {
    id: 'menus',
    title: '메뉴/노출',
    description: '대표 메뉴와 노출 영역',
  },
]

const lastRestaurantFormStepIndex = restaurantFormSteps.length - 1

const tableColumns = [
  { key: 'name', label: '식당명', className: 'w-56' },
  { key: 'address', label: '주소', className: 'w-80' },
  { key: 'genre', label: '장르', className: 'w-28' },
  { key: 'status', label: '운영 상태', className: 'w-28' },
  { key: 'reservation', label: '예약', className: 'w-24' },
  { key: 'updatedAt', label: '수정일', className: 'w-44' },
  { key: 'actions', label: '액션', className: 'w-40' },
]

const defaultBusinessHourTime = {
  openTime: '11:00',
  closeTime: '22:00',
  lastOrderTime: '21:30',
  closed: false,
}

const getDefaultBusinessHours = (): RestaurantFormData['businessHours'] =>
  dayOfWeekOptions.map(({ value }) => ({
    dayOfWeek: value,
    ...defaultBusinessHourTime,
  }))

const defaultMenu: RestaurantFormData['menus'][number] = {
  name: '',
  description: '',
  imageFileKey: '',
  currency: 'JPY',
  price: 0,
  representative: false,
}

const defaultRestaurantForm: RestaurantFormData = {
  name: '',
  localName: '',
  description: '',
  address: '',
  area: '',
  genre: 'sushi',
  thumbnailFileKey: '',
  imageFileKeys: [],
  reservationFee: 0,
  priceRange: {
    currency: 'JPY',
    minPrice: 0,
    maxPrice: 0,
  },
  businessHours: getDefaultBusinessHours(),
  menus: [],
  curationTypes: [],
  active: true,
}

export const RestaurantsPage = () => {
  const [scenario, setScenario] = useState<MockScenario>('success')
  const [searchText, setSearchText] = useState('')
  const deferredSearchText = useDeferredValue(searchText)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('latest')
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null,
  )
  const [deletingRestaurant, setDeletingRestaurant] =
    useState<Restaurant | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const restaurantsQuery = useRestaurantsQuery(scenario)
  const createMutation = useCreateRestaurantMutation()
  const updateMutation = useUpdateRestaurantMutation()
  const deleteMutation = useDeleteRestaurantMutation()

  const restaurants = restaurantsQuery.data ?? []

  const filteredRestaurants = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase()

    return [...restaurants]
      .filter((restaurant) => {
        const matchesKeyword =
          keyword.length === 0 ||
          restaurant.name.toLowerCase().includes(keyword) ||
          restaurant.address.toLowerCase().includes(keyword)
        const matchesStatus =
          statusFilter === 'all' || restaurant.status === statusFilter
        const matchesGenre =
          genreFilter === 'all' || restaurant.genre === genreFilter

        return matchesKeyword && matchesStatus && matchesGenre
      })
      .sort((left, right) => {
        if (sortOption === 'name') {
          return left.name.localeCompare(right.name, 'ko')
        }

        return right.updatedAt.localeCompare(left.updatedAt)
      })
  }, [deferredSearchText, genreFilter, restaurants, sortOption, statusFilter])

  const handleCreateClick = () => {
    setEditingRestaurant(null)
    setIsDrawerOpen(true)
  }

  const handleEditClick = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setIsDrawerOpen(true)
  }

  const handleSubmit = (formData: RestaurantFormData) => {
    if (editingRestaurant) {
      updateMutation.mutate(
        { restaurantId: editingRestaurant.id, input: formData },
        {
          onSuccess: () => {
            setIsDrawerOpen(false)
            setEditingRestaurant(null)
          },
        },
      )
      return
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsDrawerOpen(false)
      },
    })
  }

  const handleDeleteConfirm = () => {
    if (!deletingRestaurant) {
      return
    }

    deleteMutation.mutate(deletingRestaurant.id, {
      onSuccess: () => {
        setDeletingRestaurant(null)
      },
    })
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <PageHeader
        title="식당 관리"
        description="입점 식당 정보, 운영 상태, 예약 가능 여부를 관리합니다."
      >
        <Button
          size="sm"
          leftIcon={<PlusIcon className="size-4" />}
          onClick={handleCreateClick}
        >
          식당 등록
        </Button>
      </PageHeader>

      <AdminToolbar>
        <AdminSearchInput
          value={searchText}
          placeholder="식당명 또는 주소로 검색"
          onChange={setSearchText}
        />
        <AdminSelect
          label="운영 상태"
          value={statusFilter}
          options={statusOptions}
          onChange={setStatusFilter}
        />
        <AdminSelect
          label="장르"
          value={genreFilter}
          options={genreOptions}
          onChange={setGenreFilter}
        />
        <AdminSelect
          label="정렬"
          value={sortOption}
          options={sortOptions}
          onChange={setSortOption}
        />
        <AdminSelect
          label="Mock 상태"
          value={scenario}
          options={scenarioOptions}
          onChange={setScenario}
        />
      </AdminToolbar>

      <div className="px-5 py-5 lg:px-8">
        <div className="text-cool-gray-500 mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>총 {filteredRestaurants.length.toLocaleString()}개 식당</span>
          <p>API 확정 전 mock adapter 기준으로 동작합니다.</p>
        </div>

        <div className="border-cool-gray-100 overflow-hidden rounded-lg border">
          <AdminTable
            columns={tableColumns}
            isLoading={restaurantsQuery.isLoading}
            isError={restaurantsQuery.isError}
            isEmpty={filteredRestaurants.length === 0}
            emptyTitle="조건에 맞는 식당이 없습니다"
            emptyDescription="검색어나 필터를 조정하거나 새 식당을 등록하세요."
            onRetry={() => void restaurantsQuery.refetch()}
          >
            {filteredRestaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-cool-gray-50">
                <td className="px-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-cool-gray-50 text-cool-gray-500 flex size-10 shrink-0 items-center justify-center rounded-md">
                      <CameraIcon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-cool-gray-900 truncate text-sm font-bold">
                        {restaurant.name}
                      </p>
                      <p className="text-cool-gray-500 text-xs">
                        {restaurant.localName || restaurant.area}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-cool-gray-600 truncate px-3 py-3 text-sm">
                  {restaurant.address}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {getGenreLabel(restaurant.genre)}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={restaurant.status} />
                </td>
                <td className="text-cool-gray-700 px-3 py-3 text-sm font-semibold">
                  {restaurant.isReservationAvailable ? '가능' : '불가'}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {restaurant.updatedAt}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ActionButton onClick={() => handleEditClick(restaurant)}>
                      <PencilIcon aria-hidden="true" className="size-4" />
                      수정
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => {
                        deleteMutation.reset()
                        setDeletingRestaurant(restaurant)
                      }}
                    >
                      삭제
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </div>

      <Drawer
        open={isDrawerOpen}
        title={editingRestaurant ? '식당 정보 수정' : '식당 등록'}
        description="등록에 필요한 정보를 단계별로 입력합니다."
        size="lg"
        onClose={() => setIsDrawerOpen(false)}
      >
        <RestaurantForm
          restaurant={editingRestaurant}
          isSubmitting={isSubmitting}
          onCancel={() => setIsDrawerOpen(false)}
          onSubmit={handleSubmit}
        />
      </Drawer>

      <ConfirmDialog
        open={deletingRestaurant != null}
        title="식당을 삭제할까요?"
        description="삭제하면 목록에서 즉시 제거됩니다. 실제 API 연동 전 mock 데이터에만 반영됩니다."
        confirmLabel="삭제"
        loading={deleteMutation.isPending}
        onCancel={() => {
          deleteMutation.reset()
          setDeletingRestaurant(null)
        }}
        onConfirm={handleDeleteConfirm}
      >
        {deletingRestaurant ? (
          <div className="space-y-3">
            <p className="bg-cool-gray-50 text-cool-gray-900 rounded-md px-3 py-2 text-sm font-bold">
              {deletingRestaurant.name}
            </p>
            {deleteMutation.isError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                {getMutationErrorMessage(deleteMutation.error)}
              </p>
            ) : null}
          </div>
        ) : null}
      </ConfirmDialog>
    </>
  )
}

const RestaurantForm = ({
  restaurant,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  restaurant: Restaurant | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (formData: RestaurantFormData) => void
}) => {
  const [formData, setFormData] = useState<RestaurantFormData>(
    restaurant ? getRestaurantFormData(restaurant) : defaultRestaurantForm,
  )
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )
  const currentStep = restaurantFormSteps[currentStepIndex]
  const isLastStep = currentStepIndex === lastRestaurantFormStepIndex
  const missingFields = getRestaurantFormMissingFields(formData)

  useEffect(() => {
    setFormData(
      restaurant ? getRestaurantFormData(restaurant) : defaultRestaurantForm,
    )
    setCurrentStepIndex(0)
    setValidationMessage(null)
  }, [restaurant])

  useEffect(() => {
    if (
      validationMessage &&
      getRestaurantFormStepMissingFields(formData, currentStep.id).length === 0
    ) {
      setValidationMessage(null)
    }
  }, [currentStep.id, formData, validationMessage])

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isLastStep) {
      handleNextStepClick()
      return
    }

    if (missingFields.length > 0) {
      const nextStepIndex = getFirstIncompleteRestaurantStepIndex(formData)
      setCurrentStepIndex(nextStepIndex)
      setValidationMessage(getMissingFieldsMessage(missingFields))
      return
    }

    onSubmit(formData)
  }

  const handleStepClick = (nextStepIndex: number) => {
    setCurrentStepIndex(nextStepIndex)
    setValidationMessage(null)
  }

  const handlePreviousStepClick = () => {
    setCurrentStepIndex(Math.max(currentStepIndex - 1, 0))
    setValidationMessage(null)
  }

  const handleNextStepClick = () => {
    const currentStepMissingFields = getRestaurantFormStepMissingFields(
      formData,
      currentStep.id,
    )

    if (currentStepMissingFields.length > 0) {
      setValidationMessage(getMissingFieldsMessage(currentStepMissingFields))
      return
    }

    setCurrentStepIndex(
      Math.min(currentStepIndex + 1, lastRestaurantFormStepIndex),
    )
    setValidationMessage(null)
  }

  const updateBusinessHour = (
    index: number,
    nextBusinessHour: RestaurantFormData['businessHours'][number],
  ) => {
    setFormData({
      ...formData,
      businessHours: formData.businessHours.map((businessHour, currentIndex) =>
        currentIndex === index ? nextBusinessHour : businessHour,
      ),
    })
  }

  const handleApplyFirstBusinessHourClick = () => {
    const firstBusinessHour = formData.businessHours[0]

    if (!firstBusinessHour) {
      return
    }

    setFormData({
      ...formData,
      businessHours: formData.businessHours.map((businessHour) => ({
        ...businessHour,
        openTime: firstBusinessHour.openTime,
        closeTime: firstBusinessHour.closeTime,
        lastOrderTime: firstBusinessHour.lastOrderTime,
        closed: firstBusinessHour.closed,
      })),
    })
  }

  const updateMenu = (
    index: number,
    nextMenu: RestaurantFormData['menus'][number],
  ) => {
    setFormData({
      ...formData,
      menus: formData.menus.map((menu, currentIndex) =>
        currentIndex === index ? nextMenu : menu,
      ),
    })
  }

  return (
    <form
      id="restaurant-form"
      className="space-y-5 pb-24"
      onSubmit={handleSubmit}
    >
      <RestaurantFormStepper
        currentStepIndex={currentStepIndex}
        formData={formData}
        onStepClick={handleStepClick}
      />

      {validationMessage ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
        >
          {validationMessage}
        </p>
      ) : null}

      {currentStep.id === 'basic' ? (
        <FormSection title="기본 정보">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="식당 한글명"
              value={formData.name}
              required
              onChange={(value) => setFormData({ ...formData, name: value })}
            />
            <FormField
              label="식당 현지명"
              value={formData.localName}
              onChange={(value) =>
                setFormData({ ...formData, localName: value })
              }
            />
          </div>
          <TextareaField
            label="식당 한 줄 소개"
            value={formData.description}
            required
            maxLength={300}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
          />
          <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
            <FormField
              label="주소"
              value={formData.address}
              required
              onChange={(value) => setFormData({ ...formData, address: value })}
            />
            <FormField
              label="지역"
              value={formData.area}
              required
              onChange={(value) => setFormData({ ...formData, area: value })}
            />
          </div>
          <AdminSelect
            className="w-full"
            label="음식 장르"
            value={formData.genre}
            options={genreFormOptions}
            onChange={(value) => setFormData({ ...formData, genre: value })}
          />
        </FormSection>
      ) : null}

      {currentStep.id === 'media' ? (
        <FormSection title="이미지 fileKey">
          <FormField
            label="대표 이미지 fileKey"
            value={formData.thumbnailFileKey}
            required
            onChange={(value) =>
              setFormData({ ...formData, thumbnailFileKey: value })
            }
          />
          <ListField
            label="추가 이미지 fileKey"
            value={formData.imageFileKeys}
            onChange={(value) =>
              setFormData({ ...formData, imageFileKeys: value })
            }
          />
        </FormSection>
      ) : null}

      {currentStep.id === 'media' ? (
        <FormSection title="예약금/가격대">
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField
              label="예약금"
              value={formData.reservationFee}
              required
              onChange={(value) =>
                setFormData({ ...formData, reservationFee: value })
              }
            />
            <NumberField
              label="최소 가격"
              value={formData.priceRange.minPrice}
              required
              onChange={(value) =>
                setFormData({
                  ...formData,
                  priceRange: { ...formData.priceRange, minPrice: value },
                })
              }
            />
            <NumberField
              label="최대 가격"
              value={formData.priceRange.maxPrice}
              required
              onChange={(value) =>
                setFormData({
                  ...formData,
                  priceRange: { ...formData.priceRange, maxPrice: value },
                })
              }
            />
          </div>
          <AdminSelect
            className="w-full"
            label="통화"
            value={formData.priceRange.currency}
            options={currencyOptions}
            onChange={(value) =>
              setFormData({
                ...formData,
                priceRange: { ...formData.priceRange, currency: value },
              })
            }
          />
        </FormSection>
      ) : null}

      {currentStep.id === 'hours' ? (
        <FormSection title="영업 시간">
          <div className="bg-cool-gray-50 flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3">
            <p className="text-cool-gray-600 text-sm leading-6">
              월요일부터 일요일까지 기본 영업일로 시작합니다. 휴무일만
              체크하거나 첫 요일 시간을 전체에 적용할 수 있습니다.
            </p>
            <button
              type="button"
              className="border-cool-gray-100 text-cool-gray-700 h-10 shrink-0 rounded-md border bg-white px-3 text-sm font-bold hover:bg-white"
              onClick={handleApplyFirstBusinessHourClick}
            >
              첫 요일 시간 전체 적용
            </button>
          </div>
          <div className="space-y-3">
            {formData.businessHours.map((businessHour, index) => (
              <BusinessHourFields
                key={`${businessHour.dayOfWeek}-${index}`}
                value={businessHour}
                onChange={(nextBusinessHour) =>
                  updateBusinessHour(index, nextBusinessHour)
                }
              />
            ))}
          </div>
        </FormSection>
      ) : null}

      {currentStep.id === 'menus' ? (
        <FormSection title="메뉴">
          <div className="space-y-3">
            {formData.menus.map((menu, index) => (
              <MenuFields
                key={`${menu.name}-${index}`}
                value={menu}
                onChange={(nextMenu) => updateMenu(index, nextMenu)}
                onRemove={() =>
                  setFormData({
                    ...formData,
                    menus: formData.menus.filter(
                      (_, currentIndex) => currentIndex !== index,
                    ),
                  })
                }
              />
            ))}
          </div>
          <button
            type="button"
            className="border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50 mt-3 h-10 rounded-md border px-3 text-sm font-bold"
            onClick={() =>
              setFormData({
                ...formData,
                menus: [...formData.menus, defaultMenu],
              })
            }
          >
            메뉴 추가
          </button>
        </FormSection>
      ) : null}

      {currentStep.id === 'menus' ? (
        <FormSection title="노출 설정">
          <CurationTypeFields
            value={formData.curationTypes}
            onChange={(value) =>
              setFormData({ ...formData, curationTypes: value })
            }
          />
          <Checkbox
            checked={formData.active}
            onChange={(event) =>
              setFormData({ ...formData, active: event.target.checked })
            }
          >
            노출 활성
          </Checkbox>
        </FormSection>
      ) : null}

      <div className="border-cool-gray-100 fixed right-0 bottom-0 z-50 flex w-full max-w-[46rem] flex-wrap justify-between gap-2 border-t bg-white px-6 py-4 shadow-[0_-10px_24px_rgba(16,24,40,0.08)]">
        <Button size="sm" variant="neutral" onClick={onCancel}>
          취소
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="neutral"
            disabled={currentStepIndex === 0}
            onClick={handlePreviousStepClick}
          >
            이전
          </Button>
          {isLastStep ? (
            <Button type="submit" size="sm" loading={isSubmitting}>
              저장
            </Button>
          ) : (
            <Button size="sm" onClick={handleNextStepClick}>
              다음
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '요청 처리 중 오류가 발생했습니다.'
}

const getRestaurantFormData = (restaurant: Restaurant): RestaurantFormData => ({
  name: restaurant.name,
  localName: restaurant.localName,
  description: restaurant.description,
  address: restaurant.address,
  area: restaurant.area,
  genre: restaurant.genre,
  thumbnailFileKey: restaurant.thumbnailFileKey,
  imageFileKeys: restaurant.imageFileKeys,
  reservationFee: restaurant.reservationFee,
  priceRange: restaurant.priceRange,
  businessHours: restaurant.businessHours,
  menus: restaurant.menus,
  curationTypes: restaurant.curationTypes,
  active: restaurant.active,
})

const getGenreLabel = (genre: RestaurantGenre) =>
  genreFormOptions.find(({ value }) => value === genre)?.label ?? genre

const getDayOfWeekLabel = (
  dayOfWeek: RestaurantFormData['businessHours'][number]['dayOfWeek'],
) =>
  dayOfWeekOptions.find(({ value }) => value === dayOfWeek)?.label ?? dayOfWeek

const RestaurantFormStepper = ({
  currentStepIndex,
  formData,
  onStepClick,
}: {
  currentStepIndex: number
  formData: RestaurantFormData
  onStepClick: (stepIndex: number) => void
}) => {
  return (
    <nav aria-label="식당 등록 단계" className="grid gap-2 md:grid-cols-4">
      {restaurantFormSteps.map((step, index) => {
        const isCurrent = index === currentStepIndex
        const isComplete =
          getRestaurantFormStepMissingFields(formData, step.id).length === 0

        return (
          <button
            key={step.id}
            type="button"
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'border-cool-gray-100 flex min-h-24 flex-col rounded-md border bg-white p-3 text-left',
              isCurrent && 'border-primary-200 bg-primary-100',
            )}
            onClick={() => onStepClick(index)}
          >
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                isCurrent
                  ? 'bg-primary-200 text-white'
                  : 'bg-cool-gray-50 text-cool-gray-600',
              )}
            >
              {index + 1}
            </span>
            <span className="text-cool-gray-900 mt-3 text-sm font-bold">
              {step.title}
            </span>
            <span className="text-cool-gray-500 mt-1 text-xs leading-5">
              {step.description}
            </span>
            <span
              className={cn(
                'mt-auto pt-2 text-xs font-bold',
                isComplete ? 'text-primary-200' : 'text-cool-gray-400',
              )}
            >
              {isComplete ? '완료' : '확인 필요'}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

const getRestaurantFormMissingFields = (formData: RestaurantFormData) =>
  restaurantFormSteps.flatMap(({ id }) =>
    getRestaurantFormStepMissingFields(formData, id),
  )

const getRestaurantFormStepMissingFields = (
  formData: RestaurantFormData,
  stepId: RestaurantFormStepId,
) => {
  if (stepId === 'basic') {
    return [
      !hasText(formData.name) ? '식당 한글명' : null,
      !hasText(formData.description) ? '식당 한 줄 소개' : null,
      !hasText(formData.address) ? '주소' : null,
      !hasText(formData.area) ? '지역' : null,
    ].filter(Boolean) as string[]
  }

  if (stepId === 'media') {
    return [
      !hasText(formData.thumbnailFileKey) ? '대표 이미지 fileKey' : null,
      formData.reservationFee < 0 ? '예약금' : null,
      formData.priceRange.minPrice < 0 ? '최소 가격' : null,
      formData.priceRange.maxPrice < formData.priceRange.minPrice
        ? '최대 가격'
        : null,
    ].filter(Boolean) as string[]
  }

  if (stepId === 'hours') {
    if (formData.businessHours.length === 0) {
      return ['영업 시간']
    }

    return formData.businessHours.flatMap((businessHour) => {
      if (businessHour.closed) {
        return []
      }

      return [
        !hasText(businessHour.openTime) ? '영업 시작 시간' : null,
        !hasText(businessHour.closeTime) ? '영업 종료 시간' : null,
      ].filter(Boolean) as string[]
    })
  }

  return formData.menus.flatMap((menu) => {
    return [
      !hasText(menu.name) ? '메뉴명' : null,
      menu.price < 0 ? '메뉴 가격' : null,
    ].filter(Boolean) as string[]
  })
}

const getFirstIncompleteRestaurantStepIndex = (
  formData: RestaurantFormData,
) => {
  const stepIndex = restaurantFormSteps.findIndex(
    ({ id }) => getRestaurantFormStepMissingFields(formData, id).length > 0,
  )

  return stepIndex < 0 ? lastRestaurantFormStepIndex : stepIndex
}

const getMissingFieldsMessage = (missingFields: string[]) => {
  const visibleFields = missingFields.slice(0, 3).join(', ')
  const restCount = missingFields.length - 3

  if (restCount > 0) {
    return `${visibleFields} 외 ${restCount}개 항목을 확인해주세요.`
  }

  return `${visibleFields} 항목을 확인해주세요.`
}

const hasText = (value: string | null | undefined) =>
  value != null && value.trim().length > 0

const FormSection = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => {
  return (
    <section className="border-cool-gray-100 space-y-4 rounded-lg border p-4">
      <h3 className="text-cool-gray-900 text-sm font-bold">{title}</h3>
      {children}
    </section>
  )
}

const FormField = ({
  label,
  value,
  required = false,
  onChange,
}: {
  label: string
  value: string
  required?: boolean
  onChange: (value: string) => void
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="border-cool-gray-100 focus:border-primary-200 h-11 rounded-md border bg-white px-3 text-sm font-semibold outline-none"
      />
    </label>
  )
}

const TextareaField = ({
  label,
  value,
  required = false,
  maxLength,
  onChange,
}: {
  label: string
  value: string
  required?: boolean
  maxLength?: number
  onChange: (value: string) => void
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      <textarea
        value={value}
        required={required}
        maxLength={maxLength}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="border-cool-gray-100 focus:border-primary-200 min-h-24 rounded-md border bg-white px-3 py-3 text-sm font-semibold outline-none"
      />
    </label>
  )
}

const NumberField = ({
  label,
  value,
  required = false,
  onChange,
}: {
  label: string
  value: number
  required?: boolean
  onChange: (value: number) => void
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        required={required}
        onChange={(event) => onChange(Number(event.target.value))}
        className="border-cool-gray-100 focus:border-primary-200 h-11 rounded-md border bg-white px-3 text-sm font-semibold outline-none"
      />
    </label>
  )
}

const ListField = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      <textarea
        value={value.join('\n')}
        rows={3}
        placeholder="fileKey를 줄바꿈으로 입력"
        onChange={(event) => onChange(getListValue(event.target.value))}
        className="border-cool-gray-100 focus:border-primary-200 min-h-24 rounded-md border bg-white px-3 py-3 text-sm font-semibold outline-none"
      />
    </label>
  )
}

const BusinessHourFields = ({
  value,
  onChange,
}: {
  value: RestaurantFormData['businessHours'][number]
  onChange: (value: RestaurantFormData['businessHours'][number]) => void
}) => {
  return (
    <div className="border-cool-gray-100 space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-cool-gray-500 text-xs font-bold">요일</p>
          <p className="text-cool-gray-900 mt-1 text-sm font-bold">
            {getDayOfWeekLabel(value.dayOfWeek)}
          </p>
        </div>
        <Checkbox
          checked={value.closed}
          onChange={(event) =>
            onChange({
              ...value,
              closed: event.target.checked,
              openTime: event.target.checked
                ? null
                : (value.openTime ?? defaultBusinessHourTime.openTime),
              closeTime: event.target.checked
                ? null
                : (value.closeTime ?? defaultBusinessHourTime.closeTime),
              lastOrderTime: event.target.checked
                ? null
                : (value.lastOrderTime ??
                  defaultBusinessHourTime.lastOrderTime),
            })
          }
        >
          휴무
        </Checkbox>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <TimeSelectField
          label="오픈"
          value={value.openTime ?? ''}
          fallbackValue={defaultBusinessHourTime.openTime}
          disabled={value.closed}
          onChange={(openTime) => onChange({ ...value, openTime })}
        />
        <TimeSelectField
          label="마감"
          value={value.closeTime ?? ''}
          fallbackValue={defaultBusinessHourTime.closeTime}
          disabled={value.closed}
          onChange={(closeTime) => onChange({ ...value, closeTime })}
        />
        <TimeSelectField
          label="라스트오더"
          value={value.lastOrderTime ?? ''}
          fallbackValue={defaultBusinessHourTime.lastOrderTime}
          disabled={value.closed}
          onChange={(lastOrderTime) => onChange({ ...value, lastOrderTime })}
        />
      </div>
    </div>
  )
}

const TimeSelectField = ({
  label,
  value,
  fallbackValue,
  disabled = false,
  onChange,
}: {
  label: string
  value: string
  fallbackValue: string
  disabled?: boolean
  onChange: (value: string) => void
}) => {
  const normalizedValue = getNormalizedTimeValue(value || fallbackValue)
  const [hour, minute] = normalizedValue.split(':')

  return (
    <div className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      {disabled ? (
        <div className="border-cool-gray-100 text-cool-gray-400 bg-cool-gray-50 flex h-11 items-center rounded-md border px-3 text-sm font-bold">
          휴무
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <AdminSelect
            className="min-w-0"
            label="시"
            value={hour}
            options={timeHourOptions}
            onChange={(nextHour) => onChange(`${nextHour}:${minute}`)}
          />
          <AdminSelect
            className="min-w-0"
            label="분"
            value={minute}
            options={timeMinuteOptions}
            onChange={(nextMinute) => onChange(`${hour}:${nextMinute}`)}
          />
        </div>
      )}
    </div>
  )
}

const MenuFields = ({
  value,
  onChange,
  onRemove,
}: {
  value: RestaurantFormData['menus'][number]
  onChange: (value: RestaurantFormData['menus'][number]) => void
  onRemove: () => void
}) => {
  return (
    <div className="border-cool-gray-100 space-y-3 rounded-md border p-3">
      <div className="flex items-start justify-between gap-3">
        <FormField
          label="메뉴명"
          value={value.name}
          required
          onChange={(name) => onChange({ ...value, name })}
        />
        <button
          type="button"
          className="mt-7 h-9 shrink-0 rounded-md px-2 text-sm font-bold text-red-600 hover:bg-red-50"
          onClick={onRemove}
        >
          삭제
        </button>
      </div>
      <TextareaField
        label="메뉴 설명"
        value={value.description ?? ''}
        maxLength={500}
        onChange={(description) => onChange({ ...value, description })}
      />
      <FormField
        label="메뉴 이미지 fileKey"
        value={value.imageFileKey ?? ''}
        onChange={(imageFileKey) => onChange({ ...value, imageFileKey })}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <AdminSelect
          className="w-full"
          label="통화"
          value={value.currency}
          options={currencyOptions}
          onChange={(currency) => onChange({ ...value, currency })}
        />
        <NumberField
          label="가격"
          value={value.price}
          required
          onChange={(price) => onChange({ ...value, price })}
        />
      </div>
      <Checkbox
        checked={value.representative}
        onChange={(event) =>
          onChange({ ...value, representative: event.target.checked })
        }
      >
        대표 메뉴
      </Checkbox>
    </div>
  )
}

const CurationTypeFields = ({
  value,
  onChange,
}: {
  value: RestaurantFormData['curationTypes']
  onChange: (value: RestaurantFormData['curationTypes']) => void
}) => {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {curationTypeOptions.map(({ value: curationType, label }) => (
        <Checkbox
          key={curationType}
          checked={value.includes(curationType)}
          onChange={(event) => {
            if (event.target.checked) {
              onChange([...value, curationType])
              return
            }

            onChange(value.filter((item) => item !== curationType))
          }}
        >
          {label}
        </Checkbox>
      ))}
    </div>
  )
}

const getListValue = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const getNormalizedTimeValue = (value: string) => {
  const [hour = '00', minute = '00'] = value.split(':')
  const normalizedHour = timeHourOptions.some((option) => option.value === hour)
    ? hour
    : '00'
  const normalizedMinute = timeMinuteOptions.some(
    (option) => option.value === minute,
  )
    ? minute
    : '00'

  return `${normalizedHour}:${normalizedMinute}`
}
