# Component Spec: `IconButton`

Jira: HASHI-55

## Purpose

`IconButton`은 텍스트 label 없이 아이콘만으로 단일 액션을 실행하는 HDS의 공통 interactive primitive입니다.

HDS에서는 **native button 렌더링, 정사각형 touch target, 아이콘 중앙 정렬, icon-only 접근성 계약, disabled/loading 상태, focus-visible, 기본 시각 상태만 담당**합니다. 실제 route 이동, API 호출, analytics, WebView bridge, 좋아요/저장 같은 도메인 상태, 앱 전용 copy/data 구성은 각 App Shell / Page / Feature에서 처리합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Figma Reference

- `Button_Components / button_edit`: `40px x 40px` icon-only action
- `Common_Components / topbar_*`: 뒤로가기, 공유처럼 상단바 안에서 쓰이는 투명 icon-only action
- `Common_Components / button_heart`: 아이콘과 count label이 함께 있는 좋아요 패턴
- `Common_Components / icon_heart`: active/default 상태와 count가 함께 있는 좋아요 표시 패턴
- `Button_Components / button_agreement_check`: agreement check 상태 버튼

## Figma 판단

`IconButton` v1에 바로 포함하는 패턴:

- 뒤로가기, 닫기, 공유, 수정처럼 아이콘 하나로 표현되는 단일 액션
- 별도 text label은 보이지 않지만, 접근성 label이 필요한 액션
- `24px`, `40px` button box 안에 아이콘을 중앙 정렬하는 패턴

`IconButton` v1에 포함하지 않는 패턴:

- 좋아요 count를 함께 표시하는 `button_heart`, `icon_heart`
- agreement check처럼 선택 상태와 form 의미가 강한 버튼
- 날짜, 시간, 정렬처럼 텍스트 또는 도메인 상태를 함께 가지는 버튼

좋아요와 체크 패턴은 icon-only primitive라기보다 `LikeButton`, `Checkbox`, `ToggleButton` 또는 App shared component 후보로 분리해 검토합니다.

## Usage Location

- `packages/hds-ui/src/components/iconButton/IconButton.tsx`

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] native `button` 기반으로 렌더링합니다.
- [x] 기본 `type="button"`을 제공합니다.
- [x] visible text가 없으므로 `aria-label`을 필수로 요구합니다.
- [x] 아이콘은 button 내부에서 중앙 정렬합니다.
- [x] 아이콘-only 버튼의 touch target 크기를 size로 제어합니다.
- [x] disabled 상태 시각 표현 및 interaction 차단을 지원합니다.
- [x] loading 상태 시각 표현 및 중복 클릭 방지를 지원합니다.
- [x] focus-visible 상태를 제공합니다.
- [x] `className`을 내부 class와 병합합니다.

## UI Structure

```text
IconButton
  icon
```

## Props

### `aria-label`

- type: `string`
- required: `true`
- description: visible text가 없는 icon-only button의 접근성 이름입니다.

### `children`

- type: `React.ReactNode`
- required: `true`
- description: 버튼 안에 렌더링할 아이콘입니다.

### visual style

v1 public API에는 `variant`를 두지 않습니다.

기본 시각 스타일은 배경 없이 아이콘만 노출되는 `plain` 형태입니다. Figma의 topbar 뒤로가기/공유 패턴에 대응합니다.

`button_edit`처럼 흰 배경과 원형에 가까운 shape를 가진 icon-only action은 존재하지만, 현재 반복 근거가 충분하지 않아 v1 public API로 올리지 않습니다. 구현 시 필요한 경우 호출부 `className`으로 배경, radius, shadow를 보정하고, 반복되면 `variant` 또는 `shape` 추가를 검토합니다.

### `size`

- type: `'xs' | 'md'`
- required: `false`
- default: `'md'`
- description: icon button의 touch target 크기입니다.

| size |        button box | 주요 용도                                              |
| ---- | ----------------: | ------------------------------------------------------ |
| `xs` | `1.5rem` / `24px` | topbar의 뒤로가기, 공유 같은 기본 아이콘 액션          |
| `md` | `2.5rem` / `40px` | 수정 버튼처럼 명확한 touch box가 있는 icon-only action |

`size`는 button box의 width/height만 담당합니다. 아이콘 자체의 visual size는 전달받은 icon component가 소유합니다.

`24px` button box는 Figma topbar의 시각 기준을 그대로 반영한 값입니다. 모바일 touch target 관점에서 더 넓은 hit area가 필요하면 Topbar, App Shell, 또는 호출부 layout에서 padding을 보강합니다.

기본값 `md`는 `button_edit`처럼 명확한 `40px` button box를 가진 icon-only action을 기준으로 합니다. Topbar에서는 `size="xs"`를 명시해 사용합니다.

### `loading`

- type: `boolean`
- required: `false`
- default: `false`
- description: 처리 중 상태를 표시하고 중복 클릭을 방지합니다.

### `disabled`

- type: `boolean`
- required: `false`
- default: `false`
- description: 버튼 interaction을 비활성화합니다.

### `className`

- type: `string`
- required: `false`
- description: root `button`에 병합할 class입니다.

## Recommended API

```tsx
type IconButtonSize = 'xs' | 'md'

type IconButtonProps = {
  size?: IconButtonSize
  loading?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
  'aria-label': string
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'disabled' | 'children' | 'aria-label'
>
```

## States

- default: 기본 사용 가능 상태
- disabled: interaction이 막힌 상태
- loading: 처리 중이며 중복 클릭이 막힌 상태
- focus-visible: keyboard focus가 표시되는 상태

v1에서는 selected/pressed 상태를 `IconButton`이 직접 소유하지 않습니다. 좋아요, 저장, 체크처럼 선택 상태가 의미를 가지는 경우는 호출부 또는 별도 컴포넌트가 상태를 소유합니다.

## Behavior

1. 사용자가 icon button을 클릭하면 native `button`의 `onClick`이 실행됩니다.
2. `disabled || loading`이면 click interaction은 실행되지 않습니다.
3. `loading` 중에는 기존 icon 대신 spinner를 표시합니다.
4. `loading` 중에도 button box 크기는 유지합니다.
5. `loading` 중에는 `aria-busy="true"`를 부여합니다.
6. 기본 `type`은 `button`입니다.
7. `type="submit"`은 지원할 수 있지만, icon-only submit은 사용처에서 접근성 label을 명확히 제공해야 합니다.

## Styling

- element: native `button`
- layout: `inline-flex`, center alignment
- size:
  - `xs`: `24px x 24px`
  - `md`: `40px x 40px`
- icon: 전달받은 icon을 button box 안에서 중앙 정렬
- background: v1에서는 기본 배경을 소유하지 않습니다.
- radius: v1에서는 기본 radius를 소유하지 않습니다.
- color: v1에서는 고정 색상 token을 소유하지 않고 `currentColor`를 상속합니다.
- disabled: 고정 색상 token은 소유하지 않고, 최소 시각 구분을 위해 opacity를 낮춥니다.
- loading: spinner로 상태를 표시하며, disabled opacity와는 분리합니다.
- focus-visible: keyboard focus outline 제공
- visual surface: 배경, radius, border, shadow가 필요한 아이콘 버튼은 호출부 `className` 또는 상위 컴포넌트에서 처리합니다.
- safe area: HDS에서 적용하지 않습니다.
- fixed/sticky: HDS에서 결정하지 않습니다.

## Accessibility

- semantic element: `button`
- accessible name: `aria-label` 필수
- keyboard interaction: native button keyboard interaction을 따릅니다.
- focus-visible: keyboard focus outline을 제공합니다.
- icon: 전달받은 icon은 기본적으로 장식 요소로 취급합니다.
- ARIA:
  - loading 중 `aria-busy="true"`
  - native `disabled` 우선 사용

## Storybook

- [ ] Default
- [ ] Topbar action
- [ ] Share action
- [ ] Edit action
- [ ] Size variants
- [ ] Disabled
- [ ] Loading
- [ ] Long `aria-label` accessibility check
- [ ] 393px mobile viewport wrapper
- [ ] Topbar wrapper에서 `24px` visual box보다 넓은 hit area를 제공하는 예시

## Public API

- [ ] `IconButton` value export
- [ ] `IconButtonProps` type export
- [ ] `IconButtonSize` type export
- [ ] no private helper export

## HDS가 가지면 안 되는 것

- 실제 route 이동
- Next / React Router 의존성
- `href`, `Link`, `asChild` API
- WebView bridge 호출
- 로그인 여부 판단
- 권한에 따른 버튼 노출 판단
- 좋아요, 저장, 체크 같은 도메인 상태 소유
- count label 렌더링
- analytics event 전송
- API mutation 또는 query invalidation
- 앱 전용 copy 하드코딩
- safe area inset 직접 적용
- app shell padding 결정
- topbar layout 결정

## Deferred Decisions

### selected / pressed

좋아요, 저장, 체크처럼 selected 상태가 필요한 아이콘 액션이 있습니다. 다만 Figma에서 확인한 `button_heart`, `icon_heart`는 count label을 포함하고 있고, `button_agreement_check`는 agreement/form 의미가 강합니다.

따라서 v1 `IconButton`은 selected 상태를 소유하지 않습니다. 형태가 동일하고 색상만 바뀌는 단순 토글 icon-only action이 두 곳 이상 반복되면 `pressed?: boolean` 또는 `selected?: boolean` 추가를 검토합니다.

### `sm` size / 26px

Figma에는 `button_agreement_check`처럼 `26px` 전후의 작은 버튼 박스가 있습니다. 다만 agreement check는 선택 상태와 form 의미가 강해 `IconButton` v1 범위에서 제외합니다.

따라서 v1 `IconButton`은 `26px` size를 public API에 포함하지 않습니다. 도메인 의미가 없는 작은 icon-only action이 반복되면 `size="sm"` 추가를 검토합니다.

### soft variant / shape

`button_edit`은 `40px x 40px` button box라는 점에서는 `IconButton size="md"`와 맞지만, 흰 배경과 원형에 가까운 shape를 가집니다.

현재 v1 public API는 배경, radius, border, shadow를 소유하지 않는 bare icon action만 지원합니다. 흰 배경, 약한 배경, 원형 shape가 반복되면 아래 API 중 하나를 검토합니다.

- `variant="soft"`
- `shape="square" | "circle"`
- `tone` 또는 별도 visual prop

### icon size prop

v1에서는 icon size prop을 두지 않습니다. `IconButton`의 `size`는 button box만 담당하고, icon visual size는 전달받은 icon component가 소유합니다.

다만 같은 button box 안에서 icon visual size를 호출부마다 계속 조정해야 한다면 `iconSize` prop 또는 icon slot className 정책을 별도로 검토합니다.

## Verification

- [ ] `corepack pnpm format:check`
- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] `corepack pnpm --filter @hashi/hds-ui build-storybook`
- [ ] `git diff --check`
