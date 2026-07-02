# Page Feature Recipe

새 page, route, 화면 단위 feature를 구현할 때 사용합니다.

## Read First

- `docs/architecture/app-structure.md`
- `docs/architecture/routing-and-access-policy.md`
- `docs/workflows/spec-writing.md`
- `docs/conventions/coding.md`
- 필요한 경우 `docs/architecture/data-layer.md`

## Workflow

1. Jira description, Figma, 기존 page 구조를 확인합니다.
2. `pnpm gen:page`로 생성된 `*.spec.md`를 구현 기준에 맞게 채우거나, 기존 page라면 구현 위치 근처의 `*.spec.md`를 갱신합니다.
3. route path, `ROUTES` key, access type, guard, redirect, lazy loading, bottom navigation layout을 spec에 먼저 적습니다.
4. 새 route는 `apps/client/src/app/router/path.ts`, `lazy.ts`, `routes.ts`에 등록합니다.
5. page-local 책임과 app shared로 승격할 책임을 분리합니다.
6. route, query, mutation, form 상태는 HDS component 내부로 넣지 않습니다.
7. loading, error, empty, disabled 상태를 구현 범위에 맞게 정리합니다.
8. UI 변경이면 screenshot 또는 수동 확인 결과를 PR에 남깁니다.

## Preferred Commands

```bash
pnpm gen:page
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client build
pnpm --filter @hashi/client test
```

## Done Criteria

- page 책임과 shared 책임이 섞이지 않습니다.
- spec이 필요한 변경이면 구현과 spec이 일치합니다.
- route path, guard, redirect, layout 정책이 `docs/architecture/routing-and-access-policy.md`와 일치합니다.
- 주요 상태와 viewport 확인 결과를 설명할 수 있습니다.
