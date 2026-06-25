# Local Development

이 문서는 HASHI Client를 로컬에서 실행하고 변경 범위에 맞게 검증하는 기준을 정리합니다.

## Install

```bash
pnpm install
```

lockfile 기준 설치가 필요한 경우:

```bash
pnpm install --frozen-lockfile
```

## Dev Server

전체 dev script는 client app을 실행합니다.

```bash
pnpm dev
```

직접 app workspace를 지정할 수도 있습니다.

```bash
pnpm --filter @siksa/client dev
```

preview:

```bash
pnpm preview
pnpm --filter @siksa/client preview
```

## Quality Checks

기본 검증:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

테스트:

```bash
pnpm test
pnpm test:e2e
```

문서만 변경한 경우:

```bash
pnpm format:check
git diff --check
bash .agents/scripts/check-harness.sh
```

workspace 단위 검증:

```bash
pnpm --filter @siksa/client lint
pnpm --filter @siksa/client typecheck
pnpm --filter @siksa/client build

pnpm --filter @siksa/sds-ui lint
pnpm --filter @siksa/sds-ui typecheck
pnpm --filter @siksa/sds-ui build

pnpm --filter @siksa/sds-icons lint
pnpm --filter @siksa/sds-icons typecheck
pnpm --filter @siksa/sds-icons build
```

## Generator

반복 scaffold는 root script를 우선 사용합니다.

```bash
pnpm gen:page
pnpm gen:component
pnpm gen:hook
pnpm gen:ds-component
```

자세한 기준은 [Turbo Generators](./turbo-generators.md)를 따릅니다.

## Storybook

SDS UI 문서화와 시각 확인은 Storybook을 사용합니다.

```bash
pnpm storybook
pnpm build-storybook
```

## Icon Generation

SDS icon은 SVGR 기반 generator를 사용합니다.

```bash
pnpm --filter @siksa/sds-icons gen:icons
```

## Practical Rule

- 문서만 바꾼 경우 full build 대신 Markdown format과 `git diff --check`를 우선할 수 있습니다.
- 코드, package, config, generator가 바뀐 경우 관련 quality check를 실행합니다.
- dependency가 바뀐 경우 `pnpm-lock.yaml` 변경을 함께 확인합니다.
- UI 변경은 가능한 경우 screenshot 또는 수동 확인 결과를 PR에 남깁니다.
