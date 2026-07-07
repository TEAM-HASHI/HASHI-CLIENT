# Styling And Design Tokens

이 문서는 HASHI Client의 styling과 design token 경계를 정의합니다.

## Current State

현재 저장소에는 Tailwind CSS v4가 `apps/client`에 설정되어 있습니다.

공통 색상과 typography token은 `@hashi/hds-tokens`에서 관리합니다.
각 app은 Tailwind CSS v4 entry CSS에서 `@hashi/hds-tokens/styles.css`를 import해 Figma 디자인 시스템 토큰을 Tailwind utility로 노출합니다.

앱별 reset/base style은 각 app의 전역 CSS에서 관리합니다.

## Token Source

현재 `@hashi/hds-tokens/styles.css` 토큰은 HASHI Figma 디자인 시스템 기준입니다.

- Color source: Figma paint style과 Design system canvas label을 대조해 반영합니다.
- Typography source: Figma local text styles(`Header 1` ~ `Long Body 1`)를 반영합니다.
- Dark mode: 현재 기준 없음.

Figma local paint style 이름과 canvas label이 충돌하면, 사용자에게 보이는 Design system canvas label을 우선합니다.
Figma local paint style에만 있고 Design system canvas에 없는 값은 기본 토큰에서 제외합니다.
예외적으로 `Gradient_01`은 local paint style과 canvas label이 모두 있어 `gradient-01`로 정규화해 반영합니다.

## Styling Boundary

- 앱 화면 스타일과 reset/base style은 각 app에서 해결합니다.
- 여러 app/package가 공유하는 foundation token은 `packages/hds-tokens`에서 관리합니다.
- 제품 의미가 없는 UI primitive 스타일만 `packages/hds-ui`로 승격합니다.
- icon visual은 `packages/hds-icons`에서 관리합니다.
- `@hashi/hds-tokens`는 제품 도메인 의미가 없는 color, typography, gradient 같은 foundation token만 담습니다.

## Tailwind Rules

Tailwind CSS를 사용하는 경우:

- 공통 color, typography는 Tailwind v4 `@theme`에서 관리합니다.
- 조건부 class는 문자열 결합보다 `cn` 같은 유틸 사용을 우선합니다.
- `cn` 유틸을 도입하면 위치는 `apps/client/src/shared/utils`에서 시작합니다.
- 여러 패키지에서 같은 class merge 유틸이 필요해지면 별도 shared package 도입을 검토합니다.
- arbitrary value는 꼭 필요한 경우에만 사용합니다.
- `!important` 사용은 지양합니다.

## Current Token Shape

`@hashi/hds-tokens/styles.css`는 public entry CSS이고, 실제 토큰은 `packages/hds-tokens/src/tokens` 아래에서 카테고리별로 관리합니다.

- `font.css`: font family token
- `colors.css`: color token
- `gradients.css`: gradient token
- `typography.css`: typography token과 `typo-*` utility
- `z-index.css`: z-index token

현재 제공하는 utility namespace는 다음과 같습니다.

- Colors: `primary`, `secondary`, `cool-gray`, `warm-gray`, semantic colors
- Gradients: `gradient-01`, `background-image-gradient-01`
- Typography: `typo-header-*`, `typo-sub-header-*`, `typo-body-*`, `typo-caption-*`, `typo-long-body-1`
- Font family: `font-sans` maps to `Pretendard` first, then system fallback
- Z-index: `floating`

App entry CSS example:

```css
@import 'tailwindcss';
@import '@hashi/hds-tokens/styles.css';
```

서비스 폰트 파일은 아직 저장소에 없습니다. Pretendard 파일을 self-hosting하기 전까지는 설치된 환경에서는 Pretendard를 사용하고, 그 외 환경에서는 system font stack으로 fallback합니다.

Tailwind CSS가 app 밖의 workspace package class를 생성해야 할 때는 app entry CSS에서 해당 package source를 `@source`로 명시합니다.
`@hashi/hds-ui` 컴포넌트가 token utility를 내부 class로 사용하기 시작하면 `apps/client`는 `packages/hds-ui/src`를 source로 포함합니다.

## Token Promotion Rule

토큰은 다음 조건을 만족할 때 공통화합니다.

- 두 개 이상의 화면 또는 컴포넌트에서 같은 의미로 반복됩니다.
- Figma token 또는 디자인 시스템 기준과 직접 대응됩니다.
- 값이 바뀔 때 호출부를 일일이 수정하는 비용이 큽니다.

공통화하지 않는 경우:

- 한 화면에서만 쓰는 임시 값입니다.
- 제품 도메인 의미가 강한 값입니다.
- 디자인 기준이 아직 확정되지 않았습니다.

## Font And Asset Rule

- 외부 CDN font를 기본으로 추가하지 않습니다.
- 기본은 system font stack을 사용합니다.
- 서비스 폰트가 확정되면 외부 CDN 대신 self-hosted `woff2` 방식으로 관리합니다.
- font asset이 필요하면 라이선스, 파일 용량, 캐싱 전략을 확인합니다.
- font asset이 필요하면 먼저 app 로컬 asset으로 시작하고, 여러 app/package에서 공유해야 할 때 token package 또는 별도 asset package로 승격합니다.

## Design System

- HDS component는 호출부에서 받은 `className`을 안전하게 병합할 수 있어야 합니다.
- HDS component 내부에 제품별 색상 의미를 넣지 않습니다.
- 앱 도메인 상태를 색상 token으로 바로 고정하지 않고 variant/tone API로 추상화합니다.
- 디자인 시스템 책임 경계는 [Design System](./design-system.md)을 따릅니다.
