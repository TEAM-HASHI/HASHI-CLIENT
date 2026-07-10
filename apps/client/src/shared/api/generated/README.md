# Generated API Types

`openapi.ts` is generated from the backend OpenAPI schema.

```bash
pnpm gen:api-types
```

Set `OPENAPI_SCHEMA_URL` in your shell or in `apps/client/.env.openapi.local`.
The URL must point to raw OpenAPI JSON/YAML, not Swagger UI HTML.

Do not edit generated type files by hand. Update the backend schema or generation script instead.
