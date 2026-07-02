# Component Spec: `BottomNavigation`

Jira: HASHI-51

## Purpose

`BottomNavigation`은 모바일 WebView/PWA 화면 하단에서 주요 목적지로 이동하는 공통 하단 내비게이션 컴포넌트입니다.

HDS는 하단 내비게이션의 시각 구조, 탭 균등 배치, 선택 상태 표시, 라벨 표시, 기본 접근성 계약만 담당합니다. 실제 라우팅, safe area, fixed/sticky 배치, 로그인/권한 처리, analytics는 App Shell 또는 page가 주입합니다.

## Usage Location

- `packages/hds-ui/src/components/bottomNavigation/BottomNavigation.tsx`

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] `value` 기반 controlled selection을 제공합니다.
- [x] 모든 item label을 항상 표시합니다.
- [x] item은 button 기반 interaction으로 동작합니다.
- [x] active item에는 접근성 상태를 제공합니다.
- [x] token 또는 Tailwind theme 기준을 우선 사용합니다.

## UI Structure

```text
BottomNavigation
  item button
    icon
    label
```

## Props

### value

- type: `string`
- required: `true`
- description: 현재 선택된 item의 값입니다.

### items

- type: `BottomNavigationItem[]`
- required: `true`
- description: 렌더링할 하단 내비게이션 item 목록입니다.

```tsx
type BottomNavigationItem = {
  value: string
  label: string
  icon: React.ReactNode
}
```

권장 item 개수는 3-5개입니다. 구현에서 개수를 강제하지는 않습니다.

### onValueChange

- type: `(value: string) => void`
- required: `false`
- description: inactive item을 선택했을 때 호출됩니다. route 이동은 호출부에서 처리합니다.

### className

- type: `string`
- required: `false`
- description: root `nav`에 병합할 class입니다.

## States

- active: item `value`가 현재 `value`와 일치합니다.
- inactive: item `value`가 현재 `value`와 다릅니다.

## Behavior

1. `items`를 같은 너비의 column으로 배치합니다.
2. active item icon은 active 색상으로 표시합니다.
3. inactive item icon은 inactive 색상으로 표시합니다.
4. label은 상태와 관계없이 항상 표시합니다.
5. inactive item을 클릭하면 `onValueChange(item.value)`를 호출합니다.
6. active item을 다시 클릭하면 `onValueChange`를 호출하지 않습니다.

## Styling

- layout: root 높이 84px, item visual box 48px, icon 24px
- spacing: root `pt: 5px`, `pb: 10px`, horizontal padding 26.5px, icon/label gap 3px
- responsive: `w-full`과 equal-column grid로 배치합니다.
- token usage: active icon `cool-gray-900`, inactive icon `warm-gray-300`, label `cool-gray-900`, label typography `typo-caption-5`
- safe area: HDS에서 적용하지 않고 App Shell에서 한 번만 처리합니다.
- fixed/sticky: HDS에서 결정하지 않습니다.

## Accessibility

- semantic element: root는 `nav`, item은 `button`
- accessible name: visible label을 button name으로 사용합니다.
- keyboard interaction: 기본 button keyboard interaction을 따릅니다.
- focus-visible: keyboard focus outline을 제공합니다.
- ARIA: active item에는 `aria-current="page"`를 제공합니다.

## Storybook

- [x] Default
- [x] Active item variants
- [x] Long label overflow
- [x] 393px mobile viewport wrapper

v1에서 disabled, loading, invalid/error, link/href, `asChild`는 지원하지 않습니다.

## Public API

- [x] `BottomNavigation` value export
- [x] `BottomNavigationProps` type export
- [x] `BottomNavigationItem` type export
- [x] no private helper export

## HDS가 가지면 안 되는 것

- 실제 route 이동
- Next/React Router 의존성
- `href`, `Link`, `asChild` API
- WebView bridge 호출
- 로그인 여부 판단
- 권한에 따른 탭 숨김
- 예약 상태에 따른 탭 disabled
- analytics event 전송
- safe area inset 직접 적용
- fixed/sticky layout 결정
- 앱 전용 탭 목록 하드코딩

## Verification

- [ ] `corepack pnpm format:check`
- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
- [ ] `corepack pnpm --filter @hashi/hds-icons lint`
- [ ] `corepack pnpm --filter @hashi/hds-icons typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-icons build`
