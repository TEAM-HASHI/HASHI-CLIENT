# AnywhereReservationPage Spec

Jira: HASHI-86

## Purpose

`/reservations/anywhere`에서 사용자가 DB에 등록되지 않은 식당 정보를 직접 입력해 예약 초안을 만들고, 예약 확인 페이지로 전달한다.

이 화면은 로컬 입력과 draft를 관리하고, `/reservations/request`에서 기존 어디든 예약 생성 API로 제출한다.

## Route

- path: `/reservations/anywhere`
- path constant: `ROUTES.anywhereReservation`
- access: `authOnly`
- guard: `AuthOnlyRoute`
- layout: 기본 모바일 frame
- bottom navigation: 없음

## Requirements

- 상단 Header는 고정한다.
- 뒤로가기 버튼은 입력이 있으면 나가기 확인 모달을 연다. “계속 예약하기”는 입력을 유지하고, “그만두기”는 저장된 draft를 지우고 `navigate(-1)`로 돌아간다.
- 사용자가 아래 값을 직접 입력할 수 있다.
  - 식당명
  - 식당 주소
  - 예약자명
  - 요청사항(선택)
- 요청사항은 HDS 박스형 textarea로 표시하고 최대 1000자까지만 허용한다.
- 요청사항 아래에 현재 글자 수를 `0/1000` 형식으로 표시한다.
- 인원은 어른/청소년/어린이 카운터로 입력한다.
- 날짜는 Calendar로 선택한다.
- 오늘 및 오늘 이전 날짜는 선택할 수 없다.
- 현재 월보다 이전으로는 이동할 수 없다.
- 날짜를 변경하면 이전에 선택한 시간은 해제한다.
- 날짜를 선택하기 전에는 시간 버튼을 disabled 처리한다.
- 날짜 선택 후 예약 시간을 선택할 수 있다.
- 시간 슬롯은 예약 플로우 공통 정책을 사용한다.
  - `11:00`부터 `23:30`까지
  - 30분 간격
  - 종료 시각 포함
- 필수값이 모두 확정되기 전까지 하단 `다음` CTA는 disabled 상태다.
- 활성화된 CTA 클릭 시 `/reservations/request`로 이동한다.

## Required Values

CTA 활성 조건은 아래 값을 모두 만족해야 한다.

- `restaurantName.trim().length`가 1~100
- `restaurantAddress.trim().length`가 1~255
- `guestName.trim().length`가 1~50
- 각 유형 0~100명, 초기 0명이며 총 인원 수가 1명 이상
- 내일부터 오늘의 3개월 후(해당 날짜가 없으면 월말)까지 선택됨
- 예약 시간이 선택됨

요청사항은 선택값이므로 CTA 활성 조건에 포함하지 않는다.

## Data Dependencies

2026-10-19 OpenAPI의 `CreateAnywhereReservationRequest`와 서버 develop DTO를 대조했다.
Notion #50의 기존 화면 제한(식당명·주소 모두 200자)과 서버 계약이 달라,
식당명 100자·주소 255자로 입력, CTA, draft 검증을 함께 맞춘다.

| API                                  | 입력 / 응답                                                | 실행 및 상태                                                                                               | Cache                                                |
| ------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `POST /api/v1/reservations/anywhere` | `CreateAnywhereReservationRequest` / `ReservationResponse` | 인증 필요. 확인 화면의 기존 mutation으로 제출. 요청 중 버튼 비활성화, 실패 시 안내, 성공 시 완료 화면 이동 | 완료 상세 응답 저장, 포인트 잔액·내 예약 목록 무효화 |
| `GET /api/v1/points/me`              | `PointBalanceResponse`                                     | 확인 화면의 기존 `useSuspenseQuery`, route loading/error 처리                                              | `pointQueryKeys.myBalance()`                         |

- 이 입력 화면은 새로운 query나 mutation을 추가하지 않는다. 기존 API adapter와 cache 정책을 유지한다.
- 글자 수 제한은 공유 상수로 input `maxLength`, form 검증, history draft 검증에 함께 적용한다.
- 확인 화면 왕복에서도 최대 길이의 이름·주소를 그대로 복원한다.
- Notion #57의 포인트 차감·환불 정책은 기획·서버 답변 대기로 이번 변경 범위에 포함하지 않는다.
- 실제 서버 예약 생성과 운영 정책 전체 정합성 검증은 별도로 필요하다.

## State

페이지 로컬 hook인 `useAnywhereReservationForm`이 아래 상태를 소유한다.

- `restaurantName`
- `restaurantAddress`
- `guestName`
- `guestCounts`
  - `adult`
  - `teen`
  - `child`
- `visibleMonth`
- `selectedDate`
- `selectedTime`
- `requestNote`

## Submit Draft

CTA submit 시 현재 입력 화면의 history entry에 draft를 replace 저장한 뒤 확인 화면의 `location.state`로 전달한다. 확인 화면에서 뒤로가면 식당명·주소·예약자명·인원·날짜·시간·요청사항을 모두 복원한다. 빈 요청사항은 draft에서 생략한다.

```ts
interface AnywhereReservationDraft {
  source: 'anywhere'
  restaurantId: null
  restaurantName: string
  restaurantAddress: string
  restaurantImageUrl: null
  guestName: string
  guests: {
    adult: number
    teen: number
    child: number
  }
  date: string
  time: string
  requestNote?: string
}
```

어디든 예약은 DB 식당 이미지가 없을 수 있으므로 `restaurantImageUrl`은 `null`로 전달한다. 예약 확인 페이지는 `source: 'anywhere'` 또는 이미지 부재를 기준으로 어디든 예약 placeholder를 렌더링한다.

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Calendar`
  - `Textarea` (`ReservationRequestNoteField` 내부)
- HDS icon:
  - `BackIcon`
- feature component:
  - `GuestCounter`
  - `ReservationUnderlineTextField`
  - `ReservationRequestNoteField`
  - `ReservationTimeSelector`
  - `ReservationBottomBar`
- page-local hook:
  - `useAnywhereReservationForm`

## Verification

- 식당명 100자·주소 255자는 제출할 수 있고 101자·256자는 차단한다.
- 최대 길이 입력을 확인 화면에 전달하고 뒤로가기로 복원한다.

- 요청사항을 1000자까지만 입력할 수 있고 글자 수 counter가 표시된다.
- 입력한 요청사항이 어디든 예약 draft에 포함된다.
- 초기 CTA는 disabled 상태다.
- 필수 입력값을 모두 채우면 CTA가 enabled 상태가 된다.
- 오늘 및 오늘 이전 날짜는 선택할 수 없다.
- 날짜를 선택하기 전에는 시간 버튼을 누를 수 없다.
- 선택한 날짜를 disabled 날짜로 바꾸면 시간 선택이 초기화된다.
- submit 시 `/reservations/request`로 어디든 예약 draft가 전달된다.
- bottom navigation은 렌더링되지 않는다.
