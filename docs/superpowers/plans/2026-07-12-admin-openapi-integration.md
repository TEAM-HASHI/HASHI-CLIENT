# Admin OpenAPI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 최신 `develop`의 OpenAPI 생성 기반을 admin 앱에 확장하고, 실제 admin schema로 타입을 생성해 기존 admin endpoint boundary를 Swagger 계약과 일치시킨다.

**Architecture:** `apps/client`와 `apps/admin`은 각자의 생성 스크립트와 generated output을 소유한다. Admin page hook은 인증 전달 방식과 조회 API가 확정될 때까지 mock service를 유지하고, 현재 Swagger가 제공하는 restaurant/reservation/magazine endpoint 함수만 generated type으로 좁힌다.

**Tech Stack:** pnpm workspace, Vite, TypeScript, `openapi-typescript`, `ky`, Vitest

## Global Constraints

- 명시적 요청 전까지 `git commit`하지 않는다.
- 실제 dev/staging schema URL을 repository 파일에 기록하지 않는다.
- `apps/client/src/shared/api/generated/openapi.ts`를 admin schema로 덮어쓰지 않는다.
- auth transport가 확정되기 전에는 page hooks가 `adminService` mock을 계속 사용한다.
- generated `openapi.ts`는 직접 수정하지 않는다.

---

### Task 1: Develop 동기화와 admin 생성 기반

**Files:**

- Modify: `eslint.config.js`
- Modify: `package.json`
- Modify: `apps/admin/package.json`
- Modify: `.gitignore`
- Create: `apps/admin/scripts/generate-openapi-types.mjs`
- Create: `apps/admin/src/shared/api/generated/README.md`
- Generate: `apps/admin/src/shared/api/generated/openapi.ts`

**Interfaces:**

- Consumes: `OPENAPI_SCHEMA_URL`, workspace catalog의 `openapi-typescript`
- Produces: `pnpm gen:admin-api-types`, `@hashi/admin`의 `gen:api-types`, `components`/`paths` generated types

- [x] **Step 1: `origin/develop`을 새 commit 없이 현재 작업 트리에 병합하고 `eslint.config.js` 충돌에서 client/admin source와 script glob을 모두 보존한다.**

Run: `git merge --no-commit --no-ff origin/develop`

Expected: `eslint.config.js` 한 파일 충돌, 나머지는 auto-merge.

- [x] **Step 2: admin generator command가 아직 없음을 확인한다.**

Run: `pnpm gen:admin-api-types`

Expected: `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` 또는 missing script.

- [x] **Step 3: admin 앱 전용 생성 스크립트와 package scripts를 추가한다.**

```json
{
  "scripts": {
    "gen:admin-api-types": "pnpm --filter @hashi/admin gen:api-types"
  }
}
```

```json
{
  "scripts": {
    "gen:api-types": "node scripts/generate-openapi-types.mjs"
  },
  "devDependencies": {
    "openapi-typescript": "catalog:"
  }
}
```

Generator requirements:

- app root는 `apps/admin/scripts/generate-openapi-types.mjs` 위치 기준으로 계산한다.
- `OPENAPI_SCHEMA_URL` 또는 ignored `apps/admin/.env.openapi.local`을 읽는다.
- remote schema는 임시 파일로 받은 뒤 `src/shared/api/generated/openapi.ts`에 생성한다.
- schema URL을 로그나 repository 파일에 기록하지 않는다.

- [x] **Step 4: 실제 admin raw schema로 타입을 생성한다.**

Run: `OPENAPI_SCHEMA_URL="$OPENAPI_SCHEMA_URL" pnpm gen:admin-api-types`

Expected: `apps/admin/src/shared/api/generated/openapi.ts` 생성, OpenAPI 3.1 admin paths 11개 operation 포함.

- [x] **Step 5: 생성기 설정을 검증한다.**

Run:

```bash
node --check apps/admin/scripts/generate-openapi-types.mjs
git check-ignore -v apps/admin/.env.openapi.local
pnpm --filter @hashi/admin typecheck
```

Expected: all pass.

### Task 2: Admin endpoint contract tests

**Files:**

- Modify: `apps/admin/package.json`
- Create: `apps/admin/src/shared/api/adminApi.test.ts`

**Interfaces:**

- Consumes: `restaurantApi`, `reservationApi`, `magazineApi`, mocked low-level `request`
- Produces: URL, method, body, search params에 대한 executable contract

- [x] **Step 1: endpoint 계약 테스트를 작성한다.**

Tests assert:

```ts
restaurantApi.createRestaurant(createBody)
// POST /api/v1/admin/restaurants, generated CreateRestaurantRequest body

reservationApi.listReservations({ status: 'REQUESTED', page: 1, size: 20 })
// GET /api/v1/admin/reservations?status=REQUESTED&page=1&size=20

reservationApi.updateReservationStatus(3, { status: 'CANCELED' })
// POST /api/v1/admin/reservations/3/status

reservationApi.getReservationUser(3)
// GET /api/v1/admin/reservations/3/user

magazineApi.deleteMagazine(4)
// DELETE /api/v1/admin/magazines/4
```

- [x] **Step 2: 테스트가 현재 수동 타입/누락 endpoint 때문에 실패하는지 확인한다.**

Run: `pnpm --filter @hashi/admin test`

Expected: `REQUESTED`/`CANCELED` 타입 불일치 또는 `deleteMagazine` 누락으로 FAIL.

### Task 3: Generated type 기반 endpoint boundary

**Files:**

- Modify: `apps/admin/src/shared/api/restaurantApi.ts`
- Modify: `apps/admin/src/shared/api/reservationApi.ts`
- Modify: `apps/admin/src/shared/api/magazineApi.ts`

**Interfaces:**

- Consumes: `components`, `paths` from `@/shared/api/generated/openapi`
- Produces: generated request/response aliases and typed endpoint methods

- [x] **Step 1: 각 endpoint 파일에서 request body는 `paths`, response data는 `components`로 local alias를 만든다.**

```ts
type ChangeReservationStatusBody =
  paths['/api/v1/admin/reservations/{reservationId}/status']['post']['requestBody']['content']['application/json']

type AdminReservationData = components['schemas']['AdminReservationResponse']
```

- [x] **Step 2: reservation search params는 `status`, `page`, `size`만 직렬화하고 restaurant/magazine DTO 이름을 실제 schema에 맞춘다.**

- [x] **Step 3: `magazineApi.deleteMagazine`을 추가한다.**

- [x] **Step 4: focused tests를 통과시킨다.**

Run: `pnpm --filter @hashi/admin test`

Expected: all admin API contract tests pass.

### Task 4: 문서 동기화와 전체 검증

**Files:**

- Modify: `docs/architecture/data-layer.md`
- Modify: `docs/workflows/api-integration.md`
- Modify: `apps/admin/src/app/AdminConsole.spec.md`

**Interfaces:**

- Consumes: 실제 생성 command/output과 endpoint 구현 상태
- Produces: client/admin 생성 경계와 mock 유지 범위를 설명하는 source of truth

- [x] **Step 1: data-layer/API workflow 문서에 admin command, output, env 파일을 추가한다.**

- [x] **Step 2: page spec verification checkbox를 실제 결과로 갱신한다.**

- [x] **Step 3: 전체 검증을 실행한다.**

Run:

```bash
pnpm --filter @hashi/admin test
pnpm --filter @hashi/admin lint
pnpm --filter @hashi/admin typecheck
pnpm --filter @hashi/admin build
git diff --check
```

Expected: all pass, no commit created.
