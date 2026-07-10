# Component Spec: `Button`

Jira: HASHI-50

## Purpose

`Button`은 사용자가 명시적인 액션을 실행할 수 있도록 하는 HDS의 기본 interactive primitive입니다.

HDS는 native button 렌더링, 액션 목적별 시각 스타일, 크기, 너비, 아이콘 배치, disabled/loading 상태, focus-visible, 기본 접근성 계약만 담당합니다. 실제 액션 실행, route 이동, API 호출, analytics, WebView bridge, 도메인 copy/data 구성은 App Shell 또는 Page/Feature가 주입합니다.

Figma 기준과 HDS v1 범위를 비교한 결과, `Button` v1은 `primary`, `neutral` 두 가지 variant만 확정합니다. `danger`, `cta`, `ghost`, brand/social button, icon-only button은 v1 public API에서 제외합니다.

## Usage Location

- `packages/hds-ui/src/components/button/Button.tsx`

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] native `button` 기반으로 렌더링합니다.
- [x] `type="button"`을 기본값으로 제공합니다.
- [x] form submit을 위해 `type="submit"`을 전달할 수 있습니다.
- [x] `variant`, `size` 값을 기준으로 HDS 내부 시각 스타일을 결정합니다.
- [x] `width="fit" | "full"` layout을 지원합니다.
- [x] leftIcon / rightIcon slot을 지원합니다.
- [x] Button에 들어가는 icon은 `currentColor` 기반일 때 variant/disabled/loading text color를 상속합니다.
- [x] disabled 상태의 시각 표현과 interaction 차단을 제공합니다.
- [x] loading 상태의 시각 표현과 중복 클릭 방지를 제공합니다.
- [x] native focus-visible outline을 보존합니다.
- [x] disabled 상태 표현을 제공합니다.
- [x] native `disabled`, `aria-busy`를 연결합니다.
- [x] label overflow 상황에서 layout이 깨지지 않아야 합니다.
- [x] `cva`로 variant를 관리하고, `cn`으로 `className`을 내부 class와 안전하게 병합합니다.
- [x] icon-only 액션은 `Button`이 아니라 `IconButton`으로 분리합니다.
- [x] link/href/asChild API는 v1에서 지원하지 않습니다.
- [x] token 또는 Tailwind theme 기준을 우선 사용합니다.

## UI Structure

```text
Button
  leftIcon? (loading 중 숨김)
  label
  rightIcon? (loading 중 숨김)
```

지원 케이스:

- 텍스트만
- 아이콘 좌 + 텍스트
- 텍스트 + 아이콘 우
- 아이콘 좌 + 텍스트 + 아이콘 우

아이콘만 있는 버튼은 `Button`으로 만들지 않고 `IconButton`으로 분리합니다.

## Props

### `variant`

- type: `'primary' | 'neutral'`
- required: `false`
- default: `primary`
- description: 버튼 액션의 목적과 우선도를 나타내는 값입니다. 호출부가 CSS 속성을 직접 지정하는 값이 아니며, HDS 내부에서 목적별 기본 시각 스타일로 매핑합니다.

| variant   | 목적                           | v1 시각 매핑                  |
| --------- | ------------------------------ | ----------------------------- |
| `primary` | 일반 주요 액션, 완료/예약 액션 | `cool-gray-800` filled button |
| `neutral` | 보조 액션 또는 중립 액션       | `secondary-200` filled button |

`cta` 스타일은 v1 확정 variant에서 제외합니다. 로그인/온보딩/예약 전환에서 동일한 강한 전환 스타일이 2개 이상 반복되면 `variant="cta"` 승격을 검토합니다. 카카오 브랜드 색상만을 이유로 `cta`를 추가하지 않습니다.

Figma 기준 메모:

- Figma의 주요 완료/예약 CTA는 brand red가 아니라 dark gray 계열이므로 `primary` 기본 배경은 `cool-gray-800`을 사용합니다.
- Figma에 `secondary-200` 배경 + red text 형태의 반복 danger 버튼은 확인되지 않았습니다.
- 탈퇴/삭제 같은 위험 최종 액션은 v1에서 별도 `danger` variant로 추상화하지 않습니다.
- 투명 배경의 `button_profile_delete` 패턴은 `ghost` 후보이지만, height와 쓰임이 v1 Button 핵심 size와 달라 public variant로 승격하지 않습니다.

### `size`

- type: `'sm' | 'md' | 'lg' | 'xl'`
- required: `false`
- default: `lg`
- description: 버튼의 height를 결정합니다. width, padding, typography, icon size, icon gap, radius는 `size`에 포함하지 않습니다.

`Button`의 `size`는 Figma에 존재하는 모든 height를 그대로 노출하지 않고, 반복되는 핵심 버튼 height만 정규화합니다. 같은 height 안에서도 세부 padding, typography, layout이 다를 수 있으므로 v1 size는 height만 소유합니다.

| size |     height | 주요 용도                       |
| ---- | ---------: | ------------------------------- |
| `sm` |  `2.25rem` | 카드 내부, 모달 내부, 작은 액션 |
| `md` | `2.625rem` | 보조/쌍 버튼, 일반 중간 액션    |
| `lg` | `2.875rem` | 기본 확인/완료/예약 액션        |
| `xl` |  `3.25rem` | 큰 CTA, 카드형 주요 액션        |

정규화 기준:

- `2.8125rem(45px)` 계열은 `lg(2.875rem, 46px)`로 흡수합니다.
- `3.1875rem(51px)` 계열은 `xl(3.25rem, 52px)`로 흡수합니다.
- `1.75rem(28px)`, `2.0625rem(33px)`, `2.5rem(40px)`, `3.625rem(58px)` 계열은 `Button` v1 size에서 제외합니다.
- 제외된 height는 `IconButton`, `Chip`, `Toggle`, `Tab`, `SocialLoginButton` 등 별도 컴포넌트 후보에서 다룹니다.
- Figma의 `button_review`는 `typo-body-5`와 `cool-gray-700` 배경을 사용하지만, v1 Button 핵심 variant나 size typography로 승격하지 않고 카드 내부 보조 CTA tone 후보로 기록합니다.

### `width`

- type: `'fit' | 'full'`
- required: `false`
- default: `fit`
- description: 버튼의 가로 배치 방식입니다.

| width  | 의미                                        |
| ------ | ------------------------------------------- |
| `fit`  | label과 padding 기준으로 필요한 만큼만 차지 |
| `full` | 부모 container의 width를 채움               |

고정 width는 `Button`이 직접 소유하지 않습니다. Dialog Footer, BottomBar, Card, Form layout이 버튼 폭을 결정합니다.

### `loading`

- type: `boolean`
- required: `false`
- default: `false`
- description: 로딩 중인 액션임을 표시하고 중복 클릭을 차단합니다.

HDS가 담당하는 것:

- loading 시각 표현
- 중복 클릭 방지
- `aria-busy="true"` 연결
- 필요 시 disabled와 동일한 interaction 차단
- loading 중 leftIcon / rightIcon slot을 숨기고 spinner를 표시

HDS가 담당하지 않는 것:

- API 요청 실행
- 성공/실패 처리
- 서버 에러 표시
- loading 문구 결정
- retry 정책

### `disabled`

- type: `boolean`
- required: `false`
- default: `false`
- description: 버튼을 비활성화하고 interaction을 차단합니다.

### `leftIcon`

- type: `React.ReactNode`
- required: `false`
- description: label 왼쪽에 렌더링할 아이콘입니다. Button의 variant/disabled/loading text color를 따라야 하는 아이콘은 `currentColor` 기반이어야 합니다.

### `rightIcon`

- type: `React.ReactNode`
- required: `false`
- description: label 오른쪽에 렌더링할 아이콘입니다. Button의 variant/disabled/loading text color를 따라야 하는 아이콘은 `currentColor` 기반이어야 합니다.

### `className`

- type: `string`
- required: `false`
- description: root `button`에 병합할 class입니다.

### `children`

- type: `React.ReactNode`
- required: `true`
- description: 버튼의 visible label입니다.

## States

- default: 기본 사용 상태입니다.
- hover: v1에서는 별도 색상 변경을 정의하지 않습니다.
- active: press 상태에서 variant별 feedback background color를 적용합니다.
  - `primary`: `cool-gray-300`
  - `neutral`: `warm-gray-100`
- focus-visible: keyboard focus 시 native outline을 보존합니다.
- disabled: `disabled`가 `true`일 때 비활성 시각 상태를 표시하고 interaction을 차단합니다.
- loading: `loading`이 `true`일 때 로딩 시각 상태를 표시하고 중복 click interaction을 차단합니다.

## Behavior

1. `button` element로 렌더링합니다.
2. `type`이 전달되지 않으면 `type="button"`을 사용합니다.
3. `variant`, `size`, `width` 값에 맞는 HDS 내부 class를 적용합니다.
4. `leftIcon`이 있고 loading 상태가 아니면 label 왼쪽에 렌더링합니다.
5. `rightIcon`이 있고 loading 상태가 아니면 label 오른쪽에 렌더링합니다.
6. `disabled || loading`이면 click interaction이 실행되지 않아야 합니다.
7. `loading`이면 `aria-busy="true"`를 제공합니다.
8. `disabled`이면 native `disabled`를 우선 사용합니다.
9. `children` label은 기본 한 줄을 유지하고, overflow 시 layout을 깨지 않아야 합니다.
10. icon-only 사용은 허용하지 않고 `IconButton`으로 분리합니다.

## Styling

- styling 기준: Tailwind CSS utility class와 design token 또는 Tailwind theme를 우선 사용합니다.
- class composition: `class-variance-authority`의 `cva`로 `variant`, `size`, `width` 조합을 정의하고, `cn`으로 호출부 `className`과 병합합니다.
- layout: inline-flex 기반으로 icon과 label을 중앙 정렬합니다.
- size: `sm(2.25rem)`, `md(2.625rem)`, `lg(2.875rem)`, `xl(3.25rem)` 높이를 사용합니다. 16px root 기준 각각 36px, 42px, 46px, 52px입니다.
- width: `fit`은 content 기준, `full`은 `w-full` 기준입니다.
- root font-size: 앱과 HDS Storybook은 브라우저 기본 16px root를 따릅니다. HDS typography token도 16px root 기준 rem으로 작성합니다.
- radius: Figma Button 반복값인 `5px`를 기준으로 `rounded-[5px]`을 사용합니다.
- spacing: icon/label gap은 Figma의 4px 패턴을 기준으로 `gap-1`을 사용합니다. padding은 Button 기본 스타일로 두고, 고정 폭/배치는 부모 layout이 결정합니다.
- typography: v1 Button 기본 label typography는 `typo-body-6`으로 통일합니다. size별 typography 분기는 도입하지 않습니다.
- responsive: Button 자체는 fixed/sticky layout을 결정하지 않고 부모 container의 width를 따릅니다.
- icon: leftIcon/rightIcon은 label과 시각적으로 중앙 정렬되어야 합니다.
- icon color: Button은 icon slot에 전달된 node의 SVG fill/stroke를 강제로 덮어쓰지 않습니다. variant/disabled/loading 색상 상속이 필요한 Button icon은 `currentColor` 기반 아이콘을 사용합니다. 고정 fill/stroke를 가진 HDS icon은 의도한 상태 색상을 따라가지 않을 수 있으므로 Button slot 사용 전 확인합니다.
- loading icon policy: loading 중에는 leftIcon/rightIcon을 모두 숨기고 spinner만 표시합니다. rightIcon이 유지되면 화살표/다음 아이콘이 이동 가능 상태처럼 보일 수 있기 때문입니다.
- overflow: 긴 label이 icon과 겹치거나 button box를 깨지 않아야 합니다.
- focus-visible: v1에서는 별도 token ring을 정의하지 않고 native outline을 보존합니다.
- disabled: Figma에서 확인된 token 조합으로 HDS 내부 상태 스타일을 매핑합니다.
- hover: Figma 상태 색상이 확인되기 전까지 v1에서 별도 색상 변경을 적용하지 않습니다.
- active: press 상태는 enabled button에만 variant별 background color feedback을 적용합니다. `primary`는 `cool-gray-300`, `neutral`은 `warm-gray-100`을 사용합니다.
- disabled: v1에서는 opacity 기반 비활성화 대신 `secondary-200` background + `warm-gray-300` text로 통일합니다. Figma의 opacity disabled 패턴은 별도 기준이 확정되기 전까지 v1 Button에 추가하지 않습니다.

## Deferred Decisions

아래 항목은 Figma에서 일부 패턴이 보이지만, v1 `Button` public API로 추가하지 않습니다. 추가 여부는 반복성, 목적 명확성, 기존 `primary`/`neutral`로 표현 가능한지 기준으로 다시 판단합니다.

### `danger`

v1에서는 `danger` variant를 추가하지 않습니다.

확인한 Figma 근거:

- `bottombar_two_buttons`의 `button_reset`에는 `삭제하기` 버튼이 존재합니다.
- 스타일은 `secondary-200` background + red text(`primary-400` 계열) + `46px` height + `5px` radius입니다.
- 같은 bottom bar 안의 `수정하기` 버튼과 나란히 배치되는 low-emphasis destructive action에 가깝습니다.

제외 이유:

- 이 사례는 위험 액션 후보이지만, HDS 전체의 `danger` variant를 확정할 만큼 반복성이 아직 부족합니다.
- 일반적으로 `danger`는 삭제/탈퇴 같은 모든 위험 액션을 포괄하는 semantic API로 읽힙니다. 그런데 현재 확인된 시각 패턴은 dark filled danger가 아니라 neutral container 안의 red text 패턴입니다.
- `danger`를 지금 추가하면 `danger = 위험 액션`인지, `danger = secondary background + red text`인지 API 의미가 흐려집니다.
- 삭제 여부, 확인 플로우, 복구 가능성, 권한 같은 위험도 판단은 HDS가 아니라 App Shell / Page / Feature가 소유합니다.

v1 처리 방향:

- 삭제/탈퇴 액션은 우선 `primary` 또는 `neutral`과 호출부 copy/배치로 표현합니다.
- `secondary-200` background + red text가 필요한 경우, v1에서는 feature-local pattern 또는 호출부 `className`으로 제한적으로 처리합니다.
- HDS Button은 `danger` action prop이나 confirm/delete 전용 prop을 제공하지 않습니다.

추가 검토 조건:

- `secondary-200` background + red text destructive button이 bottom bar, modal footer, card action 등 서로 다른 맥락에서 2개 이상 반복됩니다.
- 디자인팀이 해당 패턴을 위험 액션의 공통 Button variant로 명명합니다.
- hover/active/disabled, icon 포함, loading 상태까지 함께 정의됩니다.
- 이름을 `danger`로 할지, `destructive` 또는 `destructiveLow`처럼 emphasis가 드러나는 이름으로 할지 결정됩니다.

### `ghost`

v1에서는 `ghost` variant를 추가하지 않습니다.

이유:

- 현재 확인된 투명 배경 패턴은 `button_profile_delete`처럼 특정 화면/행동에 가까운 사례입니다.
- height가 `3.1rem` 계열로 v1 Button 핵심 size(`sm`, `md`, `lg`, `xl`)에 포함되지 않습니다.
- 투명 배경 + 텍스트만 있는 액션은 `Button`보다 text action 또는 feature-local pattern일 가능성이 있습니다.

추가 검토 조건:

- 투명 배경 + 텍스트 버튼이 서로 다른 화면에서 2개 이상 반복됩니다.
- route/link가 아니라 native button action으로 반복됩니다.
- size, typography, spacing이 v1 Button 구조 안에서 정규화될 수 있습니다.
- 삭제/수정/닫기 같은 특정 도메인 행동명이 아니라 product-agnostic 목적(`ghost`, `tertiary` 등)으로 설명할 수 있습니다.

### disabled opacity

v1에서는 disabled를 opacity 방식으로 처리하지 않습니다.

이유:

- Figma에 opacity disabled와 token color disabled가 함께 있어 기준이 충돌합니다.
- opacity는 배경/텍스트/아이콘 전체 대비를 동시에 낮춰 접근성 검토가 필요합니다.
- Button v1은 variant별 disabled를 `secondary-200` background + `warm-gray-300` text로 통일합니다.

추가 검토 조건:

- 디자인팀에서 disabled 표현을 opacity 방식으로 통일합니다.
- opacity 수치와 대비 기준이 명확히 정해집니다.
- icon 포함 버튼에서도 동일한 disabled 표현이 안전하게 동작합니다.

### `cool-gray-700` review tone

v1에서는 `cool-gray-700` 계열을 별도 Button variant로 추가하지 않습니다.

이유:

- `review`는 제품 행동에 가까운 이름이라 HDS Button variant로 직접 승격하기 어렵습니다.
- `cool-gray-700`은 목적 이름이 아니라 색상 차이입니다.
- 현재 확정 variant인 `primary`/`neutral`만으로 Button v1 API를 작게 유지하는 편이 더 안정적입니다.

추가 검토 조건:

- `cool-gray-700` filled button이 리뷰 외 다른 카드/모달/폼 액션에서도 반복됩니다.
- `primary`보다 약하지만 `neutral`보다 강한 product-agnostic 목적이 확인됩니다.
- 이름을 `review`가 아니라 `secondary`, `subtlePrimary`, `accent`처럼 도메인 없는 목적어로 설명할 수 있습니다.
- hover/active/disabled까지 함께 정의할 수 있습니다.

## Accessibility

- semantic element: root는 native `button`입니다.
- accessible name: visible `children` label을 button name으로 사용합니다.
- keyboard interaction: 기본 button keyboard interaction을 따릅니다.
- focus-visible: keyboard focus 시 native outline을 보존합니다.
- ARIA: loading 상태에는 `aria-busy="true"`를 제공합니다.
- disabled: native `disabled`를 우선 사용합니다.
- `aria-disabled`는 native disabled를 사용할 수 없는 구조가 생길 때만 검토합니다.

## Public API

```tsx
type ButtonVariant = 'primary' | 'neutral'

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

type ButtonWidth = 'fit' | 'full'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  width?: ButtonWidth
  loading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  children: React.ReactNode
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'disabled'
>
```

- [x] `Button` value export
- [x] `ButtonProps` type export
- [x] no private helper export
- [x] 호출부는 `onClick`, `type`, form submit, route 이동, API 호출, analytics를 소유합니다.
- [x] `Button`은 link/href/asChild API를 제공하지 않습니다.

권장 사용 예시:

```tsx
<Button variant="primary" size="lg" width="full">
  확인 완료
</Button>

<Button variant="neutral" size="md">
  취소하기
</Button>

<Button
  variant="primary"
  size="sm"
  leftIcon={<CheckIcon />}
>
  리뷰 작성하기
</Button>

<Button
  variant="neutral"
  size="sm"
  rightIcon={<NextIcon />}
>
  더보기
</Button>

<Button type="submit" variant="primary" size="lg">
  저장하기
</Button>
```

## Storybook

- [x] Default
- [x] variant variants
- [x] size variants
- [x] width full
- [x] Figma 대응: WithdrawalActions
- [x] disabled
- [x] loading
- [x] leftIcon
- [x] rightIcon
- [x] leftIcon + rightIcon
- [x] disabled + currentColor icon
- [x] loading + leftIcon + rightIcon
- [x] long label overflow

v1에서 icon-only, disabled reason, invalid/error, link/href, `asChild`는 지원하지 않습니다.

## HDS가 가지면 안 되는 것

- 실제 route 이동
- Next / React Router 의존성
- `href`, `Link`, `asChild` API
- WebView bridge 호출
- 로그인 여부 판단
- 권한에 따른 버튼 노출 판단
- 예약 / 리뷰 / 결제 같은 도메인 데이터 하드코딩
- API mutation 또는 query invalidation
- analytics event 전송
- form validation 규칙
- 앱 전용 copy 하드코딩
- confirm / delete / reserve 같은 action props
- 서버 에러 메시지 처리
- retry 정책
- browser back button 정책
- safe area inset 직접 적용
- app shell padding 결정
- 버튼 그룹의 의미와 실행 순서 결정

## Verification

- [x] `corepack pnpm format:check`
- [x] `corepack pnpm --filter @hashi/hds-ui lint`
- [x] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [x] `corepack pnpm --filter @hashi/hds-ui build`
- [x] `corepack pnpm --filter @hashi/hds-ui test`
- [x] `corepack pnpm --filter @hashi/hds-ui build-storybook`
- [x] `git diff --check`
