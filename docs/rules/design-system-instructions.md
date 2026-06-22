# Design System Instructions

이 문서는 SIKSA 디자인시스템 구현 시 반드시 따르는 instruction입니다.
아키텍처 설명은 [Design System](../architecture/design-system.md)을 기준으로 보고, 실제 구현 판단은 이 문서의 규칙을 우선합니다.

관련 문서:

- [Design System](../architecture/design-system.md)
- [Design System Components](../architecture/design-system-components.md)
- [Design System Component Plan](../architecture/design-system-component-plan.md)
- [Design System Icons](../architecture/design-system-icons.md)
- [Styling And Design Tokens](../architecture/styling-and-design-tokens.md)
- [Tech Stack](../architecture/tech-stack.md)

## Current Tooling Boundary

Tailwind CSS, Storybook, SVGR은 SIKSA 디자인시스템 구현 표준으로 사용할 예정입니다.

다만 현재 저장소에 아직 설치되지 않은 도구는 코드나 문서에서 `Current`로 취급하지 않습니다.
도구를 실제로 도입하는 PR에서는 dependency, script, 설정 파일, 관련 문서를 함께 갱신합니다.

## Basic Principles

- 디자인 구현 전 `@siksa/sds-ui`, `@siksa/sds-icons`에 재사용 가능한 컴포넌트와 아이콘이 있는지 먼저 확인합니다.
- 디자인시스템은 product-agnostic UI primitive, interaction state, accessibility contract, public API를 담당합니다.
- 앱의 페이지 구성, route, API 호출, query, mutation, 도메인 문구, 비즈니스 로직은 디자인시스템에 넣지 않습니다.
- Figma와 시각적으로 맞추되, 좌표를 그대로 복사하기보다 재사용 가능한 props, variant, layout 구조로 구현합니다.
- 공통 Figma에 존재하더라도 제품 의미가 강한 UI는 바로 `packages/sds-ui`로 승격하지 않습니다.
- 임시 구현과 확정 구현을 구분하고, 임시 값이나 placeholder를 최종 구현처럼 남기지 않습니다.

## Component Mapping

구현 우선순위는 다음 순서를 따릅니다.

1. `packages/sds-ui`의 기존 컴포넌트를 사용합니다.
2. `packages/sds-icons`의 기존 아이콘을 사용합니다.
3. 제품 의미가 없는 반복 UI라면 `packages/sds-ui`에 컴포넌트 추가를 검토합니다.
4. 앱 전용이지만 여러 화면에서 반복된다면 app 내부 shared component로 작성합니다.
5. 한 페이지나 한 feature에서만 쓰는 UI라면 page-local component로 작성합니다.

| 대상                         | 위치                            | 기준                                            |
| ---------------------------- | ------------------------------- | ----------------------------------------------- |
| SDS UI primitive             | `packages/sds-ui`               | 제품 의미가 없고 재사용 가능한 public component |
| SDS icon                     | `packages/sds-icons`            | 제품 의미가 없고 재사용 가능한 icon component   |
| App shared component         | `apps/client` shared 영역       | 앱 전용이지만 여러 화면에서 반복되는 UI         |
| Page or feature component    | page 또는 feature 내부          | 특정 화면이나 기능에만 묶인 UI                  |
| Domain behavior and API flow | `apps/client`의 page/feature 층 | route, query, mutation, submit, tracking        |

## Figma And Code Connect

- Figma 구현 시 기존 SDS 컴포넌트와 아이콘 매핑을 먼저 확인합니다.
- Figma Code Connect를 도입한 뒤에는 Code Connect 매핑을 우선합니다.
- Code Connect 매핑이 없으면 기존 SDS 컴포넌트, app shared component, Figma variant 구조를 비교해 최소 구현 범위를 정합니다.
- Code Connect 매핑이 없다는 이유만으로 바로 새 SDS 컴포넌트를 만들지 않습니다.
- Figma의 variant, size, tone, state는 명시적인 component props로 표현합니다.
- Figma의 화면별 copy, 데이터 예시, API 흐름은 SDS props나 내부 로직으로 고정하지 않습니다.

## Tailwind Styling

- 스타일은 Tailwind CSS utility class를 기본으로 작성합니다.
- 조건부 스타일은 문자열을 직접 이어붙이지 않고 `cn` 같은 class merge 유틸을 사용합니다.
- 반복되는 긴 className은 복사하지 않고 component variant, slot, 내부 스타일 구조로 정리합니다.
- CSS Module, 전역 CSS, inline style은 기본 선택지가 아닙니다.
- color, typography, spacing, radius, shadow는 Tailwind theme 또는 design token 기준을 우선합니다.
- arbitrary value는 Figma와 맞추기 위해 꼭 필요한 경우에만 사용합니다.
- 같은 arbitrary value가 반복되면 Tailwind theme 또는 token 승격을 검토합니다.
- `!important` 사용은 지양합니다.

## Design Token

- token package가 생기기 전에는 기존 코드와 문서에 있는 값을 기준으로 구현합니다.
- 임의 token package나 임의 CSS variable 체계를 먼저 만들지 않습니다.
- 반복되는 color, typography, spacing, radius, shadow 값은 token 승격 후보로 기록합니다.
- Figma 값과 현재 코드 값이 다르면 어느 값을 따른 것인지 PR 설명이나 문서에 남깁니다.
- token package 또는 Tailwind theme를 도입하면 이 문서와 [Styling And Design Tokens](../architecture/styling-and-design-tokens.md)를 함께 갱신합니다.

## Icon And SVGR

- 아이콘은 `@siksa/sds-icons`를 우선 사용합니다.
- 새 아이콘은 재사용 가능하고 product-agnostic한 경우에만 `packages/sds-icons`에 추가합니다.
- 특정 기능이나 도메인에만 쓰이는 아이콘은 app 내부에 둡니다.
- SVG는 SVGR 기반 React component로 변환하는 것을 표준으로 합니다.
- 아이콘 컴포넌트 이름은 `PascalCase`와 `Icon` 접미사를 사용합니다.
- 누락된 아이콘을 임시 placeholder로 최종 구현하지 않습니다.
- SVG의 `width`, `height`, `fill`, `stroke`, `aria-hidden` 처리 기준은 [Design System Icons](../architecture/design-system-icons.md)를 따릅니다.

## Layout

- 디자인시스템 컴포넌트는 내부 정렬, spacing, state 표현까지만 책임집니다.
- 페이지 전체 layout, section 구성, 데이터 배치는 app이 책임집니다.
- Figma 좌표를 그대로 absolute positioning으로 옮기지 않습니다.
- spacing은 Figma의 실제 간격을 기준으로 하되, 재사용 가능한 Tailwind spacing 또는 token 값으로 표현합니다.
- fixed width와 fixed height는 컴포넌트 안정성이 필요한 경우에만 사용합니다.
- loading, error, empty, disabled 상태에서도 layout shift가 과하지 않아야 합니다.
- 긴 텍스트와 좁은 viewport에서 텍스트가 부모 영역을 깨지 않는지 확인합니다.

## SDS Component Implementation

- 새 SDS 컴포넌트는 먼저 [Design System Component Plan](../architecture/design-system-component-plan.md)의 승격 기준을 통과해야 합니다.
- scaffolding이 필요한 경우 `pnpm gen:ds-component` 사용을 우선 검토합니다.
- 컴포넌트는 `packages/sds-ui/src/components/{componentFolder}` 아래에 둡니다.
- 컴포넌트 파일은 `PascalCase`를 사용합니다.
- public component는 package entry에서 명시적으로 export합니다.
- 필요한 props type은 export할 수 있지만, 내부 helper를 public API로 노출하지 않습니다.
- `className`을 받을 경우 내부 class와 안전하게 병합해야 합니다.
- disabled, loading, invalid, selected 같은 상태는 시각 상태와 접근성 속성을 함께 고려합니다.

## Storybook

Storybook 도입 후에는 디자인시스템 컴포넌트를 추가하거나 수정할 때 story를 함께 작성합니다.

필수 story 기준:

- Default
- variant, size, tone 조합
- disabled
- loading
- error 또는 invalid
- selected 또는 active
- 긴 텍스트와 overflow 케이스
- 아이콘 포함 케이스

Storybook story에는 app route, API 호출, query, mutation, tracking, 제품 도메인 데이터 의존성을 넣지 않습니다.
Storybook build 또는 관련 검증 script가 생기면 PR 전 확인 절차에 포함합니다.

## Review Checklist

디자인시스템 구현 후 다음 항목을 확인합니다.

- 기존 SDS 컴포넌트나 아이콘을 재사용할 수 있었는가?
- app 전용 로직이 `packages/sds-ui`에 들어가지 않았는가?
- props가 Figma variant와 상태를 명확하게 표현하는가?
- Tailwind class가 theme 또는 token 기준을 따르는가?
- 반복되는 arbitrary value를 그대로 방치하지 않았는가?
- Storybook story가 필요한 상태와 variant를 충분히 보여주는가?
- SVG 아이콘이 SVGR 기준에 맞게 컴포넌트화되었는가?
- 긴 텍스트, disabled, loading, error 상태에서 UI가 깨지지 않는가?
- public export와 package boundary가 정리되어 있는가?
