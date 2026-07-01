# Component Spec: `Badge`

Jira: HASHI-45

## Purpose

`Badge`는 짧은 라벨과 선택적 아이콘으로 상태, 속성, 키워드를 표시하는 HDS UI primitive입니다.

HDS는 badge의 시각 구조, 선택 상태, 기본 접근성 계약만 담당합니다. 리뷰 키워드 목록, 선택 개수 제한, validation message, 저장 가능 여부, route, API, analytics는 App 또는 page/feature가 처리합니다.

첨부 디자인 기준으로 같은 badge가 두 방식으로 쓰입니다.

- 리뷰 상세, 식당 상세 리뷰 목록: 리뷰에 포함된 키워드를 보여주는 non-clickable static badge
- 리뷰 작성, 리뷰 수정: 사용자가 1-3개 키워드를 고르는 clickable selectable badge

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

제품 도메인 문구와 키워드 데이터는 HDS 밖에서 주입하므로 `packages/hds-ui`에 둘 수 있습니다.

## Spec Location

- spec path: `packages/hds-ui/src/components/badge/Badge.spec.md`
- implementation path: `packages/hds-ui/src/components/badge/Badge.tsx`

## Usage Location

- expected path: `packages/hds-ui/src/components/badge/Badge.tsx`
- expected stories: `packages/hds-ui/src/components/badge/Badge.stories.tsx`
- expected tests: `packages/hds-ui/src/components/badge/Badge.test.tsx`
- app examples:
  - 리뷰 상세의 키워드 표시 영역
  - 식당 상세 리뷰 목록의 키워드 표시 영역
  - 리뷰 작성/수정 form의 키워드 선택 영역

## Scaffold

새 public HDS component이므로 구현 시 generator 사용을 우선합니다.

```bash
corepack pnpm gen:ds-component
```

## Public API

```tsx
<Badge icon={<SmileIcon />} label="친절해요" />

<Badge
  interactive
  selected={selectedKeywords.includes('kind')}
  icon={<SmileIcon />}
  label="친절해요"
  onSelectedChange={(nextSelected) => {
    updateKeyword('kind', nextSelected)
  }}
/>
```

Exported value:

- `Badge`

Exported types:

- `BadgeProps`

호출부가 소유하는 책임:

- `label`, `icon`, `selected` 값 주입
- 리뷰 키워드 value와 label 매핑
- 선택 개수 1-3개 제한
- 필수 선택 validation message
- form submit 가능 여부
- 리뷰 상세/목록에서 어떤 키워드를 노출할지 결정

컴포넌트가 소유하지 않는 책임:

- 리뷰 도메인 enum 또는 서버 응답 shape
- 키워드별 icon 자동 매핑
- 선택 개수 제한
- form validation 문구
- route, query, mutation, analytics

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] static mode와 selectable mode를 같은 시각 구조로 제공합니다.
- [x] selectable mode는 controlled `selected` 상태를 받습니다.
- [x] selectable mode에서 inactive badge를 누르면 `onSelectedChange(true)`를 호출합니다.
- [x] selectable mode에서 selected badge를 누르면 `onSelectedChange(false)`를 호출합니다.
- [x] 긴 라벨이 들어와도 badge 바깥 layout을 깨지 않습니다.
- [x] token 또는 Tailwind theme 기준을 우선 사용합니다.

## UI Structure

```text
Badge
  root span | button
    icon slot
    label
```

## Props

### `label`

- type: `ReactNode`
- required: `true`
- description: badge에 표시할 짧은 라벨입니다. 일반 사용은 문자열을 권장합니다.

### `icon`

- type: `ReactNode`
- required: `false`
- description: 라벨 앞에 표시할 아이콘입니다. 아이콘 자체의 시각 디테일은 호출부가 주입합니다.

### `interactive`

- type: `boolean`
- required: `false`
- default: `false`
- description: `true`이면 native `button`, `false`이면 non-interactive `span`으로 렌더링합니다.

### `selected`

- type: `boolean`
- required: `false`
- default: `false`
- description: 선택 상태입니다. static mode에서도 selected visual을 표시할 수 있지만, 주 사용처는 selectable mode입니다.

### `onSelectedChange`

- type: `(selected: boolean) => void`
- required: `false`
- description: selectable badge를 눌렀을 때 다음 선택 상태를 전달합니다. `interactive=true`일 때만 호출합니다.

### `className`

- type: `string`
- required: `false`
- description: root element에 병합할 class입니다.

## States

- static: `interactive=false`, `span`으로 렌더링하고 클릭 동작이 없습니다.
- interactive: `interactive=true`, `button type="button"`으로 렌더링합니다.
- default: 흰 배경, 회색 border, 기본 텍스트 색상을 표시합니다.
- selected: primary border로 선택 상태를 표시합니다.

## Behavior

1. `interactive=false`이면 root를 `span`으로 렌더링하고 click handler를 연결하지 않습니다.
2. `interactive=true`이면 root를 `button type="button"`으로 렌더링합니다.
3. selectable badge를 누르면 현재 `selected`의 반대 값을 `onSelectedChange`에 전달합니다.
4. selected 상태여도 같은 badge를 다시 눌러 해제할 수 있습니다.

## Validation

HDS는 validation을 수행하지 않습니다.

- 리뷰 작성/수정의 "키워드를 선택해주세요." 문구는 page form이 표시합니다.
- 1-3개 선택 제한은 page form state가 관리합니다.
- 제한 초과 시 추가 선택을 막는 정책은 호출부가 결정합니다.

## Styling

- root layout: `inline-flex`, 가운데 정렬, `shrink-0`
- padding: horizontal `10px`, vertical `4px`
- icon size: `24px * 24px`, `shrink-0`
- icon / text gap: `4px`
- radius: `0.5rem`
- border: weight `1px`, color `warm-gray-100`
- background: `white`
- text: typography `typo-body-8`, color `black`
- selected stroke: weight `1.4px`, color `primary-400`
- selected background: `primary-400 / 20%`
- label overflow: `min-w-0 truncate`
- responsive: badge 자체는 layout을 소유하지 않습니다. 줄바꿈, horizontal scroll, grid 배치는 호출부 container가 처리합니다.

Figma 값과 token이 다를 때는 token을 우선합니다. 정확한 radius, padding, border color가 Figma와 반복적으로 어긋나면 token 승격 후보로 별도 기록합니다.

## Accessibility

- static mode: root는 `span`이며 visible label이 그대로 읽힙니다.
- interactive mode: root는 native `button type="button"`입니다.
- selectable mode: button에 `aria-pressed={selected}`를 제공합니다.
- icon은 장식 목적일 때 `aria-hidden`이 적용된 icon을 주입하는 것을 권장합니다.
- accessible name은 visible label을 기준으로 합니다.
- keyboard interaction은 native button 동작을 따릅니다.
- focus-visible outline을 제공합니다.

## Dependencies

- components: none
- icons: 호출부가 `@hashi/hds-icons`의 icon component를 주입합니다.
- hooks: none
- APIs: none
- external libraries:
  - `class-variance-authority`
  - HDS `cn` utility

## Storybook

- [x] Static default badge
- [x] Static badge with icon
- [x] Selectable default
- [x] Selectable selected
- [x] Long label overflow
- [x] Review keyword wrap example with multiple badges
- [x] 393px mobile viewport wrapper

Storybook 예시는 HDS public API와 상태를 보여주기 위한 샘플이어야 하며, app route, API 호출, query, mutation, tracking, 실제 리뷰 데이터 의존성을 넣지 않습니다.

## 테스트

- `interactive=false`이면 정적 `span`으로 렌더링합니다.
- `interactive=true`이면 `button type="button"`으로 렌더링합니다.
- 선택되지 않은 interactive badge를 누르면 `onSelectedChange(true)`를 호출합니다.
- 선택된 interactive badge를 누르면 `onSelectedChange(false)`를 호출합니다.
- 선택 상태를 `aria-pressed`로 노출합니다.
- 화면에 보이는 label을 accessible name으로 유지합니다.

## 범위 제외

- 리뷰 키워드 enum, label, icon 매핑
- badge group 검증
- 최소/최대 선택 개수 제한
- form error message 렌더링
- 비동기 loading 또는 server error handling
- routing 또는 navigation
- analytics event 전송
- `href`, `Link`, `asChild` 또는 polymorphic element API
- badge가 직접 소유하는 tooltip, popover, menu 동작

## Verification

- [ ] `corepack pnpm format:check`
- [ ] `git diff --check`
- [ ] `bash .agents/scripts/check-harness.sh`
- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] `corepack pnpm --filter @hashi/hds-ui build-storybook`
