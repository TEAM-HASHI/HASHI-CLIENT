# Component Spec: `Checkbox`

Jira: HASHI-53

## Purpose

`Checkbox`는 HASHI Design System의 checkbox icon형 HDS UI primitive입니다.

이번 `icon_checkbox` 디자인은 일반적인 "빈 박스에서 체크 아이콘이 나타나는 checkbox"가 아니라, 체크 아이콘이 항상 보이고 checked 여부에 따라 아이콘 색상만 바뀌는 UI입니다.

## HDS Responsibilities

HDS가 담당하는 것:

- native checkbox input 렌더링
- native input ref 전달
- checkbox icon의 시각 구조
- checked 상태에 따른 CheckIcon 색상 표현
- disabled 상태의 기본 interaction 차단
- label 클릭과 keyboard interaction을 포함한 기본 접근성 계약

HDS가 담당하지 않는 것:

- 탈퇴 페이지 문구
- 동의 여부 validation
- 버튼 활성화 조건
- form submit
- route 이동
- API 호출
- analytics

## Public API

```tsx
<Checkbox defaultChecked>동의합니다</Checkbox>

<Checkbox checked={checked} onChange={handleChange}>
  동의합니다
</Checkbox>
```

Exported value:

- `Checkbox`

Exported types:

- `CheckboxProps`

## Props

### native checkbox input props

- type: `Omit<ComponentPropsWithRef<'input'>, 'type'>`
- required: `false`
- description: React native checkbox input props를 전달합니다. `type`은 내부에서 `checkbox`로 고정합니다. React 19 ref prop 방식으로 native input ref도 전달할 수 있습니다.

### `children`

- type: `ReactNode`
- required: `false`
- description: checkbox 옆에 렌더링할 label content입니다.

### `className`

- type: `string`
- required: `false`
- description: root label에 병합할 class입니다.

## States

- unchecked: Cool_Gray_100 배경과 흰색 CheckIcon을 표시합니다.
- checked: Cool_Gray_100 배경과 Cool_Gray_800 CheckIcon을 표시합니다.
- disabled: native input disabled 상태를 사용하고 `cursor-not-allowed`만 적용합니다.
- controlled: 호출부가 `checked`와 `onChange`로 상태를 관리합니다.
- uncontrolled: native input이 `defaultChecked` 기반으로 상태를 관리합니다.

## Styling

- box size: `26px * 26px`
- icon size: `26px * 26px`
- radius: `3px`
- background: `bg-cool-gray-100`
- unchecked icon color: `text-white`
- checked icon color: `peer-checked:text-cool-gray-800`
- disabled: `cursor-not-allowed`
- focus-visible: native input focus를 `peer-focus-visible` outline으로 visual box에 표시합니다.

Figma Dev Mode의 `2.6rem` 값은 사용하지 않고 px 기준 `h-[26px] w-[26px]`를 사용합니다. `CheckIcon`은 `@hashi/hds-icons`에서 import하고, SVG viewBox가 26x26이므로 `h-[26px] w-[26px]`로 렌더링합니다.

## Accessibility

- 실제 `input type="checkbox"`를 유지합니다.
- root를 `label`로 감싸 label과 children 클릭 시 토글됩니다.
- input은 `sr-only`로 숨겨 keyboard 접근성을 유지합니다.
- keyboard interaction은 native checkbox 동작을 따릅니다.
- CheckIcon은 장식 요소이므로 `aria-hidden="true"`와 `focusable="false"`를 적용합니다.
- `role="checkbox"`, `aria-checked`, `tabIndex`를 중복 추가하지 않습니다.

## Storybook

- [x] Default
- [x] Checked
- [x] Disabled
- [x] DisabledChecked

Controls:

- `children`
- `defaultChecked`
- `disabled`

`checked` control은 controlled/read-only 혼선을 피하기 위해 기본 control로 노출하지 않습니다.

## Test

- [x] label children 렌더링
- [x] native checkbox input 렌더링
- [x] native checkbox input ref 전달
- [x] click 시 checked 상태 토글
- [x] disabled 상태에서 click 시 checked 상태 유지
- [x] CheckIcon `aria-hidden` 처리

## Verification

- [ ] `pnpm --filter @hashi/hds-ui lint`
- [ ] `pnpm --filter @hashi/hds-ui typecheck`
- [ ] `pnpm --filter @hashi/hds-ui build-storybook`
- [ ] `pnpm --filter @hashi/hds-ui test`
- [ ] `git diff --check`
