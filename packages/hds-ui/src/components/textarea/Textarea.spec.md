# Component Spec: `Textarea`

Jira: HASHI-176 (기존 HASHI-63 리디자인)

## Purpose

여러 줄 입력, 안내 문구, 글자 수 counter와 초과 상태를 표현하는 HDS primitive입니다. 제품 문구, 검증 정책, 제출 가능 여부, API는 호출부가 소유합니다.

## Figma References

- [Input textbox](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=7869-36483&m=dev)
- 기본 variant `7869:36505`, 입력 박스 `7869:36506`, 텍스트 `7869:36507`, 초과 문구 `7869:36516`, 초과 counter `7869:36518`
- 2026-09-08 ego-browser의 Dev Mode 화면과 속성 패널에서 확인했습니다.

## Public API

```tsx
<Textarea
  aria-label="내용"
  maxLength={1000}
  maxLengthBehavior="allow"
  errorMessage="글자 수 제한을 초과했어요."
/>
```

Export: `Textarea`, `TextareaProps`. 기존 export를 유지합니다.

- `maxLengthBehavior`: `'prevent' | 'allow'`, 기본 `'prevent'`.
  - prevent: 기존대로 native maxLength, controlled/default value, 입력 이벤트를 제한합니다.
  - allow: 내용을 자르지 않으며 native maxLength를 전달하지 않습니다. maxLength는 counter와 초과 여부 판단에 사용합니다.
- `errorMessage`: invalid일 때 helperText 대신 표시하는 문구. 문구 자체는 호출부에서 전달합니다.
- `helperText`: 기본 안내 문구. errorMessage가 없으면 invalid여도 유지합니다.
- `showCounter`: 기본은 maxLength가 있을 때 true. false로 숨겨도 초과 상태 계산은 유지합니다.
- `rows`: native rows, 기본 1. 여러 줄 표시가 필요한 호출부에서 지정할 수 있습니다.
- `className`: root, `textareaClassName`: 실제 textarea에 병합합니다.
- native textarea props, ref, value/defaultValue, disabled, aria 속성을 유지합니다.

## States And Behavior

- default, focused, disabled, controlled/uncontrolled, over limit를 지원합니다.
- counter는 실제 렌더링하는 값의 JavaScript 문자열 길이(UTF-16 code unit)를 계산합니다. 임의 counter prop은 없습니다.
- count > maxLength일 때만 초과입니다. 경계값과 초과 후 삭제하여 복구하는 흐름을 지원합니다.
- 초과하면 aria-invalid=true, 현재 글자 수와 안내 문구는 primary-400입니다. 최대 글자 수와 테두리는 기존 회색을 유지합니다.
- 외부 aria-invalid를 보존하며 외부 invalid도 errorMessage를 표시합니다. 현재 글자 수의 빨간색은 길이 초과일 때만 적용합니다.
- helper와 counter id는 외부 aria-describedby에 합쳐 연결하고 counter는 aria-live=polite를 유지합니다.
- maxLengthBehavior=allow는 제출을 막지 않습니다. 폼 검증과 제출 차단은 호출부 책임입니다.

## Styling

- root는 w-full. Figma 예시 너비 346px는 Storybook 프레임에만 적용합니다.
- 이전 최소 높이 230px를 Figma의 min-height 56px로 변경하고 rows=1을 기본으로 합니다.
- Figma의 20px inset에는 inside stroke가 포함됩니다. CSS border 1px + padding 19px로 맞추며, 19px 글꼴 환경에서 한 줄 박스는 59px입니다.
- white 배경, warm-gray-100 1px border, radius 10px, Body 4, primary-200 본문, warm-gray-300 placeholder를 유지합니다.
- 하단 간격 8px. helper는 Body 7, counter는 Body 6 / line-height 1.36, counter 내부 간격 2px.
- 긴 안내 문구는 줄바꿈하고 counter 영역은 축소하지 않습니다.
- focus-visible outline과 disabled 외형은 유지합니다.
- 리뷰 입력 호출부는 min-height 230px를 명시해 기존 큰 입력 영역을 유지합니다. 예약 요청사항의 기존 140px override도 유지합니다.
- Figma 초과 예시는 placeholder와 1200/1000을 함께 보이지만, 실제 컴포넌트와 story는 1200자의 실제 입력값과 일치하는 counter를 표시합니다.

## Storybook And Verification

Default, ReviewExample, Disabled, AllowOverLimit, OverLimit, LongHelperText를 제공합니다.

- `pnpm --filter @hashi/hds-ui test`
- `pnpm --filter @hashi/hds-ui lint`
- `pnpm --filter @hashi/hds-ui typecheck`
- `pnpm --filter @hashi/hds-ui build`
- `pnpm build-storybook`
- prevent 기존 계약, allow 입력/controlled/default 값, 경계값·초과·복구, error 접근성 연결을 자동 테스트합니다.
- 브라우저에서 키보드 입력, 좁은 화면, focus, 초과/복구를 확인합니다.
