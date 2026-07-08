# Component Spec: `Toast`

Jira: HASHI-88

## Purpose

`Toast`는 사용자 액션 결과를 짧게 알려주는 HDS feedback primitive입니다.

HDS는 toast의 시각 구조, icon slot, message slot, React Aria 기반 접근성 동작을 담당합니다. Toast를 언제 띄울지, 어떤 문구를 사용할지, 어떤 action 후에 호출할지는 App 또는 page/feature가 담당합니다.

## Component Type

- [x] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

## Public API

```tsx
import { LinkIcon } from '@hashi/hds-icons'
import { showToast, ToastRegion } from '@hashi/hds-ui'

const App = () => {
  return (
    <>
      <ToastRegion className="app-mobile-fixed-top z-toast px-5 pt-[calc(32px+var(--safe-area-top,0px))]" />
      <button
        type="button"
        onClick={() => {
          showToast({
            icon: <LinkIcon className="size-6" />,
            children: '링크가 복사 되었어요.',
          })
        }}
      >
        링크 복사
      </button>
    </>
  )
}
```

Exported values:

- `Toast`
- `ToastRegion`
- `toastQueue`
- `createToastQueue`
- `showToast`
- `DEFAULT_TOAST_TIMEOUT`

Exported types:

- `ToastContent`
- `ToastOptions`
- `ToastProps`
- `ToastRegionProps`

## Structure

React Aria Toast는 queue 기반으로 동작합니다.

```text
showToast({ icon, children })
  -> ToastRegion
    -> Toast
      -> icon slot
      -> message
```

기본 사용은 `showToast` helper를 사용합니다. `showToast`는 close 버튼이 없는 HDS Toast UX에 맞춰 기본 `timeout`을 적용합니다.

## Props

### `ToastContent.children`

- type: `ReactNode`
- required: `true`
- description: Toast에 표시할 메시지입니다.

### `ToastContent.icon`

- type: `ReactNode`
- required: `false`
- description: 메시지 앞에 표시할 아이콘입니다. 제품 의미가 있는 아이콘 선택은 호출부가 담당합니다.

### `ToastRegion.queue`

- type: `ToastQueue<ToastContent>`
- required: `false`
- default: package-level `toastQueue`
- description: 표시할 toast queue입니다. 앱에서 별도 queue가 필요하면 `createToastQueue()`로 만들어 주입합니다.

### `showToast(content, options)`

- type: `(content: ToastContent, options?: ToastOptions) => ReturnType<typeof toastQueue.add>`
- required: `false`
- description: package-level `toastQueue`에 toast를 추가하는 기본 helper입니다. `options.timeout`을 넘기지 않으면 `DEFAULT_TOAST_TIMEOUT`을 사용합니다.

### `DEFAULT_TOAST_TIMEOUT`

- type: `number`
- value: `2000`
- description: `showToast`의 기본 자동 닫힘 시간입니다.

### `className`

- type: `string`
- required: `false`
- description: `Toast` 또는 `ToastRegion` root element에 병합할 class입니다.

## Requirements

- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.
- [x] React Aria Toast primitive를 기반으로 구현합니다.
- [x] icon과 message를 queue content로 주입받습니다.
- [x] 기본 디자인은 Figma toast와 맞춥니다.
- [x] 긴 메시지는 최대 두 줄까지 표시합니다.
- [x] ToastRegion은 기본적으로 하나의 toast만 표시합니다.
- [x] `showToast`는 기본적으로 2000ms 후 toast가 자동으로 닫히도록 timeout을 적용합니다.

## UI Structure

```text
ToastRegion
  Toast
    ToastContent
      icon slot
      message
```

## Styling

Toast:

- width: `100%`
- height: `60px`
- padding: horizontal `20px`
- gap: `11px`
- radius: `10px`
- background: `primary-200`
- text color: `white`
- typography: `typo-long-body-1`
- icon slot: `24px * 24px`, `shrink-0`
- message: `min-w-0 line-clamp-2`

ToastRegion:

- root layout: vertical stack
- default gap: `8px`
- width: `100%`
- React Aria ToastRegion은 `document.body`로 portal 렌더링됩니다.
- positioning은 소유하지 않습니다. fixed 위치가 필요하면 wrapper가 아니라 `ToastRegion`의 `className`에 직접 위치 class를 전달합니다.

```tsx
<ToastRegion className="app-mobile-fixed-top z-toast px-5 pt-[calc(32px+var(--safe-area-top,0px))]" />
```

`ToastRegion`은 portal로 `document.body`에 렌더링되므로 wrapper로 감싸서 위치를 잡지 않습니다. 앱에서는 위 예시처럼 `ToastRegion` 자체에 위치 class를 전달합니다.

## Accessibility

- React Aria Toast의 `ToastRegion`, `Toast`, `ToastContent`를 사용합니다.
- ToastRegion은 screen reader가 toast 영역을 인식할 수 있는 접근성 동작을 제공합니다.
- icon slot wrapper는 장식 요소로 보고 `aria-hidden="true"`를 적용합니다.
- visible message가 읽히는 content입니다.

## Non-goals

- App 전역 provider 설치 위치 결정
- route별 toast 정책
- 제품별 copy
- API 성공/실패 처리
- analytics
- custom animation
- swipe dismiss
- close button 또는 수동 dismiss UI

## Storybook

필수 story:

- Default
- WithoutIcon
- LongText
- Success
- Error

`Toast`는 success/error variant를 별도 prop으로 소유하지 않습니다. 성공, 에러 같은 의미는 호출부가 적절한 icon과 message를 주입해 표현합니다.

## Verification

```bash
corepack pnpm --filter @hashi/hds-ui lint
corepack pnpm --filter @hashi/hds-ui typecheck
corepack pnpm --filter @hashi/hds-ui build
corepack pnpm --filter @hashi/hds-ui test
```
