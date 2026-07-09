import { CameraIcon, PencilIcon, PlusIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import {
  type ChangeEvent,
  type ReactNode,
  type SyntheticEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  Magazine,
  MagazineFormData,
  MagazineGenre,
  MagazineRegion,
  MagazineSeries,
  MockScenario,
} from '@/shared/api/adminTypes'
import {
  useCreateMagazineMutation,
  useDeleteMagazineMutation,
  useMagazinesQuery,
  useRestaurantsQuery,
  useUpdateMagazineMutation,
} from '@/shared/api/adminHooks'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminSearchInput } from '@/shared/components/AdminSearchInput'
import { AdminSelect, type SelectOption } from '@/shared/components/AdminSelect'
import { AdminTable } from '@/shared/components/AdminTable'
import { AdminToolbar } from '@/shared/components/AdminToolbar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Drawer } from '@/shared/components/Drawer'
import { PageHeader } from '@/shared/components/PageHeader'

type RegionFilter = 'all' | MagazineRegion
type SeriesFilter = 'all' | MagazineSeries
type GenreFilter = 'all' | MagazineGenre

const scenarioOptions: SelectOption<MockScenario>[] = [
  { value: 'success', label: '정상' },
  { value: 'empty', label: '빈 데이터' },
  { value: 'error', label: '오류' },
]

const regionOptions: SelectOption<MagazineRegion>[] = [
  { value: 'TOKYO', label: '도쿄' },
  { value: 'OSAKA', label: '오사카' },
  { value: 'KYOTO', label: '교토' },
  { value: 'FUKUOKA', label: '후쿠오카' },
  { value: 'SAPPORO', label: '삿포로' },
]

const seriesOptions: SelectOption<MagazineSeries>[] = [
  { value: 'WEEKLY', label: '위클리' },
  { value: 'THEME', label: '테마' },
  { value: 'EDITOR_PICK', label: '에디터픽' },
  { value: 'SEASONAL', label: '시즌' },
]

const genreOptions: SelectOption<MagazineGenre>[] = [
  { value: 'IZAKAYA', label: '이자카야' },
  { value: 'SUSHI', label: '스시' },
  { value: 'RAMEN', label: '라멘' },
  { value: 'YAKINIKU', label: '야키니쿠' },
  { value: 'CAFE', label: '카페' },
  { value: 'KOREAN', label: '한식' },
  { value: 'WESTERN', label: '양식' },
]

const regionFilterOptions: SelectOption<RegionFilter>[] = [
  { value: 'all', label: '전체' },
  ...regionOptions,
]

const seriesFilterOptions: SelectOption<SeriesFilter>[] = [
  { value: 'all', label: '전체' },
  ...seriesOptions,
]

const genreFilterOptions: SelectOption<GenreFilter>[] = [
  { value: 'all', label: '전체' },
  ...genreOptions,
]

const tableColumns = [
  { key: 'banner', label: '배너', className: 'w-28' },
  { key: 'title', label: '제목', className: 'w-80' },
  { key: 'region', label: '지역', className: 'w-28' },
  { key: 'series', label: '시리즈', className: 'w-28' },
  { key: 'genre', label: '장르', className: 'w-28' },
  { key: 'cards', label: '카드뉴스', className: 'w-24' },
  { key: 'restaurants', label: '관련 식당', className: 'w-28' },
  { key: 'updatedAt', label: '수정일', className: 'w-44' },
  { key: 'actions', label: '액션', className: 'w-40' },
]

const defaultMagazineForm: MagazineFormData = {
  title: '',
  content: '',
  region: 'TOKYO',
  series: 'WEEKLY',
  genre: 'IZAKAYA',
  bannerImageKey: '',
  cards: [],
  restaurants: [],
}

const getOptionLabel = <TValue extends string>(
  options: SelectOption<TValue>[],
  value: TValue,
) => options.find((option) => option.value === value)?.label ?? value

const formatDateTime = (value: string) => value.replace('T', ' ').slice(0, 16)

const formatMagazineId = (id: number) => `MAG-${id}`

const getRestaurantNumericId = (restaurantId: string) =>
  Number(restaurantId.replace(/^[A-Z]+-/, '')) || 0

const getSafeFileName = (fileName: string) =>
  fileName.toLowerCase().replace(/[^a-z0-9.]+/g, '-')

const getGeneratedImageKey = (kind: string, fileName: string) =>
  `magazines/temp/${Date.now()}-${kind}-${getSafeFileName(fileName)}`

const getMagazineFormData = (magazine: Magazine | null): MagazineFormData =>
  magazine
    ? {
        title: magazine.title,
        content: magazine.content,
        region: magazine.region,
        series: magazine.series,
        genre: magazine.genre,
        bannerImageKey: magazine.bannerImageKey,
        cards: magazine.cards,
        restaurants: magazine.restaurants,
      }
    : defaultMagazineForm

export const MagazinesPage = () => {
  const [scenario, setScenario] = useState<MockScenario>('success')
  const [searchText, setSearchText] = useState('')
  const deferredSearchText = useDeferredValue(searchText)
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all')
  const [seriesFilter, setSeriesFilter] = useState<SeriesFilter>('all')
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all')
  const [editingMagazine, setEditingMagazine] = useState<Magazine | null>(null)
  const [deletingMagazine, setDeletingMagazine] = useState<Magazine | null>(
    null,
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const magazinesQuery = useMagazinesQuery(scenario)
  const restaurantsQuery = useRestaurantsQuery('success')
  const createMutation = useCreateMagazineMutation()
  const updateMutation = useUpdateMagazineMutation()
  const deleteMutation = useDeleteMagazineMutation()
  const magazines = magazinesQuery.data ?? []

  const restaurantOptions = useMemo<SelectOption<string>[]>(() => {
    return (restaurantsQuery.data ?? []).map((restaurant) => {
      const numericId = getRestaurantNumericId(restaurant.id)

      return {
        value: String(numericId),
        label: `${restaurant.name} (${numericId})`,
      }
    })
  }, [restaurantsQuery.data])

  const filteredMagazines = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase()

    return [...magazines]
      .filter((magazine) => {
        const searchableText = [
          magazine.title,
          magazine.content,
          getOptionLabel(regionOptions, magazine.region),
          getOptionLabel(seriesOptions, magazine.series),
          getOptionLabel(genreOptions, magazine.genre),
        ]
          .join(' ')
          .toLowerCase()
        const matchesKeyword =
          keyword.length === 0 || searchableText.includes(keyword)
        const matchesRegion =
          regionFilter === 'all' || magazine.region === regionFilter
        const matchesSeries =
          seriesFilter === 'all' || magazine.series === seriesFilter
        const matchesGenre =
          genreFilter === 'all' || magazine.genre === genreFilter

        return matchesKeyword && matchesRegion && matchesSeries && matchesGenre
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [deferredSearchText, genreFilter, magazines, regionFilter, seriesFilter])

  const handleCreateClick = () => {
    setEditingMagazine(null)
    setIsDrawerOpen(true)
  }

  const handleEditClick = (magazine: Magazine) => {
    setEditingMagazine(magazine)
    setIsDrawerOpen(true)
  }

  const handleSubmit = (formData: MagazineFormData) => {
    if (editingMagazine) {
      updateMutation.mutate(
        { magazineId: String(editingMagazine.id), input: formData },
        {
          onSuccess: () => {
            setIsDrawerOpen(false)
            setEditingMagazine(null)
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
    if (!deletingMagazine) {
      return
    }

    deleteMutation.mutate(String(deletingMagazine.id), {
      onSuccess: () => {
        setDeletingMagazine(null)
      },
    })
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <PageHeader
        title="매거진 관리"
        description="배너, 카드뉴스, 관련 식당 구성을 관리합니다."
      >
        <Button
          size="sm"
          leftIcon={<PlusIcon className="size-4" />}
          onClick={handleCreateClick}
        >
          매거진 생성
        </Button>
      </PageHeader>

      <AdminToolbar>
        <AdminSearchInput
          value={searchText}
          placeholder="제목, 본문, 지역, 장르로 검색"
          onChange={setSearchText}
        />
        <AdminSelect
          label="지역"
          value={regionFilter}
          options={regionFilterOptions}
          onChange={setRegionFilter}
        />
        <AdminSelect
          label="시리즈"
          value={seriesFilter}
          options={seriesFilterOptions}
          onChange={setSeriesFilter}
        />
        <AdminSelect
          label="장르"
          value={genreFilter}
          options={genreFilterOptions}
          onChange={setGenreFilter}
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
          <span>총 {filteredMagazines.length.toLocaleString()}개 매거진</span>
          <p>배너 1개, 카드뉴스 N개, 관련 식당 N개 구조로 저장합니다.</p>
        </div>

        <div className="border-cool-gray-100 overflow-hidden rounded-lg border">
          <AdminTable
            columns={tableColumns}
            isLoading={magazinesQuery.isLoading}
            isError={magazinesQuery.isError}
            isEmpty={filteredMagazines.length === 0}
            emptyTitle="조건에 맞는 매거진이 없습니다"
            emptyDescription="검색어나 필터를 조정하거나 새 매거진을 생성하세요."
            onRetry={() => void magazinesQuery.refetch()}
          >
            {filteredMagazines.map((magazine) => (
              <tr key={magazine.id} className="hover:bg-cool-gray-50">
                <td className="px-3 py-3">
                  {magazine.bannerUrl ? (
                    <img
                      src={magazine.bannerUrl}
                      alt=""
                      className="h-14 w-20 rounded-md object-cover"
                    />
                  ) : (
                    <span className="bg-cool-gray-50 text-cool-gray-500 flex h-14 w-20 items-center justify-center rounded-md">
                      <CameraIcon aria-hidden="true" className="size-5" />
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <p className="text-cool-gray-900 truncate text-sm font-bold">
                    {magazine.title}
                  </p>
                  <p className="text-cool-gray-500 mt-1 truncate text-xs">
                    {formatMagazineId(magazine.id)}
                  </p>
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {getOptionLabel(regionOptions, magazine.region)}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {getOptionLabel(seriesOptions, magazine.series)}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {getOptionLabel(genreOptions, magazine.genre)}
                </td>
                <td className="text-cool-gray-700 px-3 py-3 text-sm font-semibold">
                  {magazine.cards.length.toLocaleString()}개
                </td>
                <td className="text-cool-gray-700 px-3 py-3 text-sm font-semibold">
                  {magazine.restaurants.length.toLocaleString()}개
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {formatDateTime(magazine.updatedAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ActionButton onClick={() => handleEditClick(magazine)}>
                      <PencilIcon aria-hidden="true" className="size-4" />
                      수정
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => setDeletingMagazine(magazine)}
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
        title={editingMagazine ? '매거진 수정' : '매거진 생성'}
        description="배너 이미지 key, 카드뉴스, 관련 식당을 API 요청 형태로 저장합니다."
        size="lg"
        onClose={() => setIsDrawerOpen(false)}
        footer={
          <>
            <Button
              size="sm"
              variant="neutral"
              onClick={() => setIsDrawerOpen(false)}
            >
              취소
            </Button>
            <Button
              form="magazine-form"
              type="submit"
              size="sm"
              loading={isSubmitting}
            >
              저장
            </Button>
          </>
        }
      >
        <MagazineForm
          magazine={editingMagazine}
          restaurantOptions={restaurantOptions}
          onSubmit={handleSubmit}
        />
      </Drawer>

      <ConfirmDialog
        open={deletingMagazine != null}
        title="매거진을 삭제할까요?"
        description="삭제하면 목록에서 즉시 제거됩니다. 실제 API 연동 전 mock 데이터에만 반영됩니다."
        confirmLabel="삭제"
        loading={deleteMutation.isPending}
        onCancel={() => setDeletingMagazine(null)}
        onConfirm={handleDeleteConfirm}
      >
        {deletingMagazine ? (
          <p className="bg-cool-gray-50 text-cool-gray-900 rounded-md px-3 py-2 text-sm font-bold">
            {deletingMagazine.title}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  )
}

const MagazineForm = ({
  magazine,
  restaurantOptions,
  onSubmit,
}: {
  magazine: Magazine | null
  restaurantOptions: SelectOption<string>[]
  onSubmit: (formData: MagazineFormData) => void
}) => {
  const [formData, setFormData] = useState<MagazineFormData>(
    getMagazineFormData(magazine),
  )
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(
    magazine?.bannerUrl ?? '',
  )

  useEffect(() => {
    setFormData(getMagazineFormData(magazine))
    setBannerPreviewUrl(magazine?.bannerUrl ?? '')
  }, [magazine])

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreviewUrl)
      }
    }
  }, [bannerPreviewUrl])

  const updateFormData = (nextFormData: Partial<MagazineFormData>) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      ...nextFormData,
    }))
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(formData)
  }

  const handleBannerFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setBannerPreviewUrl(URL.createObjectURL(file))
    updateFormData({
      bannerImageKey: getGeneratedImageKey('banner', file.name),
    })
  }

  const handleAddCardClick = () => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      cards: [
        ...currentFormData.cards,
        { imageKey: '', displayOrder: currentFormData.cards.length },
      ],
    }))
  }

  const handleCardImageFileChange = (
    cardIndex: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    updateCard(cardIndex, {
      imageKey: getGeneratedImageKey(`card-${cardIndex + 1}`, file.name),
    })
  }

  const updateCard = (
    cardIndex: number,
    nextCard: Partial<MagazineFormData['cards'][number]>,
  ) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      cards: currentFormData.cards.map((card, index) =>
        index === cardIndex ? { ...card, ...nextCard } : card,
      ),
    }))
  }

  const removeCard = (cardIndex: number) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      cards: currentFormData.cards.filter((_, index) => index !== cardIndex),
    }))
  }

  const handleAddRestaurantClick = () => {
    const firstRestaurantId = Number(restaurantOptions[0]?.value ?? 0)

    setFormData((currentFormData) => ({
      ...currentFormData,
      restaurants: [
        ...currentFormData.restaurants,
        {
          restaurantId: firstRestaurantId,
          displayOrder: currentFormData.restaurants.length,
        },
      ],
    }))
  }

  const updateRestaurant = (
    restaurantIndex: number,
    nextRestaurant: Partial<MagazineFormData['restaurants'][number]>,
  ) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      restaurants: currentFormData.restaurants.map((restaurant, index) =>
        index === restaurantIndex
          ? { ...restaurant, ...nextRestaurant }
          : restaurant,
      ),
    }))
  }

  const removeRestaurant = (restaurantIndex: number) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      restaurants: currentFormData.restaurants.filter(
        (_, index) => index !== restaurantIndex,
      ),
    }))
  }

  return (
    <form id="magazine-form" className="space-y-6" onSubmit={handleSubmit}>
      <FormSection title="기본 정보">
        <FormField
          label="제목"
          value={formData.title}
          required
          maxLength={150}
          onChange={(value) => updateFormData({ title: value })}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminSelect
            className="w-full"
            label="지역"
            value={formData.region}
            options={regionOptions}
            onChange={(value) => updateFormData({ region: value })}
          />
          <AdminSelect
            className="w-full"
            label="시리즈"
            value={formData.series}
            options={seriesOptions}
            onChange={(value) => updateFormData({ series: value })}
          />
          <AdminSelect
            className="w-full"
            label="장르"
            value={formData.genre}
            options={genreOptions}
            onChange={(value) => updateFormData({ genre: value })}
          />
        </div>
      </FormSection>

      <FormSection title="배너">
        <div className="border-cool-gray-100 overflow-hidden rounded-lg border">
          {bannerPreviewUrl ? (
            <img
              src={bannerPreviewUrl}
              alt=""
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="bg-cool-gray-50 text-cool-gray-400 flex h-48 items-center justify-center">
              <CameraIcon aria-hidden="true" className="size-10" />
            </div>
          )}
          <label className="border-cool-gray-100 text-primary-200 flex cursor-pointer items-center justify-center gap-2 border-t px-4 py-3 text-sm font-bold">
            <CameraIcon aria-hidden="true" className="size-4" />
            배너 이미지 선택
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleBannerFileChange}
            />
          </label>
        </div>
        <FormField
          label="배너 이미지 key"
          value={formData.bannerImageKey}
          required
          maxLength={500}
          placeholder="magazines/temp/a1b2c3-banner.jpg"
          onChange={(value) => updateFormData({ bannerImageKey: value })}
        />
      </FormSection>

      <FormSection title="본문">
        <TextAreaField
          label="내용"
          value={formData.content}
          placeholder="매거진 본문을 입력하세요."
          onChange={(value) => updateFormData({ content: value })}
        />
      </FormSection>

      <FormSection
        title="카드뉴스"
        description="보내면 카드뉴스 목록이 전체 교체됩니다."
        action={
          <Button
            type="button"
            size="sm"
            variant="neutral"
            leftIcon={<PlusIcon className="size-4" />}
            onClick={handleAddCardClick}
          >
            카드 추가
          </Button>
        }
      >
        {formData.cards.length === 0 ? (
          <EmptyFormList text="카드뉴스 이미지가 없습니다." />
        ) : (
          <div className="space-y-3">
            {formData.cards.map((card, cardIndex) => (
              <div
                key={`${card.displayOrder}-${cardIndex}`}
                className="border-cool-gray-100 rounded-lg border p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-cool-gray-900 text-sm font-bold">
                    카드 {cardIndex + 1}
                  </p>
                  <button
                    type="button"
                    className="text-error text-xs font-bold"
                    onClick={() => removeCard(cardIndex)}
                  >
                    삭제
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                  <FormField
                    label="카드 이미지 key"
                    value={card.imageKey}
                    required
                    maxLength={500}
                    placeholder="magazines/temp/a1b2c3-card1.jpg"
                    onChange={(value) =>
                      updateCard(cardIndex, { imageKey: value })
                    }
                  />
                  <NumberField
                    label="노출 순서"
                    value={card.displayOrder}
                    min={0}
                    onChange={(value) =>
                      updateCard(cardIndex, { displayOrder: value })
                    }
                  />
                </div>
                <label className="text-primary-200 mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-bold">
                  <CameraIcon aria-hidden="true" className="size-4" />
                  카드 이미지 선택
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) =>
                      handleCardImageFileChange(cardIndex, event)
                    }
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      <FormSection
        title="관련 식당"
        description="보내면 관련 식당 목록이 전체 교체됩니다."
        action={
          <Button
            type="button"
            size="sm"
            variant="neutral"
            leftIcon={<PlusIcon className="size-4" />}
            onClick={handleAddRestaurantClick}
          >
            식당 추가
          </Button>
        }
      >
        {formData.restaurants.length === 0 ? (
          <EmptyFormList text="관련 식당이 없습니다." />
        ) : (
          <div className="space-y-3">
            {formData.restaurants.map((restaurant, restaurantIndex) => (
              <div
                key={`${restaurant.restaurantId}-${restaurantIndex}`}
                className="border-cool-gray-100 rounded-lg border p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-cool-gray-900 text-sm font-bold">
                    관련 식당 {restaurantIndex + 1}
                  </p>
                  <button
                    type="button"
                    className="text-error text-xs font-bold"
                    onClick={() => removeRestaurant(restaurantIndex)}
                  >
                    삭제
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                  {restaurantOptions.length > 0 ? (
                    <AdminSelect
                      className="w-full"
                      label="식당"
                      value={String(restaurant.restaurantId)}
                      options={getRestaurantSelectOptions(
                        restaurantOptions,
                        restaurant.restaurantId,
                      )}
                      onChange={(value) =>
                        updateRestaurant(restaurantIndex, {
                          restaurantId: Number(value),
                        })
                      }
                    />
                  ) : (
                    <NumberField
                      label="식당 ID"
                      value={restaurant.restaurantId}
                      min={0}
                      onChange={(value) =>
                        updateRestaurant(restaurantIndex, {
                          restaurantId: value,
                        })
                      }
                    />
                  )}
                  <NumberField
                    label="노출 순서"
                    value={restaurant.displayOrder}
                    min={0}
                    onChange={(value) =>
                      updateRestaurant(restaurantIndex, {
                        displayOrder: value,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </form>
  )
}

const getRestaurantSelectOptions = (
  restaurantOptions: SelectOption<string>[],
  restaurantId: number,
) => {
  const currentValue = String(restaurantId)
  const hasCurrentValue = restaurantOptions.some(
    (option) => option.value === currentValue,
  )

  if (hasCurrentValue) {
    return restaurantOptions
  }

  return [
    { value: currentValue, label: `식당 ID ${currentValue}` },
    ...restaurantOptions,
  ]
}

const FormSection = ({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) => {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-cool-gray-900 text-sm font-bold">{title}</h3>
          {description ? (
            <p className="text-cool-gray-500 mt-1 text-xs">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

const FormField = ({
  label,
  value,
  required = false,
  maxLength,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  required?: boolean
  maxLength?: number
  placeholder?: string
  onChange: (value: string) => void
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      <input
        value={value}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-cool-gray-100 focus:border-primary-200 h-11 rounded-md border bg-white px-3 text-sm font-semibold outline-none"
      />
    </label>
  )
}

const NumberField = ({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        className="border-cool-gray-100 focus:border-primary-200 h-11 rounded-md border bg-white px-3 text-sm font-semibold outline-none"
      />
    </label>
  )
}

const TextAreaField = ({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-cool-gray-800 text-sm font-bold">{label}</span>
      <textarea
        value={value}
        rows={5}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-cool-gray-100 focus:border-primary-200 min-h-32 resize-y rounded-md border bg-white px-3 py-3 text-sm font-semibold outline-none"
      />
    </label>
  )
}

const EmptyFormList = ({ text }: { text: string }) => {
  return (
    <div className="border-cool-gray-100 bg-cool-gray-50 text-cool-gray-500 rounded-lg border px-4 py-6 text-center text-sm">
      {text}
    </div>
  )
}
