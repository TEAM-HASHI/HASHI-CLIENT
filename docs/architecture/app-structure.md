# App Structure

SIKSA Client의 실행 앱은 `apps/client`입니다. 새 화면과 앱 내부 공유 코드는 현재 폴더 구조와 generator 기준을 우선합니다.

## Base Structure

```text
apps/client/src/
  app/       앱 실행 조립 코드
  pages/     라우트 또는 페이지 단위 화면
  features/  기능 단위 UI와 상태 로직
  shared/    client 앱 내부 공통 코드
  assets/    정적 asset
```

`app/`은 앱을 실행하기 위해 조립하는 코드만 둡니다.

```text
app/
  providers/  전역 Provider 조립
  router/     라우터 설정
  App.tsx     앱 root component
  main.tsx    React entry point
```

## Page Structure

새 페이지는 `pnpm gen:page`를 우선 사용합니다.

```text
pages/{pageName}/
  {PageName}Page.tsx
  index.ts
```

페이지가 커지면 page 폴더 안에서만 필요한 코드를 아래처럼 분리합니다.

```text
pages/{pageName}/
  {PageName}Page.tsx
  components/
  sections/
  hooks/
  utils/
  index.ts
```

- page component는 layout과 composition에 집중합니다.
- 페이지 내부에서만 쓰는 컴포넌트는 해당 page의 `components/`에 둡니다.
- 화면 구획은 `sections/`에 둡니다.
- 페이지 전용 hook이나 pure helper는 page-local `hooks/`, `utils/`에 둡니다.
- 여러 페이지에서 실제로 재사용될 때만 `features/` 또는 `shared/`로 승격합니다.

## Feature Structure

`features/`는 특정 기능 흐름이 여러 페이지나 섹션에서 반복될 때 사용합니다.

```text
features/{featureName}/
  components/
  hooks/
  utils/
  index.ts
```

- 한 페이지에만 묶인 코드는 `features/`로 먼저 빼지 않습니다.
- 기능 이름 없이 공통 UI처럼 보이는 코드는 `shared/components` 또는 `packages/sds-ui` 후보인지 먼저 판단합니다.
- 서버 통신, 권한, route, analytics에 강하게 묶이면 앱 내부에 둡니다.

## Shared Structure

`shared/`는 `apps/client` 내부에서만 공유되는 코드입니다.

```text
shared/
  api/         HTTP client, API helper
  components/ 앱 내부 공통 UI
  constants/  route, config constant
  hooks/      앱 내부 공통 hook
  lib/        외부 라이브러리 조립 코드
  types/      앱 내부 공통 type
  utils/      순수 helper
```

여러 workspace에서 재사용해야 하는 코드는 바로 `shared/`에 남기지 않고 목적에 따라 이동합니다.

- UI primitive: `packages/sds-ui`
- Icon component: `packages/sds-icons`
- TypeScript config: `configs/tsconfig`

## Placement Rules

- 앱 실행 조립 코드는 `apps/client/src/app`에 둡니다.
- route constant는 `apps/client/src/shared/constants`에 둡니다.
- 앱 내부 공통 컴포넌트는 `apps/client/src/shared/components`에 둡니다.
- 새 shared component scaffold는 `pnpm gen:component`를 우선 사용합니다.
- 새 shared hook scaffold는 `pnpm gen:hook`을 우선 사용합니다.
- 제품 의미가 없는 UI primitive만 `packages/sds-ui`로 승격합니다.
- 아이콘은 앱 한정이면 앱 내부에 두고, 공통 아이콘이면 `packages/sds-icons`로 승격합니다.
- 구조 변경만을 위해 관련 없는 기존 파일을 이동하지 않습니다.

## Routing Rules

- 라우터 설정은 `apps/client/src/app/router`에서 관리합니다.
- route path는 문자열을 흩뿌리지 않고 상수화를 검토합니다.
- URL params와 search params는 사용하는 위치에서 명시적으로 읽고 검증합니다.
- 첫 진입 화면은 단순성을 우선하고, lazy loading은 실제 번들/사용성 이슈가 있을 때 도입합니다.
