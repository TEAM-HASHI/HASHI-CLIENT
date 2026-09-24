# Page Spec: `Terms`

Jira: HASHI-207

## Purpose

- 사용자가 Hashi에서 적용 중인 약관의 제목과 시행일을 확인하고 각 약관 상세로 이동할 수 있게 한다.
- 기획 명세: HASHI-PLAN `02_PRODUCT_SPEC/MYPAGE/TERMS/TERMS.md` (MY-004), `SPRINT-001_ADDITIONAL_FEATURES.md` §10
- 디자인: Figma `Hashi.kr` > 서비스 전체 화면 > 이용약관 섹션 (node-id 8317-33970), 목록 프레임 8317-97168

## Route

- path: `/terms`
- path constant:
  - `ROUTES.terms`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout` > `BottomNavigationLayout`
- access type:
  - `public`
- guard:
  - none
- lazy loading:
  - `lazyPages.terms`
- bottom navigation:
  - yes (`마이` 탭 활성)
- redirect:
  - unauthenticated: none
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/terms/TermsPage.tsx`
- spec path:
  - `apps/client/src/pages/terms/TermsPage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`
  - URL helper: `getTermsDetailPath` in `apps/client/src/app/router/routePaths.ts`

## Requirements

- [x] 상단 Header에 뒤로가기 버튼과 `이용약관` 제목을 고정해 보여준다.
- [x] 뒤로가기는 `navigate(-1)`을 실행한다.
- [x] 현재 적용 중인 약관 8개를 Figma 순서로 표시한다: Hashi 이용약관, 개인정보처리방침, 개인정보 수집 및 이용 동의, 개인정보 제3자 제공 동의, 예약 및 취소·환불 정책, 리뷰 운영정책, 포인트 이용약관, 서비스 운영정책.
- [x] 각 행은 `[약관 제목]`과 시행일을 표시하고, 선택 시 해당 약관 상세로 이동한다.
- [x] 목록 아래에 이메일과 카카오톡 채널 문의 정보를 표시한다.
- [x] 비로그인 사용자도 접근할 수 있다.

## Data Dependencies

### Query

- query: none
  - 약관 목록과 본문은 `features/terms/constants/termsPolicies.ts`의 정적 콘텐츠를 사용한다. 백엔드 약관 API가 OpenAPI에 아직 없어 정적으로 시작하며, API 확정 시 데이터 소스만 교체한다.
- loading state: none
- error state: none
- empty state: none

### Mutation

- mutation: none

## User Flow

1. 마이페이지 `이용약관` 메뉴에서 `/terms`로 진입한다.
2. 약관 행을 선택하면 `/terms/{policyId}` 상세로 이동한다.
3. 뒤로가기로 마이페이지로 돌아간다.

## State

- local state: none
- URL state: none
- server state: none
- derived state: none

## UI Structure

```text
TermsPage
  Header (back, 이용약관)
  ul > li > button (title, effectiveDate, NextIcon) x 8
  address (이메일, 문의 채널)
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
- feature constant:
  - `TERMS_POLICIES`
- icon:
  - `BackIcon`
  - `NextIcon`

## Error Handling

- API error: none
- validation error: none
- exceptional case: none

## Navigation

- entry:
  - 마이페이지 `이용약관` 메뉴 (`ROUTES.terms`)
- links:
  - 약관 상세: `getTermsDetailPath(policyId)`
- route params: none
- search params: none
- back behavior:
  - `navigate(-1)`

## Styling

- Tailwind layout:
  - 모바일 단일 컬럼, 행 좌우 20px, 행 상하 28px, `secondary-200` 하단 구분선
  - 제목 `typo-sub-header-3`, 시행일 `typo-body-8`, 문의 정보 `typo-caption-3 text-warm-gray-300`
- fixed area:
  - Header: `app-mobile-fixed-top`
  - 하단 네비게이션: `BottomNavigationLayout`

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 목록 8개 순서·시행일·행 선택 이동·뒤로가기 확인
- [x] 비로그인 직접 진입 확인
