# Verification Checklist

변경 범위에 맞는 검증만 실행하고, 실행하지 않은 검증은 최종 요약에 이유를 남깁니다.

`apps/client/**` 코드 변경은 먼저 `docs/workflows/testing.md`로 테스트 필수 여부를 판단합니다. 테스트가 필수인 변경은 해당 동작을 재현하는 자동 테스트와 실행 결과를 남기고, 필수가 아닌 변경은 수동 확인 항목을 PR `Verification`에 적습니다.

## Before Commit And Push

- 커밋을 요청받으면 변경 범위에 맞는 아래 검증을 먼저 완료하고, 실행 명령과 결과를 보고합니다. 검증 후 코드가 바뀌면 영향받는 검증을 다시 실행합니다.
- `pre-commit`은 스테이징된 파일의 ESLint 및 Prettier 자동 수정만 실행합니다. 타입 검사, 테스트, 빌드 통과를 보장하지 않습니다.
- 푸시 전에는 `pre-push`가 아래 통합 명령을 자동 실행합니다. 커밋 전에 전체 검증할 때도 같은 명령을 사용합니다.

```bash
pnpm verify
```

포맷 → 전체 워크스페이스 린트 → 타입 검사 → 클라이언트·HDS 테스트 → 전체 워크스페이스 빌드 순서로 실행하며, 하나라도 실패하면 이후 검증과 푸시를 중단합니다. 자동 수정하지 않으므로 오류를 수정하고 다시 실행합니다. 기존 Turbo 캐시 정책은 유지합니다.

- Node.js 22와 저장소에 지정된 pnpm을 사용합니다. 의존성 설치 시 `pnpm install --frozen-lockfile`을 실행하고, 훅이 연결되지 않았다면 `pnpm exec husky`로 설정합니다.
- 터미널에서는 통과하지만 훅에서 실패하면 `${XDG_CONFIG_HOME:-$HOME/.config}/husky/init.sh`의 PATH 설정을 확인합니다. 사용자 초기화가 Homebrew 등의 경로를 앞에 추가하면 선택한 Node 버전이 바뀔 수 있으므로 훅에서도 CI와 같은 Node.js 22를 사용하도록 환경을 맞춥니다.
- 검증은 현재 작업 디렉터리 기준입니다. 미커밋 변경이 있으면 푸시할 커밋과 검증 대상이 다를 수 있으므로 `git status`로 확인합니다.
- 로컬 통과와 원격 CI 통과는 구분합니다. CI 보조 스크립트 테스트, E2E, Lighthouse, Chromatic, 배포 검증은 통합 명령에 포함되지 않습니다. 관련 변경은 추가 검증하고 푸시 후 원격 체크를 확인합니다.
- `--no-verify`나 `HUSKY=0`으로 검증을 우회하지 않습니다.

## Documentation Or Harness Only

```bash
pnpm format:check
git diff --check
bash .agents/scripts/check-harness.sh
```

## App Or Package Code

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## Design System

```bash
pnpm --filter @hashi/hds-ui lint
pnpm --filter @hashi/hds-ui typecheck
pnpm --filter @hashi/hds-ui build
pnpm --filter @hashi/hds-ui test
pnpm build-storybook
```

## Client UI Flow

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client build
pnpm --filter @hashi/client test
```

## Client API Integration

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client test
pnpm --filter @hashi/client build
```

Manual verification:

- query key factory is used instead of inline query keys.
- mutation cache synchronization uses `setQueryData`, invalidation, or both according to response completeness and UI flow.
- loading, error, empty, disabled, and success states are connected.
- page spec `Data Dependencies` matches the implementation.

E2E가 필요한 변경이면 다음 명령을 추가합니다.

```bash
pnpm test:e2e
```

## Dependency Or Config

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
```

## Manual Checks

- UI 변경은 주요 viewport에서 깨짐, overflow, loading, error, empty, disabled 상태를 확인합니다.
- Storybook 변경은 필요한 story와 Chromatic 영향 범위를 확인합니다.
- 문서 영향이 있는 변경은 `README.md`, `AGENTS.md`, `docs/`, `.agents` 갱신 여부를 확인합니다.
