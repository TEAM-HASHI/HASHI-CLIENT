# Component Spec: `BottomSheet`

Jira: HASHI-50

## Purpose

`BottomSheet`는 화면 하단에서 올라오는 HDS overlay primitive입니다.

HDS는 sheet shell, overlay, open/close interaction, title/header, footer slot, safe-area 대응, 접근성 계약만 담당합니다. 음식 장르, 정렬 옵션, 로그인 문구, 카카오 로그인 액션, 선택 상태, API 호출, routing, analytics 같은 앱 도메인 로직은 호출부가 주입합니다.

## Usage Location

- `packages/hds-ui/src/components/bottomSheet/BottomSheet.tsx`

## Requirements

- [x] `open` 값이 `true`일 때만 렌더링합니다.
- [x] `onOpenChange(false)`로 닫기 요청을 전달합니다.
- [x] overlay press로 닫을 수 있습니다.
- [x] close button press로 닫을 수 있습니다.
- [x] `title`, `children`, `footer` slot을 지원합니다.
- [x] drag handle과 close button 표시 여부를 제어할 수 있습니다.
- [x] `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-label`을 연결합니다.
- [x] title이 없는 바텀시트도 접근성 이름을 제공할 수 있습니다.
- [x] sheet가 열리면 focus를 sheet 내부로 이동합니다.
- [x] Tab focus를 sheet 내부에 가둡니다.
- [x] Escape key로 닫을 수 있습니다.
- [x] 닫힌 뒤 이전 focus 위치로 복귀합니다.
- [x] sheet가 열려 있을 때 `html`/`body` 배경 스크롤을 잠그고 닫힐 때 기존 스크롤 위치를 복구합니다.
- [x] safe-area bottom padding을 반영합니다.
- [x] 열림/닫힘 시 translate transition을 적용합니다.
- [x] 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않습니다.

## Props

### `open`

- type: `boolean`
- required: `true`
- description: 바텀시트 표시 여부입니다.

### `onOpenChange`

- type: `(open: boolean) => void`
- required: `true`
- description: 바텀시트 open 상태 변경 요청을 호출부로 전달합니다.

### `title`

- type: `React.ReactNode`
- required: `false`
- description: header 중앙에 표시할 제목입니다.

### `children`

- type: `React.ReactNode`
- required: `true`
- description: 바텀시트 본문 콘텐츠입니다.

### `footer`

- type: `React.ReactNode`
- required: `false`
- description: 바텀시트 하단 액션 영역입니다.

### `showHandle`

- type: `boolean`
- required: `false`
- default: `true`
- description: 상단 drag handle 표시 여부입니다.

### `showCloseButton`

- type: `boolean`
- required: `false`
- default: `true`
- description: close button 표시 여부입니다.

### `aria-label`

- type: `string`
- required: `false`
- default: `'바텀시트'`
- description: `title` 없이 사용하는 바텀시트의 접근성 이름입니다. `title`이 있으면 `aria-labelledby`를 우선 사용합니다.

### `className`

- type: `string`
- required: `false`
- description: sheet panel에 병합할 class입니다.

## Behavior

1. `open`이 `false`이면 DOM에 렌더링하지 않습니다.
2. `open`이 `true`이면 `document.body`에 portal로 렌더링합니다.
3. close button press, overlay press 시 `onOpenChange(false)`를 호출합니다.
4. sheet 내부 press는 overlay press로 전파되지 않아야 합니다.
5. sheet가 열려 있는 동안 `documentElement`와 `body`의 배경 스크롤을 잠그고, 닫힐 때 기존 inline style과 스크롤 위치를 복구합니다.
6. `title`이 있으면 dialog accessible name으로 연결합니다.
7. `title`이 없으면 `aria-label`을 dialog accessible name으로 연결합니다.
8. sheet가 열리면 sheet panel로 focus를 이동합니다.
9. `Tab`과 `Shift + Tab` focus는 sheet 내부에서 순환합니다.
10. `Escape` key를 누르면 `onOpenChange(false)`를 호출합니다.
11. sheet가 닫히면 이전 focus 위치로 복귀합니다.
12. 닫힘 요청 후에는 sheet를 아래로 내리는 transition이 끝난 뒤 DOM에서 제거합니다.

## Styling

- overlay: viewport 전체를 덮고 하단 정렬합니다.
- panel: 부모/viewport 너비를 가득 채우고 상단 모서리만 둥글게 처리합니다.
- safe-area: 하단 padding에 `var(--safe-area-bottom,0px)`를 반영합니다.
- header: handle, title, close button을 포함합니다.
- content: 기본 좌우 padding은 `20px`입니다.
- footer: 기본 좌우 padding은 `20px`, 하단 padding은 `20px`입니다.
- open animation: overlay는 opacity animation으로 fade-in/fade-out되고, panel은 `translateY` animation으로 하단에서 올라오거나 내려갑니다.
- motion timing: overlay는 `animate-bottom-sheet-overlay-in/out`, panel은 `animate-bottom-sheet-panel-in/out` token utility를 사용해 열림/닫힘 모두 부드럽게 처리합니다.

## HDS가 가지면 안 되는 것

- 음식 장르 option list
- 정렬 option list
- 선택 상태 관리
- 초기화/적용 로직
- 카카오 로그인 액션
- 로그인 여부 판단
- 앱 전용 문구 하드코딩
- API mutation 또는 query invalidation
- analytics event 전송
- routing

## Storybook

- [x] Default
- [x] Footer slot
- [x] Close button hidden
- [x] Header hidden
- [x] Long content

Storybook은 BottomSheet primitive의 slot과 옵션만 보여줍니다. 음식 장르, 정렬, 로그인 유도처럼 앱 도메인 조합이 들어간 예시는 app layer story 또는 app 테스트에서 다룹니다.

## Verification

- [x] `corepack pnpm --filter @hashi/hds-ui lint`
- [x] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [x] `corepack pnpm --filter @hashi/hds-ui build`
- [x] `corepack pnpm --filter @hashi/hds-ui test`
