# Tech Stack

이 문서는 HASHI Client의 목표 기술 스택과 현재 저장소 반영 상태를 구분해 기록합니다.

## Status

| Status   | Meaning                                  |
| -------- | ---------------------------------------- |
| Current  | 현재 저장소에 설정되어 있습니다.         |
| Planned  | 도입 방향은 정했지만 아직 설정 전입니다. |
| Deferred | 도입 후보지만 별도 티켓에서 다룹니다.    |

## Version Policy

- `Current` 항목의 version은 현재 저장소 설정을 기준으로 적습니다.
- 실제 dependency version의 source of truth는 `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`입니다.
- 이 문서는 사람이 빠르게 확인하기 위한 요약이므로 dependency를 바꾸면 함께 갱신합니다.
- `Planned`와 `Deferred` 항목은 지금 version을 미리 고정하지 않습니다.
- 새 도구를 도입할 때 공식 문서를 확인하고 `pnpm-workspace.yaml`의 `catalog` 또는 해당 workspace `package.json`에 version을 고정합니다.

## Stack

| Area                        | Stack                                         | Version                                  | Status  | Notes                                      |
| --------------------------- | --------------------------------------------- | ---------------------------------------- | ------- | ------------------------------------------ |
| Package manager             | `pnpm`                                        | `10.18.3`                                | Current | 루트 `packageManager` 기준                 |
| Monorepo                    | `pnpm workspace`, `pnpm catalog`, `Turborepo` | `pnpm@10.18.3`, `turbo@^2.7.2`           | Current | workspace와 task graph 기준                |
| Language                    | `React`, `TypeScript`                         | `react@^19.2.6`, `typescript@~6.0.2`     | Current | `apps/client`, `packages/*` 공통 기준      |
| Bundler                     | `Vite`                                        | `vite@^8.0.12`                           | Current | `@hashi/client` 실행/빌드 기준             |
| PWA                         | `vite-plugin-pwa`, `Workbox`                  | `vite-plugin-pwa@^1.3.0`                 | Current | Manifest와 정적 앱 셸 캐시 기준            |
| Routing                     | `React Router`                                | `react-router-dom@^7.18.1`               | Current | `apps/client` 라우팅과 route guard 기준    |
| Lint and format             | `ESLint`, `Prettier`                          | `eslint@^10.3.0`, `prettier@^3.6.2`      | Current | 루트 script와 공통 ESLint config 기준      |
| CSS                         | `Tailwind CSS`, `class-variance-authority`    | `tailwindcss@^4.3.1`, `cva@^0.7.1`       | Current | `@tailwindcss/vite`, `tailwind-merge` 사용 |
| Accessibility UI primitives | `React Aria Components`                       | `react-aria-components@^1.19.0`          | Current | HDS overlay/date 계열 primitive 기준       |
| API client                  | `ky`                                          | `ky@^2.0.2`                              | Current | `apps/client/src/shared/api` 기준          |
| Server state                | `TanStack Query`                              | `@tanstack/react-query@^5.101.0`         | Current | app provider와 shared query client 기준    |
| Unit/Component test         | `Vitest`                                      | `vitest@^3.2.4`                          | Current | client, HDS UI, shared config 기준         |
| E2E test                    | `Playwright`                                  | `@playwright/test@^1.55.0`               | Current | client e2e scaffold 기준                   |
| Icon pipeline               | `SVGR`                                        | `@svgr/core@^8.1.0`                      | Current | `packages/hds-icons` generator 기준        |
| Error monitoring            | `Sentry`                                      | `@sentry/react@^10.60.0`                 | Current | React SDK와 Vite plugin 기준               |
| Git hook                    | `Husky`, `lint-staged`                        | `husky@^9.1.7`, `lint-staged@^17.0.8`    | Current | prepare script와 lint-staged config 기준   |
| UI docs/component test      | `Storybook`, `Chromatic`                      | `storybook@^10.4.6`, `chromatic@^17.5.0` | Current | HDS UI Storybook 기준                      |
| Deployment                  | `Vercel`                                      | `vercel@^54.14.0`                        | Current | Vercel workflow 기준                       |
| Infra                       | `AWS`                                         | 도입 시 결정                             | Planned | AWS 리소스가 필요해질 때 별도 문서화       |

## Official Docs

- Package manager: [pnpm](https://pnpm.io/)
- Monorepo: [Turborepo](https://turborepo.dev/docs)
- Language: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/docs/)
- Bundler: [Vite](https://vite.dev/guide/)
- PWA: [Vite PWA](https://vite-pwa-org.netlify.app/), [Workbox](https://developer.chrome.com/docs/workbox/)
- Routing: [React Router](https://reactrouter.com/)
- Lint and format: [ESLint](https://eslint.org/docs/latest/), [Prettier](https://prettier.io/docs/)
- CSS: [Tailwind CSS](https://tailwindcss.com/docs/installation), [Class Variance Authority](https://cva.style/docs)
- Accessibility UI primitives: [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)
- API client: [ky](https://github.com/sindresorhus/ky)
- Server state: [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- Unit/Component test: [Vitest](https://vitest.dev/guide/)
- E2E test: [Playwright](https://playwright.dev/docs/intro)
- Icon pipeline: [SVGR](https://react-svgr.com/docs/getting-started/)
- Error monitoring: [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
- Git hook: [Husky](https://typicode.github.io/husky/), [lint-staged](https://github.com/lint-staged/lint-staged)
- UI docs/component test: [Storybook](https://storybook.js.org/docs)
- Infra: [Vercel](https://vercel.com/docs), [AWS](https://docs.aws.amazon.com/)

## Adoption Rules

- 새 도구는 필요한 티켓에서 설치하고 `package.json`, `pnpm-lock.yaml`, 관련 문서를 함께 갱신합니다.
- 여러 workspace에서 공유하는 외부 dependency는 `pnpm-workspace.yaml`의 `catalog`에 등록합니다.
- 앱에만 필요한 dependency는 먼저 `@hashi/client`에 추가합니다.
- 새 도구를 추가하거나 기존 도구의 CI/검증 절차를 바꾸면 관련 script와 문서를 함께 갱신합니다.
- Playwright E2E task는 현재 client app에 있으며, 테스트 시나리오 확장은 별도 티켓에서 다룹니다.

## Related Docs

- [Package Management](../conventions/package-management.md)
- [Monorepo](./monorepo.md)
- [Routing And Access Policy](./routing-and-access-policy.md)
- [Data Layer](./data-layer.md)
- [Styling And Design Tokens](./styling-and-design-tokens.md)
- [Design System Icons](./design-system-icons.md)
- [Design System Components](./design-system-components.md)
