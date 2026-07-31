# Verification Checklist

변경 범위에 맞는 검증만 실행하고, 실행하지 않은 검증은 최종 요약에 이유를 남깁니다.

`apps/client/**` 코드 변경은 먼저 `docs/workflows/testing.md`로 테스트 필수 여부를 판단합니다. 테스트가 필수인 변경은 해당 동작을 재현하는 자동 테스트와 실행 결과를 남기고, 필수가 아닌 변경은 수동 확인 항목을 PR `Verification`에 적습니다.

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
