# Package Management

## Package Manager

이 저장소는 `pnpm`을 사용합니다.

```json
{
  "packageManager": "pnpm@10.18.3"
}
```

현재 `package.json`에는 Node.js 버전 범위가 고정되어 있지 않습니다. Node.js 버전을 팀 차원에서 고정해야 한다면 `engines`, `.nvmrc`, Volta 같은 별도 기준을 추가한 뒤 이 문서를 갱신합니다.

`npm`, `yarn`, `bun` lockfile을 추가하지 않습니다.

## Workspace

이 저장소는 pnpm workspace 기반 모노레포입니다.

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'configs/*'
```

현재 주요 workspace는 다음과 같습니다.

| Workspace          | 역할                              |
| ------------------ | --------------------------------- |
| `@siksa/client`    | Vite 기반 클라이언트 앱           |
| `@siksa/sds-ui`    | HASHI Design System UI 컴포넌트   |
| `@siksa/sds-icons` | HASHI Design System Icon 컴포넌트 |
| `@siksa/tsconfig`  | 공통 TypeScript 설정              |

## Catalog

외부 패키지 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리합니다.

```yaml
catalog:
  react: ^19.2.6
  react-dom: ^19.2.6
  typescript: ~6.0.2
```

workspace의 `package.json`에서는 catalog에 등록된 패키지를 `catalog:`로 참조합니다.

```json
{
  "dependencies": {
    "react": "catalog:"
  }
}
```

## Rules

- 패키지 설치와 스크립트 실행은 `pnpm`을 사용합니다.
- `package-lock.json`, `yarn.lock`, `bun.lockb`를 추가하지 않습니다.
- 새 패키지를 추가하면 `package.json`, `pnpm-lock.yaml`, 필요 시 `pnpm-workspace.yaml`을 함께 갱신합니다.
- 여러 workspace에서 공유하는 외부 패키지는 `pnpm-workspace.yaml`의 `catalog`에 버전을 등록하고 `catalog:`로 참조합니다.
- 내부 workspace 의존성은 `workspace:*`를 사용합니다.
- dependency를 추가하기 전에 앱에만 필요한지, 공통 패키지에 필요한지 구분합니다.
- React를 사용하는 라이브러리 패키지는 `react`, `react-dom`을 `peerDependencies`로 둘지 먼저 검토합니다.

## Install

```bash
pnpm install
```

CI나 clean install 확인이 필요하면 lockfile 기준 설치를 사용합니다.

```bash
pnpm install --frozen-lockfile
```

## Add Dependency

앱 전용 dependency:

```bash
pnpm --filter @siksa/client add package-name
```

앱 전용 dev dependency:

```bash
pnpm --filter @siksa/client add -D package-name
```

SDS UI 패키지 dependency:

```bash
pnpm --filter @siksa/sds-ui add package-name
```

SDS Icons 패키지 dependency:

```bash
pnpm --filter @siksa/sds-icons add package-name
```

루트 dev dependency:

```bash
pnpm add -D -w package-name
```

내부 workspace 패키지를 연결할 때:

```bash
pnpm --filter @siksa/client add @siksa/sds-icons@workspace:*
```

catalog에 새 외부 패키지를 등록하면서 추가할 때:

```bash
pnpm --filter @siksa/client add package-name --save-catalog
```

## Scripts

루트에서 자주 사용하는 명령어는 다음과 같습니다.

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
```

workspace 하나만 대상으로 실행할 때는 `--filter`를 사용합니다.

```bash
pnpm --filter @siksa/client dev
pnpm --filter @siksa/client lint
pnpm --filter @siksa/sds-ui typecheck
```

## Generator

파일 생성은 루트 script를 우선 사용합니다.

```bash
pnpm gen:page
pnpm gen:component
pnpm gen:hook
pnpm gen:ds-component
```

## Review Checklist

- dependency가 필요한 workspace에만 추가되었는지 확인합니다.
- 여러 workspace에서 쓰는 패키지는 catalog로 관리되는지 확인합니다.
- 내부 패키지는 `workspace:*`로 연결되었는지 확인합니다.
- lockfile 변경이 포함되었는지 확인합니다.
- `pnpm install --frozen-lockfile`로 clean install 가능성을 확인합니다.
- 변경 범위에 맞게 `pnpm lint`, `pnpm typecheck`, `pnpm build`를 실행합니다.
