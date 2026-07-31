# Client Testing Policy

`apps/client/**` 변경의 테스트 작성·수동 확인 기준입니다.

## Scope

- 이 정책은 이번 스프린트의 web client 코드에만 적용합니다.
- `apps/admin/**`, `packages/**`, 서버 저장소에는 이 정책을 자동 적용하지 않습니다.
- HDS나 shared package를 실제로 변경하는 경우에는 해당 패키지의 기존 테스트·검증 기준을 별도로 확인합니다.

## Principle

테스트는 모든 파일 수를 늘리는 것이 아니라, 변경 위험도가 높은 동작을 고정하기 위해 작성합니다.

- 동작·상태·계약이 바뀌면 재현 가능한 자동 테스트를 우선 검토합니다.
- 단순한 UI 스타일 변경은 테스트를 강제하지 않지만, 확인한 화면 상태를 PR에 남깁니다.
- 버그 수정은 버그가 발생했던 조건을 재현하는 테스트를 함께 추가합니다.
- 단순 UI 컴포넌트에 snapshot test를 기계적으로 추가하지 않습니다.

## Test Required

| 기준                        | 예시                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 비즈니스 로직               | 예약 가능 여부, 리뷰 작성 가능 여부, 상태값 변환, 날짜·시간 formatting, filtering, sorting, 가격·권한 계산 |
| API 응답을 화면 모델로 변환 | `createRestaurantDetailViewModel`, `createMyReservationViewModel` 같은 mapper                              |
| 사용자 입력 검증            | 닉네임, 예약 인원, 날짜·시간, 이미지 업로드 validation                                                     |
| 상태별 화면 또는 동작       | 로그인 상태별 이동, 예약 상태별 CTA, loading/error/empty 분기                                              |
| 공통 hook·util 수정         | infinite scroll, request, query key helper, auth session                                                   |
| 버그 수정                   | 버그 조건을 재현하는 regression test                                                                       |

## Test Optional, But Manual Verification Required

| 기준               | 예시                                      | PR에 남길 확인                          |
| ------------------ | ----------------------------------------- | --------------------------------------- |
| 단순 UI 배치       | 간격, 색상, typography, 아이콘 위치, 정렬 | 대상 viewport와 확인 결과               |
| 문구 변경          | 버튼·안내·empty message                   | 변경 화면과 문구 노출                   |
| 단순 컴포넌트 조합 | 기존 컴포넌트로 화면 구성                 | 주요 진입·렌더링 경로                   |
| 스타일 token 적용  | color, spacing, radius token              | hover/focus/disabled 영향을 포함한 상태 |

단, 위 변경도 사용자 클릭·입력·선택, 상태별 UI, API loading/error/empty, 로그인 상태, URL search param, 서버 데이터에 따른 CTA 노출을 건드리면 자동 테스트 또는 명확한 수동 확인을 반드시 추가합니다.

## Priority

1. 순수 함수, formatter, mapper, validation
2. 공통 hook, API/query helper, cache update
3. 사용자 흐름이 중요한 page-local hook
4. 상태 분기 또는 사용자 행동이 있는 UI component

## Evidence In PR

- 테스트를 추가했다면 실행한 test file 또는 command와 결과를 `Verification`에 적습니다.
- 테스트를 생략했다면 위 기준에 따른 사유와 수동 확인 항목을 적습니다.
- spec이 필요한 변경이면 spec의 `Verification`과 PR의 검증 결과가 서로 어긋나지 않아야 합니다.

## Commands

```bash
pnpm --filter @hashi/client test
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client build
```

변경 범위에 맞는 test file만 먼저 실행할 수 있지만, PR 전 최종 검증 범위와 생략 사유를 PR에 남깁니다.
