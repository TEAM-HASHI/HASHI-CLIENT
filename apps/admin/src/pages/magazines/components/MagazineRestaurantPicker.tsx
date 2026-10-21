import {
  CloseSmallIcon,
  SearchIcon,
  TapDownIcon,
  TapUpIcon,
} from '@hashi/hds-icons'
import { Button, IconButton } from '@hashi/hds-ui'
import { useState } from 'react'
import {
  MAGAZINE_RESTAURANT_LIMIT,
  type MagazineRestaurant,
} from '@/pages/magazines/magazineForm'
import { useRestaurantCatalogQuery } from '@/pages/restaurants/queries/useRestaurantCatalogQuery'

export const MagazineRestaurantPicker = ({
  value,
  onChange,
}: {
  value: MagazineRestaurant[]
  onChange: (restaurants: MagazineRestaurant[]) => void
}) => {
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const query = useRestaurantCatalogQuery({
    keyword: search || undefined,
    size: 20,
  })
  const selectedIds = new Set(
    value.map((restaurant) => restaurant.restaurantId),
  )
  const results = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.content ?? []) ?? [])
        .filter(
          (restaurant) =>
            Number.isSafeInteger(restaurant.restaurantId) &&
            restaurant.restaurantId! > 0,
        )
        .map((restaurant) => [restaurant.restaurantId, restaurant]),
    ).values(),
  ]

  const move = (index: number, offset: number) => {
    const target = index + offset
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    onChange(next)
  }

  return (
    <section
      className="border-cool-gray-100 space-y-3 border-t pt-5"
      aria-label="연결 식당"
    >
      <h3 className="text-sm font-bold">
        연결 식당{' '}
        <span className="text-cool-gray-500">
          {value.length}/{MAGAZINE_RESTAURANT_LIMIT}
        </span>
      </h3>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(keyword.trim())
        }}
      >
        <input
          aria-label="연결할 식당 검색"
          type="search"
          placeholder="식당명 검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="border-cool-gray-100 h-10 min-w-0 flex-1 rounded-md border px-3 text-sm"
        />
        <IconButton
          type="submit"
          aria-label="식당 검색"
          title="식당 검색"
          size="sm"
        >
          <SearchIcon className="size-5" />
        </IconButton>
      </form>
      <div
        className="border-cool-gray-100 max-h-64 overflow-y-auto rounded-md border"
        aria-label="식당 검색 결과"
        aria-busy={query.isFetching}
      >
        {query.isPending ? (
          <p role="status" className="p-4 text-sm">
            식당을 불러오는 중입니다.
          </p>
        ) : null}
        {results.map((restaurant) => {
          const id = restaurant.restaurantId!
          const selected = selectedIds.has(id)
          const imageUrl = restaurant.thumbnailImage
            ? restaurant.thumbnailImage.image?.status === 'READY'
              ? restaurant.thumbnailImage.image.defaultSource?.url
              : restaurant.thumbnailImage.legacyUrl
            : (restaurant.thumbnailUrl ?? restaurant.imageUrls?.[0])
          const selectedRestaurant = {
            restaurantId: id,
            name: restaurant.name ?? `식당 #${id}`,
            area: restaurant.area,
            imageUrl,
          }
          return (
            <label
              key={id}
              className="border-cool-gray-100 flex items-center gap-3 border-b p-3 last:border-b-0"
            >
              <input
                type="checkbox"
                aria-label={`${restaurant.name ?? `식당 #${id}`} 선택`}
                checked={selected}
                disabled={
                  !selected && value.length >= MAGAZINE_RESTAURANT_LIMIT
                }
                onChange={() => {
                  if (selected)
                    onChange(value.filter((item) => item.restaurantId !== id))
                  else if (value.length < MAGAZINE_RESTAURANT_LIMIT)
                    onChange([...value, selectedRestaurant])
                }}
              />
              <RestaurantLabel restaurant={selectedRestaurant} />
            </label>
          )
        })}
        {!query.isPending && !query.isError && results.length === 0 ? (
          <p className="p-4 text-sm">검색 결과가 없습니다.</p>
        ) : null}
        {query.isError ? (
          <div role="alert" className="space-y-2 p-3 text-sm">
            <p>식당을 불러오지 못했습니다.</p>
            <Button
              size="sm"
              variant="neutral"
              onClick={() =>
                void (query.isFetchNextPageError
                  ? query.fetchNextPage()
                  : query.refetch())
              }
            >
              다시 시도
            </Button>
          </div>
        ) : query.hasNextPage ? (
          <div className="p-3">
            <Button
              size="sm"
              variant="neutral"
              loading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              더 보기
            </Button>
          </div>
        ) : null}
      </div>
      {value.length ? (
        <ol aria-label="선택한 식당" className="divide-cool-gray-100 divide-y">
          {value.map((restaurant, index) => (
            <li
              key={restaurant.restaurantId}
              className="flex items-center gap-2 py-3"
            >
              <span className="text-cool-gray-500 w-5 shrink-0 text-sm">
                {index + 1}
              </span>
              <RestaurantLabel restaurant={restaurant} />
              <div className="flex shrink-0 gap-1">
                <IconButton
                  size="xs"
                  aria-label={`${restaurant.name} 앞으로 이동`}
                  title="앞으로 이동"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <TapUpIcon className="size-4" />
                </IconButton>
                <IconButton
                  size="xs"
                  aria-label={`${restaurant.name} 뒤로 이동`}
                  title="뒤로 이동"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <TapDownIcon className="size-4" />
                </IconButton>
                <IconButton
                  size="xs"
                  aria-label={`${restaurant.name} 연결 제거`}
                  title="연결 제거"
                  onClick={() =>
                    onChange(
                      value.filter(
                        (item) => item.restaurantId !== restaurant.restaurantId,
                      ),
                    )
                  }
                >
                  <CloseSmallIcon className="size-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}

const RestaurantLabel = ({
  restaurant,
}: {
  restaurant: MagazineRestaurant
}) => (
  <>
    {restaurant.imageUrl ? (
      <img
        src={restaurant.imageUrl}
        alt=""
        className="size-10 shrink-0 rounded object-cover"
      />
    ) : (
      <span className="bg-cool-gray-100 size-10 shrink-0 rounded" />
    )}
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold break-words">
        {restaurant.name}
      </span>
      {restaurant.area ? (
        <span className="text-cool-gray-500 block text-xs">
          {restaurant.area}
        </span>
      ) : null}
    </span>
  </>
)
