import { ClockIcon, PeopleIcon, PencilIcon } from '@hashi/hds-icons'
import { useMemo, useState } from 'react'
import {
  useReservationUserQuery,
  useReservationsQuery,
  useUpdateReservationStatusMutation,
} from '@/shared/api/adminHooks'
import type { ChangeReservationStatusBody } from '@/shared/api/reservationApi'
import type {
  AdminReservationView,
  ReservationPaymentStatus,
} from '@/shared/api/reservationViewModel'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminSelect, type SelectOption } from '@/shared/components/AdminSelect'
import { AdminTable } from '@/shared/components/AdminTable'
import { AdminToolbar } from '@/shared/components/AdminToolbar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Drawer } from '@/shared/components/Drawer'
import { PageHeader } from '@/shared/components/PageHeader'
import { StatusBadge } from '@/shared/components/StatusBadge'

type DocumentedReservationStatus = ChangeReservationStatusBody['status']
type StatusFilter = 'ALL' | DocumentedReservationStatus

const PAGE_SIZE = 20

const statusOptions: SelectOption<StatusFilter>[] = [
  { value: 'ALL', label: '전체' },
  { value: 'REQUESTED', label: '요청됨' },
  { value: 'CONTACTING', label: '연락 중' },
  { value: 'CONFIRMED', label: '예약 확정' },
  { value: 'VISITED', label: '방문완료' },
  { value: 'CANCELED', label: '취소' },
]

const statusChangeOptions: SelectOption<DocumentedReservationStatus>[] =
  statusOptions.slice(1) as SelectOption<DocumentedReservationStatus>[]

const tableColumns = [
  { key: 'id', label: '예약 ID', className: 'w-28' },
  { key: 'reservedAt', label: '방문 일시', className: 'w-44' },
  { key: 'reserver', label: '예약자', className: 'w-32' },
  { key: 'restaurant', label: '식당', className: 'w-56' },
  { key: 'guestCount', label: '인원', className: 'w-44' },
  { key: 'type', label: '예약 유형', className: 'w-28' },
  { key: 'payment', label: '결제', className: 'w-28' },
  { key: 'amount', label: '결제 금액', className: 'w-28' },
  { key: 'status', label: '예약 상태', className: 'w-28' },
  { key: 'actions', label: '액션', className: 'w-56' },
]

const paymentStatusLabel: Record<ReservationPaymentStatus, string> = {
  PENDING: '결제 대기',
  PAID: '결제완료',
  CANCELED: '결제취소',
  UNKNOWN: '확인 필요',
}

const paymentStatusClassName: Record<ReservationPaymentStatus, string> = {
  PENDING: 'bg-warning/10 text-warning',
  PAID: 'bg-primary-100 text-primary-200',
  CANCELED: 'bg-error/10 text-error',
  UNKNOWN: 'bg-cool-gray-100 text-cool-gray-500',
}

const reservationTypeLabel: Record<
  AdminReservationView['reservationType'],
  string
> = {
  STANDARD: '일반',
  ANYWHERE: '어디든',
  UNKNOWN: '확인 필요',
}

const formatDateTime = (value: string) =>
  value ? value.replace('T', ' ').slice(0, 16) : '-'

const formatReservationId = (id: number) => `RSV-${id}`

const getReservationGuestLabel = ({
  adultCount,
  teenCount,
  childCount,
}: AdminReservationView) => {
  const breakdown = [
    adultCount > 0 ? `성인 ${adultCount}` : null,
    teenCount > 0 ? `청소년 ${teenCount}` : null,
    childCount > 0 ? `어린이 ${childCount}` : null,
  ].filter(Boolean)

  return breakdown.length > 0 ? breakdown.join(', ') : '0명'
}

export const ReservationsPage = () => {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [statusTarget, setStatusTarget] = useState<AdminReservationView | null>(
    null,
  )
  const [nextStatus, setNextStatus] =
    useState<DocumentedReservationStatus>('REQUESTED')
  const [userTargetId, setUserTargetId] = useState<number | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      ...(statusFilter === 'ALL' ? {} : { status: statusFilter }),
    }),
    [page, statusFilter],
  )
  const reservationsQuery = useReservationsQuery(queryParams)
  const updateStatusMutation = useUpdateReservationStatusMutation()
  const userQuery = useReservationUserQuery(userTargetId)
  const result = reservationsQuery.data
  const reservations = result?.reservations ?? []
  const currentPage = result?.page ?? page
  const totalPages = result?.totalPages ?? 0

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setPage(0)
  }

  const handleStatusConfirm = () => {
    if (!statusTarget) {
      return
    }

    updateStatusMutation.mutate(
      { reservationId: statusTarget.id, status: nextStatus },
      { onSuccess: () => setStatusTarget(null) },
    )
  }

  return (
    <>
      <PageHeader
        title="예약 관리"
        description="예약 현황을 확인하고 예약자 정보와 처리 상태를 관리합니다."
      />

      <AdminToolbar>
        <AdminSelect
          label="예약 상태"
          value={statusFilter}
          options={statusOptions}
          onChange={handleStatusFilterChange}
        />
      </AdminToolbar>

      <div className="px-5 py-5 lg:px-8">
        <div className="text-cool-gray-500 mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>총 {(result?.totalCount ?? 0).toLocaleString()}개 예약</span>
          <span>
            {totalPages === 0 ? 0 : currentPage + 1} / {totalPages} 페이지
          </span>
        </div>

        <div className="border-cool-gray-100 overflow-hidden rounded-lg border">
          <AdminTable
            columns={tableColumns}
            isLoading={reservationsQuery.isLoading}
            isError={reservationsQuery.isError}
            isEmpty={reservations.length === 0}
            emptyTitle="예약이 없습니다"
            emptyDescription="선택한 상태에 해당하는 예약이 없습니다."
            onRetry={() => void reservationsQuery.refetch()}
          >
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-cool-gray-50">
                <td className="text-cool-gray-700 px-3 py-3 text-sm font-bold">
                  {formatReservationId(reservation.id)}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon aria-hidden="true" className="size-4" />
                    {formatDateTime(reservation.reservedAt)}
                  </span>
                </td>
                <td className="text-cool-gray-900 px-3 py-3 text-sm font-bold">
                  {reservation.reserverName}
                </td>
                <td className="px-3 py-3 text-sm">
                  <span className="text-cool-gray-900 block truncate font-bold">
                    {reservation.restaurantName}
                  </span>
                  <span className="text-cool-gray-500 mt-0.5 block truncate text-xs">
                    {reservation.restaurantAddress}
                  </span>
                </td>
                <td className="text-cool-gray-700 px-3 py-3 text-sm font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <PeopleIcon aria-hidden="true" className="size-4" />
                    {getReservationGuestLabel(reservation)}
                  </span>
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {reservationTypeLabel[reservation.reservationType]}
                </td>
                <td className="px-3 py-3">
                  <PaymentStatusBadge status={reservation.paymentStatus} />
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {reservation.amount.toLocaleString()}원
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={reservation.reservationStatus} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ActionButton
                      ariaLabel="예약자 보기"
                      onClick={() => setUserTargetId(reservation.id)}
                    >
                      예약자 보기
                    </ActionButton>
                    <ActionButton
                      ariaLabel="예약 상태 변경"
                      onClick={() => {
                        updateStatusMutation.reset()
                        setNextStatus(
                          reservation.reservationStatus === 'UNKNOWN'
                            ? 'REQUESTED'
                            : reservation.reservationStatus,
                        )
                        setStatusTarget(reservation)
                      }}
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                      상태 변경
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <PaginationButton
            label="이전 페이지"
            disabled={page === 0 || reservationsQuery.isFetching}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          />
          <PaginationButton
            label="다음 페이지"
            disabled={
              reservationsQuery.isFetching ||
              totalPages === 0 ||
              page + 1 >= totalPages
            }
            onClick={() => setPage((current) => current + 1)}
          />
        </div>
      </div>

      <Drawer
        open={userTargetId != null}
        title="예약자 정보"
        description="예약과 연결된 회원 정보를 조회했습니다."
        onClose={() => setUserTargetId(null)}
      >
        {userQuery.isLoading ? <DrawerLoading /> : null}
        {userQuery.isError ? (
          <p className="bg-error/10 text-error rounded-md px-3 py-2 text-sm font-bold">
            예약자 정보를 불러오지 못했습니다.
          </p>
        ) : null}
        {userQuery.data ? (
          <dl className="space-y-4">
            <InfoRow label="회원 ID" value={String(userQuery.data.userId)} />
            <InfoRow label="닉네임" value={userQuery.data.nickname} />
            <InfoRow label="영문 이름" value={userQuery.data.nameEng} />
            <InfoRow label="생년월일" value={userQuery.data.birthDate} />
            <InfoRow label="연락처" value={userQuery.data.phone} />
            <InfoRow label="이메일" value={userQuery.data.email} />
          </dl>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={statusTarget != null}
        title="예약 상태를 변경할까요?"
        description="선택한 상태가 서버에 즉시 반영됩니다."
        confirmLabel="상태 변경"
        loading={updateStatusMutation.isPending}
        onCancel={() => {
          updateStatusMutation.reset()
          setStatusTarget(null)
        }}
        onConfirm={handleStatusConfirm}
      >
        <div className="space-y-3">
          <AdminSelect
            label="변경할 상태"
            value={nextStatus}
            options={statusChangeOptions}
            onChange={setNextStatus}
          />
          {updateStatusMutation.isError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
              {getMutationErrorMessage(updateStatusMutation.error)}
            </p>
          ) : null}
        </div>
      </ConfirmDialog>
    </>
  )
}

const getMutationErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.'

const PaymentStatusBadge = ({
  status,
}: {
  status: ReservationPaymentStatus
}) => (
  <span
    className={`${paymentStatusClassName[status]} inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold`}
  >
    {paymentStatusLabel[status]}
  </span>
)

const PaginationButton = ({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50 h-9 rounded-md border bg-white px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
  >
    {label.replace(' 페이지', '')}
  </button>
)

const DrawerLoading = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className="bg-cool-gray-100 block h-5 animate-pulse rounded"
      />
    ))}
  </div>
)

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border-cool-gray-100 rounded-md border px-4 py-3">
    <dt className="text-cool-gray-500 text-xs font-bold">{label}</dt>
    <dd className="text-cool-gray-900 mt-1 text-sm font-bold break-all">
      {value}
    </dd>
  </div>
)
