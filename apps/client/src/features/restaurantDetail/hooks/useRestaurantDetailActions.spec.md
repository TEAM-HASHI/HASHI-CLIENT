# Hook Spec: `useRestaurantDetailActions`

## Purpose

`RestaurantDetailPage`와 `TodayRestaurantPage`가 공유하는 식당 상세 액션 흐름을 캡슐화한다.
인증이 필요한 액션의 auth gate 상태, 카카오 로그인 시작, 예약 이동, 메뉴 상세 이동,
현재 준비 중인 좋아요 액션의 coming soon 상태를 한 곳에서 관리한다.

## Hook Type

- [ ] app shared hook
- [x] feature hook
- [ ] page-local hook
- [ ] data fetching hook
- [x] form or interaction hook

## Spec Location

- spec path: `apps/client/src/features/restaurantDetail/hooks/useRestaurantDetailActions.spec.md`
- implementation path: `apps/client/src/features/restaurantDetail/hooks/useRestaurantDetailActions.ts`

## Usage

- 사용 위치:
  - `apps/client/src/pages/restaurantDetail/RestaurantDetailPage.tsx`
  - `apps/client/src/pages/todayRestaurant/TodayRestaurantPage.tsx`
- 이 hook을 사용하는 page가 직접 담당하지 않아도 되는 책임:
  - 좋아요/예약 클릭 시 인증 필요 여부 판단
  - auth gate bottom sheet open 상태 관리
  - coming soon dialog open 상태 관리
  - 카카오 OAuth 시작 시 현재 location 기반 redirect path 전달
  - 식당 예약 생성 route 이동
  - 메뉴 상세 route 이동과 menu detail source state 전달

## Inputs

### `restaurantId`

- type: `string`
- required: `true`
- description: 예약 route와 메뉴 상세 route를 생성할 때 사용하는 식당 id.

### `menuDetailSource`

- type: `RestaurantMenuDetailSource`
- required: `true`
- description: 메뉴 상세 화면이 이전 상세 화면 종류를 복원할 수 있도록 route state에 전달하는 source 값.

## Return Shape

```ts
const {
  isAuthGateOpen,
  isComingSoonOpen,
  onAuthGateOpenChange,
  onComingSoonOpenChange,
  onPressKakao,
  onPressLike,
  onPressMenuItem,
  onPressReservation,
} = useRestaurantDetailActions({
  menuDetailSource,
  restaurantId,
})
```

### `state`

- `isAuthGateOpen`: 인증이 필요한 액션에서 로그인 유도 bottom sheet가 열려 있는지 나타낸다.
- `isComingSoonOpen`: 현재 준비 중인 액션 안내 dialog가 열려 있는지 나타낸다.

### `action`

- `onAuthGateOpenChange`: auth gate bottom sheet open 상태를 외부 UI와 동기화한다.
- `onComingSoonOpenChange`: coming soon dialog open 상태를 외부 UI와 동기화한다.
- `onPressKakao`: 현재 location을 redirect path로 보존한 뒤 Kakao OAuth를 시작한다.
- `onPressLike`: 인증 전에는 auth gate를 열고, 인증 후에는 coming soon dialog를 연다.
- `onPressMenuItem`: 선택한 메뉴의 상세 route로 이동하고 source state를 전달한다.
- `onPressReservation`: 인증 전에는 auth gate를 열고, 인증 후에는 식당 예약 생성 route로 이동한다.

## Behavior

1. hook 초기화 시 `useAuthStatus`, `useKakaoOAuthStart`, router navigate/location을 준비한다.
2. 사용자가 좋아요를 누르면 인증 여부를 확인한다.
3. 인증되지 않은 상태라면 auth gate bottom sheet를 연다.
4. 인증된 상태라면 좋아요 기능이 아직 준비 중이므로 coming soon dialog를 연다.
5. 사용자가 예약하기를 누르면 인증되지 않은 상태에서는 auth gate를 열고, 인증된 상태에서는 예약 생성 route로 이동한다.
6. 사용자가 메뉴를 누르면 인증 여부와 무관하게 메뉴 상세 route로 이동하고 `menuDetailSource`를 route state로 전달한다.
7. 사용자가 auth gate에서 카카오 로그인을 선택하면 현재 location 기반 path를 OAuth redirect 대상으로 전달한다.

## Side Effects

- API 호출: 없음
- cache update/invalidation: 없음
- localStorage/sessionStorage: 직접 접근하지 않음
- navigation:
  - `getRestaurantReservationNewPath(restaurantId)`로 이동
  - `getRestaurantMenuDetailPath(restaurantId, menuId)`로 이동
  - Kakao OAuth 시작 시 현재 route path를 redirect 값으로 전달
- alert/toast: 없음
- logging/tracking: 없음

## Error Handling

- 이 hook은 API 요청을 직접 수행하지 않으므로 request error를 처리하지 않는다.
- OAuth 시작 중 발생하는 세부 에러 처리는 `useKakaoOAuthStart`의 책임이다.
- route 생성에 필요한 `restaurantId`, `menuId`, `menuDetailSource` 값은 호출부가 유효한 값을 전달한다.

## Dependencies

- auth status: `useAuthStatus`
- OAuth start: `useKakaoOAuthStart`
- router: `useNavigate`, `useLocation`
- route helpers:
  - `getPathFromLocation`
  - `getRestaurantMenuDetailPath`
  - `getRestaurantReservationNewPath`

## Non-Goals

- 식당 상세 데이터 조회, 메뉴/리뷰 무한스크롤, 탭 상태 관리는 `useRestaurantDetailContent`가 소유한다.
- 리뷰 작성 가능 여부와 리뷰 작성 route 이동은 `useRestaurantReviewWriteNavigation`이 소유한다.
- 오늘의 식당 다시 추천받기 mutation과 상세 상태 reset은 `TodayRestaurantPage`가 소유한다.
- 실제 좋아요 API mutation, optimistic update, cache invalidation, toast 처리는 현재 책임이 아니다.
  좋아요 액션이 서버 상태 변경을 포함하게 되면 `useRestaurantLikeAction` 또는
  `useRestaurantFavoriteAction` 같은 별도 hook 분리를 검토한다.
- UI markup과 style은 `RestaurantDetailTemplate`, `AuthGateBottomSheet`, `ComingSoonDialog`가 소유한다.

## Verification

- [ ] 비인증 사용자가 좋아요를 누르면 auth gate가 열린다.
- [ ] 인증 사용자가 좋아요를 누르면 coming soon dialog가 열린다.
- [ ] 비인증 사용자가 예약하기를 누르면 auth gate가 열린다.
- [ ] 인증 사용자가 예약하기를 누르면 예약 생성 route로 이동한다.
- [ ] 메뉴를 누르면 메뉴 상세 route로 이동하고 source state를 전달한다.
- [ ] auth gate에서 카카오 로그인을 누르면 현재 location 기반 redirect path로 OAuth를 시작한다.
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
