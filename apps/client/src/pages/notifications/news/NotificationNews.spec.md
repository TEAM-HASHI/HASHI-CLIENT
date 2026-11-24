# 소식 알림 — HASHI-260

## Purpose / Sources

예약·리뷰·포인트 소식 14종을 확인하는 소식 알림 패널을 퍼블리싱한다.
HASHI-PLAN origin/main c7d2b3a의 NOTIFICATION_NEWS.md 및 Figma 11954:53234, 12109:79738, 11954:53444, 12115:10240, 12115:65182, 12115:65268을 기준으로 한다.

## Approved decisions (2026-11-24)

환불 알림은 기획대로 예약 상세 선택 이벤트를 제공한다. 입금 대기 안내는 현재 상태에 따라 입금 안내/예약 상세로 분기한다. 시간은 1분/1시간/24시간/7일 경계와 Asia/Seoul 날짜를 따른다. 모든 상태에 하단 내비게이션을 제외한다.
디자인의 고정393px 대신 좌우20px·아이콘34px·간격12px·최소104px 행을 유지한 반응형으로 구성한다. 제목은 한 줄 말줄임, 설명은 줄바꿈을 허용하고 날짜 열은 잘리지 않게 한다.

## Route / scope

261번 공유 알림 컨테이너의 소식 패널로 통합한다. 작업 브랜치를 261번 위에 쌓고 PR base도 261번으로 지정한다. 261번 PR #278의 a661c1ac 위에 스택하며, 공통 컴포넌트 public entry를 재사용한다.
기존 운영 경로에 예시 알림을 노출하지 않는다. 개발 전용 검수 화면에만 명시적 fixture를 연결한다. 실제 API·서버 읽음·푸시·보관 만료·홈 빨간 점은 후속 연동 범위다.

## State / interface

패널은 guest/loading/error/success 상태를 구분해 받는다. success는 목록, hasNextPage, isFetchingNextPage, isFetchNextPageError를 갖는다. 선택·로그인·최초 재시도·추가 조회 callback은 호출부가 소유한다.
항목 조회만으로 읽음 처리하지 않는다. 선택 callback을 통해 읽음 처리하며 읽은 항목도 선택 가능하다. 리스트 순서와 발송 당시 문구는 입력 모델 순서를 따른다. 목록 복귀 시 호출부가 읽음·불러온 개수·스크롤 위치를 보존한다.
예약 상태는 UI용 명시적 discriminated union이다. generated API 타입이나 서버 계약으로 가장하지 않는다. 입금 안내·대안 추천의 실제 route가 아직 없으면 목적지 이벤트만 제공하고 가짜 route를 만들지 않는다.

## Component mapping

HDS Header/Tabs/IconButton/Button, 기존 KakaoStartButton을 재사용한다. 공유 헤더·탭은 패널 내부에 중복 구현하지 않는다. 오류 안내는 261번 NoticeLoadError를 재사용한다. 소식 전용 구성과 Figma 자산은 news 내부에 둔다.
빈 상태 종이비행기·소식 전용 아이콘은 Figma 원본을 사용한다. 기기 상태바·기기 모서리는 제외한다.

## Verification

- 시간 경계값·잘못된 날짜·한국 시간 날짜, 14유형 목적지·환불·입금 상태·이미 작성한 리뷰 처리 테스트.
- 조회만으로 읽음 없음, 읽은 항목 재선택, 로그인·최초 오류·추가 오류·빈 상태·로딩 테스트.
- 320/393/430px 브라우저에서 긴 제목·날짜·설명·아이콘 및 모든 상태 검수.
- client lint/typecheck/test/build, Prettier 및 git diff --check.

## Integration contract

- 공개 패널: `NotificationNewsPanel({ state, now, onSelect, onLogin, onRetry, onLoadMore, renderError })`.
- `now`는 호출부가 갱신하는 epoch milliseconds이며 `createdAt`은 정상화된 ISO timestamp다. 파싱할 수 없는 값은 `-`로 표시한다. 원격 데이터의 스키마/날짜 검증은 API 연동 시 endpoint 경계의 책임이다.
- `onSelect`에는 원본 표시 모델과 `NotificationDestination`을 함께 전달한다. 현재 입금·리뷰 상태는 호출부가 최신 조회 상태로 주입한다. 원본 제목/설명은 발송 당시 문구를 유지한다.
- `renderError(onRetry)`는 261번 `NotificationLoadError`를 조립한다. 재시도 중에는 기존 오류 CTA를 숨기고 loading 상태를 우선한다.
- `onLoadMore`는 호출부에서 요청 중 중복 차단과 오류의 상태 전환을 소유한다.
- 스크린리더의 행 설명에 본문과 발송 시각을 함께 포함한다. 읽은 행도 활성 버튼이다.
- `notification-news.preview.html?state=list|read|empty|guest|loading|error|more-error|long`은 Vite 개발 전용 별도 entry다. 제품 라우터·홈에서는 import하지 않으며 기본 production build entry에 포함하지 않는다. 로그인/목적지 이벤트는 개발 검수용으로만 시뮬레이션하며 실제 인증과 예약 API를 호출하지 않는다.
- 개발 검수의 상세 선택 이벤트에서 목록으로 복귀하면 읽음·14개 표시 개수·스크롤을 유지한다. 실제 예약 route에서 돌아오는 복원과 서버 읽음 영속화는 API 통합 시 연결한다.

## Design follow-up

Figma의 회색 본문/읽음 텍스트와 시각 색상은 이번 시각 일치 범위에서 유지한다. 일반 크기 텍스트의 대비 개선은 디자인 토큰 확인 사항이다. 상태는 색상 외에 접근 가능한 이름의 읽음 여부로도 전달한다.

## Verification record — 2026-11-24

- 시간·목적지 26개 + 패널 11개 = 37개 테스트 통과. 추가 조회 재시도 중 오류/로딩 동시 상태와 접근 가능한 시각 설명을 RED→GREEN으로 검증했다.
- 기준 develop 전체 테스트: 221 files / 1439 tests 통과. 최신 전체 실행: 223 files / 1476 tests 모두 통과.
- 320px 긴 제목·8일 전 날짜·긴 설명, 393px 목록/읽음/빈 상태/최초 및 추가 오류, 430px 긴 제목과 비로그인 화면 검수. 가로 넘침 없음, 제목 말줄임과 날짜 열 분리 확인.
- 브라우저 10→14개 추가 조회, 환불 알림 reservationDetail 이벤트, 포인트 mypage 이벤트, 선택 후 읽음 표시·14개 목록·스크롤828px 복원 확인.
- 빈 상태는 원본 컴포넌트 정의가 아닌 실제 화면 인스턴스11954:53458 export로 검수해 배경·색상 일치를 확인했다.
- 독립 코드 리뷰의 추가 요청 중 중복 CTA 및 스크린리더 시각 누락을 수정했다. client lint/typecheck/build, 변경 파일 Prettier 및 git diff --check 통과. production dist에 preview HTML 및 news-preview fixture가 포함되지 않음을 확인했다.
- verify-implementation / verify-api-integration: endpoint/query/mutation/generated type 변경 없음. 페이지 전용 표시 모델·fixture, 상태/콜백, 테스트 격리, 문서 동기화 기준을 확인했다. 실제 API·푸시·인증 검증은 범위 밖이다.

## Stack integration — 2026-11-24

- 상위 PR: https://github.com/TEAM-HASHI/HASHI-CLIENT/pull/278 (`feat/HASHI-261-service-notice-publishing`, `a661c1ac`).
- 260번 브랜치를 상위 커밋으로 rebase했다. 임시 QA 공유 파일 4개는 해시 확인 후 제거했으며 현재 공통 UI는 모두 261번의 실제 tracked 파일이다.
- 개발 entry는 `@/features/notification/components` public entry의 NotificationLayout·NotificationLoadError·NotificationTab을 사용한다. 공유 파일 자체의 추가 변경은 없다.
- 제품 라우터·홈과 261번 서비스 공지 흐름은 변경하지 않는다. 상위 PR 병합 후 260번 PR의 base를 develop으로 전환한다.
- 상위 커밋을 포함한 `pnpm verify` 통과: client 225 files / 1492 tests, HDS 26 files / 243 tests, 전체 format/lint/typecheck/build. 독립 재검토에서 추가 actionable finding 없음.
- 260 변경은 소식 패널·자산·spec·개발 preview 25개 파일로 한정하며 공유 컴포넌트와 제품 라우트의 추가 diff는 없다.
