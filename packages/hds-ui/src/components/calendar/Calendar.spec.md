# Component Spec: `Calendar`

Jira: HASHI-177 (최초 구현: HASHI-42)

## Purpose

`Calendar`는 월 단위 날짜 선택 UI를 그리는 HDS의 공통 interactive primitive입니다.

HDS는 **월 헤더, 이전/다음 월 탐색 버튼, 날짜 grid, 선택/비활성 날짜의 시각 상태, 기본 접근성 계약, controlled selection callback**만 담당합니다. 실제 예약 가능 여부 계산, API 호출, query/mutation, 예약 정책, 영업일 규칙, 결제/예약 submit, analytics, 제품 copy는 App Shell / Page / Feature에서 처리합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Figma Reference

- [Calendar 리디자인](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=7869-36523&m=dev)
- 기본 날짜: `7869:36535`, 선택 예시: `7869:36537`, 선택 날짜: `7869:36542`
- month header: left `icon_back`, two-line year/month text, right `icon_next`
- weekday row: 최신 디자인에서는 표시하지 않음
- date grid: 7 columns, month days only
- selected date state: black rounded rectangle
- unavailable date state: muted cool-gray text

## HDS 판단

`Calendar` v1에 포함하는 패턴:

- 하나의 visible month를 렌더링합니다.
- 이전/다음 월 탐색 UI를 렌더링하고 호출부 callback을 실행합니다.
- 현재 선택된 날짜를 controlled prop으로 받습니다.
- 선택 가능한 날짜를 클릭하면 호출부 callback을 실행합니다.
- 선택 불가 날짜는 비활성 시각 상태와 interaction 차단을 제공합니다.
- 날짜 비활성 여부는 도메인 중립 API인 `disabledDates` 또는 `isDateDisabled`로 주입받습니다.

`Calendar` v1에 포함하지 않는 패턴:

- 예약 가능 여부 API 호출
- 서버 응답 shape 매핑
- 예약, 결제, 매장 휴무일 같은 도메인 정책 계산
- 날짜 범위 선택
- 시간 선택
- 오늘 날짜 강조
- multi-month view
- popover/date input overlay
- locale/timezone 전역 정책

오늘 날짜 강조, range selection, popover date picker는 실제 사용처가 확정되면 별도 prop 또는 별도 HDS/App component로 검토합니다.

## Usage Location

- spec path: `packages/hds-ui/src/components/calendar/Calendar.spec.md`
- implementation path: `packages/hds-ui/src/components/calendar/Calendar.tsx`
- local export: `packages/hds-ui/src/components/calendar/index.ts`
- public export: `packages/hds-ui/src/components/index.ts`

## Public API

```tsx
<Calendar
  month={new Date(2026, 5, 1)}
  selectedDate={new Date(2026, 5, 1)}
  disabledDates={[new Date(2026, 5, 6), new Date(2026, 5, 13)]}
  onMonthChange={(nextMonth) => {
    setMonth(nextMonth)
  }}
  onDateSelect={(date) => {
    setSelectedDate(date)
  }}
/>
```

- public export 여부: `Calendar` value export
- public props type export 여부: `CalendarProps`
- 호출부가 소유하는 책임:
  - visible month state
  - selected date state
  - disabled date source and calculation
  - month change side effects
  - date selection side effects
  - product copy, API, route, query, mutation, analytics
- 컴포넌트가 소유하지 않는 책임:
  - 예약 가능/불가능 정책 계산
  - 서버 데이터 fetching
  - date input parsing
  - popover positioning
  - timezone conversion policy

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] `month` 기준으로 visible month를 렌더링합니다.
- [x] visible month 외 날짜는 v1에서 렌더링하지 않고 empty grid cell로 정렬합니다.
- [x] 요일 행은 표시하지 않으며 날짜는 일요일부터 토요일 순서의 7개 column으로 렌더링합니다.
- [x] 날짜 column은 `36px` 셀 7개를 부모 너비 안에 균등 분산합니다. 최소 콘텐츠 너비는 `252px`입니다.
- [x] 날짜 visual은 각 grid cell 중앙에 정렬합니다.
- [x] month header는 `44px` 높이 안에서 연도와 월을 세로 2줄로 중앙 정렬합니다.
- [x] 연도 label은 `typo-body-3`, `text-cool-gray-900` 기준을 따릅니다.
- [x] 월 label은 `typo-sub-header-1`, `text-black` 기준을 따릅니다.
- [x] 날짜 셀 높이는 `36px`, 세로 row gap은 `6px`로 고정해 선택 시 행이 움직이지 않게 합니다.
- [x] 일반 날짜는 너비 `34px`, `padding: 5px 6px`이며 선택 날짜는 `36px × 36px`, `padding: 4px 7px`입니다.
- [x] 선택 가능한 날짜는 `typo-body-4`, `text-black` 기준을 따릅니다.
- [x] 선택 불가 날짜는 `typo-body-4`, `text-cool-gray-400` 기준을 따릅니다.
- [x] 선택된 날짜는 `rounded-[5px]`, `bg-black`, `typo-sub-header-2`, `text-white` 기준을 따릅니다.
- [x] 선택 불가 날짜는 선택되지 않고 `onDateSelect`를 호출하지 않습니다.
- [x] 선택된 날짜가 비활성 날짜로도 전달되면 비활성보다 선택 상태를 우선하지 않습니다. 호출부 데이터가 충돌하지 않도록 spec과 story에서 안내합니다.
- [x] 월 이동 버튼은 native `button` 기반으로 렌더링합니다.
- [x] 월 이동 버튼에는 accessible name을 제공합니다.
- [x] `onMonthChange`가 없으면 월 이동 버튼은 disabled 상태로 렌더링합니다.
- [x] `minMonth`가 visible month와 같거나 이후면 이전 달 버튼은 disabled 상태로 렌더링합니다.
- [x] 날짜 버튼에는 기본적으로 `YYYY년 M월 D일` 형태의 accessible name을 제공합니다.
- [x] `className`은 root에 안전하게 병합합니다.

## UI Structure

```text
Calendar
  Header
    Previous month button
    Year label
    Month label
    Next month button
  Date grid
    Empty cell x leading offset
    Date button x month day count
```

## Props

### `month`

- type: `Date`
- required: `true`
- description: 렌더링할 visible month입니다. day/time 값은 무시하고 year/month만 사용합니다.

### `selectedDate`

- type: `Date`
- required: `false`
- description: 선택된 날짜입니다. 같은 year/month/day인 날짜 button을 selected state로 표시합니다.

### `disabledDates`

- type: `Date[]`
- required: `false`
- default: `[]`
- description: 선택할 수 없는 날짜 목록입니다. 같은 year/month/day인 날짜를 disabled state로 표시합니다. 예약 불가능 날짜, 휴무일, 마감 날짜 같은 도메인 판단은 호출부에서 이 prop으로 변환해 전달합니다.

### `isDateDisabled`

- type: `(date: Date) => boolean`
- required: `false`
- description: 날짜별 disabled 여부를 계산하는 callback입니다. `disabledDates`로 표현하기 어려운 규칙형 비활성 상태에 사용합니다.

### `minMonth`

- type: `Date`
- required: `false`
- description: 이전 월 이동의 하한입니다. visible month가 같은 month이거나 이전이면 이전 달 버튼을 disabled 처리합니다. 날짜 선택 가능 여부와 도메인 정책은 호출부가 계속 소유합니다.

### `onDateSelect`

- type: `(date: Date) => void`
- required: `false`
- description: 활성 날짜를 선택했을 때 호출됩니다. disabled date와 empty cell에서는 호출하지 않습니다.

### `onMonthChange`

- type: `(nextMonth: Date) => void`
- required: `false`
- description: 이전/다음 월 버튼을 눌렀을 때 호출됩니다. HDS는 내부 month state를 소유하지 않습니다.

### `formatYearLabel`

- type: `(month: Date) => string`
- required: `false`
- default: visible month year label, for example `'2026'`
- description: month header의 연도 label을 포맷합니다. v1 기본값은 현재 디자인 기준인 numeric year label입니다.

### `formatMonthLabel`

- type: `(month: Date) => string`
- required: `false`
- default: Korean numeric month label, for example `'6월'`
- description: month header label을 포맷합니다. v1 기본값은 현재 디자인 기준인 Korean month label입니다.

### `getDateAriaLabel`

- type: `(date: Date) => string`
- required: `false`
- default: Korean full date label, for example `'2026년 6월 1일'`
- description: 날짜 button의 accessible name을 포맷합니다. visible text는 숫자만 유지하되 스크린리더에는 연/월/일 정보를 제공합니다.

### `className`

- type: `string`
- required: `false`
- description: root element에 병합할 class입니다.

### native root props

- type: `Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'onChange'>`
- required: `false`
- description: root `section`에 전달할 native props입니다. `children`은 Calendar 내부 구조가 소유합니다.

## Recommended API

```tsx
export type CalendarProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'children' | 'onChange'
> & {
  month: Date
  selectedDate?: Date
  disabledDates?: Date[]
  isDateDisabled?: (date: Date) => boolean
  minMonth?: Date
  onDateSelect?: (date: Date) => void
  onMonthChange?: (nextMonth: Date) => void
  formatYearLabel?: (month: Date) => string
  formatMonthLabel?: (month: Date) => string
  getDateAriaLabel?: (date: Date) => string
}
```

`disabledDates`와 `isDateDisabled`가 모두 제공되면 둘 중 하나라도 `true`인 날짜를 disabled로 처리합니다.

## State

- local state: 없음
- controlled state:
  - `month`
  - `selectedDate`
- uncontrolled state: v1에서는 지원하지 않음
- loading state: v1에서는 지원하지 않음
- error state: v1에서는 지원하지 않음
- disabled state:
  - date-level disabled and optional previous-month navigation boundary
  - component 전체 disabled는 v1에서 지원하지 않음

## Behavior

1. `month`의 year/month를 기준으로 첫 요일 offset과 월 일수를 계산합니다.
2. 요일 row는 렌더링하지 않습니다.
3. 날짜 grid는 7 columns를 유지하고 첫 날짜 전 empty cell을 렌더링합니다.
4. 각 날짜는 native `button`으로 렌더링합니다.
5. 활성 날짜를 클릭하면 해당 날짜의 `Date` 객체로 `onDateSelect`를 호출합니다.
6. disabled 날짜를 클릭해도 `onDateSelect`를 호출하지 않습니다.
7. selected date는 `aria-pressed="true"`와 selected visual state를 가집니다.
8. disabled date는 native `disabled`를 우선 사용합니다.
9. `minMonth`가 없거나 visible month보다 이르면 이전 월 버튼을 클릭해 `onMonthChange(previousMonth)`를 호출합니다.
10. 다음 월 버튼을 클릭하면 `onMonthChange(nextMonth)`를 호출합니다.
11. `onMonthChange`가 없으면 이전/다음 월 버튼은 disabled 상태로 렌더링하고 내부 상태를 변경하지 않습니다. `minMonth`가 visible month와 같거나 이후면 이전 달 버튼도 disabled 상태로 렌더링합니다.

## Date Matching

날짜 비교는 year/month/day 단위로만 수행합니다.

- `Date`의 hour/minute/second/millisecond는 비교에서 제외합니다.
- `month` prop도 year/month만 사용합니다.
- timezone 변환 정책은 호출부 책임입니다.
- HDS 내부 helper는 public export하지 않습니다.

## Styling

- root:
  - `w-full`
  - white background는 호출부 surface에 맡기되 story에서는 white wrapper를 제공합니다.
- header:
  - horizontal layout
  - bottom spacing to date grid: `26px`
  - left/right icon button과 centered month label
  - month label: `typo-sub-header-1`, `text-black`
  - icon color: `text-cool-gray-900`
  - icon source: `BackIcon`, `NextIcon` from `@hashi/hds-icons`
- date grid:
  - `grid`, `grid-template-columns: repeat(7, auto)`, `justify-content: space-between`
  - `row-gap: 6px`
  - date cell: `size-9` (`36px × 36px`), center alignment
  - date button: `w-8.5`, `py-1.25 px-1.5`, `rounded-[5px]`
  - available date: `typo-body-4`, `text-black`
  - disabled date: `typo-body-4`, `text-cool-gray-400`
  - selected date: `size-9`, `py-1 px-1.75`, `typo-sub-header-2`, `bg-black`, `text-white`
- focus-visible:
  - `focus-visible:outline-2`
  - `focus-visible:outline-offset-2`
  - `focus-visible:outline-cool-gray-900`

### Token Notes

- `Black`은 Tailwind 기본 `text-black`/`bg-black` utility를 사용합니다.
- `radius 5`는 현재 radius token이 없으므로 `rounded-[5px]`를 사용합니다.
- spacing/sizing은 Tailwind scale을 사용합니다: `py-1.25` = 5px, `px-1.5` = 6px, `size-9` = 36px.
- Figma 기본 날짜는 너비 34px, 선택 날짜는 36px입니다. 모든 날짜의 배치 공간을 36px로 통일해 선택 상태 변경 시 행/열 이동을 막습니다.
- Figma 기본/선택 예시의 날짜 영역 시작점은 2px 다릅니다. 선택 예시의 header–grid 간격 26px를 기준으로 사용하며, 날짜 행 간격은 42px로 통일합니다.
- Figma의 346px는 비교용 너비이며 root에 고정하지 않습니다. 36px 셀 사이의 수평 간격은 부모 너비에 맞춰 분산합니다.
- Figma 예시의 2026년 6월에 포함된 31일과 날짜 시작 위치는 복제하지 않습니다. 실제 연월의 일수와 시작 요일을 계산합니다.
- `weekdayLabels`, `weekdayAriaLabels`는 요일 행 제거와 함께 public API에서 제거했습니다. 기존 앱 호출부 두 곳에서는 사용하지 않습니다.

## Accessibility

- root semantic element: `section`
- root accessible name:
  - default `aria-label="달력"`
  - 호출부에서 `aria-label` 또는 `aria-labelledby`로 대체 가능
- month navigation:
  - previous button accessible name: `이전 달`
  - next button accessible name: `다음 달`
  - native button keyboard interaction을 따릅니다.
  - `onMonthChange`가 없으면 previous/next button은 native `disabled` 상태가 됩니다.
  - `minMonth`가 visible month와 같거나 이후면 previous button은 native `disabled` 상태가 됩니다.
- date grid:
  - v1은 native button grid로 구현합니다.
  - `role="grid"`/roving tabindex는 v1에서 도입하지 않습니다. 완전한 date picker keyboard contract가 필요해지면 `react-aria-components` 기반 Calendar로 확장합니다.
  - selected date에는 button 역할에 맞는 `aria-pressed="true"`를 제공합니다.
  - disabled date에는 native `disabled`를 사용합니다.
- visible text:
  - date button의 visible text는 숫자만 렌더링합니다.
  - date button의 accessible name은 `getDateAriaLabel` 결과를 사용합니다.
  - 기본 accessible name은 `2026년 6월 1일` 형식입니다.
- focus-visible:
  - keyboard focus outline을 제공합니다.

## Dependencies

- components: none
- icons:
  - `BackIcon` from `@hashi/hds-icons`
  - `NextIcon` from `@hashi/hds-icons`
- utils:
  - `cn` from `packages/hds-ui/src/utils`
- hooks: none
- APIs: none
- external libraries:
  - React
  - `class-variance-authority`는 상태별 class 조합이 길어지는 경우 사용합니다. 단순 조건이면 `cn`만 사용합니다.
  - `react-aria-components`는 v1에서 사용하지 않습니다. full date picker keyboard/accessibility contract가 필요해질 때 도입합니다.

## Storybook

- [x] Default month
- [x] Selected date
- [x] Disabled dates
- [x] Selected and disabled mixed example
- [x] Month navigation callbacks
- [x] Minimum month previous-navigation disabled state
- [x] Custom month label formatter
- [x] Figma 비교용 346px 콘텐츠 너비
- [x] Narrow container: 320px viewport에서 좌우 여백 32px를 제외한 256px 콘텐츠 너비
- [x] Six-week month: 2026년 8월
- [x] Long root `aria-label` or labelled wrapper accessibility check

v1에서 loading, error, invalid, range selection, time selection, popover positioning은 지원하지 않습니다.

## Public API

- [x] `Calendar` value export
- [x] `CalendarProps` type export
- [x] no private helper export

## HDS가 가지면 안 되는 것

- 예약 가능 여부 API 호출
- 예약 불가 사유 copy
- 매장 영업일, 휴무일, 브레이크타임 계산
- 결제/예약 submit
- App route 이동
- React Router 의존성
- query/mutation 의존성
- analytics event 전송
- 서버 응답 shape 하드코딩
- product-specific timezone policy

## Verification

- [x] `pnpm format:check`
- [x] `pnpm --filter @hashi/hds-ui lint`
- [x] `pnpm --filter @hashi/hds-ui typecheck`
- [x] `pnpm --filter @hashi/hds-ui build`
- [x] `pnpm --filter @hashi/hds-ui test`
- [x] `pnpm build-storybook`
- [x] 기본/선택/비활성/월 이동/좁은 너비/6주 렌더링을 브라우저에서 확인
- [x] 선택 전후 날짜 중심 좌표와 행 높이가 동일한지 확인
- [x] `pnpm --filter @hashi/client typecheck` — 앱 호출부 호환성 확인
- [x] Tab으로 비활성 날짜 건너뛰기, 포커스 표시, Enter로 날짜 선택 확인

2026-09-07 검증: HDS 19개 파일/179개 테스트 통과. 브라우저에서 346px/256px 콘텐츠 너비, 320px viewport, 선택 전후 중심 좌표 유지, 월 이동 및 6주 렌더링을 확인했습니다. 예약 API 및 실제 예약 제출은 변경하지 않았으며 이번 검증 범위에 포함하지 않습니다.
