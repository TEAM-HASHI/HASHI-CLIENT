---
name: hds-storybook-creator
description: Create, update, and review Storybook stories for HASHI Design System components in packages/hds-ui. Use when adding story variants, args, controls, interaction states, accessibility states, overflow cases, or Storybook verification for HDS components.
---

# HDS Storybook Creator

## Overview

HASHI Design System 컴포넌트의 Storybook story를 작성, 수정, 리뷰할 때 사용합니다.

이 skill은 Storybook story 작성과 Storybook 검증 기준을 담당합니다.
컴포넌트가 HDS에 속하는지, public API가 적절한지, package boundary가 맞는지는 `docs/rules/design-system-instructions.md`와 HDS component 작업 흐름을 먼저 따릅니다.

## Read First

Storybook 작업에 필요한 문서만 읽습니다.

- `docs/rules/design-system-instructions.md`
- `docs/architecture/design-system.md`
- `docs/architecture/design-system-components.md`
- `docs/architecture/styling-and-design-tokens.md`
- `.agents/recipes/hds-component.md`

대상 컴포넌트 가까이에 spec이 있으면 함께 읽습니다.

```text
packages/hds-ui/src/components/{componentFolder}/{ComponentName}.spec.md
```

## Responsibility

이 skill이 담당합니다.

- `packages/hds-ui/src/components/**/{ComponentName}.stories.tsx` 생성과 수정
- 컴포넌트 public props에 맞는 `args`, `argTypes`, story case 정리
- variant, size, tone, disabled, loading, invalid, selected 같은 상태 story 작성
- 긴 텍스트, overflow, icon 포함, focus-visible, keyboard interaction 확인
- Storybook 관련 검증 명령 선택과 결과 보고

이 skill이 담당하지 않습니다.

- app route, API, query, mutation, analytics, 제품 도메인 데이터가 들어간 story 작성
- 컴포넌트가 `packages/hds-ui`에 속하는지 최종 결정
- HDS public API를 product-specific 요구사항에 맞춰 확장
- Storybook story를 위해 컴포넌트 구현에 임시 prop이나 임시 상태 추가

## Workflow

1. 대상 컴포넌트와 기존 story 파일을 찾습니다.
2. 컴포넌트 구현과 가까운 spec을 읽고 public props, 상태, 접근성 책임을 확인합니다.
3. 기존 story가 지원 상태를 충분히 보여주는지 확인합니다.
4. 컴포넌트가 실제로 지원하는 상태만 story로 추가합니다.
5. 기본 사용 예시는 `Default`에 두고, 반복 입력값은 `args`로 표현합니다.
6. 선택 가능한 prop은 `argTypes`의 `select`, `boolean`, `text` 같은 control로 노출합니다.
7. 긴 텍스트나 flexible content를 렌더링하면 overflow story를 추가합니다.
8. keyboard, focus, disabled 같은 interaction 책임이 있으면 해당 상태를 확인할 수 있는 story를 추가합니다.
9. Storybook 검증 명령을 실행하고 결과를 보고합니다.

## Story File Location

Story 파일은 컴포넌트와 같은 폴더에 둡니다.

```text
packages/hds-ui/src/components/{componentFolder}/
  {ComponentName}.tsx
  {ComponentName}.stories.tsx
  index.ts
```

컴포넌트 spec이 있는 경우 같은 폴더에 둡니다.

```text
packages/hds-ui/src/components/{componentFolder}/
  {ComponentName}.spec.md
```

## Story Cases

컴포넌트가 지원하는 경우에만 추가합니다. 지원하지 않는 상태를 story를 위해 만들지 않습니다.

- `Default`
- `Disabled`
- `Loading`
- `Invalid` 또는 `Error`
- `Selected` 또는 `Active`
- `Small`, `Medium`, `Large` 같은 size
- `Primary`, `Secondary`, `Ghost` 같은 variant
- tone 또는 color 차이
- `WithIcon`
- `LongText`
- `Overflow`
- focus-visible 또는 keyboard interaction 확인용 case

피해야 할 이름:

- `Example1`
- `Test`
- `CaseA`
- `Sample`

## Args And Controls

기본 렌더링 값은 `args`로 둡니다.

```tsx
args: {
  children: 'Button',
}
```

선택 가능한 prop은 `argTypes`로 제어합니다.

```tsx
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary'],
  },
}
```

내부 구현 세부사항, private helper, app domain 값은 control로 노출하지 않습니다.

## Accessibility Checklist

컴포넌트 역할에 따라 확인합니다.

- semantic element가 맞는지
- accessible name이 필요한 컴포넌트에 제공되는지
- disabled 상태가 pointer, keyboard, aria 속성과 함께 처리되는지
- keyboard interaction이 필요한 컴포넌트에서 tab, enter, space 흐름이 자연스러운지
- focus-visible 상태가 확인 가능한지
- invalid/error 상태가 시각 표현과 접근성 표현을 함께 갖는지
- 긴 텍스트와 좁은 viewport에서 layout이 깨지지 않는지

## Verification

Story만 수정한 경우:

```bash
pnpm --filter @hashi/hds-ui typecheck
pnpm build-storybook
```

컴포넌트 구현과 story를 함께 수정한 경우:

```bash
pnpm --filter @hashi/hds-ui lint
pnpm --filter @hashi/hds-ui typecheck
pnpm --filter @hashi/hds-ui build
pnpm --filter @hashi/hds-ui test
pnpm build-storybook
```

로컬 환경의 pnpm PATH 문제로 검증이 실패하면, 프로젝트 선언 버전의 pnpm을 우선 사용하고 최종 보고에 사용한 명령을 명확히 남깁니다.

## Report

최종 보고에는 아래 내용을 포함합니다.

- 대상 컴포넌트
- 추가 또는 수정한 story
- 커버한 상태와 의도적으로 제외한 상태
- Storybook 검증 명령과 결과
- 남은 접근성, overflow, interaction 확인 gap
