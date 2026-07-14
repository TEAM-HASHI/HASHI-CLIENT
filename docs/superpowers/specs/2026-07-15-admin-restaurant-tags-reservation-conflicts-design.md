# Admin Restaurant Tags and Reservation Conflicts Design

## Goal

어드민 식당 등록·수정 폼에서 쉼표로 구분한 해시태그를 각각 전송하고, 예약 관리 목록에서 같은 식당의 동일 시간대 예약을 운영자가 구분해 처리할 수 있도록 경고한다.

## Scope

### Restaurant hashtags

- 해시태그 입력값은 사용자가 입력한 문자열 그대로 form state에 보존한다.
- 등록·수정 payload를 만들 때 쉼표(`,`)로 분리한다.
- 각 항목의 앞뒤 공백을 제거하고 빈 항목은 제외한다.
- 해시태그는 기존 계약대로 최소 1개, 각 20자 이하를 검증한다.
- 수정 prefill의 `string[]`은 `, `로 연결해 입력값으로 표시한다.
- 수정 시 해시태그 전체 교체 toggle 동작은 유지한다.

### Reservation time conflicts

- 경고 대상은 `/admin/reservations`의 예약 관리 목록이다.
- 동일 시간대는 `restaurantId`와 `reservedAt`의 분 단위 값이 모두 같은 경우다.
- `CANCELED` 예약은 충돌 집계에서 제외한다.
- 충돌 그룹에 포함된 모든 행에 옅은 경고 배경을 표시한다.
- 방문 일시 옆에 `동일 시간 N건` 배지를 표시한다.
- 다른 식당, 다른 분, 취소 예약에는 경고를 표시하지 않는다.
- 예약 상태 변경과 예약자 조회 동작은 그대로 유지한다.

## Data Flow

### Hashtags

1. `RestaurantFormDrawer`의 해시태그 `Field`가 raw 문자열을 `RestaurantFormState.hashtags`에 저장한다.
2. `parseRestaurantHashtags(value)`가 쉼표 분리, trim, 빈 항목 제거를 수행한다.
3. `toCreateRestaurantBody`와 `toUpdateRestaurantBody`가 parser 결과를 `hashtags: string[]`로 전송한다.
4. `validateRestaurantForm`은 같은 parser 결과를 사용해 최소 개수와 각 항목 길이를 검증한다.

입력 표시와 payload 변환이 같은 배열 state를 공유하지 않도록 해, 쉼표 입력 직후 controlled value가 다시 합쳐지면서 쉼표가 사라지는 현재 문제를 제거한다.

### Reservation conflicts

1. `ReservationsPage`가 현재 query page의 `reservations`를 받는다.
2. 순수 helper가 취소되지 않은 예약을 `restaurantId + reservedAt.slice(0, 16)` key로 집계한다.
3. 같은 key가 2개 이상이면 예약 ID별 충돌 건수를 반환한다.
4. table row는 해당 건수가 있을 때 경고 class와 배지를 렌더링한다.

## Current API Limitation

예약 API는 offset pagination과 단일 status filter만 제공하며 충돌 여부나 전체 시간대 조회 endpoint를 제공하지 않는다. 따라서 경고는 현재 조회된 페이지와 현재 filter 결과 안에서만 계산한다. 다른 페이지 또는 현재 filter에서 제외된 상태에 같은 시간대 예약이 있으면 프론트만으로는 경고할 수 없다.

전체 예약을 기준으로 정확한 충돌 경고가 필요해지면 backend가 `conflictCount` 또는 동등한 필드를 목록 응답에 제공해야 한다. 이번 범위에서는 backend 계약과 generated OpenAPI 파일을 변경하지 않는다.

## UI

- 기존 table column 구조는 유지한다.
- 충돌 행은 hover 상태와 구분되는 옅은 적색 계열 배경을 사용한다.
- 방문 일시 셀의 시간 아래 또는 옆에 작은 `동일 시간 N건` 경고 배지를 표시한다.
- 배지는 색상만으로 의미를 전달하지 않고 문구를 포함한다.
- 충돌이 없는 행의 레이아웃과 액션은 변경하지 않는다.

## Error Handling

- 빈 항목은 payload에서 제거한다.
- 분리 후 유효한 해시태그가 없거나 20자를 초과한 항목이 있으면 기존 폼 오류를 표시한다.
- `reservedAt`이 비어 있거나 `restaurantId`가 유효하지 않으면 충돌 key를 만들지 않는다.
- API query·mutation 오류 처리 방식은 변경하지 않는다.

## Testing

- `스시, 현지인맛집` 입력이 `['스시', '현지인맛집']` payload로 직렬화되는지 검증한다.
- 쉼표 주변 공백과 빈 항목이 정규화되는지 검증한다.
- 수정 prefill 배열이 raw 입력 문자열로 변환되고 전체 교체 payload가 분리되는지 검증한다.
- 같은 식당·같은 분의 활성 예약 2건이 모두 경고 행과 `동일 시간 2건` 배지를 갖는지 검증한다.
- 다른 식당, 다른 시간, 취소 예약이 충돌로 표시되지 않는지 검증한다.
- admin 전체 테스트, lint, typecheck, build, format check와 `git diff --check`를 실행한다.

## Non-goals

- 해시태그 자동완성, 중복 제거, 최대 개수 정책은 추가하지 않는다.
- 예약 충돌을 자동으로 취소하거나 상태 변경하지 않는다.
- 메인 `/admin/dashboard`의 최근 예약 table에는 경고를 추가하지 않는다.
- backend API 또는 generated OpenAPI type을 변경하지 않는다.
