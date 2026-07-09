# Page Spec: `MypagePage`

Jira: HASHI-79

## Purpose

- 로그인한 사용자가 본인의 계정 정보, 사용 가능 포인트, 리뷰/고객지원/계정 관련 메뉴를 확인할 수 있는 마이 페이지를 구현합니다.
- MVP 범위에서는 프로필 수정, 찜한 식당, 로그아웃 기능은 제외합니다.
- MVP 제외 기능 중 프로필 수정 버튼은 disabled 처리하고, 상호작용 가능한 제외 메뉴는 공통 준비중 안내 모달을 띄웁니다.
- 마이 페이지는 하단 네비게이션의 `마이` 탭 진입 화면입니다.

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
├── mocks/
│   └── mypage.mock.ts
├── types.ts
└── index.ts

apps/client/src/shared/components/comingSoonDialog/
├── ComingSoonDialog.tsx
└── index.ts
```

초기 구현 시 파일 수가 과해지면 `components/`, `constants/`, `hooks/`, `mocks/`, `types.ts` 중 실제 필요한 파일만 생성합니다.

## Requirements

- [ ] 사용자 프로필 영역을 보여줍니다.
  - 프로필 이미지
  - 닉네임
  - 수정 버튼
- [ ] 프로필 수정 버튼은 MVP 구현에서 제외합니다.
- [ ] 프로필 수정 버튼은 disabled 처리합니다.
- [ ] 사용 가능 포인트를 보여줍니다.
- [ ] 예약/리뷰 관련 주요 메뉴를 보여줍니다.
  - 내가 찜한 식당
  - 마이 리뷰
- [ ] 내가 찜한 식당 메뉴는 MVP 구현에서 제외합니다.
- [ ] 내가 찜한 식당 메뉴 클릭 시 shared `ComingSoonDialog`를 띄웁니다.
- [ ] 마이 리뷰 메뉴는 사용자가 작성한 리뷰 또는 작성 가능한 리뷰를 확인하는 페이지로 이동합니다.
- [ ] 고객지원 메뉴를 보여줍니다.
  - 공지사항
  - 문의하기
  - 개선 제안
  - 이용약관
- [ ] 공지사항과 이용약관은 Hashi 노션 페이지로 이동합니다.
- [ ] 문의하기와 개선 제안은 Hashi 공식 카카오톡 채널로 이동합니다.
- [ ] 계정 메뉴를 보여줍니다.
  - 로그아웃
  - 회원탈퇴
- [ ] 로그아웃은 MVP 구현에서 제외합니다.
- [ ] 로그아웃 클릭 시 shared `ComingSoonDialog`를 띄웁니다.
- [ ] 회원탈퇴는 탈퇴 페이지로 이동합니다.
- [ ] 하단 네비게이션은 고정으로 유지됩니다.

## MVP Scope

### Included

- 프로필 정보 표시
- 사용 가능 포인트 표시
- 마이 리뷰 메뉴 표시 및 이동
- 공지사항 외부 링크 이동
- 문의하기 외부 링크 이동
- 개선 제안 외부 링크 이동
- 이용약관 외부 링크 이동
- 회원탈퇴 페이지 이동

### Excluded

- 프로필 수정 기능
- 내가 찜한 식당 기능
- 로그아웃 기능

MVP 제외 항목은 디자인에 노출되더라도 실제 동작은 연결하지 않거나, 기획 확정 후 연결합니다.
현재 정책은 프로필 수정 버튼은 disabled 처리하고, 상호작용 가능한 제외 메뉴는 shared `ComingSoonDialog`를 띄우는 것입니다.

## Shared Component: `ComingSoonDialog`

MVP 제외 기능은 마이페이지뿐 아니라 여러 페이지에서 반복될 수 있으므로 page-local이 아니라 `apps/client/src/shared/components/comingSoonDialog`에 둡니다.

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

동작:

- 수정 버튼은 MVP 제외입니다.
- MVP에서는 버튼을 노출하되 disabled 처리합니다.

### 2. Point Section

사용자의 사용 가능 포인트를 표시합니다.

노출 정보:

- label: `사용 가능 포인트`
- value: 예: `7,000 P`

포인트 값은 서버에서 내려주는 숫자를 화면 표시용 문자열로 포맷합니다.

### 3. Primary Menu Cards

예약/리뷰 관련 주요 메뉴를 카드 형태로 보여줍니다.

#### 내가 찜한 식당

- MVP 제외입니다.
- 디자인상 카운트가 함께 표시될 수 있습니다.
- 사용자가 클릭하면 `ComingSoonDialog`를 띄웁니다.

#### 마이 리뷰

- 사용자가 작성한 리뷰 또는 작성 가능한 리뷰를 확인하는 마이 리뷰 페이지로 이동합니다.
- 우측에 작성한 리뷰 개수를 표시합니다.
- route: `ROUTES.myReviews`

### 4. Service Menu Section

서비스 이용 관련 메뉴를 보여줍니다.

#### 공지사항

- Hashi 서비스 공지사항 노션 페이지로 이동합니다.
- 외부 URL은 상수로 관리합니다.

#### 문의하기

- Hashi 공식 카카오톡 채널로 이동합니다.
- 외부 URL은 상수로 관리합니다.

#### 개선 제안

- Hashi 공식 카카오톡 채널 또는 별도 개선 제안 채널로 이동합니다.
- 현재 명세 기준으로는 Hashi 공식 카카오톡 채널로 이동합니다.
- 외부 URL은 상수로 관리합니다.

#### 이용약관

- Hashi 서비스 이용약관 노션 페이지로 이동합니다.
- 외부 URL은 상수로 관리합니다.

### 5. Account Menu Section

계정 관련 메뉴를 보여줍니다.

#### 로그아웃

- MVP 제외입니다.
- 사용자가 클릭하면 `ComingSoonDialog`를 띄웁니다.

#### 회원탈퇴

- 회원탈퇴 페이지로 이동합니다.
- route: `ROUTES.withdrawal`

## Data Dependencies

### Query

마이 페이지 진입 시 사용자 요약 정보를 조회합니다.

예상 API:

```txt
GET /api/v1/members/me/summary
```

응답 예상 shape:

```ts
type MypageSummary = {
  userId: string
  nickname: string
  profileImageUrl?: string | null
  availablePoint: number
  myReviewCount: number
  savedRestaurantCount?: number
}
```

MVP 제외 항목인 `savedRestaurantCount`는 서버 응답 여부가 확정되기 전까지 optional로 둡니다.

### Mutation

MVP 범위에서는 mutation이 없습니다.

추후 확장 후보:

- 로그아웃
- 프로필 수정
- 회원탈퇴는 별도 `/withdrawal` 페이지에서 처리합니다.

## State

`useMypagePage`에서 관리합니다.

local state:

- 현재 MVP 범위에서는 필수 local state 없음

server state:

- 사용자 닉네임
- 프로필 이미지
- 사용 가능 포인트
- 마이 리뷰 개수
- 찜한 식당 개수

derived state:

- 포인트 표시 문자열
- 외부 링크 open handler
- 내부 route navigation handler

## Navigation

내부 이동:

- 마이 리뷰: `ROUTES.myReviews`
- 회원탈퇴: `ROUTES.withdrawal`

외부 이동:

- 공지사항: Hashi 공지사항 노션 URL
- 문의하기: Hashi 공식 카카오톡 채널 URL
- 개선 제안: Hashi 공식 카카오톡 채널 URL
- 이용약관: Hashi 이용약관 노션 URL

외부 링크 처리 기준:

- URL이 확정된 외부 메뉴는 `a`로 렌더링하고 `href`, `target="_blank"`, `rel="noreferrer"`를 사용합니다.
- URL이 확정되지 않은 외부 메뉴는 `#`를 열지 않고 shared `ComingSoonDialog`를 띄웁니다.
- 외부 URL은 `mypageMenu` 상수에서 관리하며, URL 확정 시 상수만 교체합니다.

MVP 제외:

- 프로필 수정
- 내가 찜한 식당
- 로그아웃

상호작용 가능한 MVP 제외 기능 클릭:

- shared `ComingSoonDialog` open

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

hooks:

- `useMypagePage`

constants:

- `mypageMenu`
- 외부 링크 URL 상수

mocks:

- `mypage.mock`

types:

- `MypageSummary`
- `MypageMenuItem`

## Layout Policy

- 마이 페이지는 `BottomNavigationLayout` 아래에서 렌더링합니다.
- 페이지 내부에서 하단 네비게이션을 직접 렌더링하지 않습니다.
- 본문은 하단 네비게이션에 가려지지 않도록 `app-mobile-bottom-nav-content` 기준을 사용합니다.
- 화면 좌우 padding은 디자인 기준에 맞춰 page root에서 관리합니다.
- 상단 별도 Header는 없습니다.

## Empty / Loading / Error State

### Loading

- 사용자 요약 정보 조회 중에는 프로필/포인트/카운트 영역에 skeleton 또는 fallback placeholder를 보여줍니다.
- 메뉴 목록은 고정 항목이므로 먼저 렌더링할 수 있습니다.

### Error

- 사용자 요약 정보 조회 실패 시 기본 fallback 문구 또는 error fallback을 표시합니다.
- 내부/외부 메뉴는 가능한 경우 유지합니다.

### Empty

- 마이 페이지 자체 empty state는 없습니다.
- 값이 없는 항목은 아래처럼 처리합니다.
  - 프로필 이미지 없음: 프로필 생성 화면과 같은 `profile-empty.svg` fallback 이미지
  - 포인트 없음: `0 P`
  - 리뷰 개수 없음: `0`

## Accessibility

- 프로필 이미지는 사용자 식별이 목적이면 닉네임 기반 alt를 제공합니다.
- 단순 장식 이미지면 `alt=""`로 처리합니다.
- 메뉴 항목은 `button` 또는 `a`로 구현합니다.
- 내부 route 이동은 `button` + navigate 또는 `Link`를 사용합니다.
- 외부 링크는 `a`를 사용하고, 새 탭으로 열 경우 `rel="noreferrer"`를 포함합니다.
- 메뉴의 우측 카운트는 시각 정보뿐 아니라 텍스트와 함께 읽혀도 의미가 통하도록 구성합니다.

## Test Plan

- `pnpm --filter @hashi/client typecheck`
- `pnpm --filter @hashi/client lint`
- 마이 페이지가 `/mypage`에서 렌더링되는지 확인
- 하단 네비게이션의 `마이` 탭이 active인지 확인
- 사용자 닉네임, 포인트, 리뷰 개수가 표시되는지 확인
- 마이 리뷰 클릭 시 `/my-reviews`로 이동하는지 확인
- 회원탈퇴 클릭 시 `/withdrawal`로 이동하는지 확인
- 문의하기/개선 제안 클릭 시 카카오톡 채널이 열리는지 확인
- 공지사항/이용약관 URL 확정 전에는 준비중 모달이 열리는지 확인
- 공지사항/이용약관 URL 확정 후에는 노션 페이지가 열리는지 확인
- 프로필 수정 버튼이 disabled인지 확인
- MVP 제외 항목이 잘못된 route로 이동하지 않는지 확인
- 상호작용 가능한 MVP 제외 항목 클릭 시 준비중 모달이 열리는지 확인
- 준비중 모달에서 확인 버튼 클릭 시 모달이 닫히는지 확인

## Open Questions

- 공지사항 노션 URL이 확정되어야 합니다.
- 이용약관 노션 URL이 확정되어야 합니다.
- 문의하기/개선 제안에 사용할 Hashi 공식 카카오톡 채널 URL이 확정되어야 합니다.
