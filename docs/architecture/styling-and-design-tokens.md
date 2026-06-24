# Styling And Design Tokens

이 문서는 HASHI Client의 styling과 design token 경계를 정의합니다.

## Current State

현재 저장소에는 Tailwind CSS와 별도 token package가 아직 기본 dependency로 들어와 있지 않습니다.

다만 화면과 컴포넌트에서 Tailwind CSS를 사용할 경우 `docs/conventions/coding.md`의 Tailwind CSS 컨벤션을 따릅니다.

목표 styling stack은 Tailwind CSS입니다. 도입 시 dependency, theme, formatter 설정을 함께 추가하고 이 문서를 갱신합니다.

## Styling Boundary

- 앱 화면 스타일은 먼저 `apps/client`에서 해결합니다.
- 제품 의미가 없는 UI primitive 스타일만 `packages/sds-ui`로 승격합니다.
- icon visual은 `packages/sds-icons`에서 관리합니다.
- 디자인 토큰 패키지는 실제 반복과 요구가 생긴 뒤 별도 티켓으로 도입합니다.

## Tailwind Rules

Tailwind CSS를 도입하거나 사용하는 경우:

- 공통 color, spacing, font size는 Tailwind theme에서 관리합니다.
- 조건부 class는 문자열 결합보다 `cn` 같은 유틸 사용을 우선합니다.
- `cn` 유틸을 도입하면 위치는 `apps/client/src/shared/utils`에서 시작합니다.
- 여러 패키지에서 같은 class merge 유틸이 필요해지면 별도 shared package 도입을 검토합니다.
- arbitrary value는 꼭 필요한 경우에만 사용합니다.
- `!important` 사용은 지양합니다.

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
- token package가 생기기 전에는 앱 로컬 asset으로 시작하고, 공통 token package가 필요해지면 별도 티켓에서 이동합니다.

## Design System

- SDS component는 호출부에서 받은 `className`을 안전하게 병합할 수 있어야 합니다.
- SDS component 내부에 제품별 색상 의미를 넣지 않습니다.
- 앱 도메인 상태를 색상 token으로 바로 고정하지 않고 variant/tone API로 추상화합니다.
- 디자인 시스템 책임 경계는 [Design System](./design-system.md)을 따릅니다.
