# AnywhereReservationPage Spec

Jira: HASHI-86

## Purpose

`/reservations/anywhere`에서 사용자가 DB에 등록되지 않은 식당 정보를 직접 입력해 예약 초안을 만들고, 예약 확인 페이지로 전달한다.

이번 범위는 API 연동 없이 퍼블리싱, 로컬 입력 상태, CTA 활성/비활성, `/reservations/request` 이동까지만 포함한다.

## Route

- path: `/reservations/anywhere`
- path constant: `ROUTES.anywhereReservation`
- access: `authOnly`
- guard: `AuthOnlyRoute`
- layout: 기본 모바일 frame
- bottom navigation: 없음

## Requirements

- 상단 Header는 고정한다.
- 뒤로가기 버튼 클릭 시 `navigate(-1)`을 호출한다.
- 사용자가 아래 값을 직접 입력할 수 있다.
  - 식당명
  - 식당 주소
  - 예약자명
  - 요청사항(선택)
- 인원은 어른/청소년/어린이 카운터로 입력한다.
- 날짜는 Calendar로 선택한다.
- 오늘 및 오늘 이전 날짜는 선택할 수 없다.
- 현재 월보다 이전으로는 이동할 수 없다.
- 날짜를 변경하면 이전에 선택한 시간은 해제한다.
- 날짜를 선택하기 전에는 시간 버튼을 disabled 처리한다.
- 날짜 선택 후 예약 시간을 선택할 수 있다.
- 시간 슬롯은 예약 플로우 공통 정책을 사용한다.
  - `11:00`부터 `20:00`까지
  - 30분 간격
  - 종료 시각 포함
- 필수값이 모두 확정되기 전까지 하단 `예약 요청하기` CTA는 disabled 상태다.
- 활성화된 CTA 클릭 시 `/reservations/request`로 이동한다.

## Required Values

CTA 활성 조건은 아래 값을 모두 만족해야 한다.

- `restaurantName.trim().length > 0`
- `restaurantAddress.trim().length > 0`
- `guestName.trim().length > 0`
- 총 인원 수가 1명 이상
- 내일 이후 날짜가 선택됨
- 예약 시간이 선택됨

요청사항은 선택값이므로 CTA 활성 조건에 포함하지 않는다.

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

CTA submit 시 `location.state`로 아래 draft를 전달한다.

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
  requestNote: string
}
```

어디든 예약은 DB 식당 이미지가 없을 수 있으므로 `restaurantImageUrl`은 `null`로 전달한다. 예약 확인 페이지는 `source: 'anywhere'` 또는 이미지 부재를 기준으로 어디든 예약 placeholder를 렌더링한다.

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Calendar`
- HDS icon:
  - `BackIcon`
- feature component:
  - `GuestCounter`
  - `ReservationUnderlineTextField`
  - `ReservationTimeSelector`
  - `ReservationBottomBar`
- page-local hook:
  - `useAnywhereReservationForm`

## Verification

- 초기 CTA는 disabled 상태다.
- 필수 입력값을 모두 채우면 CTA가 enabled 상태가 된다.
- 오늘 및 오늘 이전 날짜는 선택할 수 없다.
- 날짜를 선택하기 전에는 시간 버튼을 누를 수 없다.
- 선택한 날짜를 disabled 날짜로 바꾸면 시간 선택이 초기화된다.
- submit 시 `/reservations/request`로 어디든 예약 draft가 전달된다.
- bottom navigation은 렌더링되지 않는다.
