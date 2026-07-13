# Missing Information Checklist

Ask before coding when a missing value changes behavior or file structure.

## Endpoint

- Missing path, method, path param name, or required query param.
- UI needs a field absent from the response.
- API spec and Swagger disagree.

## Auth

- Endpoint requires auth but token/header/session source is not defined.
- Guest-access behavior differs from the current route guard.

## Query Behavior

- Query depends on route/search/form state but enabled condition is unclear.
- Search/filter behavior needs previous data retained but no UX decision exists.
- Empty response shape is unclear.

## Infinite Query

- Response lacks `nextCursor`, `hasNext`, `page`, `totalPages`, or equivalent.
- Sort/filter params that define the list are not documented.
- The API supports both page and cursor but the target UI requires one.

## Mutation

- Success response does not state whether list/detail data changes.
- Success response does not state whether the returned entity is complete and current enough for `setQueryData`.
- Error codes are needed for field-level messages but not documented.
- Optimistic update is requested without a rollback rule.

## Types

- Nullable fields affect visible UI but null handling is unspecified.
- Numeric/date/string formats are not stable enough for UI formatting.
