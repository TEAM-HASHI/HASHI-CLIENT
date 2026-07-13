# Page Spec: `MypagePage`

Jira: HASHI-106

## Purpose

- 로그인한 사용자가 마이 페이지에서 본인의 프로필, 사용 가능 포인트, 마이 리뷰 개수, 고객지원 메뉴를 확인할 수 있게 합니다.
- 마이 페이지는 하단 네비게이션의 `마이` 탭 진입 화면입니다.
- MVP 범위에서는 프로필 수정, 내가 찜한 식당, 계정 관련 기능을 제외합니다.
- MVP 제외 기능 중 프로필 수정 버튼은 disabled 처리하고, 내가 찜한 식당은 count를 `0`으로 표시한 뒤 클릭 시 공통 준비중 안내 모달을 띄웁니다.
- 로그아웃과 회원탈퇴는 계정 섹션 자체가 MVP에서 제외되었으므로 UI에서 노출하지 않습니다.

## Route

- path: `/mypage`
- path constant:
  - `ROUTES.mypage`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - `BottomNavigationLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.mypage`
- bottom navigation:
  - yes
  - 하단 네비게이션은 페이지 내부에서 직접 구현하지 않고 `BottomNavigationLayout`에서 제공합니다.
- redirect:
  - unauthenticated: `ROUTES.loginRequired`

## Location

```txt
apps/client/src/pages/mypage/
├── MypagePage.tsx
├── MypagePage.spec.md
├── api/
│   └── getMypageProfileSummary.ts
├── components/
│   ├── MypageProfile.tsx
│   ├── MypagePointSummary.tsx
│   ├── MypageMenuCard.tsx
│   ├── MypageMenuSection.tsx
│   └── MypageMenuItem.tsx
├── constants/
│   └── mypageMenu.ts
├── hooks/
│   └── useMypagePage.ts
├── types.ts
└── index.ts

apps/client/src/shared/components/comingSoonDialog/
├── ComingSoonDialog.tsx
└── index.ts

apps/client/src/features/point/
├── api/
│   └── getMyPointBalance.ts
├── hooks/
│   └── useMyPointBalanceQuery.ts
└── index.ts
```

설계 기준:

- `request`와 공통 response 처리는 `shared/api`를 사용합니다.
- API 응답 타입은 `shared/api/generated/openapi.ts`의 `components['schemas']` 타입을 참조합니다.
- `request<T>()`는 성공 응답의 `data`가 비어 있을 수 있으므로 endpoint 함수에서 UI view type으로 정규화합니다.
- 마이페이지에서만 사용하는 endpoint 함수와 query key는 `pages/mypage` 내부에 둡니다.
- 다른 페이지에서도 재사용되는 포인트 잔액 조회는 `features/point`에서 관리합니다.
- API 연동 전후 테스트 fixture가 필요하면 해당 테스트 파일 안에서 endpoint별 mock으로 둡니다.

## Requirements

- [x] 사용자 프로필 영역을 보여줍니다.
  - 프로필 이미지
  - 닉네임
  - 수정 버튼
- [x] 프로필 정보는 `GET /api/v1/users/me/profile-summary`로 조회합니다.
- [x] 프로필 수정 버튼은 MVP 구현에서 제외합니다.
- [x] 프로필 수정 버튼은 disabled 처리합니다.
- [x] 사용 가능 포인트를 보여줍니다.
- [x] 포인트는 `GET /api/v1/points/me`로 조회합니다.
- [x] 예약/리뷰 관련 주요 메뉴를 보여줍니다.
  - 내가 찜한 식당
  - 마이 리뷰
- [x] 내가 찜한 식당 메뉴는 MVP 구현에서 제외합니다.
- [x] 내가 찜한 식당 count는 서버 조회 없이 `0`으로 표시합니다.
- [x] 내가 찜한 식당 메뉴 클릭 시 shared `ComingSoonDialog`를 띄웁니다.
- [x] 마이 리뷰 count는 `GET /api/v1/reviews/me/count`로 조회합니다.
- [x] 마이 리뷰 메뉴는 사용자가 작성한 리뷰 또는 작성 가능한 리뷰를 확인하는 페이지로 이동합니다.
- [x] 고객지원 메뉴를 보여줍니다.
  - 공지사항
  - 문의하기
  - 개선 제안
  - 이용약관
- [x] 공지사항과 이용약관은 Hashi 노션 페이지로 이동합니다.
- [x] 문의하기와 개선 제안은 Hashi 공식 카카오톡 채널로 이동합니다.
- [x] 계정 섹션은 MVP 제외 범위이므로 UI에서 제거합니다.
- [x] 하단 네비게이션은 고정으로 유지됩니다.

## MVP Scope

### Included

- 프로필 정보 API 연동 및 표시
- 사용 가능 포인트 API 연동 및 표시
- 내가 찜한 식당 메뉴 UI 표시
- 내가 찜한 식당 count `0` 고정 표시
- 내가 찜한 식당 클릭 시 준비중 모달 표시
- 마이 리뷰 count API 연동 및 표시
- 마이 리뷰 페이지 이동
- 공지사항 외부 링크 이동
- 문의하기 외부 링크 이동
- 개선 제안 외부 링크 이동
- 이용약관 외부 링크 이동

### Excluded

- 프로필 수정 기능
- 내가 찜한 식당 기능 및 count API 연동
- 계정 섹션 UI
- 로그아웃
- 회원탈퇴

MVP 제외 항목은 디자인에 노출되는 범위와 노출되지 않는 범위를 구분합니다.

- 노출 유지: 프로필 수정 버튼, 내가 찜한 식당
- 노출 제거: 계정 섹션, 로그아웃, 회원탈퇴

## Shared Component: `ComingSoonDialog`

MVP 제외 기능은 여러 페이지에서 반복될 수 있으므로 page-local이 아니라 `apps/client/src/shared/components/comingSoonDialog`에 둡니다.

역할:

- 준비중 기능임을 안내합니다.
- 확인 버튼으로 닫을 수 있습니다.
- 실제 route 이동이나 API 호출은 하지 않습니다.

디자인 문구:

- title: `서비스를 준비하고 있어요.`
- description:
  - `더 편한 Hashi 이용을 위해`
  - `현재 기능을 준비하고 있어요.`
- action label: `확인`

예상 API:

```tsx
type ComingSoonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

구현 기준:

- HDS `Dialog`를 조합합니다.
- icon은 HDS icon의 `SmileIcon`을 사용합니다.
- 확인 버튼은 닫힘만 담당합니다.
- 도메인 문구가 아닌 공통 준비중 안내이므로 shared component로 둡니다.

## UI Sections

### 1. Profile Section

사용자의 기본 프로필 정보를 표시합니다.

노출 정보:

- 프로필 이미지
- 닉네임
- 수정 버튼

데이터:

- `nickname`: `GET /api/v1/users/me/profile-summary`
- `profileImageUrl`: `GET /api/v1/users/me/profile-summary`

동작:

- 수정 버튼은 MVP 제외입니다.
- MVP에서는 버튼을 노출하되 disabled 처리합니다.
- 프로필 이미지가 없으면 `profile-empty.svg` fallback 이미지를 사용합니다.

### 2. Point Section

사용자의 사용 가능 포인트를 표시합니다.

노출 정보:

- label: `사용 가능 포인트`
- value: 예: `7,000 P`

데이터:

- `balance`: `GET /api/v1/points/me`

포인트 값은 서버에서 내려주는 숫자를 화면 표시용 문자열로 포맷합니다.
응답이 없거나 값이 없으면 `0 P`로 표시합니다.

### 3. Primary Menu Cards

예약/리뷰 관련 주요 메뉴를 카드 형태로 보여줍니다.

#### 내가 찜한 식당

- MVP 제외입니다.
- count는 서버 조회 없이 `0`으로 표시합니다.
- 사용자가 클릭하면 `ComingSoonDialog`를 띄웁니다.
- 강조 카드 배경은 `bg-cool-gray-800` 토큰을 사용합니다.

#### 마이 리뷰

- 사용자가 작성한 리뷰 또는 작성 가능한 리뷰를 확인하는 마이 리뷰 페이지로 이동합니다.
- 우측에 마이 리뷰 개수를 표시합니다.
- count 데이터는 `GET /api/v1/reviews/me/count`의 `reviewCount`를 사용합니다.
- route: `ROUTES.myReviews`

### 4. Service Menu Section

서비스 이용 관련 메뉴를 보여줍니다.

#### 공지사항

- Hashi 서비스 공지사항 노션 페이지로 이동합니다.
- 외부 URL은 상수로 관리합니다.

#### 문의하기

- Hashi 공식 카카오톡 채널로 이동합니다.
- 외부 URL은 `HASHI_KAKAO_CHANNEL_URL` 상수로 관리합니다.

#### 개선 제안

- Hashi 공식 카카오톡 채널로 이동합니다.
- 외부 URL은 `HASHI_KAKAO_CHANNEL_URL` 상수로 관리합니다.

#### 이용약관

- Hashi 서비스 이용약관 노션 페이지로 이동합니다.
- 외부 URL은 상수로 관리합니다.

## Data Dependencies

### Query: Profile Summary

마이 페이지 진입 시 사용자 프로필 요약 정보를 조회합니다.

```txt
GET /api/v1/users/me/profile-summary
```

Generated OpenAPI type:

```ts
type ProfileSummaryResponse = components['schemas']['ProfileSummaryResponse']
```

page-local normalized type:

```ts
type MypageProfileSummary = {
  nickname: string
  profileImageUrl?: string | null
}
```

normalization:

- `nickname`: 성공 응답에서 비어 있으면 에러로 처리합니다.
- `profileImageUrl`: `null`

notes:

- generated 타입은 `profileImageUrl?: string`이지만, Swagger description은 프로필 사진 미등록 시 `null`을 내려준다고 명시합니다.
- page-local 타입은 실제 응답과 이미지 fallback 처리를 위해 `string | null | undefined`를 허용합니다.
- `request<ProfileSummaryResponse>()` 결과가 `null`이거나 `nickname`이 비어 있으면 정상 프로필 데이터가 아니므로 ErrorBoundary로 전파합니다.

### Query: Point Balance

마이 페이지 진입 시 사용 가능 포인트를 조회합니다.

```txt
GET /api/v1/points/me
```

Generated OpenAPI type:

```ts
type PointBalanceResponse = components['schemas']['PointBalanceResponse']
```

feature normalized type:

```ts
type MyPointBalance = {
  availablePoint: number
}
```

fallback:

- `availablePoint`: `0`

notes:

- Swagger description은 포인트 이력이 없는 사용자의 `balance`를 `0`으로 내려준다고 명시합니다.
- `request<PointBalanceResponse>()` 결과가 `null`이거나 `balance`가 없으면 `0`으로 정규화합니다.

### Query: My Review Count

마이 페이지 진입 시 마이 리뷰 개수를 조회합니다.

```txt
GET /api/v1/reviews/me/count
```

Generated OpenAPI type:

```ts
type MyReviewCountResponse = components['schemas']['MyReviewCountResponse']
```

feature normalized type:

```ts
type MyReviewCountData = {
  myReviewCount: number
}
```

fallback:

- `myReviewCount`: `0`

notes:

- `request<MyReviewCountResponse>()` 결과가 `null`이거나 `reviewCount`가 없으면 `0`으로 정규화합니다.

### View Model

`useMypagePage`는 세 query 결과와 MVP 고정값을 조합해 화면용 summary를 만듭니다.

```ts
type MypageSummary = {
  nickname: string
  profileImageUrl?: string | null
  availablePoint: number
  myReviewCount: number
}
```

찜한 식당 count는 이번 MVP에서 API를 호출하지 않고 `createMypagePrimaryMenuItems` 내부에서 항상 `0`으로 고정합니다.

### Mutation

MVP 범위에서는 mutation이 없습니다.

추후 확장 후보:

- 프로필 수정
- 내가 찜한 식당 목록
- 로그아웃
- 회원탈퇴

## State

`useMypagePage`에서 관리합니다.

local state:

- `isComingSoonOpen`

server state:

- 사용자 닉네임
- 프로필 이미지
- 사용 가능 포인트
- 마이 리뷰 개수

MVP fixed state:

- 찜한 식당 개수: `0`

derived state:

- 포인트 표시 문자열
- primary menu item 목록
- service menu section 목록
- 외부 링크 open handler
- 내부 route navigation handler

## Navigation

내부 이동:

- 마이 리뷰: `ROUTES.myReviews`

외부 이동:

- 공지사항: `HASHI_NOTICE_URL`
- 문의하기: `HASHI_KAKAO_CHANNEL_URL`
- 개선 제안: `HASHI_KAKAO_CHANNEL_URL`
- 이용약관: `HASHI_TERMS_URL`

외부 링크 처리 기준:

- URL이 확정된 외부 메뉴는 `a`로 렌더링하고 `href`, `target="_blank"`, `rel="noreferrer"`를 사용합니다.
- 외부 URL은 `mypageMenu` 상수에서 관리하며, URL 확정 시 상수만 교체합니다.

MVP 제외:

- 프로필 수정
- 내가 찜한 식당
- 계정 섹션
- 로그아웃
- 회원탈퇴

상호작용 가능한 MVP 제외 기능 클릭:

- 내가 찜한 식당: shared `ComingSoonDialog` open

## Component Mapping

HDS component:

- `Button`
- `Dialog`
- 필요한 경우 `IconButton`

HDS icon:

- 우측 이동 chevron icon
- `SmileIcon`

shared component:

- `ComingSoonDialog`
- 프로필 이미지 fallback이 여러 화면에서 반복되면 shared component 승격을 검토합니다.

page-local components:

- `MypageProfile`
- `MypagePointSummary`
- `MypageMenuCard`
- `MypageMenuSection`
- `MypageMenuItem`

page-local api:

- `getMypageProfileSummary`

hooks:

- `useMypagePage`

feature api:

- `features/point/api/getMyPointBalance`
- `features/point/hooks/useMyPointBalanceQuery`
- `features/review/api/getMyReviewCount`
- `features/review/queries/useMyReviewCountQuery`

constants:

- `mypageMenu`
- 외부 링크 URL 상수

types:

- `MypageSummary`
- `MypageMenuItem`
- `MypageMenuAction`
- `MypageMenuSection`

## Layout Policy

- 마이 페이지는 `BottomNavigationLayout` 아래에서 렌더링합니다.
- 페이지 내부에서 하단 네비게이션을 직접 렌더링하지 않습니다.
- 본문은 하단 네비게이션에 가려지지 않도록 `app-mobile-bottom-nav-content` 기준을 사용합니다.
- 화면 좌우 padding은 디자인 기준에 맞춰 page root에서 관리합니다.
- 상단 별도 Header는 없습니다.
- 계정 섹션을 제거해도 하단 네비게이션과 본문 spacing은 어색하게 붙지 않도록 유지합니다.

## Empty / Loading / Error State

### Loading

- 프로필, 포인트, 리뷰 count 조회 중에는 각 값의 fallback을 먼저 표시하거나 skeleton을 표시합니다.
- 메뉴 목록은 고정 항목이므로 먼저 렌더링할 수 있습니다.
- 세 query가 독립적이므로 한 query의 loading이 다른 영역 렌더링을 막지 않게 합니다.

### Error

- 마이페이지 query 실패는 전역 QueryClient error policy를 따릅니다.
- 5xx, 네트워크 오류, timeout, 예상하지 못한 에러는 `AsyncBoundary`로 전달합니다.
- 마이페이지 필수 query 중 하나라도 실패하면 페이지 hook에서 해당 error를 throw해 `AsyncBoundary`로 전달합니다.
- 4xx API 에러도 마이페이지에서는 fallback 값을 실제 사용자 데이터처럼 보여주지 않고 `AsyncBoundary`로 전달합니다.
- endpoint 함수의 fallback 정규화는 API 요청이 성공했지만 응답 값이 비어 있는 경우에만 사용합니다.
- 내가 찜한 식당 count `0`은 API 실패 fallback이 아니라 MVP 제외 범위에 따른 고정 표시입니다.

### Loading

- 마이페이지 필수 query 중 하나라도 pending 상태이면 `LoadingScreen`을 표시합니다.
- API 응답이 오기 전에는 `DEFAULT_MYPAGE_SUMMARY`를 실제 사용자 데이터처럼 렌더링하지 않습니다.

### Empty

- 마이 페이지 자체 empty state는 없습니다.
- 값이 없는 항목은 아래처럼 처리합니다.
  - 프로필 이미지 없음: 프로필 생성 화면과 같은 `profile-empty.svg` fallback 이미지
  - 포인트 없음: `0 P`
  - 리뷰 개수 없음: `0`
  - 찜한 식당 개수: MVP 고정값 `0`

## Accessibility

- 프로필 이미지는 사용자 식별이 목적이면 닉네임 기반 alt를 제공합니다.
- 단순 장식 이미지면 `alt=""`로 처리합니다.
- 메뉴 항목은 `button` 또는 `a`로 구현합니다.
- 내부 route 이동은 `button` + navigate 또는 `Link`를 사용합니다.
- 외부 링크는 `a`를 사용하고, 새 탭으로 열 경우 `rel="noreferrer"`를 포함합니다.
- 메뉴의 우측 카운트는 시각 정보뿐 아니라 텍스트와 함께 읽혀도 의미가 통하도록 구성합니다.
- disabled 프로필 수정 버튼은 실제로 클릭 동작이 없어야 합니다.

## Test Plan

- `pnpm --filter @hashi/client typecheck`
- `pnpm --filter @hashi/client lint`
- `pnpm --filter @hashi/client test -- MypagePage apiClient`
- 마이 페이지가 `/mypage`에서 렌더링되는지 확인
- 하단 네비게이션의 `마이` 탭이 active인지 확인
- `GET /api/v1/users/me/profile-summary` 결과의 닉네임과 프로필 이미지가 표시되는지 확인
- 프로필 이미지가 없을 때 fallback 이미지가 표시되는지 확인
- `GET /api/v1/points/me` 결과의 `balance`가 `7,000 P` 형식으로 표시되는지 확인
- `GET /api/v1/reviews/me/count` 결과의 `reviewCount`가 마이 리뷰 count로 표시되는지 확인
- 내가 찜한 식당 count가 API 없이 `0`으로 표시되는지 확인
- 내가 찜한 식당 클릭 시 준비중 모달이 열리는지 확인
- 준비중 모달에서 확인 버튼 클릭 시 모달이 닫히는지 확인
- 마이 리뷰 클릭 시 `/my-reviews`로 이동하는지 확인
- 문의하기/개선 제안 클릭 시 카카오톡 채널이 열리는지 확인
- 공지사항/이용약관 클릭 시 노션 페이지가 새 탭으로 열리는지 확인
- 프로필 수정 버튼이 disabled인지 확인
- 로그아웃과 회원탈퇴가 화면에 노출되지 않는지 확인
- 계정 섹션 title이 화면에 노출되지 않는지 확인
- 각 query 실패 시 해당 영역이 fallback 값으로 렌더링되는지 확인

## Open Questions

- 없음.
