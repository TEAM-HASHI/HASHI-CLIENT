# Swagger And OpenAPI Inputs

## Accepted Inputs

Use the most structured source available.

| Input                           | Handling                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| OpenAPI JSON file               | Run `node .agents/scripts/summarize-openapi.mjs <file>` and inspect referenced schemas. |
| OpenAPI YAML file               | Run the same summary command.                                                           |
| OpenAPI URL                     | Run the summary command if the URL returns raw JSON/YAML.                               |
| Swagger UI URL                  | Inspect the page or ask for the raw OpenAPI URL if endpoint schemas are hidden.         |
| Markdown/Notion/Confluence spec | Extract endpoint tables and compare with page behavior.                                 |
| Screenshot or prose only        | Treat as incomplete and list missing implementation questions.                          |

## Extraction Targets

For each operation, capture:

- method and path
- operationId or stable local name
- auth requirement
- path params, query params, and request body
- success response data shape
- error response shape when specified
- pagination fields such as `page`, `size`, `cursor`, `nextCursor`, `hasNext`
- nullable or optional fields that affect UI
- backend state transitions that affect invalidation

## Naming

- Use product domain names from the current page/feature, not backend abbreviations.
- Prefer local names like `getReservationDetail`, `getMyReservations`, `cancelReservation`.
- Do not preserve unclear operation names if a clearer frontend name exists.

## When To Stop

Stop before implementation when:

- the endpoint path or method is uncertain
- required auth/session behavior is unspecified
- pagination response cannot identify the next page
- mutation success does not say which query data becomes stale
- the UI requires a field missing from the documented response
- the response shape conflicts between Swagger and the written API spec
