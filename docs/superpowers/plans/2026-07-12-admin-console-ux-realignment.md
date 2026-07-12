# Admin Console UX Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the admin restaurant and magazine list/drawer UX with live public queries, exact admin mutations, backend-aligned validation, and real presigned image uploads.

**Architecture:** `apps/admin` owns separate generated contracts for the admin and user OpenAPI groups. Public restaurant/magazine APIs supply published list and prefill data, admin APIs remain the only write boundary, and a shared admin uploader owns presign plus object-storage PUT. Restaurant and magazine page code is split into page-local API/query/form/component units instead of returning to one large page file.

**Tech Stack:** React 19, TypeScript, Vite, ky, TanStack Query, Vitest, Testing Library, openapi-typescript, HASHI Design System

## Global Constraints

- Do not modify `/Users/chuchu/workspace/SOPT/HASHI/HASHI-SERVER`; read it only for contract verification.
- Do not create commits, push, or finish the current merge unless the user explicitly asks.
- Preserve the current `merge --no-commit` state and unrelated staged/unstaged changes.
- Do not import `apps/client` generated types into `apps/admin`.
- Do not edit generated OpenAPI files by hand.
- Do not represent the public list as a complete admin inventory; label it `현재 공개 중`.
- Do not infer object keys from public image URLs.
- Do not send collection fields in PATCH unless the matching whole-replacement control is enabled.
- Use TDD for serializers, endpoint boundaries, upload behavior, query composition, and page interaction.

---

### Task 1: Refresh and separate generated contracts

**Files:**

- Modify: `apps/admin/scripts/generate-openapi-types.mjs`
- Modify: `apps/admin/package.json`
- Modify: `package.json`
- Create: `apps/admin/src/shared/api/generated/user-openapi.ts`
- Modify: `apps/admin/src/shared/api/generated/openapi.ts`
- Modify: `apps/admin/src/shared/api/generated/README.md`
- Modify: `apps/admin/src/shared/api/adminApi.test.ts`

**Interfaces:**

- Consumes: ignored environment variables `ADMIN_OPENAPI_SCHEMA_URL`, `USER_OPENAPI_SCHEMA_URL`
- Produces: `generated/openapi.ts` for admin paths and `generated/user-openapi.ts` for upload/public paths
- Produces scripts: `gen:admin-api-types`, `gen:admin-user-api-types`, `gen:admin-all-api-types`

- [ ] **Step 1: Update the contract test to use the latest restaurant request names**

Replace the old restaurant create fixture in `adminApi.test.ts` with an exact backend-aligned body:

```ts
const createRestaurantBody = {
  name: '하시 스시',
  localName: 'ハシ寿司',
  summary: '현지 스시 전문점',
  description: '제철 생선을 사용합니다.',
  address: '東京都渋谷区1-1-1',
  area: '시부야',
  genre: 'sushi',
  foodCategory: 'sushi',
  priceCurrency: 'JPY',
  minPrice: 3000,
  maxPrice: 8000,
  imageKeys: ['uploads/restaurants/2026/07/12/a.webp'],
  menus: [],
  hashtags: ['현지인맛집'],
  curationTypes: ['hashi-pick'],
  businessHours: WEEKLY_HOURS,
} satisfies CreateRestaurantBody
```

Assert that removed properties such as `reservationFee`, `currency`, `thumbnailKey`, and `lastOrderTime` are not part of the request fixture.

- [ ] **Step 2: Run the focused contract test and typecheck to establish the stale-schema failure**

Run:

```bash
pnpm --filter @hashi/admin test -- adminApi.test.ts
pnpm --filter @hashi/admin typecheck
```

Expected: typecheck fails because the existing generated contract still exposes the pre-alignment restaurant schema.

- [ ] **Step 3: Generalize the generator for two schema environment variables and outputs**

Parse `--schema-env` and `--output` arguments and keep formatting after generation:

```js
const args = new Map()

for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1])
}

const schemaEnvName = args.get('--schema-env') ?? 'OPENAPI_SCHEMA_URL'
const outputPath = args.get('--output') ?? 'src/shared/api/generated/openapi.ts'
const schemaUrl =
  process.env[schemaEnvName] ?? readSchemaUrlFromLocalEnv(schemaEnvName)
```

Make `readSchemaUrlFromLocalEnv` accept the requested key. Keep temporary-file cleanup and the existing `prettier --write` call.

- [ ] **Step 4: Add app and root scripts**

Use these script values in `apps/admin/package.json`:

```json
{
  "gen:api-types": "node scripts/generate-openapi-types.mjs --schema-env ADMIN_OPENAPI_SCHEMA_URL --output src/shared/api/generated/openapi.ts",
  "gen:user-api-types": "node scripts/generate-openapi-types.mjs --schema-env USER_OPENAPI_SCHEMA_URL --output src/shared/api/generated/user-openapi.ts",
  "gen:all-api-types": "pnpm gen:api-types && pnpm gen:user-api-types"
}
```

Expose matching root scripts without embedding raw schema URLs.

- [ ] **Step 5: Regenerate both contracts from the injected environment**

Run:

```bash
test -n "$ADMIN_OPENAPI_SCHEMA_URL"
test -n "$USER_OPENAPI_SCHEMA_URL"
pnpm --filter @hashi/admin gen:all-api-types
```

Expected generated admin request fields:

```text
summary foodCategory priceCurrency imageKeys hashtags breakStart breakEnd
```

Expected absent fields:

```text
reservationFee thumbnailKey currency lastOrderTime
```

- [ ] **Step 6: Update generated documentation and rerun contract checks**

Document the two environment keys, outputs, and commands. Run:

```bash
pnpm --filter @hashi/admin test -- adminApi.test.ts
pnpm --filter @hashi/admin typecheck
```

Expected: PASS.

- [ ] **Step 7: Review checkpoint without commit**

Run `git diff --check` and inspect only Task 1 files. Do not stage or commit.

---

### Task 2: Add public catalog and upload endpoint boundaries

**Files:**

- Create: `apps/admin/src/shared/api/uploadApi.ts`
- Create: `apps/admin/src/shared/api/uploadApi.test.ts`
- Create: `apps/admin/src/pages/restaurants/api/restaurantCatalogApi.ts`
- Create: `apps/admin/src/pages/restaurants/api/restaurantCatalogApi.test.ts`
- Create: `apps/admin/src/pages/magazines/api/magazineCatalogApi.ts`
- Create: `apps/admin/src/pages/magazines/api/magazineCatalogApi.test.ts`
- Modify: `apps/admin/src/shared/api/adminEndpoints.ts`

**Interfaces:**

- Produces: `uploadApi.uploadImage(file, usage): Promise<UploadedImage>`
- Produces: `restaurantCatalogApi.list`, `getSummary`, `getStoreInformation`, `listAllMenus`
- Produces: `magazineCatalogApi.list`

- [ ] **Step 1: Write failing upload boundary tests**

Test that presign uses the user contract and object storage PUT preserves the MIME type:

```ts
expect(requestMock).toHaveBeenCalledWith('/api/v1/uploads/presigned-urls', {
  method: 'post',
  json: {
    usage: 'restaurant',
    contentType: 'image/webp',
    fileSize: 1024,
  },
})

expect(fetchMock).toHaveBeenCalledWith('https://upload.example/image', {
  method: 'PUT',
  headers: { 'Content-Type': 'image/webp' },
  body: file,
})
```

Also assert rejection for a non-2xx storage PUT.

- [ ] **Step 2: Run the upload test to verify RED**

Run `pnpm --filter @hashi/admin test -- uploadApi.test.ts`.

Expected: FAIL because `uploadApi` does not exist.

- [ ] **Step 3: Implement the upload endpoint and result type**

Use user-generated aliases and validate required response fields:

```ts
export type UploadUsage = 'restaurant' | 'restaurant-menu' | 'magazine'

export interface UploadedImage {
  fileKey: string
  fileUrl: string
  fileName: string
  contentType: string
}

export const uploadApi = {
  async uploadImage(file: File, usage: UploadUsage): Promise<UploadedImage> {
    const presigned = await request<PresignedUrlData>(
      ADMIN_ENDPOINTS.presignedUpload,
      {
        method: 'post',
        json: { usage, contentType: file.type, fileSize: file.size },
      },
    )

    if (!presigned.uploadUrl || !presigned.fileKey || !presigned.fileUrl) {
      throw new Error('업로드 URL 응답이 올바르지 않습니다.')
    }

    const response = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.')

    return {
      fileKey: presigned.fileKey,
      fileUrl: presigned.fileUrl,
      fileName: file.name,
      contentType: file.type,
    }
  },
}
```

- [ ] **Step 4: Write failing public restaurant API tests**

Assert exact query serialization for:

```ts
{
  keyword: '스시',
  genre: 'sushi',
  foodCategory: 'sushi',
  sort: 'rating',
  cursor: 'cursor-token',
  size: 20,
}
```

Assert paths for summary, store information, and menus. Assert `listAllMenus` follows `nextCursor` until `hasNext` is false.

- [ ] **Step 5: Implement public restaurant endpoints**

Derive aliases from `generated/user-openapi.ts`. Keep cursor values opaque and omit empty query values. Implement `listAllMenus` with a loop and `size: 50` so update prefill does not silently truncate menus.

- [ ] **Step 6: Write and implement public magazine list tests**

Assert `GET /api/v1/magazines?cursor=12&size=20` and derive its response alias from the user-generated contract.

- [ ] **Step 7: Run endpoint tests and typecheck**

Run:

```bash
pnpm --filter @hashi/admin test -- uploadApi.test.ts restaurantCatalogApi.test.ts magazineCatalogApi.test.ts
pnpm --filter @hashi/admin typecheck
```

Expected: PASS.

- [ ] **Step 8: Review checkpoint without commit**

Inspect endpoint functions for React/TanStack imports and raw URL strings. Expected: none except the external presigned URL received at runtime.

---

### Task 3: Build query keys, catalog hooks, and prefill view models

**Files:**

- Create: `apps/admin/src/pages/restaurants/queries/restaurantQueryKeys.ts`
- Create: `apps/admin/src/pages/restaurants/queries/useRestaurantCatalogQuery.ts`
- Create: `apps/admin/src/pages/restaurants/queries/useRestaurantPrefillQuery.ts`
- Create: `apps/admin/src/pages/restaurants/queries/restaurantQueries.test.tsx`
- Create: `apps/admin/src/pages/restaurants/restaurantViewModel.ts`
- Create: `apps/admin/src/pages/restaurants/restaurantViewModel.test.ts`
- Create: `apps/admin/src/pages/magazines/queries/magazineQueryKeys.ts`
- Create: `apps/admin/src/pages/magazines/queries/useMagazineCatalogQuery.ts`
- Create: `apps/admin/src/pages/magazines/queries/magazineQueries.test.tsx`

**Interfaces:**

- Produces: `restaurantQueryKeys.list(params)`, `restaurantQueryKeys.prefill(id)`
- Produces: `useRestaurantCatalogQuery(params)`, `useRestaurantPrefillQuery(id)`
- Produces: `magazineQueryKeys.list(params)`, `useMagazineCatalogQuery(params)`
- Produces: `RestaurantPrefillView`

- [ ] **Step 1: Write failing query-key and query-composition tests**

Assert every response-changing list param is in the key:

```ts
expect(restaurantQueryKeys.list(params)).toEqual([
  'admin',
  'restaurant-catalog',
  'list',
  params,
])
```

Assert prefill runs summary, store information, and all-menu requests only when `restaurantId` is non-null.

- [ ] **Step 2: Write failing prefill view-model tests**

Given list row, summary, store information, and menu responses, assert the view contains scalar values, business hours, and display URLs while keeping object-key fields empty:

```ts
expect(view.images).toEqual([
  { sourceUrl: 'https://cdn.example/a.webp', uploaded: null },
])
expect(view.curationTypes).toEqual([])
expect(view.genre).toBe('sushi')
expect(view.foodCategory).toBe('sushi')
```

- [ ] **Step 3: Implement query factories and hooks**

Use `useInfiniteQuery` for public lists with explicit initial page params:

```ts
initialPageParam: null as string | null,
getNextPageParam: (lastPage) =>
  lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
```

Use `useQueries` or a single composed query function for restaurant prefill. Prefer one query key and one composed query function so the drawer has one loading/error boundary.

- [ ] **Step 4: Implement view-model normalization**

Map optional server values to display-safe defaults, retain public image URLs only for preview, and never convert them to file keys.

- [ ] **Step 5: Implement magazine cursor query**

Use `initialPageParam: null` and the server `nextCursor`/`hasNext` pair. Flatten pages in the page through a memoized selector.

- [ ] **Step 6: Run focused tests and typecheck**

Run:

```bash
pnpm --filter @hashi/admin test -- restaurantQueries.test.tsx restaurantViewModel.test.ts magazineQueries.test.tsx
pnpm --filter @hashi/admin typecheck
```

Expected: PASS.

- [ ] **Step 7: Review checkpoint without commit**

Verify there are no inline query-key arrays outside the factory files.

---

### Task 4: Rebuild restaurant form state, validation, and serializers

**Files:**

- Replace: `apps/admin/src/pages/restaurants/restaurantForm.ts`
- Replace: `apps/admin/src/pages/restaurants/restaurantForm.test.ts`
- Create: `apps/admin/src/pages/restaurants/restaurantOptions.ts`

**Interfaces:**

- Produces: `RestaurantFormState`, `RestaurantReplacementFlags`, `RestaurantDirtyFields`
- Produces: `createRestaurantForm()`, `createRestaurantFormFromPrefill(view)`
- Produces: `validateRestaurantForm(form, mode, replacements, uploadStatus)`
- Produces: `toCreateRestaurantBody(form)`, `toUpdateRestaurantBody(form, dirtyFields, replacements)`

- [ ] **Step 1: Define exact select options in a failing test**

Assert the backend enum values exactly:

```ts
expect(GENRE_OPTIONS.map(({ value }) => value)).toEqual([
  'sushi',
  'noodle',
  'rice-bowl',
  'nabe',
  'fried',
  'grill',
  'etc',
])
expect(CURRENCY_OPTIONS.map(({ value }) => value)).toEqual([
  'JPY',
  'KRW',
  'USD',
])
expect(CURATION_OPTIONS.map(({ value }) => value)).toEqual([
  'sns-hot',
  'popular',
  'hashi-pick',
  'today-restaurant',
])
```

- [ ] **Step 2: Write failing create serializer tests**

Assert the body contains only current backend names:

```ts
expect(toCreateRestaurantBody(validForm)).toEqual({
  name: '하시 스시',
  localName: 'ハシ寿司',
  summary: '현지 스시 전문점',
  description: '제철 생선을 사용합니다.',
  address: '東京都渋谷区1-1-1',
  area: '시부야',
  genre: 'sushi',
  foodCategory: 'sushi',
  priceCurrency: 'JPY',
  minPrice: 3000,
  maxPrice: 8000,
  imageKeys: ['uploads/restaurants/2026/07/12/a.webp'],
  menus: [],
  hashtags: ['현지인맛집'],
  curationTypes: ['hashi-pick'],
  businessHours: validWeeklyHours,
})
```

- [ ] **Step 3: Write failing update replacement tests**

Assert an unchanged scalar and disabled collection are omitted. Assert enabled image replacement sends only newly uploaded keys. Assert business-hour replacement always sends seven rows.

- [ ] **Step 4: Write failing validation tests**

Cover:

- blank required create values
- max lengths 100/500/255/20
- image and hashtag minimum counts
- negative prices and `minPrice > maxPrice`
- missing/duplicate weekdays
- `openTime >= closeTime`
- one-sided break time
- break outside open/close
- closed day carrying any time
- pending/failed required upload

- [ ] **Step 5: Implement options, state, validation, and serializers**

Represent money inputs as strings in form state and convert only in serializers. Store only successful `UploadedImage` values in form state and pass pending/failed counts separately through this exact interface:

```ts
export interface FormUploadStatus {
  pendingCount: number
  failedCount: number
}
```

Track update scalars through a `Set<keyof RestaurantScalarFields>` and collections through explicit booleans:

```ts
export interface RestaurantReplacementFlags {
  images: boolean
  menus: boolean
  hashtags: boolean
  curationTypes: boolean
  businessHours: boolean
}
```

For a closed day, serialize only `{ dayOfWeek, closed: true }`. For an open day, include paired break values only when both exist.

- [ ] **Step 6: Run form tests and typecheck**

Run:

```bash
pnpm --filter @hashi/admin test -- restaurantForm.test.ts
pnpm --filter @hashi/admin typecheck
```

Expected: PASS.

- [ ] **Step 7: Review checkpoint without commit**

Search production restaurant code for removed names. Expected no matches for `reservationFee`, `thumbnailKey`, or `lastOrderTime`.

---

### Task 5: Create the shared real image uploader

**Files:**

- Create: `apps/admin/src/shared/components/AdminImageUploader.tsx`
- Create: `apps/admin/src/shared/components/AdminImageUploader.test.tsx`
- Create: `apps/admin/src/shared/hooks/useAdminImageUpload.ts`
- Create: `apps/admin/src/shared/hooks/useAdminImageUpload.test.tsx`

**Interfaces:**

- Consumes: `uploadApi.uploadImage`, `UploadUsage`
- Produces: controlled `AdminImageUploader` with `UploadedImage[]`
- Produces: `AdminImageUploadStatus = { pendingCount: number; failedCount: number }`
- Supports: single/multiple, reorder, retry, remove, MIME/size validation

- [ ] **Step 1: Write failing hook tests**

Assert JPEG/PNG/WebP up to 5MB upload, unsupported MIME rejection before API call, oversize rejection before API call, per-file retry, and pending state.

- [ ] **Step 2: Write failing component interaction tests**

Assert:

- file input has an accessible label
- preview appears after selection
- first restaurant image is labelled `대표 이미지`
- move-up/move-down changes controlled order
- remove updates the controlled value
- failed item exposes `다시 시도`
- `onStatusChange` reports pending/failed counts to submit consumers

- [ ] **Step 3: Implement the upload hook**

Use stable item IDs and revoke object preview URLs on removal/unmount. Limit parallel uploads to three files by processing a queue in batches.

- [ ] **Step 4: Implement the controlled uploader**

Use HDS Button where possible and native file input for accessibility. Do not place restaurant/magazine mutation logic inside the shared uploader.

- [ ] **Step 5: Run focused tests**

Run:

```bash
pnpm --filter @hashi/admin test -- useAdminImageUpload.test.tsx AdminImageUploader.test.tsx
pnpm --filter @hashi/admin lint
pnpm --filter @hashi/admin typecheck
```

Expected: PASS.

- [ ] **Step 6: Review checkpoint without commit**

Verify canceling a form revokes browser preview URLs but does not claim to delete already uploaded storage objects.

---

### Task 6: Restore the restaurant table and four-step drawer

**Files:**

- Replace: `apps/admin/src/pages/restaurants/RestaurantsPage.tsx`
- Replace: `apps/admin/src/pages/restaurants/RestaurantsPage.test.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantTable.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantFormDrawer.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantFormStepper.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantBasicStep.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantMediaStep.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantHoursStep.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantMenuStep.tsx`
- Create: `apps/admin/src/pages/restaurants/components/RestaurantReplacementSection.tsx`
- Create: `apps/admin/src/pages/restaurants/mutations/useRestaurantMutations.ts`
- Create: `apps/admin/src/pages/restaurants/mutations/useRestaurantMutations.test.tsx`
- Modify: `apps/admin/src/shared/api/adminHooks.ts`

**Interfaces:**

- Consumes: Task 2 endpoints, Task 3 queries/view model, Task 4 form logic, Task 5 uploader
- Produces: live restaurant list, create/update drawer, ID-direct update, soft-delete dialog

- [ ] **Step 1: Write failing mutation invalidation tests**

Assert create, update, and delete all invalidate `restaurantQueryKeys.lists()` after success. Keep admin request variables exact.

- [ ] **Step 2: Write failing page tests for list states and filters**

Assert the page renders `현재 공개 중인 식당`, sends keyword/genre/foodCategory/sort to the query, loads the next cursor page, and maps loading/error/empty/success states. Assert there is no `Mock 상태` control.

- [ ] **Step 3: Write failing create-drawer tests**

Assert:

- `식당 등록` opens a large drawer
- four steps render in order
- genre, food category, and currency are listbox controls
- next is blocked with field errors
- upload results are serialized as keys
- final submit calls create mutation with the exact Task 4 body

- [ ] **Step 4: Write failing update-drawer tests**

Assert row edit loads prefill, scalar edits produce changed-only PATCH, image/menu replacement controls are off initially, enabling replacement shows the destructive replacement warning, and public URLs are never submitted as keys.

- [ ] **Step 5: Write failing delete and direct-ID tests**

Assert the soft-delete copy, mutation ID, pending duplicate prevention, success invalidation, and manual numeric-ID update/delete entry points.

- [ ] **Step 6: Implement page-local mutations**

Move restaurant mutation hooks out of the broad shared hook file. Invalidate only public restaurant list prefixes because no admin detail query exists.

- [ ] **Step 7: Implement the table and toolbar**

Restore the dense table visual pattern using actual public fields. Use `AdminSearchInput`, `AdminSelect`, `AdminTable`, and clear published-list copy.

- [ ] **Step 8: Implement drawer orchestration and steps**

Keep the form state in `RestaurantFormDrawer`; each step receives only its section value/errors/change callbacks. Keep fixed drawer footer actions for cancel, previous, next, and submit.

- [ ] **Step 9: Implement update replacement protection**

Each collection section must render this semantic copy before enabling fields:

```text
이 항목을 저장하면 기존 목록 전체가 현재 입력값으로 교체됩니다.
```

Do not include a disabled section in `toUpdateRestaurantBody`.

- [ ] **Step 10: Run restaurant verification**

Run:

```bash
pnpm --filter @hashi/admin test -- RestaurantsPage.test.tsx useRestaurantMutations.test.tsx restaurantForm.test.ts
pnpm --filter @hashi/admin lint
pnpm --filter @hashi/admin typecheck
pnpm --filter @hashi/admin build
```

Expected: PASS.

- [ ] **Step 11: Review checkpoint without commit**

Check keyboard access to stepper, select, drawer close, file input, replacement toggles, and confirm dialog.

---

### Task 7: Restore the magazine list and upload drawer

**Files:**

- Replace: `apps/admin/src/pages/magazines/MagazinesPage.tsx`
- Replace: `apps/admin/src/pages/magazines/MagazinesPage.test.tsx`
- Replace: `apps/admin/src/pages/magazines/magazineForm.ts`
- Replace: `apps/admin/src/pages/magazines/magazineForm.test.ts`
- Create: `apps/admin/src/pages/magazines/components/MagazineTable.tsx`
- Create: `apps/admin/src/pages/magazines/components/MagazineFormDrawer.tsx`
- Create: `apps/admin/src/pages/magazines/mutations/useMagazineMutations.ts`
- Create: `apps/admin/src/pages/magazines/mutations/useMagazineMutations.test.tsx`
- Modify: `apps/admin/src/shared/api/adminHooks.ts`

**Interfaces:**

- Consumes: magazine catalog query and shared uploader with usage `magazine`
- Produces: published magazine table, create/update drawer, ID-direct update/delete

- [ ] **Step 1: Write failing serializer tests**

Assert create requires title, uploaded banner key, and valid Instagram URL. Assert update omits untouched title/URL and omits banner unless a new upload succeeds.

- [ ] **Step 2: Write failing mutation invalidation tests**

Assert create, update, and delete invalidate `magazineQueryKeys.lists()`.

- [ ] **Step 3: Write failing page tests**

Assert published list states, cursor loading, create drawer, prefilled title/URL update, optional banner replacement, direct-ID actions, delete confirmation, and absence of region/series/genre/card-news controls.

- [ ] **Step 4: Implement the compact magazine form**

Use max lengths 150/500/255 and `new URL(value)` validation restricted to `http:` or `https:`. The upload component supplies `bannerKey`; do not expose a raw key text field as the primary control.

- [ ] **Step 5: Implement mutations, table, drawer, and page orchestration**

Show `현재 공개 중인 매거진`, banner preview, title, Instagram URL, and created date. Keep create/update/delete server errors local to drawer/dialog.

- [ ] **Step 6: Run magazine verification**

Run:

```bash
pnpm --filter @hashi/admin test -- MagazinesPage.test.tsx magazineForm.test.ts useMagazineMutations.test.tsx
pnpm --filter @hashi/admin lint
pnpm --filter @hashi/admin typecheck
pnpm --filter @hashi/admin build
```

Expected: PASS.

- [ ] **Step 7: Review checkpoint without commit**

Verify the magazine form sends only the three backend-supported fields.

---

### Task 8: Sync specs and run full verification

**Files:**

- Modify: `apps/admin/src/app/AdminConsole.spec.md`
- Modify: `apps/admin/src/app/AdminApiIntegration.spec.md`
- Modify: `docs/architecture/data-layer.md`
- Modify: `docs/workflows/api-integration.md` only if the dual-schema generation command changes the documented workflow
- Modify: `docs/superpowers/specs/2026-07-12-admin-console-ux-realignment-design.md` only if implementation decisions differ

**Interfaces:**

- Consumes: all completed implementation tasks
- Produces: final verified handoff with backend repository still clean

- [ ] **Step 1: Update specs to the implemented contract**

Record:

- public-list scope and endpoints
- admin write endpoints
- upload presign plus PUT flow
- exact restaurant create fields
- PATCH replacement semantics
- drawer/stepper states
- upload orphan-object limitation

- [ ] **Step 2: Run stale-pattern scans**

Run:

```bash
rg -n "reservationFee|thumbnailKey|lastOrderTime|Mock 상태|mockStore|adminService" apps/admin/src --glob '!**/*.test.*' --glob '!**/*.spec.md'
rg -n "label=\"장르\"|label=\"음식 카테고리\"|label=\"통화\"" apps/admin/src/pages/restaurants
```

Expected: first command returns no production matches; second command finds select-based controls.

- [ ] **Step 3: Verify API integration rules**

Check endpoint boundaries, generated aliases, query-key factories, cursor page params, mutation invalidation, upload states, loading/error/empty states, and docs sync using `.agents/skills/verify-api-integration/SKILL.md`.

- [ ] **Step 4: Run full admin verification**

Run:

```bash
pnpm --filter @hashi/admin test
pnpm --filter @hashi/admin lint
pnpm --filter @hashi/admin typecheck
pnpm --filter @hashi/admin build
```

Expected: all commands PASS.

- [ ] **Step 5: Run repository verification**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
git diff --check
git diff --cached --check
test -z "$(git diff --name-only --diff-filter=U)"
test "$(git rev-parse MERGE_HEAD)" = "$(git rev-parse origin/develop)"
```

Expected: all commands PASS and the no-commit merge remains based on current `origin/develop`.

- [ ] **Step 6: Confirm backend repository remained read-only**

Run:

```bash
git -C ../HASHI-SERVER status --short --branch
```

Expected:

```text
## develop...origin/develop
```

- [ ] **Step 7: Final review checkpoint without commit**

Summarize changed client files, test counts, public-list limitation, upload orphan limitation, and unverified valid-admin manual login. Do not stage or commit.
