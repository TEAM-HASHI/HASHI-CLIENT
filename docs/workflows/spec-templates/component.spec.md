# Component Spec: `ComponentName`

## Purpose

이 컴포넌트가 해결하는 UI 문제와 책임을 작성합니다.

## Component Type

- [ ] HDS UI primitive
- [ ] App shared component
- [ ] Page or feature component

선택 기준:

- 제품 의미가 없는 재사용 UI라면 `packages/hds-ui`를 검토합니다.
- 앱 전용이지만 여러 화면에서 반복된다면 `apps/client/src/shared/components`를 검토합니다.
- 한 화면이나 한 feature에만 묶인 UI라면 page 또는 feature 내부에 둡니다.

## Spec Location

- spec path:
- implementation path:

권장 위치:

- HDS UI primitive: `packages/hds-ui/src/components/{componentFolder}/{ComponentName}.spec.md`
- App shared component: `apps/client/src/shared/components/{componentFolder}/{ComponentName}.spec.md`
- Page or feature component: 구현 컴포넌트와 같은 폴더의 `{ComponentName}.spec.md`

## Usage Location

- route:
- page:
- feature:
- expected path:
  - `apps/client/src/shared/components/{componentFolder}/{ComponentName}.tsx`
  - `apps/client/src/pages/{page}/...`
  - `packages/hds-ui/src/components/{componentFolder}/{ComponentName}.tsx`

## Scaffold

필요한 경우 다음 generator를 우선 확인합니다.

```bash
pnpm gen:component
pnpm gen:ds-component
```

## Public API

```tsx
<ComponentName propName="value" />
```

- public export 여부:
- public props type export 여부:
- 호출부가 소유하는 책임:
- 컴포넌트가 소유하지 않는 책임:

## Requirements

- [ ] 반드시 만족해야 하는 기능 요구사항
- [ ] 사용자 입력, 상태, 동작 요구사항
- [ ] 접근성 요구사항
- [ ] 에러 또는 예외 상태 요구사항
- [ ] 긴 텍스트, 빈 값, loading 상태에서 layout이 깨지지 않는 조건

## UI Structure

```text
ComponentName
  Header
  Body
  Actions
```

## Props

### `propName`

- type: `string`
- required: `true`
- description:

## State

- local state:
- controlled state:
- uncontrolled state:
- loading state:
- error state:
- disabled state:

## Behavior

1. 사용자가 어떤 행동을 합니다.
2. 컴포넌트가 어떤 상태를 변경합니다.
3. 필요한 경우 호출부 callback을 실행합니다.
4. 성공 또는 실패 상태를 표시합니다.

## Validation

- 필드별 검증 규칙:
- 버튼 활성/비활성 조건:
- invalid 상태 표시 방식:

## Error Handling

- 어떤 에러를 어디에 표시하는지:
- 서버 에러 메시지 우선순위:
- fallback 문구:
- retry 또는 reset 동작:

## Styling

- styling 기준:
  - Tailwind CSS utility class
  - design token 또는 Tailwind theme
- layout:
- spacing:
- responsive:
- hover/focus/active/disabled:
- layout shift 방지 조건:

## Accessibility

- label 연결:
- `aria-*` 속성:
- keyboard interaction:
- focus-visible 처리:
- semantic element 사용 여부:

## Dependencies

- components:
- icons:
- hooks:
- APIs:
- external libraries:

## Storybook

HDS component는 Storybook story를 함께 작성합니다.

- [ ] Default
- [ ] variant / size / tone
- [ ] disabled
- [ ] loading
- [ ] error 또는 invalid
- [ ] 긴 텍스트 또는 overflow
- [ ] icon 포함 케이스

## Non-Goals

- 의도적으로 하지 않는 것:
- 추후 확장 가능성:
- 구현 시 주의할 점:

## Verification

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] 주요 UI 상태 수동 확인
