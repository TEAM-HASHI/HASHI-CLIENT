# Design System Icons

공통 아이콘은 `packages/hds-icons`에서 React 컴포넌트로 관리합니다.
패키지 전체 역할은 [Design System](./design-system.md)을 따릅니다.

## Current Structure

```text
packages/hds-icons/src/
  index.ts
  types.ts
  icons/
    CheckIcon.tsx
    index.ts
```

현재는 SVG를 직접 React component로 작성합니다. 목표 아이콘 생성 스택은 SVGR이지만, 생성 파이프라인은 아직 없습니다.

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
- 공통 props는 `IconProps`를 사용합니다.

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

- 한 화면에서만 사용합니다.
- 아이콘 이름, 의미, 노출 조건이 특정 제품 도메인에 묶입니다.
- 서버 응답, 라우팅, 이벤트 로깅 등 제품별 동작과 함께 바뀔 가능성이 큽니다.

## SVG Safety

외부 SVG를 복사해 아이콘으로 추가할 때는 아래 입력을 허용하지 않습니다.

- `<script>`, `<foreignObject>`, `<iframe>`, `<object>`, `<embed>`
- `onclick`, `onload` 같은 `on*` 이벤트 속성
- `javascript:` URL
- 외부 `href` 또는 `xlink:href`

`href`와 `xlink:href`는 같은 SVG 내부 symbol이나 gradient를 참조하는 `#id` fragment만 허용합니다.

## Future Generation Pipeline

아이콘 수가 늘어나면 별도 티켓에서 생성 파이프라인을 도입합니다.

도입 시 함께 정의할 항목:

- raw SVG 입력 폴더
- generated TSX 출력 폴더
- 생성 명령
- check 명령
- public export 자동 갱신 규칙
- SVG validation script

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
