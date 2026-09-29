# Component Spec: `Accordion`

Jira: HASHI-186

## Purpose

`Accordion`은 HASHI Design System의 접힘/펼침 UI primitive입니다.

약관, 안내 문구처럼 제목을 먼저 보여주고 사용자가 필요한 경우 상세 내용을 펼쳐 확인하는 흐름을 제공합니다.

## HDS Responsibilities

HDS가 담당하는 것:

- collapsed / expanded 상태 전환
- title 영역과 content 영역의 시각 구조
- expanded 여부에 따른 title typography 변경
- content를 `children`으로 자유롭게 렌더링
- header heading level을 호출부가 페이지 구조에 맞게 지정
- controlled / uncontrolled 상태 제어
- keyboard interaction과 focus-visible outline을 포함한 기본 접근성 계약

HDS가 담당하지 않는 것:

- 약관 title/content 데이터 생성
- 서버 응답 fetch
- 약관 동의 여부 validation
- form submit
- route 이동
- API 호출
- analytics

## Public API

```tsx
<Accordion title={term.title}>{term.content}</Accordion>

<Accordion
  title={term.title}
  expanded={expanded}
  onExpandedChange={setExpanded}
>
  {term.content}
</Accordion>

<Accordion title={term.title} headingLevel={4}>
  {term.content}
</Accordion>
```

Exported value:

- `Accordion`

Exported types:

- `AccordionProps`

## Props

### `title`

- type: `string`
- required: `true`
- description: accordion header button의 accessible name으로도 쓰이는 title입니다. 서버에서 받은 약관 제목 문자열을 전달할 수 있습니다.

### `children`

- type: `ReactNode`
- required: `true`
- description: expanded 상태에서 렌더링할 content입니다. 서버에서 받은 약관 내용이나 호출부가 조합한 ReactNode를 전달합니다.

### `headingLevel`

- type: `2 | 3 | 4 | 5 | 6`
- required: `false`
- default: `3`
- description: accordion header의 heading level입니다. 페이지의 heading 구조에 맞게 호출부가 조정합니다.

### `defaultExpanded`

- type: `boolean`
- required: `false`
- default: `false`
- description: uncontrolled 사용 시 초기 expanded 상태입니다.

### `expanded`

- type: `boolean`
- required: `false`
- description: controlled 사용 시 현재 expanded 상태입니다.

### `onExpandedChange`

- type: `(expanded: boolean) => void`
- required: `false`
- description: trigger 클릭으로 다음 expanded 상태가 요청될 때 호출됩니다.

### `className`

- type: `string`
- required: `false`
- description: root element에 병합할 class입니다.

### `contentClassName`

- type: `string`
- required: `false`
- description: content element에 병합할 class입니다.

## States

- collapsed: content DOM은 유지하되 `hidden`으로 숨기고 title을 `typo-body-5`로 표시합니다.
- expanded: content의 `hidden`을 해제하고 title을 `typo-sub-header-3`로 표시합니다.
- controlled: 호출부가 `expanded`와 `onExpandedChange`로 상태를 관리합니다.
- uncontrolled: 컴포넌트가 `defaultExpanded` 기반으로 내부 상태를 관리합니다.

hover, pressed, disabled, loading 상태는 현재 Figma에 정의되어 있지 않아 v1에 포함하지 않습니다.

## Styling

- root width: `w-full`
- root padding: horizontal `20px`, vertical `8px`
- root border: `border-b`, `secondary-200`
- expanded gap: `4px`
- header min-height: `32px`
- title color: `black`
- collapsed title typography: `typo-body-5`
- expanded title typography: `typo-sub-header-3`
- title overflow: 줄바꿈 허용
- icon size: `20px * 20px`
- icon color: `cool-gray-900`
- icon transition: expanded 상태에서 `TapDownIcon`을 180도 회전합니다.
- content typography: `typo-caption-2`
- content line-height: `1.5`
- content color: `warm-gray-300`
- focus-visible: HDS button 계열과 동일하게 `cool-gray-900` outline을 표시합니다.

Figma의 component width `393px`는 예시 viewport 기준이므로 컴포넌트에서는 부모 너비를 따르는 `w-full`을 사용합니다.

## Accessibility

- header는 `role="heading"`과 `aria-level`을 가진 wrapper 내부의 `button type="button"`으로 렌더링합니다.
- expanded 상태를 `aria-expanded`로 전달합니다.
- trigger와 content는 collapsed 상태에서도 `aria-controls` / `id`로 연결합니다.
- icon은 장식 요소이므로 `aria-hidden="true"`와 `focusable="false"`를 적용합니다.
- keyboard interaction은 native button 동작을 따릅니다.

## Storybook

- [x] Collapsed
- [x] Expanded
- [x] LongTitle
- [x] Controlled

Controls:

- `title`
- `children`
- `headingLevel`
- `defaultExpanded`
- `expanded`

Storybook의 약관 문구는 UI 확인용 예시이며, 실제 서비스 데이터는 호출부에서 서버 응답을 전달합니다.

## Test

- [x] title heading button 렌더링
- [x] custom heading level 렌더링
- [x] collapsed 기본 상태에서 content DOM 유지 및 hidden 처리
- [x] `defaultExpanded` 상태에서 content hidden 해제
- [x] trigger click 시 expanded 상태 전환
- [x] controlled mode에서 `onExpandedChange` 호출
- [x] `aria-controls`와 content `id` 연결

## Verification

- [x] `pnpm --filter @hashi/hds-ui lint`
- [x] `pnpm --filter @hashi/hds-ui typecheck`
- [x] `pnpm --filter @hashi/hds-ui build-storybook`
- [x] `pnpm --filter @hashi/hds-ui test`
- [x] `git diff --check`
