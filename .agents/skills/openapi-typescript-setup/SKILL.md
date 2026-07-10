# openapi-typescript-setup

HASHI Client에서 Swagger/OpenAPI schema 기반 타입 생성을 추가, 변경, 점검할 때 사용합니다.

## 원칙

- schema URL은 raw OpenAPI JSON/YAML이어야 합니다. Swagger UI HTML URL은 사용할 수 없습니다.
- 실제 dev/staging schema URL은 public repo 파일, docs, PR 본문에 적지 않습니다.
- 로컬 URL은 `apps/client/.env.openapi.local` 또는 shell의 `OPENAPI_SCHEMA_URL`에 둡니다.
- CI에서 비공개 URL로 타입을 생성해야 하면 Repository Variables가 아니라 GitHub Actions Secret을 사용합니다.
- `apps/client/src/shared/api/generated/openapi.ts`는 생성물입니다. 직접 수정하지 않습니다.

## Path 기준

- repo root command: `pnpm gen:api-types`
- app script: `apps/client/scripts/generate-openapi-types.mjs`
- local env: `apps/client/.env.openapi.local`
- output: `apps/client/src/shared/api/generated/openapi.ts`
- generated README: `apps/client/src/shared/api/generated/README.md`

## 사용 방식

생성 타입은 API boundary에서만 직접 참조합니다. 페이지 컴포넌트나 HDS props에 `paths`, `components`를 그대로 노출하지 않습니다.

```ts
import type { paths } from '@/shared/api/generated/openapi'

type RestaurantDetailResponse =
  paths['/restaurants/{restaurantId}']['get']['responses']['200']['content']['application/json']
```

endpoint 함수에서는 필요한 request/response alias를 만든 뒤 `request<TData>()`나 query hook에 연결합니다.

```ts
type ReservationConfirmBody =
  paths['/reservations/{reservationId}/confirm']['post']['requestBody']['content']['application/json']

export function confirmReservation(
  reservationId: string,
  body: ReservationConfirmBody,
) {
  return request<void>(`reservations/${reservationId}/confirm`, {
    method: 'post',
    json: body,
  })
}
```

## 점검

```bash
pnpm gen:api-types
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

공개 URL 노출 여부도 확인합니다.

```bash
rg -n 'dev-api|OPENAPI_SCHEMA_URL=.*https?://' .agents docs apps package.json pnpm-workspace.yaml
```
