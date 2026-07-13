# Codex Hooks

이 문서는 HASHI Client repo-local Codex hook 운영 기준을 정리합니다.

## Location

Codex hook 설정은 repo-local `.codex/hooks.json`에 둡니다.

```text
.codex/hooks.json
.codex/hooks/session_start_primer.py
.codex/hooks/pre_tool_use_bash_guard.py
```

Repo-local hook은 프로젝트 `.codex/` layer가 trusted 상태일 때 실행됩니다.
새 hook 또는 변경된 hook은 Codex에서 `/hooks`를 열어 review/trust 해야 합니다.

## SessionStart Primer

`SessionStart` hook은 `startup|resume|clear|compact`에서 실행됩니다.

목적은 문서 전체를 매번 주입하는 것이 아니라, 작업 시작 시 필요한 최소 프로젝트 기준을 추가 context로 제공하는 것입니다.

주입하는 기준:

- `pnpm`만 사용합니다.
- 작업 전 `AGENTS.md`로 작업 유형을 분류합니다.
- 변경 전 `git status --short --branch --untracked-files=all`을 확인합니다.
- `docs/`는 사람이 읽는 source of truth이고, `.agents/`는 실행 checklist, recipe, skill, script입니다.
- 작업 유형별 필요한 문서만 추가로 읽습니다.
- page, shared component, hook, API query/mutation, HDS 작업은 `*.spec.md` 필요 여부를 확인합니다.
- Swagger/API spec 기반 API query/mutation 작업은 `api-spec-intake -> api-integrator -> verify-api-integration` 순서로 처리합니다.
- HDS package에는 app route, API, query, mutation, tracking, product copy, domain data를 넣지 않습니다.
- 최종 응답에는 문서 영향과 검증 결과를 포함합니다.

## Bash Guard

`PreToolUse` hook은 `Bash` 실행 전에 위험하거나 repo 규칙과 맞지 않는 명령을 차단합니다.

차단 대상:

- `git reset --hard`
- `git checkout --`
- `git clean`에 force와 directory flag가 함께 있는 명령
- `git push --force`, `git push --force-with-lease`, `git push -f`
- `rm`에 recursive와 force flag가 함께 있는 명령
- `npm`, `npx`, `yarn`, `bun`, `bunx`
- `pnpm add`인데 `--filter`/`-F` 또는 `-w`/`--workspace-root`가 없는 명령

Dependency를 추가할 때는 workspace를 명시합니다.

```bash
pnpm --filter @hashi/client add package-name
pnpm --filter @hashi/hds-ui add package-name
pnpm add -D -w package-name
```

## Limit

이 hook은 agent 실수 방지용 guardrail입니다.
Codex `PreToolUse`가 모든 shell 실행 경로를 완전히 가로채는 보안 경계는 아닙니다.
파괴적인 작업이나 예외적인 Git 작업은 사람이 의도를 명확히 확인한 뒤 별도 명령으로 수행합니다.

API 연동 품질 검사는 hook이 아니라 `.agents/skills/verify-api-integration`에서 수행합니다.
query key, Suspense query 선택, mutation cache synchronization, UI state 같은 판단은 코드 문맥이 필요하므로 lifecycle hook으로 차단하지 않습니다.
