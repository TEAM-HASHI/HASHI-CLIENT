# Turbo Generators

Turbo generator는 반복되는 scaffold를 같은 구조로 만들기 위한 보조 도구입니다.
이 문서가 루트 `package.json`의 `gen:*` script와 `turbo/generators/config.ts` 사용 기준입니다.

## Current Generators

| Script                  | Generator                | Purpose                                                |
| ----------------------- | ------------------------ | ------------------------------------------------------ |
| `pnpm gen:page`         | `turbo gen page`         | `apps/client/src/pages` 아래 page scaffold             |
| `pnpm gen:component`    | `turbo gen component`    | `apps/client/src/shared/components` 아래 shared UI     |
| `pnpm gen:hook`         | `turbo gen hook`         | `apps/client/src/shared/hooks` 아래 shared hook        |
| `pnpm gen:ds-component` | `turbo gen ds-component` | `packages/hds-ui/src/components` 아래 HDS UI component |

## Commands

```bash
pnpm gen:page
pnpm gen:component
pnpm gen:hook
pnpm gen:ds-component
```

현재 generator는 interactive prompt로 이름을 입력받습니다.
도메인, route, app argument를 받는 generator는 아직 없습니다.

## Generated Structure

### Page

```text
apps/client/src/pages/{pageName}/
  {PageName}Page.tsx
  {PageName}.spec.md
  index.ts
```

### App Shared Component

```text
apps/client/src/shared/components/{componentName}/
  {ComponentName}.tsx
  index.ts
```

### App Shared Hook

```text
apps/client/src/shared/hooks/
  use{HookName}.ts
```

### HDS Component

```text
packages/hds-ui/src/components/{componentName}/
  {ComponentName}.tsx
  {ComponentName}.spec.md
  {ComponentName}.stories.tsx
  index.ts
```

`ds-component` generator는 `packages/hds-ui/src/components/index.ts`에 component와 props type public export를 append합니다.
생성 직후 component, spec, story, local index, public components index를 Prettier로 정리합니다.

## Spec Files

`page` generator는 page의 `*.spec.md`를 자동 생성합니다.
생성된 page spec은 route path, access guard, layout, 상태, 데이터 의존성, HDS/component mapping, 검증 기준을 구현 전에 채우는 scaffold입니다.

`ds-component` generator는 HDS component의 `*.spec.md`를 자동 생성합니다.

shared component, hook처럼 generator가 spec을 만들지 않는 작업은 [Spec Writing](./spec-writing.md)에 따라 [Spec Templates](./spec-templates/README.md)를 복사해서 구현 대상과 같은 폴더에 둡니다.

예시:

```text
apps/client/src/pages/login/
  LoginPage.tsx
  LoginPage.spec.md

packages/hds-ui/src/components/button/
  Button.tsx
  Button.spec.md
  Button.stories.tsx
```

HDS Storybook story는 component scaffold와 함께 생성하고, 실제 component 상태에 맞게 variant와 interaction case를 채웁니다.

## Boundary

- generator는 파일 구조만 만듭니다.
- API endpoint, route path, copy, business logic은 generator가 추측하지 않습니다.
- page generator는 `apps/client/src/app/router/path.ts`, `lazy.ts`, `routes.ts`를 자동 수정하지 않습니다.
- 기존 파일은 overwrite하지 않습니다.
- generator가 add 실패를 내면 같은 파일이 이미 있다는 뜻이므로 기존 파일을 확인하고 직접 병합합니다.
- page가 커지면 [App Structure](../architecture/app-structure.md)의 page-local 분리 기준을 따릅니다.
- HDS component는 [Design System Instructions](../rules/design-system-instructions.md)를 먼저 확인합니다.

## Generator Maintenance

generator를 추가하거나 바꿀 때 함께 갱신합니다.

- 루트 `package.json`의 `gen:*` script
- `turbo/generators/config.ts`
- `turbo/generators/templates/**`
- [App Structure](../architecture/app-structure.md)
- [Spec Writing](./spec-writing.md)
- 이 문서

## Verification

generator 변경 후 최소 검증:

```bash
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
git diff --check
```

샘플 생성 검증이 필요하면 임시 이름으로 generator를 실행해 생성 경로와 내용을 확인한 뒤, 생성된 샘플 파일은 diff에 남기지 않습니다.
