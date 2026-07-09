import {
  CalendarIcon,
  HashiPickIcon,
  MagazineIcon,
  ReservationIcon,
  TodayRestaurantIcon,
} from '@hashi/hds-icons'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import type { RestaurantGenre } from '@/shared/api/adminTypes'
import {
  useDashboardMetricsQuery,
  useReservationsQuery,
  useRestaurantsQuery,
} from '@/shared/api/adminHooks'
import { AdminTable } from '@/shared/components/AdminTable'
import { MetricCard } from '@/shared/components/MetricCard'
import { PageHeader } from '@/shared/components/PageHeader'
import { StatusBadge } from '@/shared/components/StatusBadge'

const reservationColumns = [
  { key: 'id', label: '예약 ID', className: 'w-32' },
  { key: 'user', label: '예약자', className: 'w-32' },
  { key: 'restaurant', label: '식당', className: 'w-56' },
  { key: 'reservedAt', label: '예약 일시', className: 'w-44' },
  { key: 'status', label: '상태', className: 'w-28' },
]

const restaurantColumns = [
  { key: 'name', label: '식당명', className: 'w-52' },
  { key: 'address', label: '주소', className: 'w-72' },
  { key: 'genre', label: '장르', className: 'w-28' },
  { key: 'updatedAt', label: '수정일', className: 'w-44' },
]

const getRestaurantGenreLabel = (genre: RestaurantGenre) => {
  const genreMap: Record<RestaurantGenre, string> = {
    sushi: '스시',
    noodle: '면',
    'rice-bowl': '덮밥',
    nabe: '나베',
    fried: '튀김',
    grill: '구이',
    etc: '기타',
  }

  return genreMap[genre]
}

const formatDateTime = (value: string) => value.replace('T', ' ').slice(0, 16)

const formatReservationId = (id: number) => `RSV-${id}`

export const DashboardPage = () => {
  const metricsQuery = useDashboardMetricsQuery()
  const reservationsQuery = useReservationsQuery('success')
  const restaurantsQuery = useRestaurantsQuery('success')

  const metrics = metricsQuery.data
  const reservations = reservationsQuery.data?.slice(0, 5) ?? []
  const restaurants = restaurantsQuery.data?.slice(0, 5) ?? []

  return (
    <>
      <PageHeader
        title="대시보드"
        description="오늘 확인해야 할 운영 지표와 최근 변경 사항을 모아봅니다."
      />

      <div className="space-y-6 px-5 py-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="총 식당 수"
            value={metrics ? metrics.totalRestaurants.toLocaleString() : '...'}
            description="mock adapter 기준 등록 식당"
            icon={<TodayRestaurantIcon aria-hidden="true" className="size-6" />}
          />
          <MetricCard
            label="오늘 예약"
            value={metrics ? metrics.todayReservations.toLocaleString() : '...'}
            description="2026년 7월 9일 예약 건"
            icon={<CalendarIcon aria-hidden="true" className="size-6" />}
          />
          <MetricCard
            label="대기 예약"
            value={
              metrics ? metrics.pendingReservations.toLocaleString() : '...'
            }
            description="관리자 확인이 필요한 예약"
            icon={<ReservationIcon aria-hidden="true" className="size-6" />}
          />
          <MetricCard
            label="등록 매거진"
            value={metrics ? metrics.magazineCount.toLocaleString() : '...'}
            description="매거진 API 기준 생성 수"
            icon={<MagazineIcon aria-hidden="true" className="size-6" />}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_20rem]">
          <div className="border-cool-gray-100 overflow-hidden rounded-lg border">
            <div className="border-cool-gray-100 border-b bg-white px-5 py-4">
              <h2 className="text-cool-gray-900 text-base font-bold">
                최근 예약
              </h2>
            </div>
            <AdminTable
              columns={reservationColumns}
              isLoading={reservationsQuery.isLoading}
              isError={reservationsQuery.isError}
              isEmpty={reservations.length === 0}
              emptyTitle="최근 예약이 없습니다"
              emptyDescription="예약 데이터가 생성되면 이 영역에 표시됩니다."
              onRetry={() => void reservationsQuery.refetch()}
            >
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-cool-gray-50">
                  <td className="text-cool-gray-700 px-3 py-3 text-sm font-bold">
                    {formatReservationId(reservation.id)}
                  </td>
                  <td className="text-cool-gray-700 px-3 py-3 text-sm">
                    {reservation.user.nickname}
                  </td>
                  <td className="text-cool-gray-900 truncate px-3 py-3 text-sm font-semibold">
                    {reservation.restaurant.name}
                  </td>
                  <td className="text-cool-gray-600 px-3 py-3 text-sm">
                    {formatDateTime(reservation.reservedAt)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={reservation.reservationStatus} />
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <aside className="border-cool-gray-100 rounded-lg border bg-white p-5">
            <h2 className="text-cool-gray-900 text-base font-bold">
              빠른 액션
            </h2>
            <div className="mt-4 space-y-2">
              <QuickLink to={ROUTES.restaurants} label="식당 등록/수정" />
              <QuickLink to={ROUTES.reservations} label="예약 상태 관리" />
              <QuickLink to={ROUTES.magazines} label="매거진 생성/수정" />
            </div>
            <div className="bg-cool-gray-50 mt-6 rounded-lg p-4">
              <HashiPickIcon
                aria-hidden="true"
                className="text-primary-200 size-8"
              />
              <p className="text-cool-gray-900 mt-3 text-sm font-bold">
                API 미확정 구간
              </p>
              <p className="text-cool-gray-500 mt-1 text-sm leading-6">
                화면은 mock adapter와 query key 기준으로 동작합니다.
              </p>
            </div>
          </aside>
        </section>

        <section className="border-cool-gray-100 overflow-hidden rounded-lg border">
          <div className="border-cool-gray-100 border-b bg-white px-5 py-4">
            <h2 className="text-cool-gray-900 text-base font-bold">
              최근 수정 식당
            </h2>
          </div>
          <AdminTable
            columns={restaurantColumns}
            isLoading={restaurantsQuery.isLoading}
            isError={restaurantsQuery.isError}
            isEmpty={restaurants.length === 0}
            emptyTitle="최근 수정된 식당이 없습니다"
            emptyDescription="식당 등록 또는 수정 후 이 영역에 표시됩니다."
            onRetry={() => void restaurantsQuery.refetch()}
          >
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-cool-gray-50">
                <td className="text-cool-gray-900 truncate px-3 py-3 text-sm font-bold">
                  {restaurant.name}
                </td>
                <td className="text-cool-gray-600 truncate px-3 py-3 text-sm">
                  {restaurant.address}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {getRestaurantGenreLabel(restaurant.genre)}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {restaurant.updatedAt}
                </td>
              </tr>
            ))}
          </AdminTable>
        </section>
      </div>
    </>
  )
}

const QuickLink = ({ to, label }: { to: string; label: string }) => {
  return (
    <Link
      to={to}
      className="border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50 flex h-11 items-center justify-between rounded-md border px-3 text-sm font-bold"
    >
      {label}
      <span aria-hidden="true">&gt;</span>
    </Link>
  )
}
