# Monorepo

SIKSA Client는 pnpm workspace와 Turborepo를 사용하는 프론트엔드 모노레포입니다.
목표 기술 스택과 현재 도입 상태는 [Tech Stack](./tech-stack.md)을 기준으로 확인합니다.

## Workspace Layout

```text
apps/
  client/      SIKSA 웹 클라이언트 앱

packages/
  sds-ui/      SIKSA Design System UI 컴포넌트
  sds-icons/   SIKSA Design System Icon 컴포넌트

configs/
  tsconfig/    공통 TypeScript 설정

turbo/
  generators/  turbo gen scaffold 정의와 템플릿
```

## Root Responsibilities

- workspace 등록과 전체 실행용 script는 루트 `package.json`에서 관리합니다.
- package version catalog는 `pnpm-workspace.yaml`에서 관리합니다.
- task graph는 `turbo.json`에서 관리합니다.
- root ESLint config는 저장소 공통 lint entry로 유지합니다.
- lockfile은 루트 `pnpm-lock.yaml` 하나만 사용합니다.

## Script Ownership

- app/package가 스스로 실행해야 하는 명령은 해당 workspace `package.json`에 둡니다.
- root `package.json`은 전체 실행, Turbo orchestration, generator wrapper를 담당합니다.
- root script가 특정 package의 내부 파일 경로를 직접 많이 알게 만들지 않습니다.
- 특정 workspace 명령을 직접 실행할 때는 `pnpm --filter <workspace>`를 사용합니다.

Examples:

```bash
pnpm --filter @siksa/client dev
pnpm --filter @siksa/client lint
pnpm --filter @siksa/sds-ui typecheck
pnpm --filter @siksa/sds-icons build
```

## App And Package Boundary

- `apps/client`는 제품 실행 단위입니다.
- `packages/sds-ui`는 제품 의미가 없는 UI primitive만 담습니다.
- `packages/sds-icons`는 제품 의미가 없는 icon component만 담습니다.
- `configs/tsconfig`는 공유 TypeScript 설정만 담습니다.
- 한 앱에서만 쓰는 코드는 먼저 `apps/client` 내부에 둡니다.
- 실제 재사용 근거가 생긴 뒤 `packages/*`로 승격합니다.

## Turborepo Tasks

- `dev`는 persistent task라 cache하지 않습니다.
- `build`는 dependency package의 `build`를 먼저 실행합니다.
- `lint`와 `typecheck`는 workspace 전체 기준으로 실행합니다.
- E2E, Storybook, mobile task는 아직 없습니다. 도입 시 `turbo.json`, [Tech Stack](./tech-stack.md), 관련 문서를 함께 갱신합니다.

## Generator Ownership

`turbo/generators`는 반복 scaffold를 담당합니다.

현재 root wrapper:

```bash
pnpm gen:page
pnpm gen:component
pnpm gen:hook
pnpm gen:ds-component
```

generator를 수정할 때는 생성 경로가 `docs/conventions/coding.md`와 이 문서의 앱/패키지 경계를 위반하지 않는지 확인합니다.
