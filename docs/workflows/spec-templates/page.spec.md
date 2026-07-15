# Page Spec: `PageName`

## Purpose

- 이 페이지가 지원하는 사용자 목표를 작성합니다.

## Route

- path:
- path constant:
  - `ROUTES.`
- route owner:
  - `apps/client/src/routes.ts`
- route module:
  - `apps/client/src/app/routes/{route-name}.tsx`
- layout:
- access type:
  - public / authOnly / guestOnly
- guard:
  - none / AuthOnlyRoute / GuestOnlyRoute
- rendering:
  - prerender / SPA
- index policy:
  - index / noindex
- bottom navigation:
  - yes / no
- redirect:
  - unauthenticated:
  - authenticated guest:
- auth status:
  - uses `useAuthStatus`: yes / no

## Location

- page path:
  - `apps/client/src/pages/{page}/{PageName}Page.tsx`
- spec path:
  - `apps/client/src/pages/{page}/{PageName}.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/routes.ts`
  - `apps/client/src/app/routes/{route-name}.tsx`

## Scaffold

필요한 경우 다음 generator를 우선 확인합니다.

```bash
pnpm gen:page
```

## Requirements

- [ ] 필수 UI 요소
- [ ] 필수 사용자 액션
- [ ] 성공 시 동작
- [ ] 실패 시 동작
- [ ] 비활성화 조건
- [ ] 반응형 요구사항
- [ ] 접근성 요구사항

## Data Dependencies

### Query

- query:
- enabled condition:
- request params:
- loading state:
- error state:
- empty state:
- refetch condition:

### Mutation

- mutation:
- request data:
- submit enabled condition:
- success handling:
- failure handling:

## User Flow

1. 사용자가 페이지에 진입합니다.
2. 필요한 데이터가 로드됩니다.
3. 사용자가 입력, 선택, 또는 클릭합니다.
4. 페이지가 성공 또는 실패 결과를 보여줍니다.
5. 필요한 경우 페이지를 이동합니다.

## State

- local state:
- form state:
- URL state:
- server state:
- derived state:

## Validation

- field:
  - rule:
  - error message:
- submit enabled condition:

## UI Structure

```text
PageNamePage
  Heading
  Section
    Form / List / Detail
  Actions
```

## Component Mapping

- HDS component:
- app shared component:
- page-local component:
- icon:

## Error Handling

- API error:
- validation error:
- exceptional case:
- user-facing message:
- retry or fallback:

## Navigation

- entry:
- links:
- route params:
- search params:
- success redirect:
- failure redirect:
- back behavior:
- auth redirect:

## Styling

- Tailwind layout:
- responsive:
- fixed area:
- scroll area:
- empty/loading/error layout:

## Verification

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] 주요 사용자 흐름 수동 확인
- [ ] route path / params / search params 확인
- [ ] access guard / redirect 확인
- [ ] bottom navigation layout 포함 여부 확인
- [ ] loading / empty / error / success 상태 확인
