# packages AGENTS.md

이 파일은 `packages/` 하위 작업에서 Codex와 agent가 디자인시스템 문서를 찾기 위한 package-level 라우팅 허브입니다.
팀 규칙 원문은 `docs/`에 두고, 이 파일은 작업 시작 시 읽을 문서와 패키지 경계만 정리합니다.

## Package Scope

- `packages/hds-ui`: 제품 의미가 없는 HDS UI primitive와 public component API
- `packages/hds-icons`: 제품 의미가 없는 HDS icon component와 icon prop type
- `configs/tsconfig`: 공유 TypeScript 설정

## Read First

HDS UI component를 추가하거나 수정할 때:

1. `docs/rules/design-system-instructions.md`
2. `docs/architecture/design-system.md`
3. `docs/architecture/design-system-components.md`
4. `docs/architecture/design-system-component-plan.md`
5. `docs/architecture/styling-and-design-tokens.md`
6. `.agents/recipes/hds-component.md`

HDS icon을 추가하거나 수정할 때:

1. `docs/rules/design-system-instructions.md`
2. `docs/architecture/design-system.md`
3. `docs/architecture/design-system-icons.md`
4. `.agents/recipes/hds-component.md`

agent harness나 repo-scoped skill을 수정할 때:

1. `AGENTS.md`
2. `docs/agent/skills.md`
3. `.agents/README.md`
4. `.agents/checklists/pre-work.md`

## Boundaries

- app route, query, mutation, tracking, product copy, domain data는 `packages/hds-ui`나 `packages/hds-icons`에 넣지 않습니다.
- 공통 Figma에 있어도 제품 의미가 강하면 먼저 `apps/client` 내부 shared 또는 page-local component로 둡니다.
- 새 public component는 public export, props type, state, accessibility, 긴 텍스트/overflow 동작을 함께 확인합니다.
- `pnpm gen:ds-component`가 생성한 `*.spec.md`와 `*.stories.tsx`를 실제 public API와 상태에 맞게 채웁니다.
- Storybook이 필요한 변경은 story 상태와 `build-storybook` 영향 범위를 확인합니다.

## Verification

변경 범위에 맞는 최소 검증을 실행합니다.

```bash
corepack pnpm format:check
git diff --check
bash .agents/scripts/check-harness.sh
```

HDS UI package code가 바뀐 경우:

```bash
corepack pnpm --filter @hashi/hds-ui lint
corepack pnpm --filter @hashi/hds-ui typecheck
corepack pnpm --filter @hashi/hds-ui build
corepack pnpm --filter @hashi/hds-ui test
```

HDS icon package code가 바뀐 경우:

```bash
corepack pnpm --filter @hashi/hds-icons lint
corepack pnpm --filter @hashi/hds-icons typecheck
corepack pnpm --filter @hashi/hds-icons build
```
