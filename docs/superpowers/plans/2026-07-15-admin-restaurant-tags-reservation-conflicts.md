# Admin Restaurant Tags and Reservation Conflicts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 어드민 식당 폼의 쉼표 구분 해시태그를 개별 배열 항목으로 전송하고, 예약 관리 목록의 동일 식당·동일 분 예약 행에 경고를 표시한다.

**Architecture:** 식당 form state는 해시태그 입력 문자열을 그대로 보존하고 serializer와 validator가 하나의 parser를 공유한다. 예약 충돌은 현재 query page의 예약을 순수 helper로 그룹화하고, `ReservationsPage`가 helper 결과에 따라 행 배경과 건수 배지를 렌더링한다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest, Testing Library, pnpm

## Global Constraints

- 동일 시간대는 `restaurantId`와 `reservedAt`의 분 단위 값이 모두 같은 경우다.
- `CANCELED` 예약은 충돌 집계에서 제외한다.
- 충돌 경고는 `/admin/reservations`의 현재 페이지와 현재 status filter 결과만 기준으로 한다.
- 메인 `/admin/dashboard`의 최근 예약 table은 변경하지 않는다.
- 예약 상태를 자동 변경하거나 취소하지 않는다.
- 해시태그 중복 제거, 자동완성, 최대 개수 정책은 추가하지 않는다.
- backend API와 generated OpenAPI 파일은 변경하지 않는다.
- 기존 식당 수정의 해시태그 전체 교체 toggle을 유지한다.
- 사용자 요청에 따라 commit과 push를 실행하지 않는다.

---

### Task 1: 쉼표 구분 해시태그 입력과 payload 직렬화

**Files:**

- Modify: `apps/admin/src/pages/restaurants/restaurantForm.test.ts`
- Modify: `apps/admin/src/pages/restaurants/RestaurantsPage.test.tsx`
- Modify: `apps/admin/src/pages/restaurants/restaurantForm.ts`
- Modify: `apps/admin/src/pages/restaurants/components/RestaurantFormDrawer.tsx`
- Modify: `apps/admin/src/app/AdminConsole.spec.md`

**Interfaces:**

- Consumes: `RestaurantFormState.hashtags` raw comma-separated string
- Produces: `parseRestaurantHashtags(value: string): string[]`과 create/update body의 `hashtags: string[]`

- [ ] **Step 1: controlled input에서 쉼표가 유지되는 실패 테스트를 추가한다**

`RestaurantsPage.test.tsx` 상단에 수정 prefill fixture를 추가한다.

```tsx
const restaurantPrefill = {
  restaurantId: 12,
  name: '하시 스시',
  localName: 'ハシ寿司',
  summary: '현지 스시 전문점',
  description: '제철 생선을 사용합니다.',
  address: '東京都渋谷区1-1-1',
  area: '시부야',
  genre: 'sushi',
  foodCategory: 'sushi',
  priceCurrency: 'JPY',
  minPrice: 3_000,
  maxPrice: 8_000,
  images: [],
  menus: [],
  hashtags: ['기존태그'],
  curationTypes: [],
  businessHours: [],
}
```

같은 파일에 아래 테스트를 추가한다.

```tsx
it('keeps comma-separated hashtags visible while editing', async () => {
  const user = userEvent.setup()
  vi.mocked(useRestaurantPrefillQuery).mockReturnValue({
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: restaurantPrefill,
  } as unknown as ReturnType<typeof useRestaurantPrefillQuery>)

  render(<RestaurantsPage />)

  await user.click(screen.getByRole('button', { name: '수정' }))
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('checkbox', { name: /해시태그 전체 교체/ }))

  const hashtagInput = screen.getByRole('textbox', { name: '해시태그' })
  await user.clear(hashtagInput)
  await user.type(hashtagInput, '스시, 현지인맛집')

  expect(hashtagInput).toHaveValue('스시, 현지인맛집')
})
```

- [ ] **Step 2: UI 테스트를 실행해 쉼표가 사라지는 현재 문제를 확인한다**

```bash
corepack pnpm --filter @hashi/admin exec vitest run --config vitest.config.ts src/pages/restaurants/RestaurantsPage.test.tsx
```

Expected: `해시태그` input의 실제 값이 `스시현지인맛집`이어서 FAIL한다.

- [ ] **Step 3: raw 문자열의 create/update 직렬화와 prefill 실패 테스트를 추가한다**

`restaurantForm.test.ts`의 `createValidForm`에서 다음 값을 사용한다.

```ts
form.hashtags = '현지인맛집'
```

serializer describe에 아래 테스트를 추가한다.

```ts
it('serializes comma-separated hashtags as separate trimmed values', () => {
  const form = createValidForm()
  form.hashtags = ' 스시, , 현지인맛집, '

  expect(toCreateRestaurantBody(form).hashtags).toEqual(['스시', '현지인맛집'])
  expect(
    toUpdateRestaurantBody(form, new Set(), {
      ...replacements,
      hashtags: true,
    }).hashtags,
  ).toEqual(['스시', '현지인맛집'])
})

it('joins prefilled hashtags into the editable input value', () => {
  const form = createRestaurantFormFromPrefill({
    restaurantId: 12,
    name: '하시 식당',
    localName: 'HASHI',
    summary: '소개',
    description: '설명',
    address: '주소',
    area: '도쿄',
    genre: 'sushi',
    foodCategory: 'sushi',
    priceCurrency: 'JPY',
    minPrice: 1_000,
    maxPrice: 2_000,
    images: [],
    menus: [],
    hashtags: ['스시', '현지인맛집'],
    curationTypes: [],
    businessHours: [],
  })

  expect(form.hashtags).toBe('스시, 현지인맛집')
})
```

- [ ] **Step 4: form 테스트를 실행해 raw 문자열 계약이 아직 없는 것을 확인한다**

```bash
corepack pnpm --filter @hashi/admin exec vitest run --config vitest.config.ts src/pages/restaurants/restaurantForm.test.ts
```

Expected: 현재 `RestaurantFormState.hashtags`가 배열이고 serializer가 `.map()`을 호출하므로 새 직렬화 테스트가 FAIL한다.

- [ ] **Step 5: form state와 serializer가 raw 문자열을 사용하도록 최소 구현한다**

`restaurantForm.ts`에서 form field type과 초기값, prefill을 변경한다.

```ts
export interface RestaurantFormState extends RestaurantScalarFields {
  images: UploadedImage[]
  existingImageUrls: string[]
  menus: RestaurantMenuForm[]
  hashtags: string
  curationTypes: string[]
  businessHours: RestaurantBusinessHourForm[]
}
```

`createRestaurantForm`의 `hashtags` 초기값과 `createRestaurantFormFromPrefill`의 반환값을 각각 다음처럼 변경한다.

```ts
hashtags: '',
```

```ts
hashtags: view.hashtags.join(', '),
```

같은 파일에 parser를 추가하고 create/update serializer와 validator에서 공유한다.

```ts
export const parseRestaurantHashtags = (value: string): string[] =>
  value
    .split(',')
    .map((hashtag) => hashtag.trim())
    .filter(Boolean)

// toCreateRestaurantBody
hashtags: parseRestaurantHashtags(form.hashtags),

// toUpdateRestaurantBody
if (replacements.hashtags) {
  body.hashtags = parseRestaurantHashtags(form.hashtags)
}

// validateRestaurantForm
const hashtags = parseRestaurantHashtags(form.hashtags)
if (
  (mode === 'create' || replacements.hashtags) &&
  (hashtags.length === 0 || hashtags.some((hashtag) => hashtag.length > 20))
) {
  errors.hashtags = '해시태그를 1개 이상, 각 20자 이하로 입력해주세요.'
}
```

`RestaurantFormDrawer.tsx`의 해시태그 `Field`는 입력 중 파싱하지 않는다.

```tsx
const hashtags = (
  <Field
    label="해시태그"
    value={form.hashtags}
    placeholder="쉼표로 구분"
    onChange={(hashtags) => setForm((current) => ({ ...current, hashtags }))}
  />
)
```

- [ ] **Step 6: 해시태그 form과 UI 테스트를 다시 실행한다**

```bash
corepack pnpm --filter @hashi/admin exec vitest run --config vitest.config.ts src/pages/restaurants/restaurantForm.test.ts src/pages/restaurants/RestaurantsPage.test.tsx
```

Expected: 두 테스트 파일의 모든 테스트가 PASS한다.

- [ ] **Step 7: AdminConsole spec을 실제 입력·직렬화 동작과 동기화한다**

`apps/admin/src/app/AdminConsole.spec.md`의 Restaurants UX 규칙에 다음 내용을 추가한다.

```md
- 해시태그 입력은 쉼표 구분 문자열을 그대로 유지하고, create/update payload 생성 시 trim한 `string[]`로 변환한다. 빈 항목은 제외한다.
```

---

### Task 2: 동일 식당·동일 시간 예약 충돌 계산

**Files:**

- Create: `apps/admin/src/pages/reservations/reservationConflicts.ts`
- Create: `apps/admin/src/pages/reservations/reservationConflicts.test.ts`

**Interfaces:**

- Consumes: `AdminReservationView[]`
- Produces: `getReservationConflictCounts(reservations: AdminReservationView[]): Map<number, number>`

- [ ] **Step 1: 충돌 그룹 계산의 실패 테스트를 작성한다**

`reservationConflicts.test.ts`를 생성한다.

```ts
import { describe, expect, it } from 'vitest'
import { getReservationConflictCounts } from '@/pages/reservations/reservationConflicts'
import type { AdminReservationView } from '@/shared/api/reservationViewModel'

const reservation: AdminReservationView = {
  adultCount: 2,
  amount: 30_000,
  childCount: 0,
  confirmDDay: 3,
  id: 91,
  paymentStatus: 'PAID',
  requestNote: '',
  reservationStatus: 'REQUESTED',
  reservationType: 'STANDARD',
  reservedAt: '2026-07-20T18:30:00',
  reserverName: '김하시',
  restaurantAddress: '도쿄도 시부야구',
  restaurantId: 7,
  restaurantImageUrl: '',
  restaurantName: '하시 스시',
  teenCount: 0,
  usedPoint: 0,
  userId: 3,
}

describe('getReservationConflictCounts', () => {
  it('marks every active reservation at the same restaurant and minute', () => {
    const counts = getReservationConflictCounts([
      reservation,
      {
        ...reservation,
        id: 92,
        reservationStatus: 'CONFIRMED',
        reservedAt: '2026-07-20T18:30:59',
      },
    ])

    expect([...counts.entries()]).toEqual([
      [91, 2],
      [92, 2],
    ])
  })

  it('ignores canceled, other-restaurant, other-minute, and invalid rows', () => {
    const counts = getReservationConflictCounts([
      reservation,
      { ...reservation, id: 92, reservationStatus: 'CANCELED' },
      { ...reservation, id: 93, restaurantId: 8 },
      { ...reservation, id: 94, reservedAt: '2026-07-20T18:31:00' },
      { ...reservation, id: 95, restaurantId: 0 },
      { ...reservation, id: 96, reservedAt: '' },
    ])

    expect(counts.size).toBe(0)
  })
})
```

- [ ] **Step 2: helper 테스트를 실행해 module 부재로 실패하는지 확인한다**

```bash
corepack pnpm --filter @hashi/admin exec vitest run --config vitest.config.ts src/pages/reservations/reservationConflicts.test.ts
```

Expected: `reservationConflicts` module을 찾지 못해 FAIL한다.

- [ ] **Step 3: 현재 페이지 예약의 충돌 건수를 계산하는 helper를 구현한다**

`reservationConflicts.ts`를 생성한다.

```ts
import type { AdminReservationView } from '@/shared/api/reservationViewModel'

const getConflictKey = (reservation: AdminReservationView) => {
  if (
    reservation.reservationStatus === 'CANCELED' ||
    reservation.restaurantId <= 0 ||
    reservation.reservedAt.length < 16
  ) {
    return null
  }

  return `${reservation.restaurantId}:${reservation.reservedAt.slice(0, 16)}`
}

export const getReservationConflictCounts = (
  reservations: AdminReservationView[],
): Map<number, number> => {
  const reservationIdsByConflictKey = new Map<string, number[]>()

  reservations.forEach((reservation) => {
    const key = getConflictKey(reservation)
    if (!key) return

    const ids = reservationIdsByConflictKey.get(key) ?? []
    ids.push(reservation.id)
    reservationIdsByConflictKey.set(key, ids)
  })

  return new Map(
    [...reservationIdsByConflictKey.values()]
      .filter((ids) => ids.length > 1)
      .flatMap((ids) => ids.map((id) => [id, ids.length] as const)),
  )
}
```

- [ ] **Step 4: helper 테스트를 다시 실행한다**

```bash
corepack pnpm --filter @hashi/admin exec vitest run --config vitest.config.ts src/pages/reservations/reservationConflicts.test.ts
```

Expected: 2개 테스트가 PASS한다.

---

### Task 3: 예약 관리 행 경고와 충돌 건수 배지

**Files:**

- Modify: `apps/admin/src/pages/reservations/ReservationsPage.test.tsx`
- Modify: `apps/admin/src/pages/reservations/ReservationsPage.tsx`
- Modify: `apps/admin/src/app/AdminConsole.spec.md`

**Interfaces:**

- Consumes: `getReservationConflictCounts(reservations)`의 `Map<number, number>`
- Produces: 충돌 행의 `bg-red-50` 경고 배경과 `동일 시간 N건` 배지

- [ ] **Step 1: 충돌 행 표시의 실패 테스트를 작성한다**

`ReservationsPage.test.tsx`에 다음 테스트를 추가한다.

```tsx
it('warns on active reservations for the same restaurant and minute', () => {
  useReservationsQueryMock.mockReturnValue({
    data: {
      page: 0,
      reservations: [
        reservation,
        {
          ...reservation,
          id: 92,
          reserverName: '이하시',
          reservationStatus: 'CONFIRMED',
          reservedAt: '2026-07-20T18:30:59',
        },
        {
          ...reservation,
          id: 93,
          reserverName: '박취소',
          reservationStatus: 'CANCELED',
        },
        {
          ...reservation,
          id: 94,
          reserverName: '최다른식당',
          restaurantId: 8,
        },
        {
          ...reservation,
          id: 95,
          reserverName: '정다른시간',
          reservedAt: '2026-07-20T18:31:00',
        },
      ],
      size: 20,
      totalCount: 5,
      totalPages: 1,
    },
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useReservationsQuery>)

  render(<ReservationsPage />)

  const warningBadges = screen.getAllByText('동일 시간 2건')
  expect(warningBadges).toHaveLength(2)
  warningBadges.forEach((badge) => {
    expect(badge.closest('tr')).toHaveClass('bg-red-50')
  })
  expect(screen.getByText('박취소').closest('tr')).not.toHaveClass('bg-red-50')
  expect(screen.getByText('최다른식당').closest('tr')).not.toHaveClass(
    'bg-red-50',
  )
  expect(screen.getByText('정다른시간').closest('tr')).not.toHaveClass(
    'bg-red-50',
  )
})
```

- [ ] **Step 2: 예약 관리 페이지 테스트를 실행해 경고 UI 부재를 확인한다**

```bash
corepack pnpm --filter @hashi/admin exec vitest run --config vitest.config.ts src/pages/reservations/ReservationsPage.test.tsx
```

Expected: `동일 시간 2건` 요소를 찾지 못해 FAIL한다.

- [ ] **Step 3: 충돌 Map을 계산하고 행과 시간 셀에 경고를 렌더링한다**

`ReservationsPage.tsx`에 helper import와 memoized 계산을 추가한다.

```tsx
import { getReservationConflictCounts } from '@/pages/reservations/reservationConflicts'

const conflictCounts = useMemo(
  () => getReservationConflictCounts(reservations),
  [reservations],
)
```

기존 `reservations.map` callback을 block body로 바꾸고 아래 구조로 렌더링한다.

```tsx
{
  reservations.map((reservation) => {
    const conflictCount = conflictCounts.get(reservation.id)

    return (
      <tr
        key={reservation.id}
        aria-label={
          conflictCount
            ? `${formatReservationId(reservation.id)} 동일 시간 예약 ${conflictCount}건`
            : undefined
        }
        className={
          conflictCount ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-cool-gray-50'
        }
      >
        <td className="text-cool-gray-700 px-3 py-3 text-sm font-bold">
          {formatReservationId(reservation.id)}
        </td>
        <td className="text-cool-gray-600 px-3 py-3 text-sm">
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1">
              <ClockIcon aria-hidden="true" className="size-4" />
              {formatDateTime(reservation.reservedAt)}
            </span>
            {conflictCount ? (
              <span className="bg-error/10 text-error inline-flex rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap">
                동일 시간 {conflictCount}건
              </span>
            ) : null}
          </div>
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
          <ReservationGuestLabel reservation={reservation} />
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
          <div className="flex min-w-max flex-nowrap items-center gap-2">
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
    )
  })
}
```

- [ ] **Step 4: helper와 예약 관리 페이지 테스트를 다시 실행한다**

```bash
corepack pnpm --filter @hashi/admin exec vitest run --config vitest.config.ts src/pages/reservations/reservationConflicts.test.ts src/pages/reservations/ReservationsPage.test.tsx
```

Expected: 두 테스트 파일의 모든 테스트가 PASS한다.

- [ ] **Step 5: AdminConsole spec에 경고 기준과 API 한계를 기록한다**

`apps/admin/src/app/AdminConsole.spec.md`의 Authentication and Reservations에 다음 내용을 추가한다.

```md
- 예약 관리 목록은 현재 조회된 page와 status filter 결과에서 `restaurantId`와 `reservedAt`의 분 단위 값이 같은 비취소 예약을 충돌로 표시한다.
- 충돌 그룹의 모든 행은 경고 배경과 `동일 시간 N건` 배지를 표시한다. 다른 page 또는 filter 밖의 충돌은 현재 API 계약으로 판별하지 않는다.
```

---

### Task 4: 전체 어드민 검증과 diff 확인

**Files:**

- Verify: `apps/admin/src/**/*`
- Verify: `docs/superpowers/specs/2026-07-15-admin-restaurant-tags-reservation-conflicts-design.md`
- Verify: 현재 Git diff와 branch 상태

**Interfaces:**

- Consumes: Task 1~3의 구현과 테스트
- Produces: admin 테스트·lint·typecheck·build·format·diff의 최신 성공 증거

- [ ] **Step 1: admin 전체 테스트를 실행한다**

```bash
corepack pnpm --filter @hashi/admin test
```

Expected: 모든 admin 테스트가 PASS한다.

- [ ] **Step 2: admin lint와 typecheck를 실행한다**

```bash
corepack pnpm --filter @hashi/admin lint
corepack pnpm --filter @hashi/admin typecheck
```

Expected: 두 명령이 exit code 0으로 끝난다.

- [ ] **Step 3: admin production build를 실행한다**

```bash
corepack pnpm --filter @hashi/admin build
```

Expected: TypeScript build와 Vite production build가 exit code 0으로 끝난다.

- [ ] **Step 4: formatting과 diff를 검사한다**

```bash
corepack pnpm format:check
git diff --check
git status --short
git branch --show-current
git log --oneline develop..HEAD
```

Expected: format과 diff check가 통과하고, branch는 `fix/HASHI-132-first-qa`이며 새 commit이 없다.
