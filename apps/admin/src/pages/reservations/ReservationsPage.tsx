import { ClockIcon, PeopleIcon, PencilIcon } from '@hashi/hds-icons'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import type {
  AdminReservationStatus,
  AdminReservationSummary,
  MockScenario,
  ReservationPaymentStatus,
} from '@/shared/api/adminTypes'
import {
  useReservationUserQuery,
  useReservationsQuery,
  useUpdateReservationStatusMutation,
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

type StatusFilter = 'all' | AdminReservationStatus
type DateFilter = 'all' | 'today' | 'upcoming' | 'past'

const scenarioOptions: SelectOption<MockScenario>[] = [
  { value: 'success', label: '정상' },
  { value: 'empty', label: '빈 데이터' },
  { value: 'error', label: '오류' },
]

const statusOptions: SelectOption<StatusFilter>[] = [
  { value: 'all', label: '전체' },
  { value: 'CONTACTING', label: '대기' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'VISITED', label: '방문완료' },
  { value: 'CANCELLED', label: '취소' },
]

const statusChangeOptions: SelectOption<AdminReservationStatus>[] = [
  { value: 'CONTACTING', label: '대기' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'VISITED', label: '방문완료' },
  { value: 'CANCELLED', label: '취소' },
]

const dateOptions: SelectOption<DateFilter>[] = [
  { value: 'all', label: '전체' },
  { value: 'today', label: '오늘' },
  { value: 'upcoming', label: '방문 예정' },
  { value: 'past', label: '지난 예약' },
]

const tableColumns = [
  { key: 'id', label: '예약 ID', className: 'w-32' },
  { key: 'appliedAt', label: '신청일', className: 'w-40' },
  { key: 'user', label: '예약자', className: 'w-44' },
  { key: 'restaurant', label: '식당', className: 'w-56' },
  { key: 'reservedAt', label: '방문 일시', className: 'w-44' },
  { key: 'guestCount', label: '인원', className: 'w-44' },
  { key: 'payment', label: '결제', className: 'w-28' },
  { key: 'amount', label: '수수료', className: 'w-28' },
  { key: 'status', label: '예약 상태', className: 'w-28' },
  { key: 'actions', label: '액션', className: 'w-52' },
]

const paymentStatusLabel: Record<ReservationPaymentStatus, string> = {
  PAID: '결제완료',
  UNPAID: '미결제',
  CANCELLED: '결제취소',
  REFUNDED: '환불',
}

const paymentStatusClassName: Record<ReservationPaymentStatus, string> = {
  PAID: 'bg-primary-100 text-primary-200',
  UNPAID: 'bg-warning/10 text-warning',
  CANCELLED: 'bg-error/10 text-error',
  REFUNDED: 'bg-cool-gray-100 text-cool-gray-500',
}

const formatDateTime = (value: string) => value.replace('T', ' ').slice(0, 16)

const formatReservationId = (id: number) => `RSV-${id}`

const getReservationGuestCount = ({
  adultCount,
  teenCount,
  childCount,
}: Pick<AdminReservationSummary, 'adultCount' | 'teenCount' | 'childCount'>) =>
  adultCount + teenCount + childCount

const getReservationGuestLabel = (reservation: AdminReservationSummary) => {
  const totalCount = getReservationGuestCount(reservation)
  const breakdown = [
    reservation.adultCount > 0 ? `성인 ${reservation.adultCount}` : null,
    reservation.teenCount > 0 ? `청소년 ${reservation.teenCount}` : null,
    reservation.childCount > 0 ? `어린이 ${reservation.childCount}` : null,
  ].filter(Boolean)

  return `${totalCount}명${breakdown.length > 0 ? ` (${breakdown.join(', ')})` : ''}`
}

const formatReservationAmount = (amount: number | null) =>
  amount == null ? '-' : `${amount.toLocaleString()}원`

export const ReservationsPage = () => {
  const [scenario, setScenario] = useState<MockScenario>('success')
  const [searchText, setSearchText] = useState('')
  const deferredSearchText = useDeferredValue(searchText)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [statusTarget, setStatusTarget] =
    useState<AdminReservationSummary | null>(null)
  const [nextStatus, setNextStatus] =
    useState<AdminReservationStatus>('CONFIRMED')
  const [userTargetId, setUserTargetId] = useState<string | null>(null)

  const reservationsQuery = useReservationsQuery(scenario)
  const updateStatusMutation = useUpdateReservationStatusMutation()
  const userQuery = useReservationUserQuery(userTargetId, userTargetId != null)
  const reservations = reservationsQuery.data ?? []

  const filteredReservations = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase()

    return [...reservations]
      .filter((reservation) => {
        const matchesKeyword =
          keyword.length === 0 ||
          reservation.user.nickname.toLowerCase().includes(keyword) ||
          reservation.user.phone.includes(keyword) ||
          reservation.restaurant.name.toLowerCase().includes(keyword)
        const matchesStatus =
          statusFilter === 'all' ||
          reservation.reservationStatus === statusFilter
        const matchesDate =
          dateFilter === 'all' ||
          (dateFilter === 'today' &&
            reservation.reservedAt.startsWith('2026-07-09')) ||
          (dateFilter === 'upcoming' &&
            reservation.reservedAt >= '2026-07-09') ||
          (dateFilter === 'past' && reservation.reservedAt < '2026-07-09')

        return matchesKeyword && matchesStatus && matchesDate
      })
      .sort((left, right) => right.reservedAt.localeCompare(left.reservedAt))
  }, [dateFilter, deferredSearchText, reservations, statusFilter])

  useEffect(() => {
    if (statusTarget) {
      setNextStatus(statusTarget.reservationStatus)
    }
  }, [statusTarget])

  const handleStatusConfirm = () => {
    if (!statusTarget) {
      return
    }

    updateStatusMutation.mutate(
      { reservationId: String(statusTarget.id), status: nextStatus },
      {
        onSuccess: () => {
          setStatusTarget(null)
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        title="예약 관리"
        description="예약 현황을 확인하고 상태를 변경합니다."
      />

      <AdminToolbar>
        <AdminSearchInput
          value={searchText}
          placeholder="예약자명, 연락처 또는 식당명으로 검색"
          onChange={setSearchText}
        />
        <AdminSelect
          label="예약 상태"
          value={statusFilter}
          options={statusOptions}
          onChange={setStatusFilter}
        />
        <AdminSelect
          label="날짜"
          value={dateFilter}
          options={dateOptions}
          onChange={setDateFilter}
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
          <span>총 {filteredReservations.length.toLocaleString()}개 예약</span>
          <p>예약자 정보는 drawer에서 비동기로 조회합니다.</p>
        </div>

        <div className="border-cool-gray-100 overflow-hidden rounded-lg border">
          <AdminTable
            columns={tableColumns}
            isLoading={reservationsQuery.isLoading}
            isError={reservationsQuery.isError}
            isEmpty={filteredReservations.length === 0}
            emptyTitle="조건에 맞는 예약이 없습니다"
            emptyDescription="검색어나 필터를 조정해 예약을 다시 확인하세요."
            onRetry={() => void reservationsQuery.refetch()}
          >
            {filteredReservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-cool-gray-50">
                <td className="text-cool-gray-700 px-3 py-3 text-sm font-bold">
                  {formatReservationId(reservation.id)}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  {formatDateTime(reservation.appliedAt)}
                </td>
                <td className="text-cool-gray-900 px-3 py-3 text-sm font-bold">
                  <span className="block">{reservation.user.nickname}</span>
                  <span className="text-cool-gray-500 mt-0.5 block text-xs font-medium">
                    {reservation.user.phone}
                  </span>
                </td>
                <td className="text-cool-gray-700 truncate px-3 py-3 text-sm">
                  {reservation.restaurant.name}
                </td>
                <td className="text-cool-gray-600 px-3 py-3 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon aria-hidden="true" className="size-4" />
                    {formatDateTime(reservation.reservedAt)}
                  </span>
                </td>
                <td className="text-cool-gray-700 px-3 py-3 text-sm font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <PeopleIcon aria-hidden="true" className="size-4" />
                    {getReservationGuestLabel(reservation)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <PaymentStatusBadge status={reservation.paymentStatus} />
                </td>
                <td className="text-cool-gray-600 truncate px-3 py-3 text-sm">
                  {formatReservationAmount(reservation.amount)}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={reservation.reservationStatus} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ActionButton
                      onClick={() => setUserTargetId(String(reservation.id))}
                    >
                      유저 보기
                    </ActionButton>
                    <ActionButton
                      onClick={() => {
                        updateStatusMutation.reset()
                        setStatusTarget(reservation)
                      }}
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                      상태
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </div>

      <Drawer
        open={userTargetId != null}
        title="예약자 정보"
        description="예약 상세와 연결된 회원 정보를 조회합니다."
        onClose={() => setUserTargetId(null)}
      >
        {userQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className="bg-cool-gray-100 block h-5 animate-pulse rounded"
              />
            ))}
          </div>
        ) : null}
        {userQuery.isError ? (
          <p className="bg-error/10 text-error rounded-md px-3 py-2 text-sm font-bold">
            예약자 정보를 불러오지 못했습니다.
          </p>
        ) : null}
        {userQuery.data ? (
          <dl className="space-y-4">
            <InfoRow
              label="예약 ID"
              value={formatReservationId(userQuery.data.reservationId)}
            />
            <InfoRow label="닉네임" value={userQuery.data.user.nickname} />
            <InfoRow
              label="영문 이름"
              value={userQuery.data.user.nameEng ?? '-'}
            />
            <InfoRow label="생년월일" value={userQuery.data.user.birthDate} />
            <InfoRow label="연락처" value={userQuery.data.user.phone} />
            <InfoRow label="이메일" value={userQuery.data.user.email ?? '-'} />
            {userQuery.data.user.profileImageUrl ? (
              <InfoRow
                label="프로필 이미지"
                value={userQuery.data.user.profileImageUrl}
              />
            ) : null}
          </dl>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={statusTarget != null}
        title="예약 상태를 변경할까요?"
        description="상태 변경은 mock 데이터에 즉시 반영되고 실제 연동 시 status 필드로 전송됩니다."
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

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '요청 처리 중 오류가 발생했습니다.'
}

const PaymentStatusBadge = ({
  status,
}: {
  status: ReservationPaymentStatus
}) => {
  return (
    <span
      className={`${paymentStatusClassName[status]} inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold`}
    >
      {paymentStatusLabel[status]}
    </span>
  )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="border-cool-gray-100 rounded-md border px-4 py-3">
      <dt className="text-cool-gray-500 text-xs font-bold">{label}</dt>
      <dd className="text-cool-gray-900 mt-1 text-sm font-bold break-all">
        {value}
      </dd>
    </div>
  )
}
