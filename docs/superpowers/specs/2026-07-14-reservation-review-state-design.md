# Reservation Review State Design

## Context

HASHI-125에서는 예약 정보의 방문 완료 목록에서 리뷰 관련 상태를 서버 계약에 맞게 표시해야 한다. 현재 화면은 `reviewId` 존재 여부와 `reviewable`만으로 작성 완료 여부를 판단하므로 다음 두 상황을 정확히 표현하지 못한다.

- 어디든 예약처럼 리뷰를 지원하지 않는 예약에도 비활성 리뷰 작성 영역이 노출된다.
- 작성했던 리뷰를 삭제하면 서버가 `reviewStatus: DELETED`를 내려주지만, 화면에서는 미작성 예약처럼 보일 수 있다.

방문 완료 목록 API는 `reviewStatus`, `reviewable`, `reviewUnavailableReason`, `reviewId`, `restaurantId`를 제공한다. 이 필드 조합을 페이지 컴포넌트마다 직접 해석하지 않고 화면 전용 상태로 한 번 정규화한다.

## Goal

- 어디든 예약의 방문 완료 카드에서는 리뷰 영역 전체를 숨긴다.
- 삭제된 리뷰는 `리뷰가 삭제되었어요` 문구만 비활성 상태로 표시한다.
- 삭제된 리뷰 카드는 클릭하거나 다시 작성할 수 없게 한다.
- 작성 가능, 작성 완료, 작성 불가에 대한 기존 동작은 유지한다.
- 리뷰 삭제 후 방문 완료 목록을 다시 조회해 서버의 최신 상태를 표시한다.

## API Contract

방문 완료 목록은 다음 API를 사용한다.

```text
GET /api/v1/reviews/visited-reservations?reviewStatus=all
```

화면 상태 판단에 사용하는 응답 필드는 다음과 같다.

- `reviewStatus`: `UNREVIEWED | REVIEWED | DELETED`
- `reviewable`: 현재 리뷰 작성 가능 여부
- `reviewUnavailableReason`: 작성 불가 사유
- `reviewId`: 작성한 리뷰 식별자
- `restaurantId`: 리뷰 작성 경로에 필요한 식당 식별자

어디든 예약은 방문 완료 목록 응답에 `reservationType`이 없으므로 `reviewUnavailableReason: UNSUPPORTED_RESERVATION_TYPE`으로 식별한다.

## View State

서버 응답을 다음 다섯 개의 화면 전용 상태로 변환한다.

| View state    | 조건                                                                               | 화면 동작                                                            |
| ------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `HIDDEN`      | `reviewUnavailableReason === 'UNSUPPORTED_RESERVATION_TYPE'`                       | 예약 카드의 하단 리뷰 영역 전체를 렌더링하지 않는다.                 |
| `DELETED`     | `reviewStatus === 'DELETED'`                                                       | `리뷰가 삭제되었어요` 문구만 표시하고 클릭 이벤트를 연결하지 않는다. |
| `WRITTEN`     | `reviewStatus === 'REVIEWED'`이고 `reviewId`가 존재한다.                           | 작성 완료 상태를 표시하고 리뷰 상세로 이동할 수 있다.                |
| `WRITABLE`    | `reviewStatus === 'UNREVIEWED'`, `reviewable === true`, `restaurantId`가 존재한다. | 리뷰 작성 CTA를 표시하고 작성 페이지로 이동할 수 있다.               |
| `UNAVAILABLE` | 위 조건에 해당하지 않는다.                                                         | 기존 리뷰 작성 불가 안내를 비활성 상태로 표시한다.                   |

상태 판정 우선순위는 `HIDDEN -> DELETED -> WRITTEN -> WRITABLE -> UNAVAILABLE`이다. 따라서 리뷰를 지원하지 않는 예약은 다른 필드 조합과 관계없이 리뷰 영역을 노출하지 않는다.

OpenAPI 생성 타입에서 일부 필드가 선택값이므로 `reviewStatus`가 없는 이전 응답이나 테스트 fixture는 `reviewId`가 있으면 `REVIEWED`, 없으면 `UNREVIEWED`로만 보정한다. 서버가 명시적으로 내려준 `DELETED` 상태는 다른 값으로 추론하지 않는다.

## Architecture

### View model

`createMyVisitedReservationViewModel`이 API 필드 조합을 화면 전용 리뷰 상태로 변환한다. `VisitedReservationCard`는 서버 필드를 다시 해석하지 않고 이 상태만 사용한다.

이 경계는 다음 책임을 갖는다.

- 서버의 리뷰 상태와 작성 불가 사유를 화면 상태로 정규화한다.
- 식별자가 부족한 비정상 조합은 안전하게 `UNAVAILABLE`로 처리한다.
- 기존 응답 및 fixture를 위한 최소한의 fallback을 제공한다.

### Card rendering

`VisitedReservationCard`는 화면 상태를 기준으로 하단 리뷰 영역을 분기한다.

- `HIDDEN`: 하단 영역을 렌더링하지 않는다.
- `DELETED`: 비활성 텍스트를 렌더링한다.
- `WRITTEN`: 기존 작성 완료 버튼을 렌더링한다.
- `WRITABLE`: 기존 별점과 리뷰 작성 CTA를 렌더링한다.
- `UNAVAILABLE`: 기존 작성 불가 버튼을 렌더링한다.

`DELETED`와 `HIDDEN`에는 `onReviewPress`를 연결하지 않는다. 페이지 훅의 이동 처리도 화면 상태를 확인해 잘못된 직접 호출을 방어한다.

## Data Flow

1. 방문 완료 탭이 `reviewStatus=all` 조건으로 목록을 조회한다.
2. 각 응답을 `createMyVisitedReservationViewModel`에서 화면 모델로 변환한다.
3. 카드가 화면 전용 리뷰 상태에 맞는 영역을 렌더링한다.
4. 리뷰 삭제 성공 시 기존 삭제 mutation이 방문 완료 목록 query를 무효화한다.
5. 방문 완료 목록을 다시 조회하면 서버의 `DELETED` 상태가 화면 모델의 `DELETED`로 변환된다.
6. 사용자는 삭제 문구를 볼 수 있지만 상세 이동이나 재작성은 할 수 없다.

삭제 성공 직후 화면을 맞추기 위한 별도 낙관적 캐시 수정은 추가하지 않는다. 기존 query invalidation을 유지해 서버 상태를 단일 기준으로 사용한다.

## Error Handling

- `REVIEWED`인데 `reviewId`가 없거나 `UNREVIEWED`인데 작성 경로에 필요한 식별자가 없으면 `UNAVAILABLE`로 처리한다.
- 알 수 없는 작성 불가 사유는 기존 작성 불가 UI로 처리한다.
- 목록 조회 실패, 재시도, 빈 목록 UI는 현재 페이지 정책을 유지한다.
- 리뷰 삭제 API 실패 시 방문 완료 목록 상태를 임의로 변경하지 않는다.

## Testing

### View model tests

- `UNSUPPORTED_RESERVATION_TYPE`이 `HIDDEN`으로 변환되는지 확인한다.
- `DELETED`가 `DELETED`로 변환되는지 확인한다.
- `REVIEWED`, `UNREVIEWED`, 기타 작성 불가 조합이 각각 올바른 화면 상태로 변환되는지 확인한다.
- 필수 식별자가 없는 응답이 `UNAVAILABLE`로 처리되는지 확인한다.

### Page tests

- 어디든 예약 카드에 리뷰 작성·불가 영역이 모두 나타나지 않는지 확인한다.
- 삭제된 리뷰 카드에 `리뷰가 삭제되었어요`가 표시되는지 확인한다.
- 삭제 문구가 버튼이나 링크가 아니며 클릭해도 이동하지 않는지 확인한다.
- 기존 작성 가능 CTA와 작성 완료 상세 이동이 유지되는지 확인한다.

### Mutation tests

- 리뷰 삭제 성공 시 방문 완료 목록 query invalidation이 유지되는지 확인한다.

## Documentation

`MyReservationsPage.spec.md`에 다음 계약을 반영한다.

- 방문 완료 목록의 화면 상태 변환 기준
- 어디든 예약의 리뷰 영역 숨김
- 삭제된 리뷰의 비활성 문구와 재작성 금지
- 리뷰 삭제 후 방문 완료 목록 재조회 흐름

## Out of Scope

- 삭제된 리뷰 재작성 기능
- 어디든 예약의 리뷰 지원 정책 변경
- 리뷰 삭제 API 또는 방문 완료 목록 API의 서버 계약 변경
- 삭제 직후 방문 완료 목록에 대한 낙관적 캐시 직접 수정
- 방문 완료 카드의 리뷰 영역 외 레이아웃 변경

## Acceptance Criteria

1. 어디든 예약의 방문 완료 카드에는 리뷰 관련 하단 영역이 보이지 않는다.
2. `reviewStatus: DELETED`인 카드에는 `리뷰가 삭제되었어요`가 비활성 상태로 표시된다.
3. 삭제된 리뷰에서는 상세 이동과 리뷰 재작성이 모두 불가능하다.
4. 작성 가능 및 작성 완료 예약의 기존 이동 동작은 유지된다.
5. 리뷰 삭제 성공 후 방문 완료 목록이 무효화되어 서버의 최신 상태를 다시 조회한다.
6. ViewModel, 페이지, 삭제 mutation 관련 테스트와 페이지 spec이 변경된 계약을 검증한다.
