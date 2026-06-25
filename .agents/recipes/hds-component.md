# HDS Component Recipe

`packages/hds-ui`에 디자인시스템 컴포넌트를 추가하거나 수정할 때 사용합니다.

## Read First

- `docs/rules/design-system-instructions.md`
- `docs/architecture/design-system.md`
- `docs/architecture/design-system-components.md`
- `docs/architecture/styling-and-design-tokens.md`
- `docs/workflows/spec-writing.md`

## Workflow

1. 기존 HDS component와 icon으로 해결 가능한지 먼저 확인합니다.
2. 제품 의미가 강한 UI는 `packages/hds-ui`로 바로 승격하지 않습니다.
3. 새 public component라면 component 근처에 `*.spec.md` 작성 여부를 판단합니다.
4. props는 Figma variant, size, tone, state를 표현하되 app domain 로직을 포함하지 않습니다.
5. Tailwind utility와 token 기준을 우선하고 반복 arbitrary value는 기록합니다.
6. public export를 확인합니다.
7. Storybook story에 Default, variant, size, disabled, loading, invalid/error, overflow 케이스를 반영합니다.

## Preferred Commands

```bash
pnpm gen:ds-component
pnpm --filter @hashi/hds-ui lint
pnpm --filter @hashi/hds-ui typecheck
pnpm --filter @hashi/hds-ui build
pnpm --filter @hashi/hds-ui test
pnpm build-storybook
```

## Done Criteria

- app route, query, mutation, tracking, product copy가 HDS 내부에 들어가지 않습니다.
- public export와 story가 변경 범위에 맞게 정리됩니다.
- 긴 텍스트와 주요 interaction state에서 layout이 깨지지 않습니다.
