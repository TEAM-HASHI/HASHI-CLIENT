# Spec Templates

이 폴더는 HASHI Client에서 page, component, hook 작업을 시작하기 전에 범위와 책임을 정리할 때 사용하는 문서 템플릿입니다.

## Location

spec template은 코드 생성 템플릿이 아니므로 루트 `templates/`나 `turbo/generators/templates/`에 두지 않습니다.
작성 완료된 실제 spec은 구현 대상과 같은 폴더에 `*.spec.md`로 둡니다.

| 위치                                | 용도                                           |
| ----------------------------------- | ---------------------------------------------- |
| `docs/workflows/spec-templates/`    | 작업 계획, Jira/PR 설명, 구현 범위 정리용 spec |
| 구현 파일과 같은 폴더의 `*.spec.md` | 실제 구현 기준이 되는 작성 완료 spec           |
| `turbo/generators/templates/`       | `pnpm gen:*` 명령에서 실제 파일 생성에 사용    |
| `docs/architecture/`                | 앱 구조, 패키지 경계, 기술 선택 기록           |
| `docs/rules/`                       | 반드시 지켜야 하는 구현 규칙                   |

## Templates

- [Component Spec](./component.spec.md)
- [Hook Spec](./hook.spec.md)
- [Page Spec](./page.spec.md)

## Usage

Spec 작성 기준은 [Spec Writing](../spec-writing.md)을 따릅니다.

필요한 template을 Jira description, PR description, 또는 작업용 문서에 복사해서 사용합니다.
구현 중 계속 참조해야 하는 spec이면 구현 대상과 같은 폴더에 `*.spec.md`로 저장합니다.

모든 항목을 반드시 채울 필요는 없습니다.
다만 책임 경계, 상태, 에러 처리, 검증 방법은 구현 전에 먼저 정리합니다.

## Actual Spec Location

| 대상                 | 권장 위치                                                 |
| -------------------- | --------------------------------------------------------- |
| Page                 | `apps/client/src/pages/{page}/{PageName}.spec.md`         |
| Page-local component | 구현 컴포넌트와 같은 폴더의 `{ComponentName}.spec.md`     |
| Feature component    | 구현 컴포넌트와 같은 폴더의 `{ComponentName}.spec.md`     |
| App shared component | `apps/client/src/shared/components/{name}/{Name}.spec.md` |
| App shared hook      | `apps/client/src/shared/hooks/use{Name}.spec.md`          |
| HDS component        | `packages/hds-ui/src/components/{name}/{Name}.spec.md`    |
| HDS icon             | `packages/hds-icons/src/icons/{Name}Icon.spec.md`         |

## When To Write A Spec

spec은 다음 경우에 작성합니다.

- page 단위 구현
- form, data fetching, mutation, navigation이 있는 기능
- HDS component
- 여러 화면에서 재사용되는 shared component 또는 hook
- 상태, 에러 처리, 접근성 요구사항이 중요한 UI

단순 presentational component나 변경 범위가 매우 작은 UI에는 spec 작성을 강제하지 않습니다.

## HASHI Defaults

- package manager는 `pnpm`을 사용합니다.
- 앱 코드는 `apps/client`를 기준으로 작성합니다.
- 디자인시스템 UI는 `packages/hds-ui`, 아이콘은 `packages/hds-icons`를 기준으로 작성합니다.
- generator가 필요한 경우 `pnpm gen:page`, `pnpm gen:component`, `pnpm gen:hook`, `pnpm gen:ds-component`를 우선 확인합니다.
- Tailwind CSS, Storybook, SVGR은 도입 예정 표준입니다. 실제 dependency와 script가 추가되기 전까지는 `Current` 도구처럼 취급하지 않습니다.
