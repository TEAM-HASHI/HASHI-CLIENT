# Component Spec: `Textarea`

Jira: HASHI-63

## Purpose

`Textarea`는 여러 줄 텍스트 입력을 제공하는 HDS form primitive입니다.

HDS는 textarea box, helper text, character counter, disabled state, className merge, native textarea attribute forwarding, baseline accessibility만 담당합니다. 리뷰, 식당, 후기, 문의, 신고, route, API, analytics, 제출 가능 여부, 제품별 검증 정책은 호출부가 처리합니다.

## Usage Location

- `packages/hds-ui/src/components/textarea/Textarea.tsx`

## Requirements

- [x] 제품 도메인 copy나 검증 정책을 하드코딩하지 않습니다.
- [x] native `textarea` props를 전달합니다.
- [x] `placeholder`, `helperText`, `maxLength`, `disabled`, `className`, `textareaClassName`을 지원합니다.
- [x] `maxLength`가 있으면 counter를 기본 표시합니다.
- [x] counter는 `value`, `defaultValue`, 사용자 입력 이벤트를 기준으로 내부 계산합니다.
- [x] `showCounter={false}`로 counter를 숨길 수 있습니다.
- [x] HTML `maxLength` attribute로 입력 길이 제한을 위임합니다.
- [x] 입력 이벤트나 controlled value가 `maxLength`를 초과해도 컴포넌트가 `maxLength`까지만 표시합니다.
- [x] resize를 막습니다.
- [x] error / invalid 상태와 minLength 검증은 1차 구현에서 제외합니다.

## Figma Reference

| Node         | Name                   | Size / Style                                                                           |
| ------------ | ---------------------- | -------------------------------------------------------------------------------------- |
| `1735:39329` | `input_textbox_review` | width `353px`, box min-height `230px`, padding `20px`, radius `10px`, helper gap `8px` |

Figma의 `리뷰를 작성해 주세요.`, `10자 이상`, `0 / 1000` 문구는 HDS 내부에 하드코딩하지 않고 Storybook 예시에서만 사용합니다.

## Public API

```tsx
<Textarea
  placeholder="리뷰를 작성해 주세요."
  helperText="10자 이상"
  maxLength={1000}
/>
```

Exported value:

- `Textarea`

Exported type:

- `TextareaProps`

## Props

- `helperText`: `string`, optional helper text rendered below the textarea.
- `showCounter`: `boolean`, optional. Defaults to `true` when `maxLength` exists.
- `className`: `string`, optional wrapper className.
- `textareaClassName`: `string`, optional inner textarea className.
- native `textarea` props except `children` and inner textarea `className`.

## States

- default: editable textarea with placeholder, helper text, and optional counter.
- focused: browser focus is visible with HDS token outline and border.
- disabled: native disabled textarea with disabled visual treatment.
- controlled: `value` drives the input and counter.
- uncontrolled: `defaultValue` and user input drive the counter.

## Behavior

1. The root renders a fixed design-system width with `max-width: 100%`.
2. The textarea renders native attributes and event handlers.
3. `onChange` updates the internal counter and then calls the provided handler.
4. When `value` changes in controlled usage, the rendered value and counter are limited to `maxLength`.
5. `maxLength` is passed to the native textarea.
6. If an input event produces a value longer than `maxLength`, the DOM value is trimmed to `maxLength` before the counter is updated.

## Styling

- root width: `353px`
- root gap: `8px`
- textarea min-height: `230px`
- textarea padding: `20px`
- border: `1px`, `warm-gray-100`
- border radius: `10px`
- input text: `font-sans`, `typo-body-4`, `primary-200`
- input override: consumers can pass `textareaClassName` to extend or override inner textarea styles.
- placeholder: `warm-gray-300`
- helper/counter: `font-sans`, `typo-body-6`, `line-height: 1.36`
- helper text: `warm-gray-300`
- current count: `primary-200`
- max count: `warm-gray-300`

## Accessibility

- Consumers provide a visible label, `aria-label`, or `aria-labelledby`.
- Counter uses `aria-live="polite"` when rendered.
- Disabled state uses native `disabled`.

## Storybook

- [x] Default
- [x] Review example
- [x] Disabled

## Verification

- `corepack pnpm --filter @hashi/hds-ui lint`
- `corepack pnpm --filter @hashi/hds-ui typecheck`
- `corepack pnpm --filter @hashi/hds-ui build`
- `corepack pnpm --filter @hashi/hds-ui test`
