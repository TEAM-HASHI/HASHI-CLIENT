<img width="1010" height="316" alt="hashi_logo" src="https://github.com/user-attachments/assets/4ca8bfba-0d37-4b37-90f2-cb549c4874b0" />

## 🍽️ 발견부터 예약까지, 포기 없이 🍽️

### **HASHI**는 한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 에이전트 서비스입니다.

- 일본 여행자가 식당을 발견한 순간부터 실제 방문하는 순간까지의 과정을 하나의 경험으로 연결합니다.

  > 직접 선별한 맛집 큐레이션, 지역별 추천, 테마별 맛집 리스트, 인기 순위 등을 통해 새로운 식당을 발견할 수 있도록 돕고, 발견한 식당은 별도의 플랫폼 이동 없이 바로 예약으로 이어질 수 있습니다.

- 예약이 불가능한 경우에는 비슷한 분위기와 경험을 제공하는 다른 식당을 추천하여 여행자가 식사 경험 자체를 포기하지 않도록 돕습니다.

- 단순히 예약을 대신해주는 서비스가 아니라, 발견부터 예약, 차선책, 리뷰까지 여행자의 식사 경험 전체를 연결하는 올인원 식사 경험 플랫폼입니다.

## 👥 Team

<table align="center">
  <tr>
    <td align="center" width="160">
      <a href="https://github.com/jyeon03">
        <img
          width="120"
          height="120"
          src="https://github.com/jyeon03.png"
          alt="백지연"
        />
      </a>
      <br />
      <a href="https://github.com/jyeon03"><strong>jyeon03</strong></a>
      <br />
    </td>
    <td align="center" width="160">
      <a href="https://github.com/chungyo">
        <img
          width="120"
          height="120"
          src="https://github.com/chungyo.png"
          alt="chungyo"
        />
      </a>
      <br />
      <a href="https://github.com/chungyo"><strong>chungyo</strong></a>
      <br />
    </td>
    <td align="center" width="160">
      <a href="https://github.com/gyeongbibin">
        <img
          width="120"
          height="120"
          src="https://github.com/gyeongbibin.png"
          alt="gyeongbibin"
        />
      </a>
      <br />
      <a href="https://github.com/gyeongbibin"><strong>gyeongbibin</strong></a>
      <br />
    </td>
    <td align="center" width="160">
      <a href="https://github.com/MinseoSONG">
        <img
          width="120"
          height="120"
          src="https://github.com/MinseoSONG.png"
          alt="MinseoSONG"
        />
      </a>
      <br />
      <a href="https://github.com/MinseoSONG"><strong>MinseoSONG</strong></a>
      <br />
    </td>
    <td align="center" width="160">
      <a href="https://github.com/yurimidaH">
        <img
          width="120"
          height="120"
          src="https://github.com/yurimidaH.png"
          alt="yurimidaH"
        />
      </a>
      <br />
      <a href="https://github.com/yurimidaH"><strong>yurimidaH</strong></a>
      <br />
    </td>
  </tr>
</table>

## ⚒️ Tech Stack

| Area             | Stack                                   |
| ---------------- | --------------------------------------- |
| Package Manager  | pnpm                                    |
| Monorepo         | pnpm workspace, pnpm catalog, Turborepo |
| Language         | React, TypeScript                       |
| Bundler          | Vite                                    |
| Routing          | React Router                            |
| Styling          | Tailwind CSS, class-variance-authority  |
| Design System    | HDS UI, HDS Icons, HDS Tokens           |
| API Client       | ky                                      |
| Server State     | TanStack Query                          |
| Test             | Vitest, Playwright                      |
| UI Docs          | Storybook, Chromatic                    |
| Error Monitoring | Sentry                                  |
| Deploy           | Vercel                                  |

자세한 기술 스택과 버전 기준은 [Tech Stack](./docs/architecture/tech-stack.md)을 따릅니다.

## 🧭 Workspace Apps

| App           | Package         | Description                      |
| ------------- | --------------- | -------------------------------- |
| `apps/client` | `@hashi/client` | 사용자 서비스 앱                 |
| `apps/admin`  | `@hashi/admin`  | HASHI-91 범위의 임시 관리자 콘솔 |

### App Commands

| Target | Dev               | Build               | Preview               |
| ------ | ----------------- | ------------------- | --------------------- |
| Client | `pnpm dev:client` | `pnpm build:client` | `pnpm preview:client` |
| Admin  | `pnpm dev:admin`  | `pnpm build:admin`  | `pnpm preview:admin`  |
| All    | -                 | `pnpm build`        | -                     |

기본 `vercel.json`은 client 배포용입니다. Admin은 별도 Vercel project에서 `vercel.admin.json`을 사용합니다.

```bash
pnpm exec vercel build --local-config vercel.admin.json
pnpm exec vercel deploy --prebuilt --local-config vercel.admin.json
```

## 📖 Convention

### Coding Convention

- 컴포넌트는 arrow function과 named export를 사용합니다.
- 컴포넌트 파일은 `PascalCase`, 일반 `.ts` 파일과 폴더는 `camelCase`를 사용합니다.
- 의미 없는 `div` 사용을 지양하고 가능한 semantic tag를 사용합니다.
- 버튼 역할은 `button` 요소를 사용하고, 텍스트가 없는 아이콘 버튼에는 `aria-label`을 제공합니다.
- 타입 이름은 `PascalCase`, Props 타입은 `Props` 접미사를 사용합니다.
- 이벤트 핸들러에는 `handle` 접두사를 사용합니다.
- boolean 값은 `is`, `has`, `check` 등의 접두사로 의미를 드러냅니다.
- 스타일은 기본적으로 Tailwind CSS utility class를 사용합니다.
- 반복되는 variant 조합은 `class-variance-authority`의 `cva`와 `VariantProps`를 사용합니다.
- 공통 디자인 값은 HDS token을 우선 사용합니다.

자세한 기준은 [Coding Convention](./docs/conventions/coding.md)을 따릅니다.

### Git Convention

HASHI Client는 Jira로 작업을 관리하고 GitHub로 코드 리뷰와 병합을 관리합니다.

1. Jira 티켓을 생성합니다.
2. Jira 티켓 번호를 기준으로 브랜치를 생성합니다.
3. 작업 브랜치에서 개발합니다.
4. 작업이 끝나면 `develop` 브랜치로 PR을 생성합니다.
5. 최소 2명 이상의 approve를 받은 뒤 merge합니다.
6. merge된 브랜치는 삭제합니다.

브랜치명은 다음 형식을 사용합니다.

```text
type/HASHI-번호-작업-요약
```

예시는 다음과 같습니다.

```text
feat/HASHI-12-login
fix/HASHI-18-button-style
docs/HASHI-30-convention-docs
```

커밋 메시지는 다음 형식을 사용합니다.

```text
type(scope): HASHI-번호 작업 내용
```

예시는 다음과 같습니다.

```text
feat(client): HASHI-12 로그인 페이지 구현
fix(hds-ui): HASHI-18 Button disabled 스타일 수정
docs(docs): HASHI-30 컨벤션 문서 추가
```

자세한 기준은 [Git Convention](./docs/conventions/git.md)을 따릅니다.

### Branch Strategy

| Branch       | Description                               |
| ------------ | ----------------------------------------- |
| `main`       | 배포 가능한 브랜치                        |
| `develop`    | 기능 브랜치들이 병합되는 개발 기준 브랜치 |
| `feat/*`     | 새로운 기능 개발                          |
| `fix/*`      | 버그 수정                                 |
| `refactor/*` | 기능 변화 없는 코드 구조 개선             |
| `style/*`    | UI 스타일, CSS, 포맷팅 수정               |
| `docs/*`     | 문서 작성 및 수정                         |
| `test/*`     | 테스트 코드 및 테스트 환경 수정           |
| `chore/*`    | 빌드 설정, 패키지 관리, 기타 잡무         |

### PR Rule

- PR 대상 브랜치는 `develop`입니다.
- PR 본문은 `.github/pull_request_template.md`를 기준으로 작성합니다.
- 변경 범위가 하나의 Jira 이슈로 설명 가능한지 확인합니다.
- 관련 없는 변경이 섞이지 않도록 `git status`와 diff를 확인합니다.
- UI 변경이 있으면 가능한 경우 screenshot 또는 수동 확인 결과를 남깁니다.
- merge 전 최소 2명 이상의 approve를 받습니다.

자세한 기준은 [PR Checklist](./docs/workflows/pr-checklist.md)을 따릅니다.

### Package Management

- 패키지 매니저는 `pnpm`을 사용합니다.
- `npm`, `yarn`, `bun` lockfile을 추가하지 않습니다.
- 외부 패키지 버전은 `pnpm-workspace.yaml`의 catalog에서 관리합니다.
- 내부 workspace 의존성은 `workspace:*`를 사용합니다.
- 새 패키지를 추가하면 `package.json`, `pnpm-lock.yaml`, 필요 시 `pnpm-workspace.yaml`을 함께 갱신합니다.

자세한 기준은 [Package Management](./docs/conventions/package-management.md)을 따릅니다.

## 🔥 Ground Rule

1. 많이 웃기
2. 연락 잘 보기, 카카오톡 빨리 확인하기
3. 급한 연락을 확인하지 않으면 전화하기
4. 짜증내지 않기
5. 둥글둥글하게 말하기
6. AI를 사용하되 결과는 꼼꼼하게 확인하기
7. 모르는 것은 30분만 혼자 고민하고 공유하기
8. 싸우지 않기
9. 불편한 점이 있으면 바로 말하기

## 📢 Communication

- 빠른 공유가 필요한 내용은 카카오톡으로 소통합니다.
- 작업 단위와 진행 상태는 Jira 이슈를 기준으로 관리합니다.
- 코드 변경과 리뷰는 GitHub PR을 기준으로 진행합니다.
- 기획, 정책, 회의 내용처럼 팀 전체가 참고해야 하는 내용은 문서로 남깁니다.

## ☄️ Schedule Management

- 작업은 Jira 이슈 단위로 나누어 관리합니다.
- 이슈 상태는 `TODO`, `IN PROGRESS`, `CODE REVIEW`, `QA`, `DONE` 흐름으로 관리합니다.
- 작업을 시작하면 담당 이슈를 `IN PROGRESS`로 이동합니다.
- PR을 생성하면 `CODE REVIEW` 상태로 관리합니다.
- 리뷰 이후 확인이 필요한 작업은 `QA` 상태로 관리합니다.
- PR이 병합되면 이슈를 `DONE`으로 정리합니다.

자세한 기준은 [Jira Ticket Guide](./docs/conventions/jira-ticket.md)을 따릅니다.

## 🤖 AI

### Docs

- [Coding Convention](./docs/conventions/coding.md)
- [Git Convention](./docs/conventions/git.md)
- [Package Management](./docs/conventions/package-management.md)
- [Agent Skills](./docs/agent/skills.md)
- [Codex Hooks](./docs/agent/hooks.md)
- [Serena MCP](./docs/agent/serena-mcp.md)

### Rules

- [Design System Instructions](./docs/rules/design-system-instructions.md)

### Workflows

- [Local Development](./docs/workflows/local-development.md)
- [PR Checklist](./docs/workflows/pr-checklist.md)
- [Spec Writing](./docs/workflows/spec-writing.md)
- [Spec Templates](./docs/workflows/spec-templates/README.md)
- [Turbo Generators](./docs/workflows/turbo-generators.md)

### Architecture

- [Tech Stack](./docs/architecture/tech-stack.md)
- [Monorepo](./docs/architecture/monorepo.md)
- [App Structure](./docs/architecture/app-structure.md)
- [Data Layer](./docs/architecture/data-layer.md)
- [Design System](./docs/architecture/design-system.md)
- [Design System Components](./docs/architecture/design-system-components.md)
- [Design System Component Plan](./docs/architecture/design-system-component-plan.md)
- [Design System Icons](./docs/architecture/design-system-icons.md)
- [Styling And Design Tokens](./docs/architecture/styling-and-design-tokens.md)
- [Mobile WebView](./docs/architecture/mobile-webview.md)
