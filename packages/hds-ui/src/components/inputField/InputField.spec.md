# Component Spec: `InputField`

Jira: HASHI-64

## Purpose

`InputField`는 여러 화면에서 재사용 가능한 HDS 공통 입력 primitive입니다.

HDS는 label, input box, right icon slot, right element slot, disabled state, focus style, className merge, native input attribute forwarding, baseline accessibility만 담당합니다. 연락처, 전화번호, 인증번호, 재전송, 확인, 인증 API, route, analytics, 제품별 검증 정책은 호출부가 처리합니다.

## Usage Location

- `packages/hds-ui/src/components/inputField/InputField.tsx`

## Requirements

- [x] 제품 도메인 copy나 검증 정책을 하드코딩하지 않습니다.
- [x] native `input` props를 전달합니다.
- [x] `label`, `rightIcon`, `rightElement`, `disabled`, `className`을 지원합니다.
- [x] `label`이 있으면 `htmlFor`와 `id`로 input에 연결합니다.
- [x] `id`가 전달되면 해당 id를 우선 사용합니다.
- [x] `rightElement`는 외부에서 주입된 element를 렌더링만 합니다.
- [x] `rightIcon`은 외부에서 주입된 icon을 장식 영역에 렌더링만 합니다.
- [x] error / invalid 상태와 도메인 검증은 1차 구현에서 제외합니다.
- [x] 컴포넌트 기본 width는 `w-full`이며 화면 고정 width를 하드코딩하지 않습니다.

## Figma References

| Node         | Name                               | Notes                               |
| ------------ | ---------------------------------- | ----------------------------------- |
| `2136:64708` | `input_name`                       | label + placeholder 기본 input      |
| `2136:64489` | `input_contact_verified`           | label + right action                |
| `2136:64707` | `input_verification_code_disabled` | placeholder + right action          |
| `2136:64711` | `input_verification_code_complete` | value + success icon + right action |

Figma의 `연락처`, `010-7875-7856`, `4846`, `재전송`, `확인`, `인증하기` 문구는 HDS 내부에 하드코딩하지 않고 Storybook 예시에서만 사용합니다.

## Public API

```tsx
<InputField
  label="연락처"
  placeholder="연락처를 입력해 주세요."
  rightElement={<Button>인증하기</Button>}
/>
```

Exported value:

- `InputField`

Exported type:

- `InputFieldProps`

## Props

- `label`: `string`, optional label rendered above the input.
- `rightIcon`: `ReactNode`, optional decorative right icon slot.
- `rightElement`: `ReactNode`, optional right action/content slot.
- `className`: `string`, optional className merged into the visual input box container.
- native `input` props except `size` and inner input `className`.

## States

- default: editable input with optional placeholder.
- labeled: label is rendered and connected to the input.
- with right icon: external icon is rendered in the right icon slot.
- with right element: external action/content is rendered in the right element slot.
- focused: no additional outline style is applied by default.
- disabled: native disabled input with disabled cursor/text treatment.

## Behavior

1. The root renders a full-width vertical stack.
2. `label` renders above the input box with an `8px` gap.
3. The input renders native attributes and event handlers.
4. `rightIcon` and `rightElement` render on the right side without owning their meaning or behavior.
5. The input uses `min-w-0` and `flex-1` so right-side content can coexist in narrow mobile widths.

## Styling

- root width: `100%`
- label/input gap: `8px`
- input box height: `45px`
- input box padding-top / padding-bottom: `13px` (`py-3.25`)
- input box padding-left: `15px`
- input box padding-right: `15px` without right content, `9px` with right content
- input box radius: `10px`
- input box background: `primary-100`
- label: `font-sans`, `typo-sub-header-2`, `black`
- input text: `font-sans`, `typo-body-4`, `primary-200`
- placeholder/hint: input typography와 동일한 `typo-body-4`, `warm-gray-300`
- inner native input resets: `appearance-none`, `border-0`, `p-0`
- input and right content minimum gap: `10px`
- right icon and right element gap: `10px`
- right action position in Figma examples: `right 9px`, vertically centered in the `45px` box
- right icon visual box: `22px`

Figma selection width is `345px`, but the component uses `w-full` for mobile app layouts. Storybook examples wrap the component in a `345px` preview frame.

## Accessibility

- `label` connects to the input through `htmlFor` and `id`.
- If no `label` is provided, consumers provide `aria-label` or `aria-labelledby`.
- `disabled` uses the native input `disabled` attribute.
- `rightIcon` is rendered inside an `aria-hidden` wrapper.
- `rightElement` accessibility is owned by the provided external element.

## Storybook

- [x] Default
- [x] WithLabel
- [x] WithRightElement
- [x] WithRightIcon
- [x] WithRightIconAndElement
- [x] Disabled
- [x] PhoneVerificationExample
- [x] CodeVerificationExample

## Verification

- `corepack pnpm --filter @hashi/hds-ui lint`
- `corepack pnpm --filter @hashi/hds-ui typecheck`
- `corepack pnpm --filter @hashi/hds-ui build`
- `corepack pnpm --filter @hashi/hds-ui test`
- `corepack pnpm --filter @hashi/hds-ui build-storybook`
