# Agent Skills

Repo-scoped Codex skills live in `.agents/skills`.

## Harness Boundary

- `docs` contains human-readable source of truth.
- `.agents` contains agent-facing execution helpers: checklists, recipes, skills, and scripts.
- A skill should reference `docs` instead of duplicating full team rules.
- Repeated checklist items can be promoted to recipe, skill, script, and eventually CI when the rule becomes stable.

## Registered Skills

| Skill                      | Purpose                                                                                           | Status |
| -------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| `page-creator`             | Guides spec-first client page scaffolding, page/component boundaries, and page verification.      | Active |
| `hds-storybook-creator`    | Guides HDS Storybook story authoring, story states, args, controls, and Storybook verification.   | Active |
| `hds-component-creator`    | Guides HDS component and icon creation through package boundaries, docs, exports, and checks.     | Active |
| `api-spec-intake`          | Maps Swagger/OpenAPI/API specs to page or feature API Integration Maps before implementation.     | Active |
| `openapi-typescript-setup` | Guides OpenAPI type generation, schema URL handling, generated type usage, and verification.      | Active |
| `api-integrator`           | Guides HASHI client API query, mutation, query key, invalidation, and UI state implementation.    | Active |
| `verify-api-integration`   | Verifies API integration boundaries, query keys, query mode, invalidation, UI states, and docs.   | Active |
| `manage-skills`            | Audits changed files for verify-skill coverage gaps and keeps verify skill metadata synchronized. | Active |
| `verify-implementation`    | Runs registered `verify-*` skills and produces an integrated verification report.                 | Active |

## Verify Skills

| Skill                    | Purpose                                                                                          | Covered files                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `verify-api-integration` | Checks HASHI client API query, mutation, query key, invalidation, UI state, and docs sync rules. | `apps/client/src/pages`, `apps/client/src/features`, `apps/client/src/shared/api` |

## Candidate Verify Skills

| Candidate                        | Purpose                                                                                         | Trigger                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------- |
| `verify-docs-sync`               | Checks whether code, config, dependency, script, or folder changes require `docs` updates.      | Broad repo changes before PR          |
| `verify-design-system-storybook` | Checks HDS component stories, public exports, interaction states, and Storybook build coverage. | `packages/hds-ui` changes             |
| `verify-workspace-boundaries`    | Checks app/package/config boundaries and prevents product logic from leaking into HDS packages. | `apps`, `packages`, `configs` changes |
| `verify-agent-harness`           | Checks `.agents`, `AGENTS.md`, and `docs/agent` links and required harness files.               | Agent harness changes                 |

## Skill Boundaries

- `page-creator`는 client page scaffold, page spec 작성, page-local/shared/HDS component 경계 판단, 페이지 검증 선택 기준을 담당합니다.
- `hds-storybook-creator`는 HDS Storybook story 작성, story 상태, controls, interaction 예시, Storybook 검증 기준을 담당합니다.
- `hds-component-creator`는 HDS package boundary, generator scaffold flow, public exports, HDS 검증 선택 기준을 담당합니다.
- `api-spec-intake`는 Swagger/OpenAPI/API 스펙을 구현 가능한 Integration Map으로 정리하는 일을 담당합니다.
- `openapi-typescript-setup`은 OpenAPI 타입 생성 script, schema URL 보안, generated type 사용법, 관련 검증을 담당합니다.
- `api-integrator`는 Integration Map을 기준으로 endpoint, query key factory, query/mutation hook, invalidation, UI state 연결을 담당합니다.
- `verify-api-integration`은 API 연동 결과의 boundary, query key, query mode, invalidation, UI state, docs sync를 점검합니다.
- HDS component의 source of truth는 디자인시스템 문서와 구현 대상 옆의 component spec입니다.

When a verify skill is added, update:

- `.agents/skills/manage-skills/SKILL.md`
- `.agents/skills/verify-implementation/SKILL.md`
- this document

## Harness Files

| Path                                               | Purpose                                  |
| -------------------------------------------------- | ---------------------------------------- |
| `.agents/README.md`                                | Agent harness entry map                  |
| `.agents/checklists/pre-work.md`                   | Pre-work routing and scope checklist     |
| `.agents/checklists/verification.md`               | Verification command selection           |
| `.agents/checklists/final-report.md`               | Final summary checklist                  |
| `.agents/recipes/*`                                | Repeatable frontend workflow recipes     |
| `.agents/skills/page-creator/SKILL.md`             | Client page creation workflow            |
| `.agents/skills/hds-storybook-creator/SKILL.md`    | HDS Storybook story workflow             |
| `.agents/skills/hds-component-creator/SKILL.md`    | HDS component and icon creation workflow |
| `.agents/skills/api-spec-intake/SKILL.md`          | Swagger/API spec intake workflow         |
| `.agents/skills/openapi-typescript-setup/SKILL.md` | OpenAPI type generation setup workflow   |
| `.agents/skills/api-integrator/SKILL.md`           | Client API implementation workflow       |
| `.agents/skills/verify-api-integration/SKILL.md`   | API integration verification workflow    |
| `.agents/scripts/check-harness.sh`                 | Lightweight harness path check           |
| `.agents/scripts/summarize-openapi.mjs`            | OpenAPI JSON/YAML endpoint summary       |

## Notes

- Skills must use lowercase kebab-case names.
- Skill frontmatter should only include `name` and `description`.
- HASHI repo skills should use `.agents/skills`.
- Use `allow_implicit_invocation: false` in `agents/openai.yaml` for skills that should run only when explicitly requested.
