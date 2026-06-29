# Design System Components

이 문서는 `packages/hds-ui`의 public component를 추가하거나 변경할 때 따르는 기준입니다.
패키지 전체 역할은 [Design System](./design-system.md)을 따릅니다.

## Structure

현재 generator는 다음 구조로 component를 생성합니다.

```text
packages/hds-ui/src/components/{componentFolder}/
  {ComponentName}.tsx
  {ComponentName}.spec.md
  {ComponentName}.stories.tsx
  index.ts
```

예시:

```text
packages/hds-ui/src/components/button/
  Button.tsx
```

Naming convention:

- folder: `camelCase`
- component file: `PascalCase.tsx`
- component: `PascalCase`
- export: named export

## Component Groups

현재는 `components/{componentFolder}` 아래에 평평하게 둡니다.

컴포넌트 수가 많아져 분류가 필요해지면 별도 티켓에서 generator와 export 구조를 함께 바꾼 뒤 아래 그룹을 도입합니다.

- `components/ui`
- `components/layout`
- `components/form`
- `components/feedback`
- `components/overlay`

폴더 구조만 먼저 바꾸지 않습니다. 실제 컴포넌트 규모와 사용 패턴이 생긴 뒤 이동합니다.

## Component Taxonomy

### Primitive

Low-level interactive or visual components.

Examples:

- `Button`
- `IconButton`
- `Checkbox`
- `Chip`
- `Divider`

### Form

Form-specific primitives that do not own product validation or submit behavior.

Examples:

- `TextField`
- `Select`
- `RadioGroup`
- `TextArea`

### Feedback

Components that communicate status without knowing product-specific copy.

Examples:

- `Toast`
- `Alert`
- `Skeleton`
- `Loading`

### Overlay

Layered interaction primitives.

Examples:

- `Dialog`
- `Popover`
- `Tooltip`
- `Drawer`

### Navigation

Product-agnostic navigation surfaces that receive item content and behavior from the app.

Examples:

- `Tabs`
- `Pagination`
- `PageHeader`

### Data Display

Product-agnostic structures for rendering data-like content without owning fetching, sorting, mutation, or domain mapping.

Examples:

- `Table`
- `TableRow`
- `TableCell`
- `FileItem`

## Promotion Criteria

앱 로컬 컴포넌트를 `packages/hds-ui`로 승격할 수 있는 경우:

- 두 곳 이상의 화면에서 동일한 API와 동작으로 재사용합니다.
- Figma design-system component와 직접 대응됩니다.
- 컴포넌트가 제품 copy, route, API, logging에 의존하지 않습니다.
- 접근성, 상태, interaction contract를 패키지 차원에서 보장할 필요가 있습니다.

승격하지 않는 경우:

- 한 페이지에서만 사용합니다.
- 겉모양은 비슷하지만 후속 동작이 다릅니다.
- copy, route, API response shape, analytics event가 들어갑니다.
- shared로 올리면 호출부 영향 범위를 빠르게 열거하기 어렵습니다.

## Public API

디자인 시스템은 public API를 명시적으로 관리합니다.

- public component는 named export를 사용합니다.
- component index에서 export되는 항목을 리뷰합니다.
- public props type은 필요한 경우 함께 export합니다.
- internal helper, style helper, private constant는 export하지 않습니다.
- public props type 변경은 breaking change 가능성이 있으므로 호출부 영향을 함께 확인합니다.

Preferred:

```ts
export { Button } from './button/Button'
export type { ButtonProps } from './button/Button'
```

Avoid:

```ts
export * from './button'
```

현재 root entry는 `components` entry를 재노출합니다. 새 컴포넌트를 추가할 때는 component 단위 export가 불필요하게 넓어지지 않는지 확인합니다.

## Spec

public component의 API가 복잡해지면 component 가까이에 spec을 둡니다.

```text
src/components/button/
  Button.tsx
  Button.spec.md
  index.ts
```

spec에는 다음을 포함합니다.

- purpose
- usage
- public API
- props
- states
- behavior
- styling
- accessibility
- verification

## Verification

디자인 시스템 component 변경 후 기본 검증:

```bash
corepack pnpm --filter @hashi/hds-ui lint
corepack pnpm --filter @hashi/hds-ui typecheck
corepack pnpm --filter @hashi/hds-ui build
corepack pnpm format:check
```

Storybook은 HDS UI 문서화와 컴포넌트 상태 확인에 사용합니다.
컴포넌트를 추가하거나 Storybook story를 바꾸면 필요한 story 상태를 확인하고 `corepack pnpm build-storybook` 영향 범위를 검토합니다.
