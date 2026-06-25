# AGENTS.md

이 파일은 상세 규칙을 직접 담는 문서가 아니라, Codex와 agent가 프로젝트 문서를 찾기 위한 루트 라우팅 허브입니다.

## 저장소 정체

- Package manager: `pnpm`
- App: `apps/client`
- Shared packages: `packages/sds-ui`, `packages/sds-icons`
- Shared config: `configs/tsconfig`
- Generator: `turbo/generators`

## 기본 순서

`User Request -> AGENTS.md -> 작업 유형 판단 -> 필요한 docs 확인 -> implementation -> verification -> final summary`

## 문서 역할

- `docs/`는 사람이 읽는 source of truth입니다.
- `.agents/`는 agent가 `docs/` 규칙을 실행하기 위한 checklist, recipe, skill, script를 둡니다.
- `.agents/`와 `docs/` 내용이 충돌하면 `docs/`를 먼저 갱신하고 `.agents/`는 실행 지침만 맞춥니다.

## 문서 라우팅

- 프로젝트 개요, 기술 스택, 주요 문서 링크는 `README.md`를 확인합니다.
- 코딩, Git, 패키지 관리 규칙은 `docs/conventions/`를 확인합니다.
- Codex, MCP, hook, agent 운영 문서는 `docs/agent/`에 둡니다.
- 반드시 지켜야 하는 개발 규칙은 `docs/rules/`에 둡니다.
- Jira, PR, generator, 검증 절차 같은 반복 작업 문서는 `docs/workflows/`에 둡니다.
- spec template은 `docs/workflows/spec-templates/`에서 확인하고, 실제 구현 기준 spec은 구현 대상과 같은 폴더의 `*.spec.md`를 우선 확인합니다.
- 앱, 패키지, 레이어, 모듈 경계 같은 구조 판단은 `docs/architecture/`를 확인합니다.
- repo-scoped Codex skill은 `.agents/skills/`에 둡니다.
- repo-scoped Codex skill 목록과 운영 기준은 `docs/agent/skills.md`를 확인합니다.
- agent 실행 하네스 구조는 `.agents/README.md`를 확인합니다.
- 작업 전후 agent checklist는 `.agents/checklists/`를 확인합니다.
- 반복 구현 절차는 `.agents/recipes/`를 확인합니다.
- agent 보조 검증 스크립트는 `.agents/scripts/`에 둡니다.
- project-scoped custom subagent 설정은 `.codex/agents/`에 둡니다.

## 작업 유형별 라우팅

| 작업 유형                | 먼저 볼 문서                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Jira, branch, commit, PR | `docs/conventions/jira-ticket.md`, `docs/conventions/git.md`, `.agents/recipes/jira-branch-pr.md`         |
| page 또는 route          | `docs/architecture/app-structure.md`, `docs/workflows/spec-writing.md`, `.agents/recipes/page-feature.md` |
| API query 또는 mutation  | `docs/architecture/data-layer.md`, `.agents/recipes/api-integration.md`                                   |
| form 또는 state flow     | `docs/conventions/coding.md`, `docs/workflows/spec-writing.md`, `.agents/recipes/form-flow.md`            |
| SDS component            | `docs/rules/design-system-instructions.md`, `.agents/recipes/sds-component.md`                            |
| generator                | `docs/workflows/turbo-generators.md`                                                                      |
| agent harness            | `docs/agent/skills.md`, `.agents/README.md`                                                               |

아직 라우팅 대상 파일이 없는 작업은 현재 코드와 저장소 설정을 먼저 확인하고, 가장 가까운 `docs/` 하위 문서를 참고합니다.

## 작업 기준

- 문서가 비어 있으면 기존 코드와 현재 저장소 설정을 먼저 확인하고 추측하지 않습니다.
- 패키지 매니저, 브랜치, PR, 코드 스타일 같은 상세 규칙은 이 파일에 중복 작성하지 않습니다.
- 새 규칙이 필요하면 적절한 `docs/` 하위 문서에 추가하고 이 파일은 라우팅만 유지합니다.

## 문서 동기화

- 코드, 설정, 의존성, 스크립트, 폴더 구조, 아키텍처 경계를 변경하면 관련 문서를 함께 확인합니다.
- 변경이 `README.md`, `AGENTS.md`, `docs/conventions/`, `docs/architecture/`, `docs/workflows/`, `docs/rules/`에 영향을 주는지 판단합니다.
- 문서 변경이 필요하면 같은 작업 안에서 함께 갱신합니다.
- 기술 스택 문서는 실제 설치 상태와 도입 예정 상태를 구분합니다.
- 설치되지 않은 도구를 `Current`로 적지 않고, `Planned` 또는 `Deferred`로 표시합니다.
- 문서 변경이 필요 없다고 판단하면 final summary에 문서 영향이 없다고 명시합니다.
