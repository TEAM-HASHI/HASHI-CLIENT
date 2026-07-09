---
name: api-spec-intake
description: Use when Swagger, OpenAPI, backend API specs, endpoint tables, or API documentation must be mapped to HASHI client pages, queries, mutations, UI states, and missing implementation questions before coding.
---

# API Spec Intake

## Overview

Convert backend API material into a concrete API Integration Map before implementation.
Use this skill before `api-integrator` when the user provides Swagger/OpenAPI, endpoint docs, or prose API specs.

## Read First

- `docs/architecture/data-layer.md`
- `docs/architecture/app-structure.md`
- `docs/workflows/api-integration.md`
- Target page or feature `*.spec.md`, when present
- User-provided Swagger/OpenAPI/API spec material

If the user provides an OpenAPI JSON/YAML file or URL, optionally run:

```bash
node .agents/scripts/summarize-openapi.mjs <path-or-url>
```

## Workflow

1. Identify target pages, features, route params, search params, and existing mock data.
2. Extract endpoints, methods, params, request bodies, response shapes, status codes, auth assumptions, pagination shape, and nullable fields.
3. Classify each operation as query, infinite query, mutation, or non-client concern.
4. Map each operation to UI states: initial loading, background fetching, empty, error, disabled, success, and optimistic state if explicitly required.
5. Propose query key factory names, enabled conditions, and invalidation targets.
6. Write an API Integration Map using `references/integration-map-template.md`.
7. Stop and ask if required implementation data is missing.

## Reference Routing

- For accepted API input formats, read `references/swagger-inputs.md`.
- For the output shape, read `references/integration-map-template.md`.
- For implementation blockers, read `references/missing-info-checklist.md`.

## Handoff

Pass the completed API Integration Map to `api-integrator`.
If the map changes page behavior, update the target page spec `Data Dependencies` section during implementation.
