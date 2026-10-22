# Design System Icons

공통 아이콘은 `packages/hds-icons`에서 React 컴포넌트로 관리합니다.
패키지 전체 역할은 [Design System](./design-system.md)을 따릅니다.

## Current Structure

```text
packages/hds-icons/src/
  index.ts
  types.ts
  rawIcons/
    check.svg
  icons/
    CheckIcon.tsx
    index.ts
```

현재 `src/rawIcons/*.svg`를 `pnpm --filter @hashi/hds-icons gen:icons`로 변환합니다. 설치된 SVGR이 `src/icons/*.tsx`와 icon barrel을 생성합니다. 생성 컴포넌트는 SVGProps를 받고 기본 크기는 1em이며, 호출부가 크기·색상·접근성 속성을 지정합니다.

## Public API

아이콘은 `@hashi/hds-icons`에서 import합니다.

```ts
import { CheckIcon } from '@hashi/hds-icons'
import type { IconProps } from '@hashi/hds-icons'
```

Root entry는 public icon component와 `IconProps`만 노출합니다.

## Naming

- icon component는 `PascalCase`와 `Icon` suffix를 사용합니다.
- 파일명은 component 이름과 맞춥니다.
- 생성 컴포넌트는 `SVGProps<SVGSVGElement>`를 사용하며, 기존 public `IconProps` 타입도 유지합니다.

Recommended:

```text
src/icons/CheckIcon.tsx
src/icons/ChevronDownIcon.tsx
```

## Placement Criteria

`packages/hds-icons`에 둘 수 있는 경우:

- 여러 화면에서 같은 의미와 형태로 재사용합니다.
- 제품 copy, route, API, logging, analytics에 의존하지 않습니다.
- Figma design-system asset 또는 제품 비의존 primitive icon입니다.

앱 내부에 둬야 하는 경우:

- 한 화면의 도메인 로직이나 노출 조건과 분리할 수 없습니다. 현재 사용처가 하나라는 이유만으로 재사용 가능한 순수 그림을 배제하지는 않습니다.
- 아이콘 이름, 의미, 노출 조건이 특정 제품 도메인에 묶입니다.
- 서버 응답, 라우팅, 이벤트 로깅 등 제품별 동작과 함께 바뀔 가능성이 큽니다.

## SVG Safety

외부 SVG를 복사해 아이콘으로 추가할 때는 아래 입력을 허용하지 않습니다.

- `<script>`, `<foreignObject>`, `<iframe>`, `<object>`, `<embed>`
- `onclick`, `onload` 같은 `on*` 이벤트 속성
- `javascript:` URL
- 외부 `href` 또는 `xlink:href`

`href`와 `xlink:href`는 같은 SVG 내부 symbol이나 gradient를 참조하는 `#id` fragment만 허용합니다.

## Generation Pipeline

- 입력: `src/rawIcons/`의 kebab-case SVG.
- 실행: `pnpm --filter @hashi/hds-icons gen:icons`.
- 출력: `src/icons/*Icon.tsx`와 `src/icons/index.ts`; root entry에서 재노출합니다.
- 전체 아이콘을 재생성하므로 기존 수동 보정까지 변경되지 않는지 diff를 검토합니다.
- 별도의 check 명령과 SVG 내용 안전성 자동 검증은 아직 없습니다. 위 SVG Safety 항목과 lint/typecheck/build로 확인합니다.

지도 그림도 동일한 파이프라인을 사용합니다. RestaurantMarkerIcon, CafeMarkerIcon, BarMarkerIcon은 그림만 제공하고 강조색은 currentColor를 따릅니다. MapViewIcon의 fill/stroke와 MapPinTailIcon의 색·크기는 호출부가 지정합니다. 이름·평점·선택·disabled 동작과 지도 좌표 처리는 앱에 남깁니다.

## Review Checklist

- [ ] 이 아이콘이 `packages/hds-icons`에 속하는지 확인했습니다.
- [ ] app-specific icon placement를 검토했습니다.
- [ ] component 이름이 `Icon` suffix를 사용합니다.
- [ ] public import가 `@hashi/hds-icons`에서 동작합니다.
- [ ] SVG 안전 기준을 확인했습니다.

## Verification

```bash
pnpm --filter @hashi/hds-icons lint
pnpm --filter @hashi/hds-icons typecheck
pnpm --filter @hashi/hds-icons build
pnpm format:check
```
