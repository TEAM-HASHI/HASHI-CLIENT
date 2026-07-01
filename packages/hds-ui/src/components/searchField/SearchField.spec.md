# Component Spec: `SearchField`

Jira: HASHI-56

## Purpose

`SearchField`는 사용자가 검색어를 입력할 수 있도록 하는 HDS의 공통 search input primitive입니다.

HDS에서는 **native input 렌더링, 검색 아이콘 고정 배치, 입력 영역 layout, placeholder/value 전달, disabled 상태, input ref forwarding, 기본 접근성 계약만 담당**합니다. 실제 검색 실행, debounce, query parameter 동기화, API 호출, 최근 검색어, 자동완성, analytics, 도메인 copy/data 구성은 각 App Shell / Page / Feature에서 처리합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Figma Audit

SearchField 설계를 위해 아래 Figma 패턴을 확인했습니다. 이 목록은 전부 `SearchField` v1에 포함한다는 의미가 아니라, 포함/제외 판단을 위한 검토 범위입니다.

- `Common_Components / bar_search`
  - Figma size: `353px x 44px`
  - implementation: `w-full`, `h-11`
  - background: `Primary_100` / `#f6f6f6`
- leading search icon: search field 정체성을 만드는 고정 아이콘
- placeholder: `식당 혹은 메뉴를 검색해보세요`

## Figma 판단

`SearchField` v1에 포함하는 패턴:

- 왼쪽 검색 아이콘이 고정으로 들어가는 단일 search input
- `h-11` / `2.75rem` / `44px` 높이의 rounded container
- full width layout 안에서 부모 width를 따르는 구조
- placeholder를 호출부가 전달하는 구조

`SearchField` v1에 포함하지 않는 패턴:

- clear button
- submit button
- 자동완성 / 추천 검색어
- 최근 검색어 목록
- 검색 결과 상태
- query string 또는 route 동기화
- debounce / throttle
- API 호출
- analytics logging

## Usage Location

- `packages/hds-ui/src/components/searchField/SearchField.tsx`

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] native `input` 기반으로 렌더링합니다.
- [x] `type="search"`를 기본으로 고정합니다.
- [x] 검색 아이콘은 `SearchField` 내부에 고정으로 렌더링합니다.
- [x] visible label이 없으므로 접근성 이름을 요구합니다.
- [x] controlled / uncontrolled input 사용을 모두 지원합니다.
- [x] disabled 상태 시각 표현 및 interaction 차단을 지원합니다.
- [x] 외부 ref를 내부 native input에 연결할 수 있습니다.
- [x] focus 시 디자인 기준에 없는 root border/outline 변화를 추가하지 않습니다.
- [x] 긴 placeholder/value가 container를 깨지 않아야 합니다.
- [x] `className`을 내부 class와 병합합니다.

## UI Structure

```text
SearchField
  search icon
  input
```

## Props

### `aria-label`

- type: `string`
- required: `true`
- description: visible label이 없는 search input의 접근성 이름입니다.

### `ref`

- type: `React.Ref<HTMLInputElement>`
- required: `false`
- description: 내부 native input에 연결됩니다. 호출부가 진입 시 자동 focus, 검색어 초기화 후 재포커싱처럼 input을 직접 제어할 때 사용합니다.

### `placeholder`

- type: `string`
- required: `false`
- description: 검색 입력 전 표시할 안내 문구입니다. HDS는 앱 전용 placeholder copy를 소유하지 않습니다.

### `value`

- type: `string`
- required: `false`
- description: controlled input 값입니다.

### `defaultValue`

- type: `string`
- required: `false`
- description: uncontrolled input 초기값입니다.

### `onChange`

- type: `React.ChangeEventHandler<HTMLInputElement>`
- required: `false`
- description: input 값 변경 시 호출됩니다. 검색 실행 여부는 호출부가 결정합니다.

### `disabled`

- type: `boolean`
- required: `false`
- default: `false`
- description: input interaction을 비활성화합니다.

### `className`

- type: `string`
- required: `false`
- description: root container에 병합할 class입니다.

### `inputClassName`

- type: `string`
- required: `false`
- description: 내부 input에 병합할 class입니다. typography 또는 placeholder 예외가 반복될 때만 사용합니다.

## Recommended API

```tsx
type SearchFieldProps = {
  className?: string
  inputClassName?: string
  'aria-label': string
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'size' | 'children'
>

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(...)
```

## States

- default: 기본 입력 가능 상태
- focused: native input focus와 caret 동작을 따릅니다. v1 디자인에서는 별도 root border/outline 변화를 제공하지 않습니다.
- disabled: interaction이 막힌 상태

v1에서는 loading, invalid/error, clearable, autocomplete 상태를 `SearchField`가 직접 소유하지 않습니다.

## Behavior

1. 사용자가 input에 입력하면 native `onChange`가 실행됩니다.
2. `value`를 전달하면 controlled input으로 동작합니다.
3. `defaultValue`를 전달하면 uncontrolled input으로 동작합니다.
4. `disabled`이면 input interaction은 실행되지 않습니다.
5. Enter key submit은 HDS가 직접 처리하지 않습니다. form submit 또는 key handling은 호출부가 소유합니다.
6. 검색어 debounce/throttle은 HDS가 직접 처리하지 않습니다.
7. 검색어 clear 동작은 v1에서 제공하지 않습니다.

## Styling

- element: root `div`, native `input`
- layout: horizontal flex, center alignment
- width: `w-full`
- height: `h-11`
- icon: leading search icon fixed, decorative
- spacing: icon과 input 사이 gap은 Figma 기준을 우선합니다.
- background: `primary-100` / `#f6f6f6`을 사용합니다.
- radius: `rounded-[10px]`를 사용합니다.
- typography: input text와 placeholder는 `typo-body-4`를 사용합니다.
- color: input text는 `black`, placeholder는 `warm-gray-300`, icon은 검색 필드 기본 톤을 따릅니다.
- disabled: opacity로 최소 시각 구분을 제공합니다.
- focus: v1 디자인 기준에 맞춰 별도 root border/outline 변화를 제공하지 않습니다.
- responsive: 부모 width를 따르며 fixed width를 소유하지 않습니다.

## Accessibility

- semantic element: `input`
- input type: `search`
- accessible name: `aria-label` 필수
- placeholder는 label을 대체하지 않습니다.
- keyboard interaction: native input keyboard interaction을 따릅니다.
- focus: native input focus와 text caret 동작을 따릅니다. 별도 focus indicator가 필요해지면 디자인 기준과 함께 재검토합니다.
- icon: 검색 아이콘은 장식 요소로 취급하고 `aria-hidden` 처리합니다.

## Storybook

- [x] Default
- [x] With value
- [x] Disabled
- [x] Focus state
- [x] Long placeholder overflow
- [x] Full width in 430px mobile viewport wrapper
- [x] Controlled example
- [x] Uncontrolled example

v1에서 loading, invalid/error, clear button, autocomplete, recent keyword list는 지원하지 않습니다.

## Validation

`SearchField`는 검색어 유효성 검증을 직접 수행하지 않습니다.

아래 정책은 App Shell / Page / Feature가 소유합니다.

- 최소 글자 수
- 공백 trim
- 허용 문자
- 금칙어
- 검색 가능 여부
- 에러 메시지

## Public API

- [x] `SearchField` value export
- [x] `SearchFieldProps` type export
- [x] ref forwards to native input
- [x] no private helper export

## HDS가 가지면 안 되는 것

- 실제 검색 실행
- debounce / throttle 정책
- API query 또는 mutation
- query string 또는 route 동기화
- Next / React Router 의존성
- WebView bridge 호출
- analytics event 전송
- 최근 검색어 저장
- 자동완성 / 추천 검색어 목록
- 검색 결과 렌더링
- 앱 전용 placeholder copy 하드코딩
- 로그인 / 권한 / 상태별 노출 판단
- safe area inset 직접 적용
- page padding 또는 layout width 결정

## Implementation Notes

- 검색 아이콘은 v1에서 고정으로 둡니다.
- 별도 `leftIcon` / `rightIcon` prop은 제공하지 않습니다.
- clear button은 v1에서 제공하지 않습니다.
- 구현은 `@hashi/hds-icons`의 `SearchIcon`을 사용합니다.
- `SearchIcon`은 `currentColor` 기반으로 SearchField의 icon color를 상속합니다.
- 브라우저가 `type="search"`에 기본 clear control을 표시하는 경우에도 v1에서는 HDS clear button을 제공하지 않도록 기본 search cancel UI를 숨깁니다.

## Deferred Decisions

### clear button

검색 필드에서 clear button이 반복적으로 필요해지면 `clearable` 또는 `onClear` API를 검토합니다.

v1에서는 clear button을 제공하지 않습니다. 호출부가 별도 action을 추가해야 하는 경우, SearchField 확장보다 화면 요구사항을 먼저 확인합니다.

### submit / onSearch

Enter 입력 또는 검색 아이콘 클릭으로 검색을 실행하는 API는 v1에서 제공하지 않습니다.

검색 실행 방식이 여러 화면에서 반복되면 `onSearch?: (value: string) => void` 추가를 검토합니다. 그 전까지는 form submit 또는 호출부 key handling을 사용합니다.

### size

Figma에서 확인한 기본 SearchField 높이는 `h-11` / `2.75rem` / `44px`입니다. v1에서는 size prop을 제공하지 않습니다.

검색 필드가 작은 topbar형, 큰 페이지형으로 반복되면 `size` 추가를 검토합니다.

## Verification

- [x] `corepack pnpm format:check`
- [x] `corepack pnpm --filter @hashi/hds-ui lint`
- [x] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [x] `corepack pnpm --filter @hashi/hds-ui build`
- [x] `corepack pnpm --filter @hashi/hds-ui test`
- [x] `corepack pnpm --filter @hashi/hds-ui build-storybook`
- [x] `corepack pnpm --filter @hashi/hds-icons lint`
- [x] `corepack pnpm --filter @hashi/hds-icons typecheck`
- [x] `corepack pnpm --filter @hashi/hds-icons build`
- [x] `git diff --check`
