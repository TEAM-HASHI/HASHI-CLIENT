# Serena MCP

이 문서는 HASHI Client에서 Serena MCP를 Codex/agent 보조 도구로 사용할 때의 범위와 운영 기준을 정리합니다.

## What Is Serena?

Serena는 AI coding agent에 IDE와 비슷한 semantic code navigation 기능을 제공하는 MCP toolkit입니다.

일반적인 `rg`, `sed`, 파일 전체 읽기 방식은 텍스트 기준으로 코드를 찾습니다.
Serena는 language server 또는 JetBrains backend를 사용해 symbol, reference, declaration, diagnostics 같은 코드 의미 단위로 탐색합니다.

정확히 말하면 Serena는 다음이 아닙니다.

- LLM model이 아닙니다.
- Codex를 대체하는 도구가 아닙니다.
- HASHI의 npm/pnpm dependency가 아닙니다.
- Jira, Figma, spec, repo 문서를 대체하는 source of truth가 아닙니다.

Serena는 Codex가 코드를 더 적은 context로 정확하게 읽고 이동할 수 있게 해주는 보조 MCP server입니다.

## Decision

Serena MCP는 **제한적 팀 공용 운영 기준**으로 둡니다.

- Serena는 repo dependency로 추가하지 않습니다.
- Codex MCP server 등록은 각 개발자의 로컬 `~/.codex/config.toml`에 둡니다.
- 현재 PR에서는 `.serena/project.yml`을 커밋하지 않습니다.
- 기본 사용 목적은 semantic navigation, symbol/reference 탐색, diagnostics입니다.
- 파일 수정은 기존 Codex editing flow와 `apply_patch`가 계속 책임집니다.
- Serena memory는 repo 문서, Jira, Figma, spec의 대체 source of truth로 쓰지 않습니다.

## Why Use It?

Serena가 유용한 경우:

- 컴포넌트, hook, type, utility의 symbol overview 확인
- 특정 symbol의 reference 탐색
- rename/refactor 전 영향 범위 조사
- page-local component와 shared/design-system component 사이의 호출 관계 파악
- TypeScript/React 변경 후 diagnostics 확인
- 큰 파일을 통째로 읽기 전에 필요한 symbol만 좁혀서 확인

기존 도구를 계속 우선할 작업:

- 단순 문자열 검색: `rg`
- 파일 일부 읽기: `sed`, `nl`
- 실제 파일 수정: `apply_patch`
- 포맷/검증: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`
- Jira/Figma/spec 판단: Jira, Figma, `docs/`, co-located `*.spec.md`, `.agents/skills/`

## Local Installation

Serena는 각 개발자 로컬 도구로 설치합니다.
`uv`가 없다면 먼저 uv를 설치합니다.

```bash
uv tool install -p 3.13 serena-agent
serena init
serena setup codex
```

설치 후 확인:

```bash
serena --help
serena --version
```

Codex 세션 안에서는 `/mcp`로 `serena` 연결 여부를 확인합니다.

```text
/mcp
```

## Codex MCP Config

`serena setup codex`를 쓰지 않고 직접 설정할 경우, 각 개발자의 `~/.codex/config.toml`에 아래 설정을 추가합니다.

```toml
[mcp_servers.serena]
startup_timeout_sec = 15
command = "serena"
args = ["start-mcp-server", "--project-from-cwd", "--context=codex"]
```

Codex App이나 global MCP config에서는 세션이 항상 프로젝트 디렉터리에서 시작되지 않을 수 있습니다.
이 경우 세션 초기에 현재 repo를 Serena project로 활성화해야 할 수 있습니다.

```text
Activate the current dir as project using serena.
```

## Project Config Policy

현재 HASHI repo에는 `.serena/project.yml`을 커밋하지 않습니다.

팀에서 Serena를 지속적으로 쓰기로 확정하면 별도 티켓에서 `.serena/project.yml`을 추가합니다.
그때의 기본 원칙은 다음과 같습니다.

- `project_name: "HASHI-CLIENT"`
- `languages: ["typescript"]`
- `language_backend: LSP`
- `ignore_all_files_in_gitignore: true`
- `read_only: true`
- `.serena/project.yml` 외 runtime data는 커밋하지 않음

`.serena/project.yml`을 추가하더라도 Serena memory, cache, log, dashboard runtime data는 repo에 포함하지 않습니다.

## HASHI Usage Rules

- Serena는 코드 이해와 영향 범위 파악에 우선 사용합니다.
- Serena로 얻은 판단은 관련 코드, spec, 문서와 다시 대조합니다.
- 구현 기준 spec이 있으면 Serena memory보다 co-located `*.spec.md`를 우선합니다.
- 디자인시스템 구현 기준은 [Design System Instructions](../rules/design-system-instructions.md)를 우선합니다.
- 문서 동기화 기준은 [AGENTS.md](../../AGENTS.md)의 문서 동기화 규칙을 따릅니다.
- Serena가 특정 symbol을 찾지 못하면 기존 `rg`와 파일 읽기 방식으로 확인합니다.

## Security Rules

- Serena MCP server는 stdio 또는 localhost 연결만 사용합니다.
- Serena Dashboard와 HTTP/SSE endpoint를 외부 네트워크에 노출하지 않습니다.
- language server dependency 자동 설치가 발생할 수 있으므로 최초 실행 시 package manager prompt와 네트워크 접근을 확인합니다.
- Serena의 shell 실행, broad file write, 대량 자동 수정 도구를 기본 workflow로 쓰지 않습니다.
- 민감 정보가 들어갈 수 있는 Serena memory는 팀 source of truth로 쓰지 않습니다.
- 문제가 생기면 Serena를 끄고 기존 `rg`, 파일 읽기, repo workflow로 되돌립니다.

## Verification Checklist

로컬 설치 확인:

```bash
uv --version
serena --help
serena --version
```

Codex MCP 등록 확인:

```bash
codex mcp get serena
```

확인 기준:

- `enabled: true`
- `transport: stdio`
- `command: serena`
- `args`에 `start-mcp-server`, `--context=codex`, `--project-from-cwd` 포함

문서 변경 검증:

```bash
pnpm format:check
git diff --check
```

## References

- [Serena GitHub](https://github.com/oraios/serena)
- [Serena Documentation](https://oraios.github.io/serena/)
- [About Serena](https://oraios.github.io/serena/01-about/000_intro.html)
- [Installation](https://oraios.github.io/serena/02-usage/010_installation.html)
- [Connecting Your MCP Client](https://oraios.github.io/serena/02-usage/030_clients.html)
- [Security Considerations](https://oraios.github.io/serena/02-usage/070_security.html)
