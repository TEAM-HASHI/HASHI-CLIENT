# API Integration Recipe

`ky`와 TanStack Query 기반 API 연결을 추가하거나 수정할 때 사용합니다.

## Read First

- `docs/architecture/data-layer.md`
- `docs/architecture/app-structure.md`
- `docs/workflows/api-integration.md`
- `docs/conventions/coding.md`
- 필요한 경우 `docs/workflows/spec-writing.md`

## Workflow

1. Swagger/OpenAPI/API 스펙이 있으면 `api-spec-intake`로 API Integration Map을 먼저 만듭니다.
2. API 호출이 page-local인지 feature-local인지 shared helper인지 결정합니다.
3. `apps/client/src/shared/api`와 `apps/client/src/shared/lib/queryClient.ts`의 기존 helper를 확인합니다.
4. server state는 TanStack Query 기준으로 query key, query options, mutation options, cache synchronization 책임을 분리합니다.
5. `useSuspenseQuery`, `useQuery`, `useInfiniteQuery` 선택 기준을 `docs/workflows/api-integration.md`와 `api-integrator` reference에 맞춥니다.
6. API response shape, loading, error, retry, empty, disabled, success state가 UI에 어떻게 드러나는지 정리합니다.
7. secret, token, base URL을 코드에 고정하지 않습니다.
8. 테스트가 필요한 data transform이나 state logic은 Vitest 대상으로 분리합니다.
9. 구현 후 `verify-api-integration`을 실행합니다.

## Preferred Commands

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client test
pnpm --filter @hashi/client build
```

## Done Criteria

- API client와 query/mutation 책임이 page UI에 과하게 섞이지 않습니다.
- query key factory가 있고 inline query key를 쓰지 않습니다.
- mutation 성공 응답이 완전한 최신 상세 객체이고 즉시 표시해야 하면 `setQueryData`를 사용합니다.
- 이동 후 조회, 일부 응답, 목록 순서·개수·집계 변경은 관련 query를 invalidation하고, 두 조건이 겹치면 혼합합니다.
- error/loading/empty 상태를 호출부에서 처리할 수 있습니다.
- 환경값이나 secret이 하드코딩되지 않습니다.
