# Design System

HASHI Design System은 제품 의미가 없는 UI와 아이콘을 패키지로 관리합니다.
앱 전용 UI를 빠르게 공통화하기 위한 장소가 아니라, 공통 계약이 안정된 요소를 공개하는 영역입니다.

## Document Map

| 문서                                                                 | 역할                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Design System Components](./design-system-components.md)            | `@hashi/hds-ui` 컴포넌트 분류, public API, 검증 기준         |
| [Design System Component Plan](./design-system-component-plan.md)    | HDS 컴포넌트 승격 기준과 구현 순서                           |
| [Design System Icons](./design-system-icons.md)                      | `@hashi/hds-icons` 아이콘 구조, SVG 기준, public export 기준 |
| [Styling And Design Tokens](./styling-and-design-tokens.md)          | `@hashi/hds-tokens`와 Tailwind token 경계                    |
| [Design System Instructions](../rules/design-system-instructions.md) | 디자인시스템 구현 시 반드시 따르는 instruction               |

## Package Role

디자인 시스템이 담당하는 것:

- product-agnostic UI primitive
- shared design token CSS
- shared component public API
- component accessibility contract
- product-agnostic icon component
- React peer dependency boundary

담당하지 않는 것:

- HASHI 도메인 데이터에 결합된 컴포넌트
- 페이지 섹션, 비즈니스 레이아웃, route-local composition
- API, query, mutation, routing, navigation
- 제품별 copy, logging, analytics, side effect

## Package Structure

```text
packages/
  hds-tokens/
    src/
      styles.css
      tokens/
        colors.css
        font.css
        gradients.css
        typography.css
        z-index.css
  hds-ui/
    src/
      index.ts
      components/
        index.ts
        {componentFolder}/
          {ComponentName}.tsx
          {ComponentName}.spec.md
          {ComponentName}.stories.tsx
          index.ts
  hds-icons/
    src/
      index.ts
      types.ts
      icons/
        index.ts
        CheckIcon.tsx
```

## Public Entries

`@hashi/hds-tokens`는 Tailwind v4 `@theme` token과 typography utility CSS를 export합니다.

```css
@import '@hashi/hds-tokens/styles.css';
```

`@hashi/hds-ui`는 public UI component를 export합니다.

```ts
import { Button } from '@hashi/hds-ui'
```

`@hashi/hds-icons`는 public icon component와 icon prop type을 export합니다.

```ts
import { CheckIcon } from '@hashi/hds-icons'
import type { IconProps } from '@hashi/hds-icons'
```

## Workflows

Component scaffold:

```bash
pnpm gen:ds-component
```

Design-system package verification:

```bash
pnpm --filter @hashi/hds-ui lint
pnpm --filter @hashi/hds-ui typecheck
pnpm --filter @hashi/hds-ui build
pnpm --filter @hashi/hds-icons lint
pnpm --filter @hashi/hds-icons typecheck
pnpm --filter @hashi/hds-icons build
```

## Implementation Boundary

공통 Figma에 있더라도 제품 의미가 들어가면 바로 디자인 시스템으로 옮기지 않습니다.

디자인 시스템에는 외형, 상태, 접근성, slot 구조, public API만 둡니다.
`apps/client`에는 route, API, 권한, 제품 copy, 도메인 데이터, submit 동작을 둡니다.

새 컴포넌트를 추가하기 전에는 [Design System Component Plan](./design-system-component-plan.md)의 분류 기준에 따라 `HDS UI primitive`, `App shared component`, `Page or feature component` 중 하나로 정리합니다.
