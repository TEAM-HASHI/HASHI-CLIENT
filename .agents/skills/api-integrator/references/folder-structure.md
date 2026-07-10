# API Folder Structure

Start near the owner. Promote only after real reuse.

## Page-Local Flow

Use when one route owns the data.

```text
apps/client/src/pages/{page}/
  api/
    {domain}Api.ts
  queries/
    {domain}QueryKeys.ts
    {domain}QueryOptions.ts
  mutations/
    {domain}MutationOptions.ts
  hooks/
    use{Thing}Query.ts
    use{Action}Mutation.ts
  types.ts
```

## Feature Flow

Use when the same business flow is reused by multiple pages or sections.

```text
apps/client/src/features/{feature}/
  api/
  queries/
  mutations/
  hooks/
  types.ts
```

## Shared Boundary

Keep `apps/client/src/shared/api` low-level:

- `apiClient`
- `request`
- `ApiError`
- response envelope types

Do not put page-specific endpoint functions, query keys, mutations, route params, or UI transforms in `shared/api` before reuse exists.

## Import Rules

- Use `@/` alias inside `apps/client/src`.
- Same-folder `index.ts` barrels can use relative exports.
- HDS packages must not import API, query, mutation, route, analytics, or product domain data.
