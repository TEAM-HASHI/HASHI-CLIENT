import {
  CalendarIcon,
  HashiPickIcon,
  ReservationIcon,
  TodayRestaurantIcon,
} from '@hashi/hds-icons'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { useReservationsQuery } from '@/shared/api/adminHooks'
import { AdminTable } from '@/shared/components/AdminTable'
import { MetricCard } from '@/shared/components/MetricCard'
import { PageHeader } from '@/shared/components/PageHeader'
import { StatusBadge } from '@/shared/components/StatusBadge'

const RECENT_RESERVATIONS_PARAMS = { page: 0, size: 5 } as const
const TOTAL_RESERVATIONS_PARAMS = { page: 0, size: 1 } as const
const REQUESTED_RESERVATIONS_PARAMS = {
  page: 0,
  size: 1,
  status: 'REQUESTED',
} as const
const CONTACTING_RESERVATIONS_PARAMS = {
  page: 0,
  size: 1,
  status: 'CONTACTING',
} as const
const CONFIRMED_RESERVATIONS_PARAMS = {
  page: 0,
  size: 1,
  status: 'CONFIRMED',
} as const

const reservationColumns = [
  { key: 'id', label: '예약 ID', className: 'w-32' },
  { key: 'user', label: '예약자', className: 'w-32' },
  { key: 'restaurant', label: '식당', className: 'w-56' },
  { key: 'reservedAt', label: '예약 일시', className: 'w-44' },
  { key: 'status', label: '상태', className: 'w-28' },
]

const formatDateTime = (value: string) =>
  value ? value.replace('T', ' ').slice(0, 16) : '-'

export const DashboardPage = () => {
  const recentReservationsQuery = useReservationsQuery(
    RECENT_RESERVATIONS_PARAMS,
  )
  const totalReservationsQuery = useReservationsQuery(TOTAL_RESERVATIONS_PARAMS)
  const requestedReservationsQuery = useReservationsQuery(
    REQUESTED_RESERVATIONS_PARAMS,
  )
  const contactingReservationsQuery = useReservationsQuery(
    CONTACTING_RESERVATIONS_PARAMS,
  )
  const confirmedReservationsQuery = useReservationsQuery(
    CONFIRMED_RESERVATIONS_PARAMS,
  )

  const recentReservations = recentReservationsQuery.data?.reservations ?? []

  return (
    <>
      <PageHeader
        title="대시보드"
        description="실제 예약 API 기준 운영 현황을 확인합니다."
      />

      <div className="space-y-6 px-5 py-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="전체 예약"
            value={
              totalReservationsQuery.isError
                ? '오류'
                : (totalReservationsQuery.data?.totalCount.toLocaleString() ??
                  '...')
            }
            description="전체 예약 요청"
            icon={<CalendarIcon aria-hidden="true" className="size-6" />}
          />
          <MetricCard
            label="요청됨"
            value={
              requestedReservationsQuery.isError
                ? '오류'
                : (requestedReservationsQuery.data?.totalCount.toLocaleString() ??
                  '...')
            }
            description="확인이 필요한 신규 요청"
            icon={<ReservationIcon aria-hidden="true" className="size-6" />}
          />
          <MetricCard
            label="연락 중"
            value={
              contactingReservationsQuery.isError
                ? '오류'
                : (contactingReservationsQuery.data?.totalCount.toLocaleString() ??
                  '...')
            }
            description="식당 확인을 진행 중인 예약"
            icon={<TodayRestaurantIcon aria-hidden="true" className="size-6" />}
          />
          <MetricCard
            label="예약 확정"
            value={
              confirmedReservationsQuery.isError
                ? '오류'
                : (confirmedReservationsQuery.data?.totalCount.toLocaleString() ??
                  '...')
            }
            description="확정된 예약"
            icon={<HashiPickIcon aria-hidden="true" className="size-6" />}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_20rem]">
          <div className="border-cool-gray-100 overflow-hidden rounded-lg border bg-white">
            <div className="border-cool-gray-100 border-b px-5 py-4">
              <h2 className="text-cool-gray-900 text-base font-bold">
                최근 예약
              </h2>
            </div>
            <AdminTable
              columns={reservationColumns}
              isLoading={recentReservationsQuery.isLoading}
              isError={recentReservationsQuery.isError}
              isEmpty={recentReservations.length === 0}
              emptyTitle="최근 예약이 없습니다"
              emptyDescription="예약 데이터가 생성되면 이 영역에 표시됩니다."
              onRetry={() => void recentReservationsQuery.refetch()}
            >
              {recentReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-cool-gray-50">
                  <td className="text-cool-gray-700 px-3 py-3 text-sm font-bold">
                    RSV-{reservation.id}
                  </td>
                  <td className="text-cool-gray-700 px-3 py-3 text-sm">
                    {reservation.reserverName}
                  </td>
                  <td className="text-cool-gray-900 truncate px-3 py-3 text-sm font-semibold">
                    {reservation.restaurantName}
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
              <QuickLink to={ROUTES.reservations} label="예약 상태 관리" />
              <QuickLink to={ROUTES.restaurants} label="식당 생성/수정" />
              <QuickLink to={ROUTES.magazines} label="매거진 생성/수정" />
            </div>
            <p className="bg-cool-gray-50 text-cool-gray-500 mt-6 rounded-lg p-4 text-sm leading-6">
              식당과 매거진 조회 API는 현재 제공되지 않아 생성·ID 기반
              수정·삭제만 지원합니다.
            </p>
          </aside>
        </section>
      </div>
    </>
  )
}

const QuickLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50 flex h-11 items-center justify-between rounded-md border px-3 text-sm font-bold"
  >
    {label}
    <span aria-hidden="true">&gt;</span>
  </Link>
)
