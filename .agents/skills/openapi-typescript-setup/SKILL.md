---
name: openapi-typescript-setup
description: Use when adding, changing, or troubleshooting HASHI Client OpenAPI 타입 생성, Swagger schema URL, openapi-typescript script, generated API type file, data-layer docs.
---

# OpenAPI TypeScript Setup

## 개요

HASHI Client에서 OpenAPI 기반 타입 생성을 설정하거나 갱신할 때 사용합니다.
Swagger UI HTML, 런타임 API base URL, generated code 책임이 섞이지 않도록 구분합니다.

API query/mutation 구현 전에 schema type generation 설정이 필요하거나 깨졌다면 이 skill을 먼저 사용합니다.

## 먼저 확인할 문서와 파일

- `docs/architecture/data-layer.md`
- `docs/workflows/api-integration.md`
- `docs/conventions/package-management.md`
- 루트 `package.json`
- `apps/client/package.json`
- `pnpm-workspace.yaml`
- `apps/client/src/shared/api/generated/README.md`, 파일이 있으면 확인합니다.

## Schema URL 규칙

- raw OpenAPI JSON/YAML을 사용합니다. Swagger UI HTML을 넣지 않습니다.
- 실제 dev/staging schema URL은 public repository 파일에 직접 기록하지 않습니다.
- 기본 dev schema URL fallback을 script에 넣지 않습니다. 실행 시 `OPENAPI_SCHEMA_URL`을 필수로 주입합니다.
- 잘못된 입력 예시는 `https://<api-host>/swagger-ui/index.html` 같은 Swagger UI HTML URL입니다.
- 로컬 backend schema를 써야 하면 아래처럼 실행합니다.

```bash
OPENAPI_SCHEMA_URL=http://localhost:8080/v3/api-docs pnpm gen:api-types
```

`Unsupported schema format, expected openapi: 3.x`가 나오면 Swagger UI HTML URL을 넣은 것은 아닌지 먼저 확인합니다.
`fetch failed ECONNREFUSED`가 나오면 script가 아직 localhost를 기본값으로 쓰는지 확인합니다.

## Path 기준

- 이 skill의 문서 경로는 repository root 기준으로 씁니다.
- 명령은 기본적으로 repository root에서 실행합니다. 루트 `pnpm gen:api-types`가 `@hashi/client` script로 위임합니다.
- `apps/client/package.json`의 `gen:api-types`는 `apps/client`를 cwd로 실행됩니다.
- 생성 스크립트 위치는 `apps/client/scripts/generate-openapi-types.mjs`입니다.
- 생성 스크립트는 실행 위치에 의존하지 않고, 자기 파일 위치 기준으로 app root를 `apps/client`로 계산합니다.
- 로컬 전용 env 파일은 `apps/client/.env.openapi.local`입니다. 이 파일은 `.gitignore` 대상이어야 하며 커밋하지 않습니다.
- generated output은 app root 기준 `src/shared/api/generated/openapi.ts`, repository root 기준 `apps/client/src/shared/api/generated/openapi.ts`입니다.
- `OPENAPI_SCHEMA_URL`에는 원격 raw OpenAPI URL 또는 local schema file path를 넣을 수 있습니다.
- 원격 URL은 스크립트가 임시 파일로 내려받은 뒤 `openapi-typescript`에 넘겨 CLI 로그에 실제 URL이 출력되지 않게 합니다.
- local schema file path를 쓸 때는 절대 경로를 권장합니다. 상대 경로를 쓰면 `apps/client` cwd 기준으로 해석되는지 확인합니다.

## 설정 절차

1. package manager가 `pnpm`인지 확인하고, dependency version은 workspace catalog에 둡니다.
2. `pnpm-workspace.yaml`의 `catalog`에 `openapi-typescript`를 추가합니다.
3. `apps/client` devDependencies에 `openapi-typescript: "catalog:"`를 추가합니다.
4. 루트 script를 추가합니다.

```json
"gen:api-types": "pnpm --filter @hashi/client gen:api-types"
```

5. client script를 추가합니다.

```json
"gen:api-types": "node scripts/generate-openapi-types.mjs"
```

6. `apps/client/scripts/generate-openapi-types.mjs`를 추가해 `OPENAPI_SCHEMA_URL` 또는 gitignore된 `apps/client/.env.openapi.local`에서 schema URL을 읽게 합니다. 원격 URL은 임시 파일로 내려받은 뒤 `openapi-typescript`에 넘겨 CLI 로그에 실제 URL이 출력되지 않게 합니다.
7. 타입을 생성합니다.

```bash
OPENAPI_SCHEMA_URL=<raw-openapi-schema-url> pnpm gen:api-types
```

반복해서 써야 하면 `apps/client/.env.openapi.local`에 아래처럼 둡니다.

```bash
OPENAPI_SCHEMA_URL=<raw-openapi-schema-url>
```

8. 생성 결과는 `apps/client/src/shared/api/generated/openapi.ts`에 둡니다.
9. `apps/client/src/shared/api/generated/README.md`에 생성 명령과 "직접 수정하지 말 것" 안내를 추가하거나 갱신합니다.
10. Node `.mjs` script를 `apps/client/scripts`에 추가하면 `eslint.config.js`에서 Node globals가 적용되는지 확인합니다. `pnpm --filter @hashi/client lint`는 `apps/client` cwd에서 실행되므로 `scripts/**/*.{js,mjs}` 패턴도 필요할 수 있습니다.
11. script, dependency 상태, schema URL 주입 방식, path 기준, output path가 바뀌면 data-layer/API workflow 문서를 같이 갱신합니다.

## 생성 타입 사용 방식

생성된 타입은 API boundary에서만 직접 참조합니다. page/component에서 `components`나 `paths`를 직접 import하지 말고, endpoint 함수 또는 page/feature-local type alias로 한 번 좁힌 뒤 사용합니다.

API 연동 코드를 추가할 때는 아래처럼 owning page 또는 feature 가까이에 둡니다. 한 화면에서만 쓰면 page-local, 여러 화면이 같은 서버 상태를 공유하면 feature-local로 승격합니다.

```text
apps/client/src/pages/{pageName}/
  api/{endpointName}.ts
  queries/{domain}QueryKeys.ts
  queries/use{Domain}Query.ts
  mutations/use{Action}Mutation.ts
  types.ts

apps/client/src/features/{featureName}/
  api/{endpointName}.ts
  queries/{domain}QueryKeys.ts
  queries/use{Domain}Query.ts
  mutations/use{Action}Mutation.ts
  types.ts
```

`CreateReservationBody`, `CreateReservationData` 같은 OpenAPI alias는 endpoint 함수 파일이나 같은 page/feature의 `types.ts`에 둡니다. 컴포넌트 파일에서 `paths[...]`를 직접 만들지 않습니다.

```ts
import { request } from '@/shared/api'
import type { components, paths } from '@/shared/api/generated/openapi'

type RestaurantListData = components['schemas']['RestaurantListResponse']
type GetRestaurantsQuery = NonNullable<
  paths['/api/v1/restaurants']['get']['parameters']['query']
>

export const getRestaurants = (params: GetRestaurantsQuery) => {
  return request<RestaurantListData>('/api/v1/restaurants', {
    searchParams: params,
  })
}
```

POST/PUT/PATCH body는 `paths`의 `requestBody`에서 뽑습니다.

```ts
import { request } from '@/shared/api'
import type { paths } from '@/shared/api/generated/openapi'

type CreateReservationBody =
  paths['/api/v1/reservations']['post']['requestBody']['content']['application/json']

type CreateReservationData = NonNullable<
  paths['/api/v1/reservations']['post']['responses'][201]['content']['*/*']['data']
>

export const createReservation = (body: CreateReservationBody) => {
  return request<CreateReservationData>('/api/v1/reservations', {
    json: body,
    method: 'post',
  })
}
```

주의할 점:

- `request<TData>()`는 공통 success envelope 전체가 아니라 `data` 필드만 반환합니다.
- 그래서 `SuccessResponseRestaurantListResponse` 같은 envelope 타입을 `request<T>()`에 넣지 않습니다.
- response data만 필요하면 `components['schemas']['...Response']`를 우선 사용합니다.
- query/path/body처럼 endpoint별 입력 타입이 필요하면 `paths['/api/...']['method']...`에서 뽑습니다.
- OpenAPI가 optional을 넓게 생성하면 UI에 넘기기 전에 endpoint/query layer에서 필요한 view model로 좁힙니다.
- 생성 파일의 type 이름이 backend operation name 때문에 애매하면 local alias 이름을 FE 의미에 맞게 붙입니다.
- TanStack Query hook에서는 endpoint 함수의 반환 타입을 그대로 추론시키고, query key에는 입력 params를 포함합니다.

```ts
import { useQuery } from '@tanstack/react-query'
import { getRestaurants } from '@/pages/search/api/getRestaurants'

export const restaurantListQueryKey = (params: GetRestaurantsQuery) =>
  ['restaurants', params] as const

export const useRestaurantListQuery = (params: GetRestaurantsQuery) => {
  return useQuery({
    queryFn: () => getRestaurants(params),
    queryKey: restaurantListQueryKey(params),
  })
}
```

## 경계

- 로컬 생성을 위해 `OPENAPI_SCHEMA_URL`을 Repository Variables에 넣지 않습니다. 로컬 shell override로 씁니다.
- CI에서 생성해야 하고 schema URL을 공개하면 안 되면 Repository Variables가 아니라 GitHub Actions Secret 같은 비공개 secret으로 둡니다.
- `OPENAPI_SCHEMA_URL`과 `VITE_API_BASE_URL`을 혼동하지 않습니다. schema generation과 runtime API call은 별개입니다.
- generated `openapi.ts`는 직접 수정하지 않습니다.
- generated type을 component props나 HDS component API에 직접 노출하지 않습니다.
- `apps/client/.env.openapi.local`은 로컬 편의용 파일입니다. 실제 URL이 들어가므로 문서, PR 설명, 커밋에 포함하지 않습니다.
- OpenAPI setup을 고치면서 관련 없는 env 파일, auth/debug 파일을 복구하거나 같이 커밋하지 않습니다.
- 브랜치에 이미 관련 없는 파일이 커밋되어 있으면, recommit 전에 Git cleanup을 별도로 처리합니다.

## 다음 단계

타입 생성 후에는 `api-spec-intake`로 endpoint를 page에 매핑하고, `api-integrator`로 query/mutation을 연결합니다.
Generated OpenAPI type만으로 endpoint 함수, query key, hook, invalidation, UI state wiring이 대체되지는 않습니다.

## 검증

변경 파일에 맞춰 아래 검증을 실행합니다.

```bash
OPENAPI_SCHEMA_URL=<raw-openapi-schema-url> pnpm gen:api-types
node --check apps/client/scripts/generate-openapi-types.mjs
git check-ignore -v apps/client/.env.openapi.local
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client lint
git diff --check
```

dependency나 build script가 바뀌면 아래도 실행합니다.

```bash
pnpm --filter @hashi/client build
```
