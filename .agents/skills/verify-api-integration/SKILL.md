---
name: verify-api-integration
description: Use after HASHI client API query, mutation, Swagger integration, TanStack Query, query key, invalidation, or server-state UI changes to audit correctness before PR or review.
---

# Verify API Integration

## Purpose

Audit HASHI client API integration for data-layer boundaries, query key correctness, mutation invalidation, UI state coverage, and docs sync.

## Related Files

| Pattern                                               | Reason                         |
| ----------------------------------------------------- | ------------------------------ |
| `apps/client/src/pages/**/api/**/*.{ts,tsx}`          | Page-local endpoints           |
| `apps/client/src/pages/**/queries/**/*.{ts,tsx}`      | Query keys and options         |
| `apps/client/src/pages/**/mutations/**/*.{ts,tsx}`    | Mutation options               |
| `apps/client/src/pages/**/hooks/**/*.{ts,tsx}`        | Query and mutation hooks       |
| `apps/client/src/features/**/api/**/*.{ts,tsx}`       | Feature endpoints              |
| `apps/client/src/features/**/queries/**/*.{ts,tsx}`   | Feature query keys and options |
| `apps/client/src/features/**/mutations/**/*.{ts,tsx}` | Feature mutation options       |
| `apps/client/src/features/**/hooks/**/*.{ts,tsx}`     | Feature hooks                  |
| `apps/client/src/shared/api/**/*.{ts,tsx}`            | Low-level API helpers          |
| `apps/client/src/shared/lib/queryClient.ts`           | QueryClient defaults           |
| `apps/client/src/**/*.test.{ts,tsx}`                  | API integration test isolation |
| `apps/client/src/**/*.spec.md`                        | Data dependency specs          |
| `docs/architecture/data-layer.md`                     | Data-layer source of truth     |

## Workflow

1. Collect changed files.

```bash
git status --short --untracked-files=all
git diff --name-only HEAD
git diff --name-only origin/develop...HEAD 2>/dev/null || true
```

2. Inspect changed API/query/mutation files and nearby page or feature specs.
3. Check endpoint boundaries:
   - endpoint functions use `request` or approved low-level API helpers
   - endpoint functions do not import React or TanStack Query
   - base URL, token, and secrets are not hardcoded
4. Check query keys:
   - every hook uses a query key factory
   - no inline `queryKey: ['...']` arrays in hooks or invalidation calls
   - params that change response data are included in keys
   - finite and infinite queries do not share the same key
5. Check query mode:
   - `useSuspenseQuery` is not used when `enabled`, `placeholderData`, manual loading UI, or local partial error UI is required
   - independent queries in one component do not create avoidable suspense waterfalls
   - infinite query uses explicit `initialPageParam` and documented `getNextPageParam`
6. Check mutations:
   - mutation hooks use documented request variables
   - success invalidates affected list/detail/infinite prefixes
   - optimistic updates exist only with explicit rollback requirements
7. Check UI states:
   - loading, error, empty, disabled, and success states are mapped to existing UI
   - destructive or submit actions cannot double-fire while pending
8. Check tests:
   - page and component tests mock page/feature API modules with `vi.mock(...)`
   - API wrapper tests mock `@/shared/api/request` or another approved low-level helper
   - tests do not import `@/shared/api` barrels when direct module imports avoid `apiClient.ts`
   - tests do not depend on `VITE_API_BASE_URL` or hardcoded real API origins unless URL construction is the unit under test
9. Check docs sync:
   - target page spec includes `Data Dependencies` when behavior changed
   - `docs/architecture/data-layer.md` still matches implementation patterns
10. Run matching verification commands.

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client test
pnpm --filter @hashi/client build
```

For CI-only failures related to missing API env values:

```bash
env -u VITE_API_BASE_URL pnpm --filter @hashi/client test -- <test-file>
```

## Output Format

```markdown
## API Integration Verification

Status: PASS | FAIL

### Findings

| Severity | File | Issue | Fix |
| -------- | ---- | ----- | --- |

### Checks

- Endpoint boundary: PASS/FAIL
- Query keys: PASS/FAIL
- Query mode: PASS/FAIL
- Mutation invalidation: PASS/FAIL
- UI states: PASS/FAIL
- Test isolation: PASS/FAIL
- Docs sync: PASS/FAIL

### Commands

- `command`: PASS/FAIL
```

## Exceptions

- Inline mutation keys are allowed when they are not used for shared defaults or cross-file checks.
- Pure mock files may keep local fixture helpers until the API Integration Map explicitly removes them.
- Local `useQuery` calls inside tests are not production integration findings.
- A page without server data does not need `Data Dependencies`.
- API wrapper tests may assert normalized request paths, but they should mock the request helper rather than loading `apiClient.ts`.
