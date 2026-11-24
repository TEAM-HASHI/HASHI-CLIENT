# Notifications — HASHI-261

## Purpose and scope

알림의 서비스 공지 목록·상세·오류 상태를 페이지 전용 목 데이터로 퍼블리싱한다. 실제 API·서버 읽음 저장·푸시·권한 설정은 후속 작업이다. 목 데이터를 사용한다는 사용자 요청에 따라 일반 경로에 연결하고 홈 진입은 아직 추가하지 않는다.

## Sources and comparison

- HASHI-PLAN `origin/main c7d2b3a`, `02_PRODUCT_SPEC/SPRINT2/NEW_FEATURES/NOTIFICATION_NOTICE/NOTIFICATION_NOTICE.md`, `NOTIFICATION_NEWS/NOTIFICATION_NEWS.md`.
- Figma `UHaom01PvoRx2wRCYa1kS1`: 목록 `12109:23674`, 상세 `12109:78705`, 첫 오류 `12115:66293`, 추가 오류 `12115:66378`, 확인 불가 `12120:68934`.
- 목록 구성·말줄임·날짜·오류는 디자인과 기획이 일치한다. 기본 소식 탭, 비회원 읽음 정책, 10개 추가 조회는 기획으로 보완한다.
- 기존 `/notices`는 마이페이지 공개 공지이며 하단 내비게이션·404 정책이 다르다. 기존 경로는 유지한다.
- 현재 공지 API에 유형·읽음 계약이 없어 generated API 타입을 변경하지 않고 목 표시 모델을 별도로 둔다.
- 상세 내부 보호 링크의 로그인 후 복귀는 공통 인증 후속 확인 대상이다. 로그인 흐름을 확장하지 않는다.

## Route

- `ROUTES.notifications`: `/notifications`, `lazyPages.notifications`, `appRoutes` public route, guard 없음.
- `RootLayout` 아래, `BottomNavigationLayout` 밖. 서비스 공지는 비회원도 조회한다.
- 기본 탭은 `news`, `?tab=notice`로 서비스 공지를 연다. 소식 탭은 준비 안내만 표시하며 소식 알림 구현 범위가 아니다.
- 목 상세는 `?tab=notice&notice=1`. API 연동 시 최종 상세 URL을 확정한다.
- 목록 뒤로가기: 이전 화면, 직접 진입은 홈 replace. 상세 복귀: 서비스 공지 탭·스크롤·불러온 개수 유지.

## Requirements

- HDS Header·Tabs·IconButton·Button과 기존 공지 본문·이미지 뷰어 재사용.
- 공지/이벤트/업데이트 배지, 한 줄 제목 말줄임, 게시일(수정 시 마지막 수정일) 표시.
- 게시일 최신순 목 데이터를 최초 10개, 하단 도달 시 10개씩 추가 표시.
- 로그인 사용자만 상세 조회 시 현재 페이지 세션에서 읽음 처리. 비회원은 읽음 처리하지 않으며 읽은 항목도 선택 가능.
- 상세는 제목·날짜·서식 본문·링크·첨부 이미지 순으로 표시하고 하단 내비게이션 없음. 이미지는 원본 비율과 등록 순서를 유지하며 기존 확대 뷰어 사용.
- 최초/상세 오류: `정보를 불러오는 중 문제가 발생했어요.`와 `다시 시도하기`. 추가 오류: 기존 목록 유지, 하단 오류·재시도.
- 확인 불가 공지: 상세를 열지 않고 `확인할 수 없는 공지예요` 토스트, 목 목록에서 제거.
- 빈 목록은 별도 디자인 범위가 아니다. 원격 공지 API 호출·운영 데이터 변경 없음.
- 기기 상태바·모서리를 웹에 그리지 않으며 320/393/430px 가로 넘침을 확인한다.

## Data Dependencies and state

- query/mutation 없음. `data/serviceNoticeFixtures.ts`는 명시적 퍼블리싱 예시 데이터다.
- local: 표시 개수·읽은 ID·확인 불가 ID·목록 스크롤·이미지 뷰어.
- URL: `tab`, `notice`. 개발 전용 검수: `preview=error|more-error|detail-error|unavailable`, `previewUser=member`(실제 인증 변경 없음).
- 실제 auth는 `useAuthStatus`를 사용한다. 목 읽음은 서버 저장되지 않고 페이지 이탈·새로고침 시 초기화된다.

## Component Mapping

- 페이지: URL·탭·목 흐름 조립. page-local `ServiceNoticeList`, `ServiceNoticeDetail`.
- `features/notice/components`: 기존·신규 공지 화면이 공유하는 본문·첨부 이미지·확대 뷰어와 테스트를 이동한다.
- `features/notification/components`: 260·261이 공유하는 `NotificationLayout`·`NotificationHeader`·`NotificationLoadError`. 탭·뒤로가기는 콜백으로 위임하고 라우트·API·목 데이터는 페이지가 소유한다. 공통 계약은 `NotificationLayout.spec.md`를 따른다.
- HDS UI public API 변경 없음. 오류 마크는 `@hashi/hds-icons`의 SVGR `LoadErrorIcon`을 사용한다. 상세 예시 이미지는 목 데이터 검수용 Figma 자산이다.

## Verification

- 목록 10개·추가 조회, 회원/비회원 읽음, 상세 복귀·스크롤 복원, 오류 재시도, 확인 불가 토스트를 자동 테스트로 확인한다.
- 공통 레이아웃 및 기존 공지 목록·상세·본문·이미지 뷰어 회귀를 확인한다.
- client lint·typecheck·test·build와 320/393/430px 브라우저 QA를 수행한다. 실행 결과는 PR에 기록한다.
