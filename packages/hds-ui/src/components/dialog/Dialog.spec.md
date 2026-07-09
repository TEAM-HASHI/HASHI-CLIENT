# Component Spec: `Dialog`

Jira: HASHI-52

## Purpose

`Dialog`는 화면 흐름 위에 짧은 확인, 안내, 또는 구조화된 정보를 표시하는 HDS overlay primitive입니다.

HDS는 dialog의 overlay, centered panel, dismiss interaction, accessibility contract, slot별 기본 시각 구조만 담당합니다. Portal, modal hiding, focus containment, keyboard dismiss 같은 하위 overlay 동작은 `react-aria-components`에 위임합니다. 실제 액션 실행, route 이동, analytics, API 호출, WebView bridge, 도메인 copy, 도메인 데이터 구성은 App Shell 또는 page/feature가 처리합니다.

## Usage Location

- `packages/hds-ui/src/components/dialog/Dialog.tsx`

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] compound component API를 제공합니다.
- [x] controlled / uncontrolled open state를 지원합니다.
- [x] React Aria Components 기반 portal overlay와 centered panel을 렌더링합니다.
- [x] focus trap, keyboard dismiss, outside hiding은 React Aria Components에 위임합니다.
- [x] React Aria Button 기반 trigger / close press API를 유지하고 initial focus / trigger focus return을 보강합니다.
- [x] `dialog` / `alertdialog` role을 지원합니다.
- [x] `aria-modal`, `aria-labelledby`, `aria-describedby` 접근성 연결을 제공합니다.
- [x] token 또는 Tailwind theme 기준을 우선 사용합니다.
- [x] icon slot은 24px visual box만 제공하고, SVG 자체의 크기와 색상은 icon component 또는 호출부 composition이 소유합니다.
- [x] Storybook composition도 HDS token class를 우선 사용하고, raw hex color는 대응 token이 없을 때만 사용합니다.

## Figma References

| Node         | Name                     | Size        | Usage             |
| ------------ | ------------------------ | ----------- | ----------------- |
| `1263:18228` | `modal_review_authority` | `327 x 220` | story composition |
| `1668:38336` | `modal_review_delete`    | `327 x 200` | story composition |
| `1105:10955` | `type=confirm`           | `327 x 220` | story composition |
| `1105:11195` | `type=complete`          | `327 x 220` | story composition |
| `1596:27834` | `reservation_info_modal` | `319 x 504` | story composition |

Figma의 copy와 데이터 예시는 HDS에 하드코딩하지 않습니다.

## Public API

```tsx
<Dialog.Root type="alertdialog" open={open} onOpenChange={setOpen}>
  <Dialog.Trigger>열기</Dialog.Trigger>

  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Icon>{icon}</Dialog.Icon>
      <Dialog.Title>정말 삭제하시겠습니까?</Dialog.Title>
      <Dialog.Description>
        삭제한 리뷰는 다시 되돌릴 수 없어요.
      </Dialog.Description>
    </Dialog.Header>

    <Dialog.Body>{children}</Dialog.Body>

    <Dialog.Footer>
      <Dialog.Close>취소하기</Dialog.Close>
      <button type="button" onClick={handleConfirm}>
        삭제하기
      </button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

Exported value:

- `Dialog`

Exported types:

- `DialogType`
- `DialogRootProps`
- `DialogTriggerProps`
- `DialogContentProps`
- `DialogHeaderProps`
- `DialogIconProps`
- `DialogTitleProps`
- `DialogDescriptionProps`
- `DialogBodyProps`
- `DialogFooterProps`
- `DialogCloseProps`

## UI Structure

```text
Dialog.Root
  Dialog.Trigger
  Dialog.Content
    overlay
    panel
      Dialog.Header
        Dialog.Icon
        Dialog.Title
        Dialog.Description
      Dialog.Body
      Dialog.Footer
        Dialog.Close
        app action button
```

## Props

### `Dialog.Root`

- `type`: `'dialog' | 'alertdialog'`, optional, default `'dialog'`
- `open`: `boolean`, optional controlled open state
- `defaultOpen`: `boolean`, optional uncontrolled initial open state
- `onOpenChange`: `(open: boolean) => void`, optional
- `children`: `ReactNode`, required

### `Dialog.Trigger`

- React Aria `ButtonProps`
- renders a native `button` through React Aria `Button`
- default `type="button"`
- supports React Aria press events such as `onPress`
- keeps `onClick` compatibility through React Aria `PressEvents`

### `Dialog.Content`

- div props except `role`
- renders the portal, overlay, and panel while open
- receives `aria-label` when no `Dialog.Title` is rendered
- merges `className` into the panel

### Slots

- `Dialog.Header`: header layout slot
- `Dialog.Icon`: icon slot, 24px visual box. It does not resize SVG children through font-size.
- `Dialog.Title`: title slot and `aria-labelledby` source
- `Dialog.Description`: description slot and `aria-describedby` source
- `Dialog.Body`: optional free-content slot
- `Dialog.Footer`: action layout slot
- `Dialog.Close`: React Aria `ButtonProps`, native `button`, default `type="button"`

## States

- closed: portal content is not rendered.
- open: portal content is rendered.
- controlled: `open` controls the state.
- uncontrolled: internal state starts from `defaultOpen`.
- dialog: ESC and outside interaction request close.
- alertdialog: ESC requests close, outside interaction does not close.

## Behavior

1. `Dialog.Trigger` press requests `open=true`.
2. `Dialog.Content` renders a React Aria `ModalOverlay`, `Modal`, and `Dialog` while open.
3. Focus moves to the first focusable element inside the dialog, or to the panel if none exists.
4. `Tab` and `Shift+Tab` stay inside the modal through React Aria focus containment.
5. `Dialog.Close` press requests `open=false`.
6. `Escape` requests close through React Aria keyboard dismiss behavior.
7. Outside interaction closes only `type="dialog"` through React Aria `isDismissable`.
8. Close returns focus to the trigger when the trigger opened the dialog.

## Styling

- placement: viewport-centered modal
- overlay background: `bg-dim`
- content width: `327px`, max `calc(100vw - 48px)`
- background: `white`
- radius: `15px`
- small dialog horizontal padding: `27px`
- small dialog vertical padding: `26px`
- header layout: vertical, centered, `12px` gap
- icon slot: `24px` visual box through `size-6`
- icon sizing: SVG children own their `width` / `height`; `Dialog.Icon` must not use text-size utilities to imply icon resizing
- title: `typo-header-3`, `cool-gray-900`
- description: 14px / 20px, `cool-gray-500`
- footer: full-width horizontal action row, `8px` gap, direct children flex equally
- information-rich examples may adjust panel width, padding, body sections, and footer gap through `className`
- Storybook composition examples should prefer token classes such as `text-cool-gray-900` over hard-coded color values.

## Accessibility

- panel role is `dialog` or `alertdialog`
- panel receives `aria-modal`
- `Dialog.Title` uses React Aria `Heading slot="title"` and connects through `aria-labelledby`
- `Dialog.Description` connects through `aria-describedby`
- `Dialog.Content` can receive `aria-label` when title is omitted
- trigger and close controls use React Aria button press semantics while rendering native buttons
- modal focus remains inside the dialog through React Aria
- focus returns to trigger on close

## Dependencies

- `react-aria-components`: modal overlay, dialog role wiring, focus containment, outside hiding, keyboard dismiss

## Storybook

- [x] Default small dialog
- [x] Review authority example
- [x] Review delete alert example
- [x] Reservation cancel alert example
- [x] Reservation complete example
- [x] Information-rich reservation layout example
- [x] Long title and description overflow
- [x] Controlled open
- [x] Uncontrolled `defaultOpen`
- [x] 393px mobile viewport wrapper

## Non-Goals

- Bottom sheet or Drawer layout
- Radix dependency
- `href`, `Link`, `asChild`, or polymorphic element API
- route-driven dialog state
- browser back button policy
- WebView bridge call
- app-specific action props
- dialog-owned async loading, validation, or server error handling
- analytics event dispatch

## Verification

- [ ] `corepack pnpm format:check`
- [ ] `git diff --check`
- [ ] `bash .agents/scripts/check-harness.sh`
- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
