# Agent Harness

이 디렉터리는 HASHI Client에서 Codex와 다른 coding agent가 작업 전후에 읽는 실행 하네스입니다.

`docs`가 사람이 읽는 source of truth라면, `.agents`는 agent가 그 규칙을 실제 작업에 적용하기 위한 checklist, recipe, skill, script를 담습니다.

## Entry

Agent는 작업을 시작할 때 아래 순서로 필요한 문서만 확인합니다.

1. `AGENTS.md`
2. 작업 유형에 맞는 `docs/` 문서
3. `checklists/pre-work.md`
4. 필요한 경우 `recipes/*`
5. 작업 후 `checklists/verification.md`
6. 최종 응답 전 `checklists/final-report.md`

## Structure

| Path          | Purpose                                                  |
| ------------- | -------------------------------------------------------- |
| `checklists/` | 작업 전, 검증, 최종 보고 시 빠르게 확인할 항목           |
| `recipes/`    | page, HDS component, API integration 같은 반복 작업 절차 |
| `skills/`     | repo-scoped Codex skill                                  |
| `scripts/`    | 하네스와 문서 경로를 확인하는 보조 스크립트              |

## Source Of Truth Rule

- 팀 규칙 원문은 `docs/`에 둡니다.
- `.agents`에는 AI가 실행할 순서와 확인 기준만 둡니다.
- `.agents`와 `docs` 내용이 다르면 `docs`를 먼저 고치고, `.agents`는 그 규칙을 참조하도록 정리합니다.
- 반복적으로 놓치는 항목은 checklist -> recipe -> skill -> script/CI 순서로 승격합니다.

## Current Skills

- `manage-skills`: verify skill 커버리지와 stale reference를 점검합니다.
- `verify-implementation`: 등록된 `verify-*` skill을 순차 실행합니다.

현재 등록된 `verify-*` skill은 없습니다. 후보는 `docs/agent/skills.md`를 기준으로 관리합니다.
