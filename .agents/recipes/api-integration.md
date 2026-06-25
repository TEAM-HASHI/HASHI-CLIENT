# API Integration Recipe

`ky`와 TanStack Query 기반 API 연결을 추가하거나 수정할 때 사용합니다.

## Read First

- `docs/architecture/data-layer.md`
- `docs/architecture/app-structure.md`
- `docs/conventions/coding.md`
- 필요한 경우 `docs/workflows/spec-writing.md`

## Workflow

1. API 호출이 page-local인지 shared API layer로 둘지 결정합니다.
2. `apps/client/src/shared/api`와 `apps/client/src/shared/lib`의 기존 helper를 확인합니다.
3. server state는 TanStack Query 기준으로 query, mutation, invalidation 책임을 분리합니다.
4. API response shape, loading, error, retry, empty state가 UI에 어떻게 드러나는지 정리합니다.
5. secret, token, base URL을 코드에 고정하지 않습니다.
6. 테스트가 필요한 data transform이나 state logic은 Vitest 대상으로 분리합니다.

## Preferred Commands

```bash
pnpm --filter @siksa/client lint
pnpm --filter @siksa/client typecheck
pnpm --filter @siksa/client test
pnpm --filter @siksa/client build
```

## Done Criteria

- API client와 query/mutation 책임이 page UI에 과하게 섞이지 않습니다.
- error/loading/empty 상태를 호출부에서 처리할 수 있습니다.
- 환경값이나 secret이 하드코딩되지 않습니다.
