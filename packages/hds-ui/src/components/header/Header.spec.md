# Component Spec: `Header`

Jira: HASHI-189

## Purpose

`Header`는 모바일 화면 상단에서 페이지 제목과 선택적 좌우 액션을 배치하는 HDS의 공통 topbar primitive입니다.

HDS에서는 **상단바 visual structure, 제목/보조 텍스트 layout, 좌우 action, typography, spacing, 기본 접근성 계약만 담당**합니다. 실제 route 이동, 공유 실행, 검색 submit, safe area inset, sticky/fixed 배치, analytics, 앱 전용 copy/data 구성은 각 App Shell / Page / Feature에서 처리합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Figma Reference

Figma: `Hashi.kr / Basic·complex / 빨간 테두리 컴포넌트 범위`

아래 width 값은 Figma가 배치된 모바일 기준 프레임의 관측값입니다. `Header` 구현은 `393px` 또는 `394px` 고정 width를 소유하지 않고, 부모 모바일 뷰포트에 맞춰 항상 `w-full`로 렌더링합니다.

- red boundary: `7046:12752`
- `Navigation Bar`: `6976:39752`
  - `Right=None`: `393px x 75px`, centered `18px SemiBold` title
  - `Right=Icon`: `393px x 75px`, left back icon and right share icon
  - `Subtitle=On`: `393px x 75px`, `18px` title and `12px/18px` subtitle
  - `Right=Text`: `393px x 75px`, right `45px x 35px` Ghost action
  - `Restaurant name`: `393px x 77px`, `22px SemiBold` title with `272px` single-line area

빨간 테두리 안에 함께 배치된 `Icon=Close`, Basic의 하단 `Navigation`, complex의 `Bottom bar`는 `Header` 범위에서 제외합니다. `Icon=Close`의 `344px x 24px` 구조는 이번 Header public API에 추가하지 않으며, 따라서 `size="sm"`도 추가하지 않습니다.

## Figma 판단

`Header` v1에 포함하는 패턴:

- 75px 기본 topbar
- title centered layout
- optional left action slot
- optional right action slot
- right icon/text action layout
- long title layout for a single-line restaurant title
- optional subtitle/description below title for terms detail-like header
- title/subtitle content supplied by caller

`Header` v1에 포함하지 않는 패턴:

- back/search bar combined layout
- `Icon=Close` 24px title row
- Basic `Navigation` and complex `Bottom bar`
- actual back navigation
- actual share behavior
- route, link, query string, WebView bridge dependency
- sticky/fixed positioning
- safe area inset calculation
- page horizontal padding ownership
- app-specific date formatting
- app-specific page titles hardcoded inside HDS

## Usage Location

- `packages/hds-ui/src/components/header/Header.tsx`

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] visible title을 렌더링합니다.
- [x] left action은 caller가 `ReactNode`로 주입합니다.
- [x] right action은 icon/text 종류와 필요한 값을 한 `HeaderRightAction` 객체로 받습니다.
- [x] Header는 right icon action에 `IconButton size="xs"`를, right text action에 Figma typography와 크기를 적용합니다.
- [x] `Header`는 `393px`/`394px` 고정 width를 소유하지 않고 부모 너비를 따릅니다.
- [x] 기본 topbar 높이는 `75px`입니다.
- [x] long title variant는 `77px` 높이를 사용합니다.
- [x] `center` variant에서 subtitle이 있어도 `75px` 높이를 유지하고 title 아래 중앙에 렌더링합니다.
- [x] right text action을 위한 명시적인 배치 규칙을 제공합니다.
- [x] 기본 elevation을 끌 수 있습니다.
- [x] `className`을 내부 class와 병합합니다.

## UI Structure

```text
Header
  left action slot
  content
    title
    subtitle?
  right icon or text action?
```

## Props

### `title`

- type: `React.ReactNode`
- required: `true`
- description: Header의 주 제목입니다. 문자열 또는 ReactNode를 받을 수 있지만, HDS는 앱 전용 title copy를 소유하지 않습니다.

### `subtitle`

- type: `React.ReactNode`
- required: `false`
- description: `center` variant에서 약관 상세의 `최종 업데이트`처럼 title 아래에 표시할 보조 텍스트입니다. 날짜 포맷과 문구 조합은 호출부가 소유합니다.
- `false`, `true`, 빈 문자열, 공백 문자열, `null`, `undefined`는 subtitle 없음으로 처리합니다. `0`은 실제 표시 가능한 값이므로 subtitle로 렌더링합니다.

### `leftAction`

- type: `React.ReactNode`
- required: `false`
- description: 왼쪽 액션 영역입니다. 뒤로가기 버튼이 필요한 화면에서는 호출부가 `IconButton size="xs"`와 `BackIcon`을 조합해 전달합니다.

### `rightAction`

- type: `HeaderRightAction`
- required: `false`
- description: 오른쪽 액션의 종류, content, 접근성 label, callback을 묶은 판별 유니온입니다. icon action은 `icon`, `ariaLabel`, 선택적 `onClick`/`disabled`를 받고, text action은 `label`, 선택적 `onClick`/`disabled`를 받습니다. type과 content를 따로 전달할 수 없으므로 24px icon slot에 text action이 들어가는 조합을 TypeScript가 차단합니다.

### `elevated`

- type: `boolean`
- required: `false`
- default: `true`
- description: `false`이면 기본 `shadow-header` elevation을 제거합니다. 표시 가능한 subtitle이 있으면 Figma 규칙에 따라 이 값과 관계없이 elevation을 적용하지 않습니다.

### `variant`

- type: `'center' | 'largeTitle'`
- required: `false`
- default: `'center'`
- description: title layout과 높이를 결정합니다.

| variant      | height | title layout                               | title typography    | 주요 용도                          |
| ------------ | ------ | ------------------------------------------ | ------------------- | ---------------------------------- |
| `center`     | `75px` | 중앙 정렬, single-line                     | `typo-sub-header-1` | 일반 페이지와 subtitle 포함 topbar |
| `largeTitle` | `77px` | action 사이 272px 영역에서 left align, 1줄 | `typo-header-2`     | 긴 식당명을 보여주는 상세 title    |

### `className`

- type: `string`
- required: `false`
- description: root element에 병합할 class입니다.

### `contentClassName`

- type: `string`
- required: `false`
- description: title/subtitle wrapper에 병합할 class입니다. 반복되는 예외가 생기기 전에는 사용을 최소화합니다.

## Recommended API

```tsx
type HeaderVariant = 'center' | 'largeTitle'

type HeaderIconAction = {
  type: 'icon'
  icon: React.ReactNode
  ariaLabel: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

type HeaderTextAction = {
  type: 'text'
  label: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

type HeaderRightAction = HeaderIconAction | HeaderTextAction

type HeaderBaseProps = {
  title: React.ReactNode
  leftAction?: React.ReactNode
  rightAction?: HeaderRightAction
  elevated?: boolean
  className?: string
  contentClassName?: string
}

type HeaderCenterProps = HeaderBaseProps & {
  variant?: 'center'
  subtitle?: React.ReactNode
}

type HeaderLargeTitleProps = HeaderBaseProps & {
  variant: 'largeTitle'
  subtitle?: never
}

type HeaderProps = HeaderCenterProps | HeaderLargeTitleProps
```

Recommended usage:

```tsx
<Header
  title="식당 상세 정보"
  leftAction={
    <IconButton size="xs" aria-label="뒤로가기" onClick={handleBack}>
      <BackIcon className="size-6" />
    </IconButton>
  }
  rightAction={{
    type: 'icon',
    icon: <ShareIcon className="size-6" />,
    ariaLabel: '공유하기',
    onClick: handleShare,
  }}
/>
```

## States

- default: title만 있거나 left/right action이 선택적으로 있는 상태
- with icon action: 공유처럼 오른쪽 icon action이 있는 상태
- with text action: 저장처럼 오른쪽 text action을 Header가 렌더링하는 상태
- subtitle: `center` variant에서 title 아래 보조 텍스트가 있는 상태
- largeTitle: 긴 title을 한 줄 말줄임으로 보여주는 상태

v1에서는 `largeTitle`과 `subtitle` 조합, loading, selected, invalid/error 상태를 `Header`가 직접 소유하지 않습니다. `rightAction.disabled`는 icon/text action의 native button에 전달하지만, 실제 비활성 조건과 loading state는 호출부가 소유합니다.

## Behavior

1. `title`을 Header의 주요 텍스트로 렌더링합니다.
2. `leftAction`이 있으면 왼쪽 action slot에 렌더링합니다.
3. `rightAction`이 있으면 `type`에 맞는 오른쪽 action을 렌더링합니다. `icon`은 `IconButton size="xs"`와 필수 `ariaLabel`을 사용하고, `text`는 Header가 정의한 Ghost button typography와 크기를 사용합니다.
4. `variant="center"`에서 표시 가능한 `subtitle`이 있으면 `75px` 높이를 유지하고 title 아래 보조 텍스트로 렌더링합니다.
5. `variant="center"`에서는 title이 가운데 정렬됩니다.
6. `rightAction.type="text"`이면 Figma의 `45px x 35px` text action을 위한 `45px x 39px` 오른쪽 slot을 사용하고, 중앙 title 영역은 양쪽 `57px` inset으로 action과 겹치지 않게 합니다.
7. `variant="largeTitle"`에서는 title이 action 사이 content 영역에서 왼쪽 정렬되고 한 줄을 넘으면 말줄임 처리됩니다.
8. `elevated={false}` 또는 표시 가능한 `subtitle`이 있으면 Header shadow를 제거합니다.
9. `Header`는 action click handler를 직접 만들지 않고, `rightAction.onClick`을 해당 native button에 연결합니다. callback의 실제 side effect는 호출부가 소유합니다.
10. `Header`는 safe area, fixed/sticky, route navigation을 직접 처리하지 않습니다.

## Styling

- element: root `header`
- background: `white`
- shadow: `shadow-header` (`0 4px 4px rgb(179 179 179 / 10%)`)
- width: `w-full`; no fixed `393px`/`394px` component width
- visual reference: Figma mobile frame `393-394px`
- default height: `75px`
- subtitle height: `75px`
- large title height: `77px`
- default padding: `pt-[33px]`, `pb-[18px]`, `pl-[13px]`, `pr-5`
- large title padding: `pt-[33px]`, `pb-3`, `pl-[13px]`, `pr-5`
- action visual size: `24px x 24px`, use `IconButton size="xs"`
- text action button: `45px x 35px`, `typo-body-6`, `text-primary-200`
- text action position: `top 26px`, `right 12px`, `45px x 39px` alignment area
- center title inset with text action: `57px` on both sides
- title color: `text-primary-200`
- default title typography: `typo-sub-header-1`
- large title typography: `typo-header-2`
- subtitle typography: `typo-caption-2` with `18px` line-height
- subtitle color: `text-primary-200`
- large title overflow: single-line `truncate`
- safe area: HDS에서 적용하지 않고 App Shell에서 한 번만 처리합니다.
- fixed/sticky: HDS에서 결정하지 않습니다.

`12px`, `13px`, `26px`, `33px`, `39px`, `45px`, `57px`, `75px`, `77px`는 Figma Navigation Bar와 직접 대응되는 값이므로 arbitrary value로 유지합니다. 같은 값이 여러 topbar/header 계열에서 반복되고 token 기준이 확정되면 spacing/height token 승격을 검토합니다.

Header elevation은 HDS token `shadow-header`로 관리합니다. Header를 사용하는 페이지는 기본 elevation과 중복되는 `border-b`를 추가하지 않습니다. subtitle을 렌더링하는 Header는 Figma 상태에 맞춰 elevation을 적용하지 않습니다.

## Accessibility

- semantic element: root는 `header`를 사용합니다.
- title semantic: visible title은 기본적으로 text로 렌더링합니다.
- heading level: HDS가 문서 구조를 소유하지 않으므로 `h1`/`h2`를 강제하지 않습니다. 페이지 heading이 필요하면 호출부가 `title`에 heading element를 전달하거나, 별도 heading 정책을 정한 뒤 API를 확장합니다.
- action accessible name: icon action은 `ariaLabel`을 필수로 받고 Header가 `IconButton`에 연결합니다. text action은 `label`을 native button의 accessible name으로 사용합니다.
- keyboard interaction: Header는 right action을 native button으로 렌더링하며, action callback은 호출부가 제공합니다.
- focus-visible: icon action은 `IconButton`의 focus-visible 상태를 사용합니다. text action은 keyboard focus outline을 제공합니다.

## Storybook

- [x] Default: center title + back action
- [x] WithRightAction: center title + back/share action
- [x] WithTextAction: center title + text action, no elevation
- [x] TextActionOverflow: narrow viewport에서 long title + text action overflow
- [x] TitleOnly: title만 있는 topbar
- [x] Subtitle: terms detail처럼 subtitle이 있는 topbar
- [x] LargeTitle: 긴 식당명 single-line overflow

v1에서 search header, sticky header, transparent header, `largeTitle` + `subtitle` 조합, loading/selected/error 상태는 지원하지 않습니다.

## Public API

- [x] `Header` value export
- [x] `HeaderProps` type export
- [x] `HeaderVariant` type export
- [x] `HeaderRightAction`, `HeaderIconAction`, `HeaderTextAction` type export
- [x] no private helper export

## HDS가 가지면 안 되는 것

- 실제 route 이동
- Next / React Router 의존성
- `href`, `Link`, `asChild` API
- WebView bridge 호출
- share API 호출
- 검색 실행
- query string 또는 route 동기화
- safe area inset 직접 적용
- fixed/sticky layout 결정
- page horizontal padding 결정
- 로그인 여부 판단
- 권한에 따른 액션 노출 판단
- analytics event 전송
- 앱 전용 title copy 하드코딩
- 앱 전용 날짜 포맷 하드코딩

## Deferred Decisions

### search header

`bar_search_back_button`은 `BackIcon`과 `SearchField`를 조합한 별도 layout입니다. `Header` v1에 검색 입력 책임을 넣으면 topbar primitive와 form primitive가 섞이므로 제외합니다.

검색 헤더가 여러 화면에서 반복되면 아래 중 하나를 별도 검토합니다.

- app shared composition: page/app shell에서 `IconButton + SearchField` 조합
- HDS `SearchHeader`: 제품 의미 없이 반복되는 search topbar primitive

### `as` or heading level

v1에서는 `as`, `titleAs`, `headingLevel` 같은 polymorphic API를 제공하지 않습니다.

페이지 heading semantics가 필요해지면 호출부가 `title={<h1>...</h1>}` 형태로 전달하는 방식부터 사용합니다. 여러 화면에서 동일한 heading 정책이 반복되면 `titleAs` 또는 `headingLevel` 추가를 검토합니다.

### transparent / overlay header

이미지 위에 올라가는 transparent header나 inverse icon color는 v1 범위에서 제외합니다. 반복 근거가 생기면 `tone` 또는 `variant` 확장을 검토합니다.

### safe area

Figma 수치는 iOS status area를 포함한 topbar처럼 보이지만, HDS가 safe area를 직접 계산하면 App Shell과 중복될 수 있습니다.

v1은 Figma visual height와 padding만 표현하고, 실제 `env(safe-area-inset-top)` 적용은 App Shell 책임으로 둡니다.

## Verification

- [x] `corepack pnpm format:check`
- [x] `git diff --check`
- [x] `bash .agents/scripts/check-harness.sh`
- [x] `corepack pnpm --filter @hashi/hds-ui lint`
- [x] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [x] `corepack pnpm --filter @hashi/hds-ui build`
- [x] `corepack pnpm --filter @hashi/hds-ui test`
- [x] `corepack pnpm --filter @hashi/hds-ui build-storybook`
