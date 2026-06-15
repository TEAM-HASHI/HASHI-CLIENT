# SIKSA Client

React, TypeScript, pnpm 기반 모노레포입니다.

## Structure

```txt
SIKSA-CLIENT/
  apps/
    client/        # React client application
  packages/
    sds-icons/     # Shared icon components
    sds-ui/        # Shared design system components
  configs/
    tsconfig/      # Shared TypeScript config
```

## Client Structure

```txt
apps/client/src/
  app/       # app entry, router, providers
  pages/     # route pages
  features/  # feature modules
  shared/    # client-only shared code
  assets/    # static assets
```

## Install

```sh
pnpm install
```

## Scripts

```sh
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

## Dependency Rules

앱에서만 쓰는 라이브러리는 앱에 설치합니다.

```sh
pnpm --filter @siksa/client add <package>
```

공용 디자인 시스템에서 쓰는 라이브러리는 `sds-ui`에 설치합니다.

```sh
pnpm --filter sds-ui add <package>
```

공용 아이콘 패키지에서 쓰는 라이브러리는 `sds-icons`에 설치합니다.

```sh
pnpm --filter sds-icons add <package>
```

모든 workspace에서 공유하는 개발 도구는 루트에 설치합니다.

```sh
pnpm add -w -D <package>
```

외부 패키지 버전은 `pnpm-workspace.yaml`의 `catalog`에서 중앙 관리합니다.
