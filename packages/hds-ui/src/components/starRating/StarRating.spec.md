# Component Spec: `StarRating`

Jira: HASHI-59

## Purpose

`StarRating`은 숫자 평점을 5개의 별 아이콘으로 표시하는 HDS의 read-only UI primitive입니다.

HDS는 **평점 숫자를 별의 filled / half / empty 시각 상태로 변환하는 표시 규칙, 별 크기, 간격, 색상, 접근성 텍스트, layout 안정성**을 담당합니다. 실제 평점 데이터 조회, 리뷰 API, 점수 산정 정책, 평점 문구, 클릭을 통한 점수 입력, analytics는 호출부가 소유합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Figma Reference

- `Common_Components / rating_star_*`: 5개 별로 평점을 표시하는 패턴
- 큰 별: 리뷰 작성/평점 강조 화면에서 사용하는 `36px` 별
- 작은 별: 카드, 리스트, 요약 정보에서 사용하는 작은 별

## Spec Location

- spec path: `packages/hds-ui/src/components/starRating/StarRating.spec.md`
- implementation path: `packages/hds-ui/src/components/starRating/StarRating.tsx`

## Usage Location

- route: 앱 호출부에서 결정합니다.
- page: 앱 호출부에서 결정합니다.
- feature: 식당, 리뷰, 예약 등 도메인별 평점 데이터 매핑은 앱 호출부가 소유합니다.
- expected path: `packages/hds-ui/src/components/starRating/StarRating.tsx`

## Scaffold

새 public HDS component이므로 구현 시 generator 사용을 우선합니다.

```bash
pnpm gen:ds-component
```

## Public API

```tsx
<StarRating value={3.8} />
<StarRating value={4.2} size="sm" aria-label="평점 4.2점" />
```

- public export 여부: `@hashi/hds-ui`에서 `StarRating` named export
- public props type export 여부: `StarRatingProps`, `StarRatingSize` export
- 호출부가 소유하는 책임:
  - 서버 또는 로컬 상태에서 받은 원본 평점 숫자 전달
  - 평점 데이터가 없을 때 `StarRating`을 렌더링할지 여부 결정
  - 평점 숫자 텍스트, 리뷰 수, 도메인 copy 렌더링
  - 클릭으로 점수를 선택하는 입력 flow
  - API, query, mutation, route update, analytics 실행
- 컴포넌트가 소유하지 않는 책임:
  - 서버 상태 조회 또는 변경
  - 평점 산정 business rule
  - 평점 텍스트 copy 고정
  - interactive rating input

`StarRating`은 별 아이콘 묶음만 렌더링합니다. 평점 숫자 텍스트, 리뷰 수, “평점 없음” 같은 fallback copy는 렌더링하지 않습니다.

Exported value:

- `StarRating`

Exported types:

- `StarRatingProps`
- `StarRatingSize`

## Requirements

- [x] 숫자 평점을 5개의 별로 표시합니다.
- [x] 별은 `filled`, `half`, `empty` 상태를 가질 수 있습니다.
- [x] 호출부는 `value`를 `0` 이상 `5` 이하의 평점 숫자로 전달합니다.
- [x] 원본 `value`는 컴포넌트 내부에서 정수 또는 `.5` 표시값으로 변환합니다.
- [x] 정수 평점은 그대로 표시하고, 소수점이 있는 평점은 정수부 + `0.5`칸으로 표시합니다.
- [x] `0`은 모든 별을 `empty`로 표시합니다.
- [x] `0.5`는 첫 번째 별을 `half`로 표시합니다.
- [x] `3.8`은 `3.5`칸으로 표시합니다.
- [x] `1.01 ~ 1.99`는 `1.5`칸으로 표시합니다.
- [x] `4.1 ~ 4.9`는 `4.5`칸으로 표시합니다.
- [x] 별 크기는 `size` prop으로 제어합니다.
- [x] fill 여부와 size를 하나의 variant 값에 섞지 않고 별도 축으로 관리합니다.
- [x] 고정 width/height 컨테이너에 의존하지 않고 아이콘 크기와 gap으로 layout을 정합니다.
- [x] 표시 전환 시 별 간격과 전체 box가 흔들리지 않아야 합니다.

## UI Structure

```text
StarRating
  StarItem x 5
    EmptyStar
    FilledStar? (half 상태에서는 width 50%로 clipping)
```

## Props

### `value`

- type: `number`
- required: `true`
- description: 호출부가 전달하는 원본 평점 숫자입니다. HDS는 이 값을 표시용 정수 또는 `.5` 단위로 변환합니다.

### `size`

- type: `'sm' | 'md'`
- required: `false`
- default: `'md'`
- description: 별 아이콘의 visual size와 gap을 결정합니다.

| size | star size | 주요 용도                 |
| ---- | --------: | ------------------------- |
| `sm` |    `18px` | 카드, 리스트, 요약 정보   |
| `md` |    `36px` | 리뷰 작성, 평점 강조 영역 |

### `aria-label`

- type: `string`
- required: `false`
- default: `평점 {value}점`
- description: read-only 별점 묶음의 접근성 이름입니다. 제품 copy가 필요하면 호출부가 직접 전달합니다.

### `className`

- type: `string`
- required: `false`
- description: root element에 병합할 class입니다.

## State

- local state: 없음
- controlled state: 없음
- uncontrolled state: 없음
- loading state: 제공하지 않음
- error state: 제공하지 않음
- disabled state: 제공하지 않음
- display state: `filled`, `half`, `empty`

## Behavior

1. `value`는 호출부에서 `0` 이상 `5` 이하의 숫자로 전달합니다.
2. 표시값은 정수 평점이면 그대로 사용하고, 소수점이 있는 평점이면 `Math.floor(value) + 0.5`로 계산합니다.
3. 각 별은 1-based index 기준으로 다음 상태를 결정합니다.
   - `displayValue >= index`: `filled`
   - `displayValue >= index - 0.5`: `half`
   - 그 외: `empty`
4. `half` 상태는 `StarBlankIcon` 위에 `StarFillIcon`을 50% width로 clipping해 표현합니다.
5. 모든 별 아이콘은 장식 요소로 숨기고, root의 접근성 이름으로 전체 평점을 전달합니다.
6. 클릭, hover, keyboard 입력으로 값을 변경하지 않습니다.

## Display Value Examples

| value       | display value | visual result               |
| ----------- | ------------: | --------------------------- |
| `0`         |           `0` | empty 5                     |
| `0.5`       |         `0.5` | half 1 + empty 4            |
| `1`         |           `1` | filled 1                    |
| `1.01~1.99` |         `1.5` | filled 1 + half 1           |
| `3.8`       |         `3.5` | filled 3 + half 1 + empty 1 |
| `4.1~4.9`   |         `4.5` | filled 4 + half 1           |
| `4.99`      |         `4.5` | filled 4 + half 1           |
| `5`         |           `5` | filled 5                    |

## Validation

- 필드별 검증 규칙: 없음
- 버튼 활성/비활성 조건: 없음
- invalid 상태 표시 방식: 제공하지 않음
- `value` 범위 검증과 fallback 여부는 호출부에서 처리합니다.

## Error Handling

- 서버 에러나 fallback copy는 호출부에서 처리합니다.
- 평점 데이터가 없을 때 별점을 숨길지, `0`점으로 표시할지, 별도 문구를 보여줄지는 호출부에서 결정합니다.
- `StarRating`은 “평점 없음” 같은 fallback copy를 직접 렌더링하지 않습니다.
- HDS는 전달받은 `0` 이상 `5` 이하의 평점을 별 아이콘 묶음으로 표시합니다.

## Styling

- styling 기준:
  - Tailwind CSS utility class
  - `@hashi/hds-tokens` color 기준
  - `class-variance-authority`의 `cva`로 size와 star state 조합 관리
  - `cn`으로 호출부 `className`과 병합
- layout:
  - root는 `inline-flex`로 렌더링합니다.
  - 별은 같은 크기의 square item 안에서 렌더링합니다.
  - `half` 상태에서도 item width는 변하지 않아야 합니다.
- size:
  - `sm`: star icon `18px`
  - `md`: star icon `36px`
- color:
  - filled: `primary-500`
  - empty: `warm-gray-300`
- state:
  - `filled`: `StarFillIcon`
  - `empty`: `StarBlankIcon`
  - `half`: `StarBlankIcon` + clipped `StarFillIcon`
- hover/focus/active/disabled: read-only display component이므로 제공하지 않습니다.
- layout shift 방지 조건:
  - `value` 변화 시 별 개수, item 크기, gap이 변하지 않아야 합니다.
  - `filled`, `half`, `empty` 전환 시 전체 width가 흔들리지 않아야 합니다.

## Accessibility

- semantic element: `span` 또는 `div`
- role: `img`
- accessible name:
  - 기본값은 `평점 {value}점`입니다.
  - 제품 문구가 필요하면 호출부가 `aria-label`을 전달합니다.
- icon:
  - 개별 `StarFillIcon`, `StarBlankIcon`은 `aria-hidden="true"`로 숨깁니다.
  - 스크린리더에는 개별 별이 아니라 전체 평점만 노출합니다.
- keyboard interaction: 없음
- focus-visible: read-only display component이므로 focus를 받지 않습니다.

## Dependencies

- components: 없음
- icons:
  - `@hashi/hds-icons`의 `StarFillIcon`
  - `@hashi/hds-icons`의 `StarBlankIcon`
- hooks: 없음
- APIs: 없음
- external libraries:
  - `class-variance-authority`
  - `cn` utility

## Storybook

- [x] Default (`value={0}`)
- [x] Half (`value={0.5}`)
- [x] decimal value examples (`value={1.1}`, `value={3.8}`, `value={4.1}`, `value={4.99}`)
- [x] integer values (`value={1}` ~ `value={5}`)
- [x] `size="sm"`
- [x] `size="md"`
- [ ] loading
- [ ] error 또는 invalid
- [ ] interactive input

`StarRating`은 현재 read-only display component입니다. loading, error, invalid, interactive input은 prop 추가가 확정될 때 작성합니다.

## Non-Goals

- 사용자가 별을 클릭하거나 keyboard로 평점을 입력하는 interactive rating input은 이번 범위에 포함하지 않습니다.
- `onChange`, `selectedValue`, `hoverValue` 같은 입력 상태는 제공하지 않습니다.
- 리뷰 수, 평점 텍스트, 도메인 copy는 렌더링하지 않습니다.
- API 응답 shape나 도메인 enum을 HDS props로 정의하지 않습니다.
- `size`와 `filled/half/empty` 상태를 `smallFill` 같은 하나의 variant로 합치지 않습니다.
- half star를 별도 public icon으로 노출하지 않습니다. 반복 필요가 생기면 `StarHalfIcon` 추가를 별도 검토합니다.

## Architecture Decision

`StarRating`은 원본 평점 숫자를 받아 HDS 내부에서 정수 또는 `.5` 단위 표시값으로 변환합니다.

이 결정을 한 이유:

- 소수점이 있는 평점을 `.5`칸으로 표시하는 규칙은 별점 UI의 표시 규칙이므로 화면마다 중복 구현하지 않는 편이 안전합니다.
- 앱 호출부는 서버에서 받은 평점 숫자를 그대로 전달하고, HDS는 동일한 visual rule을 보장합니다.
- `size`는 별의 크기와 간격을 담당하고, `filled/half/empty`는 표시 상태를 담당하므로 variant 축을 분리합니다.
- `StarFillIcon`과 `StarBlankIcon`은 모양과 `currentColor`만 제공하고, 색상/크기/half clipping은 `StarRating`이 소유합니다.

## Verification

- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] Storybook에서 `0`, `0.5`, `1`, `1.1`, `3.8`, `4.1`, `4.99`, `5`, `sm`, `md` 상태 수동 확인
