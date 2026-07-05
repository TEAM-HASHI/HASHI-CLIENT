# Pre-work Checklist

작업 시작 전에 변경 범위와 읽어야 할 문서를 좁힙니다.

## Required

- Jira key와 작업 Type을 확인합니다.
- 현재 브랜치가 작업용 브랜치인지 확인합니다.
- `git status --short --branch --untracked-files=all`로 작업트리를 확인합니다.
- 변경이 `apps/client`, `packages/hds-ui`, `packages/hds-icons`, `configs`, `turbo`, `docs`, `.agents` 중 어디에 속하는지 분류합니다.
- 변경 범위에 맞는 `docs/conventions`, `docs/architecture`, `docs/workflows`, `docs/rules` 문서를 확인합니다.
- 구현 기준 spec이 필요한 작업인지 `docs/workflows/spec-writing.md` 기준으로 판단합니다.

## Routing

| Work type                | Read first                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jira, branch, commit, PR | `docs/conventions/jira-ticket.md`, `docs/conventions/git.md`, `.agents/recipes/jira-branch-pr.md`                                                           |
| Page or route            | `docs/architecture/app-structure.md`, `docs/architecture/routing-and-access-policy.md`, `docs/workflows/spec-writing.md`, `.agents/recipes/page-feature.md` |
| API query or mutation    | `docs/architecture/data-layer.md`, `.agents/recipes/api-integration.md`                                                                                     |
| Form or state flow       | `docs/conventions/coding.md`, `docs/workflows/spec-writing.md`, `.agents/recipes/form-flow.md`                                                              |
| HDS component            | `packages/AGENTS.md`, `docs/rules/design-system-instructions.md`, `.agents/recipes/hds-component.md`                                                        |
| Generator                | `docs/workflows/turbo-generators.md`                                                                                                                        |
| Agent harness            | `AGENTS.md`, `docs/agent/skills.md`, `.agents/README.md`                                                                                                    |

## Stop And Clarify

- Jira key, target package, or source design/spec이 없어서 임의 판단이 필요한 경우
- `docs`와 실제 repository 설정이 서로 다르게 보이는 경우
- 기존 코드와 충돌하는 새 규칙을 추가해야 하는 경우
