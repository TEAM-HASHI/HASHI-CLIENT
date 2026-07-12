# Generated Admin API Types

The admin console keeps write and public-read/upload contracts separate:

- `openapi.ts`: generated from the backend `admin` OpenAPI group
- `user-openapi.ts`: generated from the backend `user` OpenAPI group

```bash
pnpm gen:admin-api-types
pnpm gen:admin-user-api-types
pnpm gen:admin-all-api-types
```

Set `ADMIN_OPENAPI_SCHEMA_URL` and `USER_OPENAPI_SCHEMA_URL` in your shell or in
`apps/admin/.env.openapi.local`. Each URL must point to raw OpenAPI JSON/YAML,
not Swagger UI HTML.

Do not edit generated type files by hand. Update the backend schema or generation script instead.
