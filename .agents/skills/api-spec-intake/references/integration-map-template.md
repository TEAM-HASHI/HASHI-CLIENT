# API Integration Map Template

Use this shape in the working notes or target page spec. Keep it concise and implementation-facing.

```markdown
# API Integration Map

## Target

- Page or feature:
- Existing mock/source file:
- Route params:
- Search params:
- Required auth:

## Source Docs

- Swagger/OpenAPI:
- API spec:
- Notes:

## Queries

| UI area | Endpoint   | Params | Response data | Query key                    | Mode                    | Enabled | States              |
| ------- | ---------- | ------ | ------------- | ---------------------------- | ----------------------- | ------- | ------------------- |
|         | `GET /...` |        |               | `domainQueryKeys.detail(id)` | suspense/query/infinite |         | loading/error/empty |

## Mutations

| Action | Endpoint    | Body | Success UI | Error UI | Invalidate  |
| ------ | ----------- | ---- | ---------- | -------- | ----------- |
|        | `POST /...` |      |            |          | list/detail |

## Type Mapping

| API field | UI use | Nullable | Transform |
| --------- | ------ | -------- | --------- |
|           |        | yes/no   |           |

## Missing Questions

- None, or list blocking questions.
```

## Mode Values

- `suspense`: page-entry required data with route-level fallback.
- `query`: conditional, filter/search, partial state, placeholder, or manual refetch data.
- `infinite`: paginated list with `fetchNextPage`.

## Completion Rule

The map is complete only when every query and mutation has an endpoint, UI state behavior, and invalidation decision.
