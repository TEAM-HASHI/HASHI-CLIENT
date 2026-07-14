# Reservation First QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 예약 흐름의 일반 식당 이미지 로드 실패를 화면별 지정 기본 이미지로 처리하고, 요청사항 textarea의 포커스 border와 긴 식당 주소의 줄바꿈을 보정한다.

**Architecture:** 예약 입력 화면은 이미지 URL별 실패 상태를 추적해 검은색 `HashiPlaceholderIcon`을 표시하고, 예약 확인 화면은 앱 공통 `ImageWithDefaultFallback`을 적용한다. 일반 예약과 어디든 예약이 이미 공유하는 `ReservationRequestNoteField`에서만 textarea class를 덮어쓰고, 예약 정보·확인 모달의 주소 행은 고정 폭 대신 남은 가로폭을 사용한다. HDS 전역 스타일과 form 상태는 변경하지 않는다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest, Testing Library, pnpm

## Global Constraints

- `10자 이상` 안내 문구와 최소 길이 검증을 추가하지 않는다.
- 요청사항은 선택 입력이며 최대 1000자 제한과 counter를 유지한다.
- 요청사항 값에 따른 CTA 활성 조건을 변경하지 않는다.
- 예약 입력 화면의 이미지 fallback은 기존 검은색 `HashiPlaceholderIcon`을 사용한다.
- 어디든 예약의 `HashiPlaceholderIcon`을 유지한다.
- HDS `Textarea`의 전역 스타일을 변경하지 않는다.
- 긴 식당 주소를 말줄임하거나 한 줄로 고정하지 않는다.
- 예약 정보 영역과 최종 확인 모달의 주소 행을 함께 변경한다.
- 사용자 요청에 따라 commit과 push를 실행하지 않는다.

---

### Task 1: 예약 식당 이미지 오류 fallback

**Files:**

- Modify: `apps/client/src/pages/restaurantReservationNew/RestaurantReservationNewPage.test.tsx`
- Modify: `apps/client/src/pages/reservationRequest/ReservationRequestPage.test.tsx`
- Modify: `apps/client/src/pages/restaurantReservationNew/components/ReservationRestaurantSummary.tsx`
- Modify: `apps/client/src/pages/reservationRequest/components/ReservationRequestInfoSection.tsx`
- Modify: `apps/client/src/pages/restaurantReservationNew/RestaurantReservationNewPage.spec.md`
- Modify: `apps/client/src/pages/reservationRequest/ReservationRequestPage.spec.md`

**Interfaces:**

- Consumes: HDS `HashiPlaceholderIcon`, `ImageWithDefaultFallbackProps`의 `src`, `alt`, `className`, `fallbackLogoSize`
- Produces: 예약 입력 화면의 검은색 `HashiPlaceholderIcon`과 예약 확인 화면의 `DefaultImage` fallback

- [ ] **Step 1: 두 화면에 실패 테스트를 추가한다**

```tsx
it('shows the black Hashi placeholder when the restaurant image fails to load', () => {
  renderPage()

  const restaurantImage = screen.getByRole('img', {
    name: '하시 스시 식당 이미지',
  })

  fireEvent.error(restaurantImage)

  expect(
    screen.queryByRole('img', { name: '하시 스시 식당 이미지' }),
  ).not.toBeInTheDocument()
  const placeholder = screen.getByRole('img', {
    name: '하시 스시 식당 기본 이미지',
  })

  expect(placeholder.tagName).toBe('svg')
  expect(placeholder.querySelector('rect')).toHaveAttribute('fill', 'black')
})
```

`ReservationRequestPage.test.tsx`에는 fixture 이름인 `야키니쿠 리키마루 이케부쿠로 히가시구치 텐 식당 이미지`로 기존 회색 `DefaultImage` 동작을 검증한다.

- [ ] **Step 2: 실패 테스트를 실행한다**

```bash
corepack pnpm --filter @hashi/client exec vitest run src/pages/restaurantReservationNew/RestaurantReservationNewPage.test.tsx src/pages/reservationRequest/ReservationRequestPage.test.tsx
```

Expected: 예약 입력 화면 테스트가 기존 회색 `DefaultImage` 때문에 FAIL하고, 예약 확인 화면 테스트는 기존 `<img>`가 유지되어 FAIL한다.

- [ ] **Step 3: 최소 구현으로 공통 fallback을 적용한다**

`ReservationRestaurantSummary.tsx`:

```tsx
const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
const shouldShowImage = imageUrl && failedImageUrl !== imageUrl

{
  shouldShowImage ? (
    <img
      alt={`${name} 식당 이미지`}
      className="size-15 shrink-0 rounded-[5px] object-cover"
      onError={() => setFailedImageUrl(imageUrl)}
      src={imageUrl}
    />
  ) : (
    <HashiPlaceholderIcon
      aria-label={`${name} 식당 기본 이미지`}
      className="size-15 shrink-0"
      role="img"
    />
  )
}
```

`ReservationRequestInfoSection.tsx`:

```tsx
{
  isAnywhereReservation && !restaurantImageUrl ? (
    <HashiPlaceholderIcon
      aria-label="어디든 예약 식당 기본 이미지"
      className="size-15 shrink-0"
      role="img"
    />
  ) : (
    <ImageWithDefaultFallback
      alt={`${restaurantName} 식당 이미지`}
      className="size-15 shrink-0 rounded-[5px] object-cover"
      fallbackLogoSize="sm"
      src={restaurantImageUrl ?? undefined}
    />
  )
}
```

- [ ] **Step 4: 페이지 spec을 실제 fallback 동작과 동기화한다**

`RestaurantReservationNewPage.spec.md`에는 검은색 `HashiPlaceholderIcon`, `ReservationRequestPage.spec.md`에는 `DefaultImage`가 표시된다고 명시한다.

- [ ] **Step 5: 관련 테스트를 다시 실행한다**

```bash
corepack pnpm --filter @hashi/client exec vitest run src/pages/restaurantReservationNew/RestaurantReservationNewPage.test.tsx src/pages/reservationRequest/ReservationRequestPage.test.tsx
```

Expected: 두 테스트 파일의 모든 테스트가 PASS한다.

### Task 2: 요청사항 textarea 포커스 검정 border

**Files:**

- Modify: `apps/client/src/features/reservation/components/reservationRequestNoteField/ReservationRequestNoteField.test.tsx`
- Modify: `apps/client/src/features/reservation/components/reservationRequestNoteField/ReservationRequestNoteField.tsx`
- Modify: `apps/client/src/features/reservation/components/reservationRequestNoteField/ReservationRequestNoteField.spec.md`

**Interfaces:**

- Consumes: HDS `Textarea`의 `textareaClassName`
- Produces: 기본 상태에서 회색 1px, 포커스 상태에서 검정색 1px border를 사용하는 기존 controlled field contract

- [ ] **Step 1: 기본 회색·포커스 검정 border 실패 테스트를 작성한다**

```tsx
it('uses the default gray border and a black focus border', () => {
  render(<ReservationRequestNoteField onValueChange={vi.fn()} value="" />)

  const requestNoteField = screen.getByRole('textbox', {
    name: '요청사항 (선택)',
  })

  expect(requestNoteField).toHaveClass(
    'border-warm-gray-100',
    'focus-visible:border-black',
    'focus-visible:outline-0',
  )
  expect(requestNoteField).not.toHaveClass(
    'border-black',
    'focus-visible:border-primary-400',
  )
})
```

- [ ] **Step 2: 실패 테스트를 실행한다**

```bash
corepack pnpm --filter @hashi/client exec vitest run src/features/reservation/components/reservationRequestNoteField/ReservationRequestNoteField.test.tsx
```

Expected: `border-warm-gray-100`이 없고 `border-black`이 남아 있어 FAIL한다.

- [ ] **Step 3: feature 전용 textarea class만 수정한다**

```tsx
textareaClassName =
  'min-h-[140px] focus-visible:border-black focus-visible:outline-0'
```

- [ ] **Step 4: component spec을 회색·검정 border 요구사항과 동기화한다**

기본 border는 회색 1px, 포커스 border는 검정색 1px이며 선택 입력, 1000자 제한, counter와 submit 비소유 책임은 유지한다고 명시한다.

- [ ] **Step 5: 관련 테스트를 다시 실행한다**

```bash
corepack pnpm --filter @hashi/client exec vitest run src/features/reservation/components/reservationRequestNoteField/ReservationRequestNoteField.test.tsx
```

Expected: 테스트 파일의 모든 테스트가 PASS한다.

### Task 3: 긴 식당 주소 줄바꿈

**Files:**

- Modify: `apps/client/src/pages/reservationRequest/ReservationRequestPage.test.tsx`
- Modify: `apps/client/src/pages/reservationRequest/components/ReservationRequestInfoSection.tsx`
- Modify: `apps/client/src/pages/reservationRequest/components/ReservationConfirmDialog.tsx`
- Modify: `apps/client/src/pages/reservationRequest/ReservationRequestPage.spec.md`

**Interfaces:**

- Consumes: `ReservationInfoRow`와 `ReservationConfirmRow`의 `multiline` 분기
- Produces: 주소 값이 남은 가로폭을 사용하고 필요한 경우에만 자연스럽게 줄바꿈되는 레이아웃

- [ ] **Step 1: 예약 정보 영역과 확인 모달의 실패 테스트를 작성한다**

```tsx
const longRestaurantAddress = '도쿄도 지요다구 진보초 2-3-1'

mockLocationState.current = {
  ...reservationDraft,
  restaurantAddress: longRestaurantAddress,
}
renderPage()

const pageAddress = screen.getByText(longRestaurantAddress)

expect(pageAddress).toHaveClass('min-w-0', 'flex-1', 'text-pretty')
expect(pageAddress).not.toHaveClass('max-w-[149px]')

fireEvent.click(screen.getByRole('button', { name: '예약 요청' }))

const dialogAddress = within(
  screen.getByRole('alertdialog', { name: '예약을 진행할까요?' }),
).getByText(longRestaurantAddress)

expect(dialogAddress).toHaveClass('min-w-0', 'flex-1', 'text-pretty')
expect(dialogAddress).not.toHaveClass('max-w-[150px]')
```

- [ ] **Step 2: 실패 테스트를 실행한다**

```bash
corepack pnpm --filter @hashi/client exec vitest run src/pages/reservationRequest/ReservationRequestPage.test.tsx
```

Expected: 주소 값에 `min-w-0`, `flex-1`, `text-pretty`가 없어 FAIL한다.

- [ ] **Step 3: 두 multiline 주소 값의 고정 폭을 제거한다**

```tsx
multiline
  ? 'typo-body-6 text-cool-gray-900 min-w-0 flex-1 text-right leading-[1.36] break-keep text-pretty'
  : 'typo-body-6 text-cool-gray-900 text-right leading-[1.36] whitespace-nowrap'
```

- [ ] **Step 4: page spec을 주소 줄바꿈 정책과 동기화한다**

예약 정보 영역과 최종 확인 모달의 긴 식당 주소는 남은 폭을 사용하고, 공간이 부족할 때만 전체 내용을 보존한 채 줄바꿈한다고 명시한다.

- [ ] **Step 5: 관련 테스트를 다시 실행한다**

```bash
corepack pnpm --filter @hashi/client exec vitest run src/pages/reservationRequest/ReservationRequestPage.test.tsx
```

Expected: 테스트 파일의 모든 테스트가 PASS한다.

### Task 4: 전체 검증

**Files:**

- Verify: `apps/client/src/**/*`
- Verify: 현재 Git diff

**Interfaces:**

- Consumes: Task 1과 Task 2의 변경 결과
- Produces: 테스트, lint, typecheck, diff check의 최신 성공 증거

- [ ] **Step 1: client 전체 테스트를 실행한다**

```bash
corepack pnpm --filter @hashi/client test
```

Expected: 모든 client 테스트가 PASS한다.

- [ ] **Step 2: client lint와 typecheck를 실행한다**

```bash
corepack pnpm --filter @hashi/client lint
corepack pnpm --filter @hashi/client typecheck
```

Expected: 두 명령이 exit code 0으로 끝난다.

- [ ] **Step 3: formatting과 diff를 검사한다**

```bash
corepack pnpm format:check
git diff --check
git status --short
```

Expected: formatting과 diff check가 exit code 0이며, 변경 파일은 이 계획 범위로 한정된다.
