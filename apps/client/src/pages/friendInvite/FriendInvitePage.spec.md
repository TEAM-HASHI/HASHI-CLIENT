# Page Spec: `FriendInvite`

Jira: 미발급 (2차 스프린트 "친구 초대" 범위)

## Purpose

- 회원이 내 초대코드를 확인·복사하고 초대 링크를 친구에게 공유할 수 있게 한다.
- 디자인: Figma `Hashi.kr` > 2️⃣ 서비스 전체 화면 [2차 스프린트] > 마이 페이지 섹션 > `친구 초대 · 내 초대코드` (node-id 11609-239660, 공유 시트 11609-243674)
- 기획 명세: HASHI-PLAN에 아직 없음.

## Route

- path: `/friend-invite`
- path constant:
  - `ROUTES.friendInvite`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.friendInvite`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `/login-required`
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/friendInvite/FriendInvitePage.tsx`
- spec path:
  - `apps/client/src/pages/friendInvite/FriendInvitePage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Requirements

- [x] 상단 Header에 뒤로가기 버튼과 `친구 초대` 제목을 고정해 보여준다.
- [x] 소개 문구(`친구도 나도, 각각 4,000P`)와 설명을 보여준다.
- [x] 내 초대코드와 `복사` 버튼을 보여주고, 누르면 코드를 클립보드에 복사한 뒤 토스트를 띄운다.
- [x] `초대 링크 공유`를 누르면 OS 공유 시트(`navigator.share`)를 연다. 지원하지 않거나 실패하면 초대 링크를 복사하고 토스트를 띄운다. 사용자가 시트를 닫으면 아무것도 하지 않는다.
- [x] `포인트는 이렇게 받아요!` 3단계 안내를 보여준다.
- [ ] 내 초대코드를 서버에서 조회한다. (API 미제공 — 현재 Figma 예시 값 `HASHI7A2` 고정)
- [x] 마이페이지 이벤트 배너(`MypageEventBanner`)에서 이 페이지로 진입한다.

## Open Questions

- 초대 링크 형식: 현재 `{origin}/?inviteCode={code}` 임시 값. 링크로 들어온 친구의 온보딩에 코드를 자동 입력할지 미정.
- 복사 토스트 문구(`초대코드가 복사되었어요.`, `초대 링크가 복사되었어요.`)는 Figma에 없어 임시로 정했다.
- 포인트 금액: 마이페이지 배너는 `400 포인트`, 이 페이지는 `4,000P`로 Figma가 서로 다르다.
- 토큰에 없는 Figma 값을 그대로 썼다: 설명 문구 색 `#737a7d`(가장 가까운 토큰은 `cool-gray-500` `#6b8692`), 초대코드 26px(타이포 토큰 최대 24px), 안내 제목 줄 높이 136%. 디자인 확인 후 토큰으로 바꿀 수 있다.
- RN 웹뷰에서 `navigator.share`가 동작하지 않으면 네이티브 브릿지가 필요하다.

## Navigation

- entry: 마이페이지 이벤트 배너(`MypageEventBanner`)
- back behavior: 이전 history가 있으면 뒤로, 없으면 `/mypage`로 replace

## Component Mapping

- HDS component: `Header`, `IconButton`, `Button`, `showToast`, `toastQueue`
- app shared: `PageFixedArea`, `copyTextToClipboard`
- icon: `BackIcon`, `LinkIcon`·`CopyIcon`(토스트), page-local `assets/invite-link.svg`, `invite-code.svg`, `invite-point-coins.svg` (안내 3단계, Figma export)
