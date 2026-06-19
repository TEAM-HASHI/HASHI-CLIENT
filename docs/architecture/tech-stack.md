# Tech Stack

이 문서는 SIKSA Client의 목표 기술 스택과 현재 저장소 반영 상태를 구분해 기록합니다.

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

| Area                   | Stack                                         | Version                              | Status   | Notes                                        |
| ---------------------- | --------------------------------------------- | ------------------------------------ | -------- | -------------------------------------------- |
| Package manager        | `pnpm`                                        | `10.18.3`                            | Current  | 루트 `packageManager` 기준                   |
| Monorepo               | `pnpm workspace`, `pnpm catalog`, `Turborepo` | `pnpm@10.18.3`, `turbo@^2.7.2`       | Current  | workspace와 task graph 기준                  |
| Language               | `React`, `TypeScript`                         | `react@^19.2.6`, `typescript@~6.0.2` | Current  | `apps/client`, `packages/*` 공통 기준        |
| Bundler                | `Vite`                                        | `vite@^8.0.12`                       | Current  | `@siksa/client` 실행/빌드 기준               |
| Lint and format        | `ESLint`, `Prettier`                          | `eslint@^10.3.0`, `prettier@^3.6.2`  | Current  | 루트 script와 공통 ESLint config 기준        |
| CSS                    | `Tailwind CSS`                                | 도입 시 결정                         | Planned  | 도입 시 styling/token 문서 함께 갱신         |
| API client             | `ky`                                          | 도입 시 결정                         | Planned  | 도입 시 data layer 문서 기준으로 배치        |
| Server state           | `TanStack Query`                              | 도입 시 결정                         | Planned  | Provider는 앱 실행 조립 영역에서 시작        |
| Unit/Component test    | `vitest`                                      | 도입 시 결정                         | Planned  | 테스트 script와 위치는 도입 티켓에서 정의    |
| E2E test               | `Playwright`                                  | 도입 시 결정                         | Deferred | 이번 AI 설정 골격 범위에는 포함하지 않음     |
| Icon pipeline          | `SVGR`                                        | 도입 시 결정                         | Planned  | 현재는 직접 작성한 React icon component 사용 |
| Error monitoring       | `Sentry`                                      | 도입 시 결정                         | Planned  | 환경변수와 배포 정책 확정 후 도입            |
| Git hook               | `Husky`, `lint-staged`                        | 도입 시 결정                         | Planned  | hook 정책 확정 후 도입                       |
| UI docs/component test | `Storybook`                                   | 도입 시 결정                         | Planned  | SDS 컴포넌트 규모가 커질 때 도입             |
| Infra                  | `Vercel`, `AWS`                               | 도입 시 결정                         | Planned  | 배포/인프라 문서가 생기면 이 문서와 연결     |

## Official Docs

- Package manager: [pnpm](https://pnpm.io/)
- Monorepo: [Turborepo](https://turborepo.dev/docs)
- Language: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/docs/)
- Bundler: [Vite](https://vite.dev/guide/)
- Lint and format: [ESLint](https://eslint.org/docs/latest/), [Prettier](https://prettier.io/docs/)
- CSS: [Tailwind CSS](https://tailwindcss.com/docs/installation)
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
- 앱에만 필요한 dependency는 먼저 `@siksa/client`에 추가합니다.
- 테스트, Storybook, Sentry, Git hook은 script와 검증 절차가 정해질 때 도입합니다.
- Playwright E2E 구조는 별도 티켓에서 추가합니다.

## Related Docs

- [Package Management](../conventions/package-management.md)
- [Monorepo](./monorepo.md)
- [Data Layer](./data-layer.md)
- [Styling And Design Tokens](./styling-and-design-tokens.md)
- [Design System Icons](./design-system-icons.md)
- [Design System Components](./design-system-components.md)
