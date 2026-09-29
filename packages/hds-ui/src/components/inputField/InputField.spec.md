# Component Spec: `InputField`

Jira: HASHI-176 (기존 HASHI-64 리디자인)

## Purpose

제품 의미가 없는 한 줄 입력 primitive입니다. label, 입력 외형, 우측 slot, disabled, focus, native input props를 담당합니다. 검증 정책, 인증 API, 제품 문구와 제출 동작은 호출부가 소유합니다.

## Figma References

- [Input line](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=7869-36441&m=dev)
- rest: `7869:36479`, input: `7869:36481`, 본문 typography: `7869:36480`
- 2026-09-08 ego-browser의 Dev Mode 화면과 속성 패널에서 확인했습니다.

## Public API

```tsx
<InputField label="라벨" placeholder="텍스트" onChange={handleChange} />
```

- export: `InputField`, `InputFieldProps` (변경 없음)
- `label`: input과 연결되는 선택적 label. 생략 시 `aria-label` 또는 `aria-labelledby` 필수.
- `rightIcon`: 장식용 아이콘 slot.
- `rightElement`: 호출부가 동작과 접근성을 소유하는 action/content slot.
- `className`: 외형을 담당하는 input box에 병합.
- native input props, controlled `value`, uncontrolled `defaultValue`, ref 전달을 유지합니다. native `size`는 제외합니다.

## States And Behavior

- rest는 placeholder, input은 실제 입력값으로 표현합니다. 별도 시각 상태 prop을 추가하지 않습니다.
- label은 `htmlFor`와 `id`로 연결하며, 전달된 id를 우선합니다.
- 박스 여백을 누르면 input에 focus합니다. 우측 slot 동작은 가로채지 않습니다.
- disabled이면 native input을 비활성화하고 우측 action slot은 `inert` 처리합니다.
- input의 키보드 focus만 박스 바깥쪽 `cool-gray-500` 2px outline, offset 2px로 표시합니다. Figma의 rest/input 외 접근성 보완입니다. 우측 action에 focus가 이동하면 입력 박스 outline은 해제되며 action 자체의 focus 표시는 호출부가 담당합니다.

## Styling

| 항목               | 이전                   | 리디자인          |
| ------------------ | ---------------------- | ----------------- |
| 배경               | primary-100            | white             |
| 테두리             | 없음                   | warm-gray-100 1px |
| 높이 / radius      | 45px / 10px            | 유지              |
| 입력값             | primary-200            | black             |
| 글꼴 / placeholder | Body 4 / warm-gray-300 | 유지              |
| 왼쪽 inset         | 15px                   | 테두리 포함 12px  |

- 너비는 `w-full`. Figma 예시 345px는 Storybook 프레임에만 사용합니다.
- 세로 정렬은 flex center. Figma의 45px 높이와 19px 텍스트보다 큰 상하 16px padding을 함께 강제하지 않습니다.
- border 1px + padding 11px로 왼쪽 inset 12px를 맞춥니다. 오른쪽은 긴 입력값이 테두리에 닿지 않도록 같은 inset을 유지합니다.
- 우측 slot이 있으면 기존의 테두리 포함 오른쪽 inset 9px, slot gap 10px, icon 22px를 유지합니다.
- label gap 8px와 Sub Header 2 typography를 유지합니다.

## Storybook And Verification

Default, Filled, WithLabel, 우측 icon/action 조합, Disabled, DisabledWithAction, LongText로 확인합니다.

- `pnpm --filter @hashi/hds-ui test`
- `pnpm --filter @hashi/hds-ui lint`
- `pnpm --filter @hashi/hds-ui typecheck`
- `pnpm --filter @hashi/hds-ui build`
- `pnpm build-storybook`
- 브라우저에서 입력, Tab으로 input → 우측 action 이동 시 박스 outline 해제와 action focus 표시, disabled action, 좁은 화면 overflow를 확인합니다.
