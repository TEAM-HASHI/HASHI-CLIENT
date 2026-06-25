# Design System Component Plan

이 문서는 `packages/sds-ui`와 `packages/sds-icons`에 어떤 컴포넌트를 둘지 판단하는 계획 문서입니다.
세부 구현 기준은 [Design System Components](./design-system-components.md), 아이콘 기준은 [Design System Icons](./design-system-icons.md)를 따릅니다.

## Current Package State

현재 디자인 시스템 관련 패키지는 두 개입니다.

| Package            | Role                                |
| ------------------ | ----------------------------------- |
| `@siksa/sds-ui`    | 제품 의미가 없는 React UI component |
| `@siksa/sds-icons` | 제품 의미가 없는 SVG icon component |

현재 `@siksa/sds-ui`에는 `Button`만 있습니다. 앞으로 컴포넌트가 늘어나도 앱 도메인 의미가 들어간 코드는 바로 디자인 시스템으로 올리지 않습니다.

## Design Decision

디자인 시스템이 소유하는 것:

- visual structure
- size, variant, tone, state
- layout spacing
- baseline accessibility
- controlled interaction contract
- public prop type

앱이 소유하는 것:

- route and navigation
- API, query, mutation
- permission and menu visibility
- product copy
- domain data shape
- logging and analytics
- product-specific validation and submit behavior

## Classification

| Classification            | Location                                            | Criteria                                                                  |
| ------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| SDS UI primitive          | `packages/sds-ui/src/components`                    | 제품 의미 없이 하나의 UI 동작이나 상태를 표현합니다.                      |
| SDS compound primitive    | `packages/sds-ui/src/components`                    | 여러 subcomponent로 조합하지만 route, API, 도메인 데이터를 알지 않습니다. |
| App shared component      | `apps/client/src/shared/components`                 | client 앱 안에서 여러 페이지가 공유합니다.                                |
| Page or feature component | `apps/client/src/pages`, `apps/client/src/features` | 특정 화면, 기능 흐름, API 정책에 묶입니다.                                |
| SDS icon                  | `packages/sds-icons/src/icons`                      | 제품 의미 없이 여러 화면에서 재사용되는 아이콘입니다.                     |

겉모양이 같아도 다음 중 하나에 해당하면 앱 내부에 둡니다.

- 이름이 제품 도메인 없이 자연스럽지 않습니다.
- props가 서버 응답, route, 권한, analytics에 의존합니다.
- 같은 외형이어도 후속 동작이 화면마다 다릅니다.
- 앱 copy나 validation 규칙이 component 내부로 들어가야 합니다.

## Candidate Order

디자인 시스템 컴포넌트는 의존성이 낮고 재사용성이 높은 순서로 추가합니다.

1. `Button`
2. `IconButton`
3. `Checkbox`
4. `TextField`
5. `TextArea`
6. `Select`
7. `Chip`
8. `Dialog`
9. `Toast`
10. `Tabs`
11. `Pagination`
12. `Table`

이 순서는 고정 로드맵이 아니라 기본 우선순위입니다. Jira 티켓이나 Figma 전달 범위가 있으면 해당 작업의 요구사항을 우선합니다.

## Component Introduction Rule

새 SDS component를 추가할 때는 다음 순서를 따릅니다.

1. 앱 내부 구현으로 충분한지 먼저 판단합니다.
2. Figma 또는 반복 사용 근거를 확인합니다.
3. public props와 상태를 최소 API로 정의합니다.
4. `pnpm gen:ds-component`로 scaffold를 생성합니다.
5. 접근성 요구사항을 컴포넌트 책임에 포함합니다.
6. `pnpm --filter @siksa/sds-ui lint`, `typecheck`, `build`로 검증합니다.

## Future Work

아래 항목은 실제 필요가 생길 때 별도 티켓으로 다룹니다.

- Storybook 도입
- design token package 분리
- icon generation pipeline
- compound component API 표준화
- Figma component node map 문서화
