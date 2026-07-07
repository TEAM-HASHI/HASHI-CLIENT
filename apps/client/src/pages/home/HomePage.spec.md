# Page Spec: `HomePage`

## Purpose

- 사용자가 Hashi 서비스의 주요 기능과 추천 콘텐츠를 한눈에 확인하고 검색, 큐레이션, 예약, SNS 기반 맛집 콘텐츠, 하단 탭 화면으로 빠르게 이동할 수 있는 첫 진입 화면을 제공합니다.
- 현재 디자인 기준 구현 범위는 첨부 이미지의 홈 화면입니다.
- 새 공통 컴포넌트를 무리하게 만들지 않고, 현재 프로젝트에 이미 있는 HDS 컴포넌트와 아이콘을 우선 사용합니다.
- API가 아직 확정되지 않은 배너와 SNS 맛집 데이터는 page-local 정적 mock 데이터로 먼저 구현하고, API 확정 시 page-local query로 교체합니다.

## Route

- path: `/`
- path constant:
  - `ROUTES.home`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - `BottomNavigationLayout`
- access type:
  - public
- guard:
  - none
- lazy loading:
  - eager
  - 홈은 첫 진입 화면이므로 `lazyPages`에 넣지 않고 `routes.ts`에서 `HomePage`를 직접 import합니다.
- bottom navigation:
  - yes
  - 홈 페이지 내부에서 하단 네비게이션을 다시 만들지 않습니다.
  - `BottomNavigationLayout`이 `@hashi/hds-ui`의 `BottomNavigation`과 `@hashi/hds-icons`의 하단 탭 아이콘을 조립합니다.
- redirect:
  - unauthenticated: 없음
  - authenticated guest: 해당 없음
- auth status:
  - uses `useAuthStatus`: yes
  - 비로그인 사용자가 브라우저 세션에서 홈 페이지에 처음 진입하면 기존 `AuthGateBottomSheet`를 유지합니다.
  - 같은 브라우저 세션에서는 새로고침해도 로그인 유도 바텀시트를 반복 노출하지 않습니다.

## Location

- page path:
  - `apps/client/src/pages/home/HomePage.tsx`
- spec path:
  - `apps/client/src/pages/home/HomePage.spec.md`
- page-local components:
  - `apps/client/src/pages/home/components/HomeLogo.tsx`
  - `apps/client/src/pages/home/components/HomeSearchEntry.tsx`
  - `apps/client/src/pages/home/components/HomeCurationSection.tsx`
  - `apps/client/src/pages/home/components/HomeQuickMenuSection.tsx`
  - `apps/client/src/pages/home/components/AnywhereReservationCta.tsx`
  - `apps/client/src/pages/home/components/HotSnsRestaurantSection.tsx`
  - `apps/client/src/pages/home/components/QuickMenuItem.tsx`
- page-local hook:
  - `apps/client/src/pages/home/hooks/useHomePage.ts`
- page-local mock:
  - `apps/client/src/pages/home/mocks/homeContent.mock.ts`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/routes.ts`
  - `apps/client/src/app/router/lazy.ts`는 변경하지 않습니다.

## Existing Asset Check

- 현재 저장소에는 `apps/client/src/shared/assets/logos/hashi-logo.svg` 브랜드 로고 asset이 있습니다.
- 현재 저장소에는 `HashiLogo` React 컴포넌트가 없습니다.
- 확인 범위:
  - `apps/client/src`
  - `packages`
  - `docs`
- 혼동하면 안 되는 기존 asset:
  - `packages/hds-icons/src/icons/HashiPickIcon.tsx`는 퀵 버튼용 하시 PICK 아이콘입니다.
  - `packages/hds-icons/src/rawIcons/hashi-pick.svg`도 브랜드 로고가 아닙니다.
  - `packages/hds-ui/src/components/carousel/assets/banner_magazine.png`는 Storybook용 carousel 예시 asset입니다.
  - `apps/client/src/shared/assets/images/empty.webp`, `not-found.webp`는 상태 화면 이미지입니다.

## Logo Asset Decision

- 결정:
  - 앱 UI에서 import해 사용하는 로고 asset은 `apps/client/src/shared/assets/logos/`에 둡니다.
- 위치:
  - `apps/client/src/shared/assets/logos/hashi-logo.svg`
- 사용 방식:
  - SVG를 React component로 새로 수동 변환하지 않고 Vite asset import로 사용합니다.
  - 예시:

```tsx
import hashiLogoSrc from '@/shared/assets/logos/hashi-logo.svg'

export const HomeLogo = () => {
  return (
    <img
      src={hashiLogoSrc}
      alt="Hashi"
      className="h-[23px] w-[73px]"
      width={73}
      height={23}
    />
  )
}
```

- HDS 승격 금지:
  - 브랜드 로고는 제품 브랜드 asset이므로 `packages/hds-icons`나 `packages/hds-ui`에 넣지 않습니다.
- 파일 기준:
  - 파일명은 kebab-case asset 관례로 `hashi-logo.svg`를 사용합니다.
  - SVG 내부 색상은 원본 asset 기준을 유지하고, 임의로 currentColor 아이콘처럼 만들지 않습니다.

## Requirements

- [ ] 상단 상태바 영역 아래에 Hashi 로고를 노출합니다.
- [ ] 검색 진입 영역을 노출하고, 탭 또는 클릭 시 `ROUTES.search`로 이동합니다.
- [ ] 메인 배너 섹션 타이틀 `맛집 큐레이션을 둘러보세요!`를 노출합니다.
- [ ] 메인 배너는 여러 장 carousel로 노출합니다.
- [ ] 메인 배너 데이터는 최종적으로 서버에서 받은 이미지와 인스타그램 이동 대상 정보로 구성합니다.
- [ ] 퀵 버튼 4개를 노출합니다.
  - 하시 PICK: `ROUTES.hashiPickRestaurants`
  - 인기 맛집: `ROUTES.popularRestaurants`
  - 매거진: `ROUTES.magazines`
  - 오늘의 식당: `ROUTES.todayRestaurant`
- [ ] 어디든 예약 CTA를 노출하고, `예약하기` 버튼 클릭 시에만 `ROUTES.anywhereReservation`으로 이동합니다.
- [ ] `SNS에서 핫한 일본 식당` 섹션을 노출합니다.
- [ ] SNS 기반 맛집 콘텐츠는 이미지, 식당명, 한 줄 요약을 리스트 형태로 보여주고, 항목 클릭 시 식당 상세 화면으로 이동합니다.
- [ ] 하단 네비게이션은 홈, 저장, 지도, 내 예약, 마이 탭을 제공합니다.
- [ ] 저장과 지도는 MVP 범위에서 준비중/임시 화면일 수 있으며, 홈 페이지 내부에서는 별도 구현하지 않습니다.
- [ ] 이미지나 API 데이터가 아직 없을 때 최종 구현처럼 보이는 임시 체크보드 placeholder를 남기지 않습니다.

## Data Dependencies

### Query

- query:
  - MVP에서는 서버 query 없이 page-local 정적 mock 데이터로 구현합니다.
  - API가 확정되면 `useHomePage` 내부의 `homeBanners`, `hotSnsRestaurants` 같은 홈 전용 query로 교체합니다.
  - query/mutation 코드는 HDS나 아이콘 패키지에 넣지 않습니다.
- enabled condition:
  - MVP 정적 데이터: 해당 없음
  - API 연동 후: 홈 진입 즉시
- request params:
  - MVP 정적 데이터: 해당 없음
  - API 연동 후: 서버 스펙에 맞춰 배너 개수, SNS 맛집 개수, 지역 또는 언어 필터가 생기면 명시합니다.
- response shape:
  - `homeBanners` 예상 필드:
    - `id`
    - `imageUrl`
    - `imageAlt`
    - `instagramUrl`
  - `hotSnsRestaurants` 예상 필드:
    - `restaurantId`
    - `name`
    - `summary`
    - `imageUrl`
    - `imageAlt`
- loading state:
  - MVP 정적 데이터: 없음
  - API 연동 후: 배너와 리스트 높이를 유지하는 skeleton 또는 대체 레이아웃을 사용합니다.
- error state:
  - MVP 정적 데이터: 없음
  - API 연동 후: 전체 페이지 실패로 막지 않고 실패한 섹션만 축소하거나 재시도 UI를 제공합니다.
- empty state:
  - 배너 데이터가 없으면 메인 배너 영역을 숨기거나 서비스 기본 배너를 사용합니다.
  - SNS 리스트가 없으면 섹션을 숨기는 것을 우선합니다.
- refetch condition:
  - API 연동 후 정책 확정 시 작성합니다.

### Mutation

- mutation:
  - 없음
- request data:
  - 없음
- submit enabled condition:
  - 해당 없음
- success handling:
  - 해당 없음
- failure handling:
  - 해당 없음

## User Flow

1. 사용자가 `/`로 진입합니다.
2. 페이지가 홈 콘텐츠를 구성합니다.
3. 비로그인 상태이고 현재 브라우저 세션에서 아직 표시한 적이 없다면 기존 로그인 유도 바텀시트를 표시합니다.
4. 사용자가 검색 영역을 선택하면 홈에서 입력을 받지 않고 `/search`로 이동합니다.
5. 사용자가 메인 배너를 선택하면 해당 인스타그램 링크로 이동합니다.
6. 사용자가 퀵 버튼을 선택하면 연결된 앱 내부 화면으로 이동합니다.
7. 사용자가 어디든 예약 CTA의 `예약하기` 버튼을 선택하면 `/reservations/anywhere`로 이동합니다.
8. 사용자가 SNS 맛집 항목을 선택하면 해당 식당 상세로 이동합니다.
9. 사용자가 하단 네비게이션 탭을 선택하면 `BottomNavigationLayout`이 해당 route로 이동합니다.

## State

- local state:
  - `isAuthGateOpen`: 기존 로그인 유도 바텀시트 표시 여부
  - `sessionStorage['hashi:home-auth-gate-shown']`: 같은 브라우저 세션에서 로그인 유도 바텀시트 반복 노출 방지
- form state:
  - 없음
  - 홈 검색 영역은 입력 폼을 소유하지 않고 검색 페이지 진입점으로만 동작합니다.
- URL state:
  - 없음
- server state:
  - MVP 정적 데이터에서는 없음
  - API 연동 후 배너/추천 리스트 query state
- derived state:
  - 로그인 상태와 세션 노출 여부를 반영한 `AuthGateBottomSheet` 표시 여부

## Validation

- field:
  - 없음
- submit enabled condition:
  - 해당 없음

## UI Structure

```text
HomePage
  HomeLogo
  HomeSearchEntry
  HomeCurationSection
    SectionHeading
    Carousel
  HomeQuickMenuSection
    QuickMenuItem x 4
  AnywhereReservationCta
  HotSnsRestaurantSection
    SectionHeading
    Restaurant link x N
  AuthGateBottomSheet

BottomNavigationLayout
  Outlet(HomePage)
  BottomNavigation
```

## Top-To-Bottom Component Mapping

### 0. Page shell and auth gate

- Reuse:
  - `BottomNavigationLayout`
  - `AuthGateBottomSheet`
  - `useAuthStatus`
- Do not create:
  - 홈 전용 하단 네비게이션
  - 홈 전용 로그인 유도 바텀시트
- Page-local:
  - `useHomePage`
  - 단순 content composition
- Notes:
  - `RootLayout`이 `main`과 `app-mobile-frame`을 제공하므로 홈 페이지 내부에서 다시 `main` 또는 `app-mobile-frame`을 만들지 않습니다.
  - 홈 본문은 `BottomNavigationLayout`의 하단 네비게이션 padding을 고려합니다.

### 1. Search entry

- Reuse:
  - `SearchField` from `@hashi/hds-ui`
  - `SearchIcon` is already included in `SearchField`
  - `ROUTES.search`
- Do not create:
  - 새 검색 input primitive
  - 새 검색 아이콘
- Page-local:
  - `HomeSearchEntry`
- Behavior:
  - 사용자가 홈에서 검색어를 입력하는 플로우가 아니라면 `SearchField`를 실제 form input으로 운영하지 않습니다.
  - `SearchField`를 `readOnly` 시각 요소로 렌더링하고, 실제 이동 컨트롤은 `ROUTES.search`로 이동하는 page-local `Link`가 담당합니다.
  - 아이콘/패딩을 포함한 검색 박스 전체가 클릭 진입점이 되도록 `HomeSearchEntry`에서 링크 클릭 영역을 제공합니다.
  - 접근 가능한 컨트롤 이름은 `식당 또는 메뉴 검색하기`로 제공합니다.
- Risk:
  - `SearchField` 내부는 `input type="search"`입니다. `div onClick` navigation만 붙이면 의미상 클릭 가능한 컨트롤이 불명확합니다.
  - 이 충돌을 줄이기 위해 홈에서는 `SearchField`를 `readOnly`와 `tabIndex={-1}`로 렌더링하고, 실제 검색어 입력은 검색 페이지가 소유합니다.

### 2. Main banner

- Reuse:
  - `Carousel` from `@hashi/hds-ui`
- Do not create:
  - 새 HDS banner/carousel component
  - `packages/hds-ui`에 Hashi 큐레이션 copy가 박힌 banner component
- Page-local:
  - `HomeCurationSection`
- Assets:
  - 최종 배너 이미지는 서버 응답의 `imageUrl`을 사용합니다.
  - API 전까지는 page-local mock 데이터와 임시 이미지 asset을 사용할 수 있습니다.
  - 임시 이미지 asset은 홈 전용이면 `apps/client/src/pages/home/assets/`, 여러 화면에서 재사용하면 `apps/client/src/shared/assets/`에 둡니다.
  - 임시 체크보드 placeholder를 최종 구현처럼 남기지 않습니다.
- Data:
  - 최종 서버 응답은 이미지와 인스타그램 이동 대상 정보를 포함한다고 가정합니다.
  - 문구는 이미지에 포함되어 있으므로 홈 UI가 별도 제목/설명 copy를 배너 위에 덧씌우지 않습니다.
  - 이동 대상은 서버가 내려주는 인스타그램 URL입니다.
- Behavior:
  - 배너 항목은 `instagramUrl`을 데이터에 포함합니다.
  - 외부 링크이므로 React Router `Link`가 아니라 `<a>`를 사용합니다.
  - 클릭 영역 전체가 하나의 링크로 동작합니다.
  - carousel은 여러 장을 지원하고, 단일 mock 데이터만 있을 때도 구조는 `Carousel` 기반으로 유지합니다.

### 3. Quick buttons

- Reuse icons:
  - `HashiPickIcon`
  - `PopularIcon`
  - `MagazineIcon`
  - `TodayRestaurantIcon`
- Reuse route constants:
  - `ROUTES.hashiPickRestaurants`
  - `ROUTES.popularRestaurants`
  - `ROUTES.magazines`
  - `ROUTES.todayRestaurant`
- Do not create:
  - 새 HDS quick-button component
  - 새 아이콘
- Page-local:
  - `HomeQuickMenuSection`
  - `QuickMenuItem`
- Behavior:
  - 각 버튼은 `button`보다 `Link`를 우선합니다.
  - 아이콘은 장식으로 처리하고 텍스트 label이 접근 가능한 이름이 되게 합니다.
- Layout:
  - 최소 모바일 폭에서도 4개 퀵 메뉴가 부모 폭을 넘지 않도록 `grid-cols-4`로 동일한 4칸을 나눕니다.
- Notes:
  - 현재 아이콘 SVG 자체에 고정 fill/stroke가 들어 있으므로 색상 변경이 필요하면 HDS icon 수정 전에 디자인 요구사항을 재확인합니다.

### 4. Anywhere reservation CTA

- Reuse:
  - `Button` from `@hashi/hds-ui` for `예약하기`
  - `CheckIcon` from `@hashi/hds-icons` for 검은 원 안 체크 아이콘
  - `ROUTES.anywhereReservation`
- Do not create:
  - 예약 CTA를 HDS 컴포넌트로 승격
  - 예약 route 또는 auth flow를 CTA 내부에 숨기는 shared component
- Page-local:
  - `AnywhereReservationCta`
- Behavior:
  - `예약하기` 버튼 클릭 시에만 어디든 예약 화면으로 이동합니다.
  - CTA container 전체를 링크나 버튼으로 만들지 않습니다.
  - 어디든 예약 페이지는 `authOnly`이므로 비로그인 사용자는 기존 route guard 정책에 따라 `/login-required`로 이동합니다.
- Styling:
  - CTA container의 어두운 배경, 문구, 버튼 배치는 홈 페이지 전용 스타일입니다.
  - HDS `Button`의 기본 `primary`가 디자인과 맞지 않으면 `className`으로 홈 CTA 범위에서만 보정합니다.

### 5. SNS hot restaurants section

- Reuse:
  - 현재 재사용 가능한 식당 리스트/카드 컴포넌트는 확인되지 않았습니다.
  - 이미지 렌더링은 일반 `img`를 사용합니다.
- Do not create:
  - 초기부터 `shared/components/RestaurantCard`
  - HDS 식당 카드
  - SNS 데이터 shape에 묶인 HDS component
- Page-local:
  - `HotSnsRestaurantSection`
- Data:
  - 최소 필드:
    - `restaurantId`
    - `name`
    - `summary`
    - `imageUrl` 또는 mock 단계의 `imageSrc`
    - `imageAlt`
  - 이동 대상은 식당 상세로 통일합니다.
  - `ROUTES.restaurantDetail`에 `restaurantId`를 주입하는 page-local path helper가 필요합니다.
  - `restaurantId`는 URL path segment로 들어가므로 `encodeURIComponent`로 인코딩합니다.
- Behavior:
  - 항목 전체를 링크로 만들고, 제목과 요약은 1줄 말줄임으로 처리합니다.
  - 이미지 alt는 식당명만 반복하지 말고 이미지 의미가 있으면 `돈카츠 후쿠마루 도쿄역 야에스점 대표 메뉴`처럼 작성합니다.

### 6. Bottom navigation

- Reuse:
  - `BottomNavigationLayout`
  - `BottomNavigation`
  - `HomeIcon`, `SaveIcon`, `MapIcon`, `MyReservationIcon`, `MyIcon`
- Do not create:
  - 홈 페이지 내부 하단 네비게이션
  - 홈 전용 bottom tab data
- Notes:
  - 이미 `BottomNavigationLayout`에서 route별 active value와 navigation을 담당합니다.
  - 홈 구현은 bottom fixed 영역과 겹치지 않도록 본문 spacing만 확인합니다.

## Component Boundary Decisions

- HDS 사용:
  - `SearchField`
  - `Button`
  - `Carousel`
  - `BottomNavigation` through `BottomNavigationLayout`
- HDS icons 사용:
  - `HashiPickIcon`
  - `PopularIcon`
  - `MagazineIcon`
  - `TodayRestaurantIcon`
  - `CheckIcon`
  - `HomeIcon`
  - `SaveIcon`
  - `MapIcon`
  - `MyReservationIcon`
  - `MyIcon`
- App shared 사용:
  - `AuthGateBottomSheet`
  - `useAuthStatus`
- Page-local로 구현:
  - `HomeLogo`
  - `HomeSearchEntry`
  - `HomeCurationSection`
  - `HomeQuickMenuSection`
  - `QuickMenuItem`
  - `AnywhereReservationCta`
  - `HotSnsRestaurantSection`
  - `useHomePage`
  - `mocks/homeContent.mock.ts`
- 새로 만들지 않을 것:
  - HDS `HomeBanner`
  - HDS `RestaurantCard`
  - HDS `QuickButton`
  - App shared `RestaurantCard`
  - App shared `BottomNavigation`

## Navigation

- entry:
  - `/`
- links:
  - Search entry: `ROUTES.search`
  - Main banner: banner data의 `instagramUrl`
  - 하시 PICK: `ROUTES.hashiPickRestaurants`
  - 인기 맛집: `ROUTES.popularRestaurants`
  - 매거진: `ROUTES.magazines`
  - 오늘의 식당: `ROUTES.todayRestaurant`
  - 어디든 예약: `ROUTES.anywhereReservation`
  - SNS 리스트 항목: `ROUTES.restaurantDetail`
- route params:
  - SNS 리스트 식당 상세 이동: `restaurantId`
  - 메인 배너 이동: 서버가 내려준 Instagram URL
- search params:
  - 없음
- success redirect:
  - 없음
- failure redirect:
  - 없음
- back behavior:
  - browser default
- auth redirect:
  - 홈은 public입니다.
  - 어디든 예약, 저장, 내 예약, 마이 등 authOnly route 진입 시 라우터 guard 정책을 따릅니다.

## Styling

- Tailwind layout:
  - 본문은 `RootLayout`의 `app-mobile-frame` 기반 모바일 폭에 맞춥니다.
  - 전체 배경은 현재 global base의 `cool-gray-50`를 따르고, 홈 콘텐츠 영역은 디자인에 맞게 흰색 표면을 구성합니다.
  - section 간격은 이미지 기준으로 유지하되, 반복되는 arbitrary value는 최소화합니다.
- responsive:
  - 최소 320px 폭에서도 검색 placeholder, CTA 문구, 버튼 텍스트가 겹치지 않아야 합니다.
  - `--app-mobile-max-width: 430px` 안에서 자연스럽게 확장됩니다.
- fixed area:
  - 하단 네비게이션은 `BottomNavigationLayout`의 `app-mobile-fixed-bottom`이 담당합니다.
- scroll area:
  - 홈 본문만 세로 스크롤됩니다.
  - fixed bottom navigation과 마지막 리스트 항목이 겹치지 않아야 합니다.
- empty/loading/error layout:
  - MVP 정적 데이터에서는 없음
  - API 연동 후 섹션별 fallback을 추가합니다.

## Accessibility

- 홈 본문은 `RootLayout`의 `main` 안에서 렌더링합니다.
- 검색 진입점은 클릭 가능한 컨트롤 하나로 만들고 명확한 accessible name을 제공합니다.
- 퀵 버튼과 SNS 리스트 항목은 링크로 구현합니다.
- 어디든 예약 CTA는 `예약하기` 버튼만 interactive element로 구현합니다.
- 장식 아이콘은 `aria-hidden="true"`로 처리합니다.
- 이미지에는 의미 있는 `alt`를 제공합니다.
- 배너 carousel을 사용할 경우 `Carousel.Root`에 `aria-label`을 제공합니다.
- 텍스트 말줄임은 시각 표현에만 사용하고, 링크 이름이 과도하게 잘리지 않도록 제목 텍스트는 DOM에 유지합니다.

## Error Handling

- API error:
  - MVP 정적 데이터에서는 없음
  - API 연동 후 섹션 단위 fallback을 사용합니다.
- validation error:
  - 없음
- exceptional case:
  - 이미지 로드 실패 시 레이아웃이 깨지지 않도록 고정 크기/비율과 배경색을 유지합니다.
  - route target이 확정되지 않은 콘텐츠는 클릭 가능한 UI로 노출하지 않습니다.
- user-facing message:
  - 홈 전체 error message는 만들지 않습니다.
  - 특정 섹션 실패가 사용자에게 의미 있을 때만 짧은 안내를 노출합니다.
- retry or fallback:
  - API 연동 후 필요 시 섹션 단위 재시도 버튼을 검토합니다.

## Implementation Notes

- `HomePage.tsx`는 page-local section 컴포넌트 조합과 auth gate 렌더링에 집중합니다.
- 정적 mock 데이터는 `apps/client/src/pages/home/mocks/homeContent.mock.ts`에 둡니다.
- 홈 데이터 반환, 검색 path, 어디든 예약 이동, 식당 상세 path 생성, 로그인 유도 바텀시트 상태는 `apps/client/src/pages/home/hooks/useHomePage.ts`가 담당합니다.
- API 확정 후 query는 우선 `useHomePage` 내부에서 mock 데이터를 교체합니다.
- 여러 페이지에서 같은 홈 콘텐츠 API를 재사용하게 될 때만 feature/shared 승격을 검토합니다.
- route path 조합이 필요하면 문자열 직접 조합을 흩뿌리지 말고 page-local helper를 둡니다.
- API 전 임시 식당 이미지 asset이 필요하면 page-local assets에 두고, API 전환 시 제거합니다.
- 로고는 새 SVG asset으로 추가하고 Vite asset import로 사용합니다.

## Verification

- [ ] `corepack pnpm --filter @hashi/client lint`
- [ ] `corepack pnpm --filter @hashi/client typecheck`
- [ ] `corepack pnpm --filter @hashi/client build`
- [ ] `corepack pnpm --filter @hashi/client test`
- [ ] `corepack pnpm format:check`
- [ ] `git diff --check`
- [ ] `/` 직접 진입 확인
- [ ] 비로그인 상태에서 브라우저 세션 첫 홈 진입 시 `AuthGateBottomSheet` 표시 확인
- [ ] 같은 브라우저 세션에서 새로고침 또는 재진입 시 `AuthGateBottomSheet` 반복 미표시 확인
- [ ] 검색 영역 선택 시 `/search` 이동 확인
- [ ] 퀵 버튼 4개 route 이동 확인
- [ ] 어디든 예약 CTA 선택 시 `/reservations/anywhere` 또는 auth redirect 정책 확인
- [ ] SNS 리스트 항목 route 이동 확인
- [ ] 메인 배너 carousel swipe/scroll 동작 확인
- [ ] 하단 네비게이션 active 상태와 탭 이동 확인
- [ ] 320px, 393px, 430px 폭에서 텍스트 겹침과 하단 네비게이션 겹침 확인
