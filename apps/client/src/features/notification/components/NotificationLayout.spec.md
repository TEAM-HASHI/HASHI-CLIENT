# Notification layout — HASHI-260 / HASHI-261

## Purpose

소식 알림과 서비스 공지가 같은 알림 헤더·뒤로가기·탭·본문 레이아웃과 오류 안내를 재사용한다.
제품 이름과 탭 문구가 있는 app feature이며 HDS로 승격하지 않는다.

## Public API

- `NotificationTab = 'news' | 'notice'`.
- `NotificationLayout({ activeTab, onTabChange, onBack, children })`: 두 탭의 선택값·탭 전환·뒤로가기는 호출부가 제어한다. 선택 탭을 임의로 저장하지 않는다.
- `NotificationHeader({ onBack, title = '알림', elevated = false })`: 기본 헤더. 상세에서는 `title="서비스 공지"`, `elevated`로 재사용한다.
- `NotificationLoadError({ onRetry, className? })`: 최초·추가·상세 오류의 공통 문구와 재시도 버튼. 조회·재시도 상태는 호출부가 소유한다.
- public entry: `@/features/notification/components`.
- 사용처: HASHI-261 `pages/notifications/NotificationsPage.tsx`; HASHI-260 소식 패널을 같은 Layout 본문에 조립한다.

## Behavior and boundary

- HDS Header·IconButton·Tabs·Button과 BackIcon을 조합한다. 고정 영역은 PageFixedArea와 data-page-scroll-top으로 등록한다.
- 헤더 75px + 탭 50px, 본문 상단 여백 125px, 좌우 탭 여백 20px. 하단 내비게이션은 포함하지 않는다.
- API·인증·읽음·URL·목 데이터·목록 스크롤 복원은 공통 컴포넌트가 소유하지 않는다.
- 소식/서비스 탭의 role과 aria-selected는 HDS Tabs가 제공한다. 뒤로가기는 접근 가능한 이름을 제공한다.
- 오류 원본 마크는 Figma 12115:66293 기반의 `@hashi/hds-icons` SVGR 컴포넌트 `LoadErrorIcon`을 사용하며 크기·색상은 호출부가 지정한다.

## Verification

- 제어형 선택 탭, 두 패널 children 교체, 라우터 없이 뒤로가기 위임 테스트.
- 페이지 테스트에서 공통 오류 재시도와 상세 전환·복귀 회귀 확인.
- 320/393/430px에서 헤더·탭 고정과 본문 가림·가로 overflow 확인.
