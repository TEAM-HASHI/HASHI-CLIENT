# 소식 알림 패널 — HASHI-260

## Purpose / Sources

예약·리뷰·포인트 알림 14종의 표시와 선택 이벤트를 제공한다.
HASHI-PLAN c7d2b3a NOTIFICATION_NEWS.md 및 Figma UHaom01PvoRx2wRCYa1kS1: 목록11954:53234, 읽음12109:79738, 빈 상태11954:53444, 비회원12115:10240, 최초 오류12115:65182, 추가 오류12115:65268.

## Public API / ownership

`NotificationNewsPanel({ state, now, onSelect, onLogin, onRetry, onLoadMore, renderError })`.

- 상태는 guest/loading/error/success로 분리한다. success는 notifications/hasNextPage/isFetchingNextPage/isFetchNextPageError를 받는다.
- 호출부가 최신 조회 상태·epoch milliseconds인 now·정상화된 ISO createdAt을 주입한다. 서버 DTO를 임의로 정의하지 않는다.
- 조회만으로 읽음 처리하지 않는다. 읽은 항목도 선택 가능하며 onSelect에 원본 알림과 목적지를 전달한다. 서버 읽음 저장은 API 통합 시 연결한다.
- 환불은 예약 상세로 이동한다. 입금 요청·기한 안내는 awaiting일 때 입금 안내, paid/expired일 때 예약 상세다. 이미 작성한 리뷰의 요청은 예약 상세다.
- 목록 순서와 발송 당시 문구는 입력 모델을 따른다. 10개 조회와 목록/탭 복귀 상태는 페이지 호출부가 소유한다.
- 추가 조회 중에는 오류 재시도 및 수동 추가 조회 버튼을 숨긴다. onLoadMore 호출부는 중복 요청을 차단한다.

## Layout / assets

공통 헤더·탭·오류는 features/notification을 재사용한다. 패널은 하단 내비게이션을 포함하지 않는다.
좌우20px·아이콘34px·간격12px·최소104px 행. 제목 한 줄 말줄임, 본문 줄바꿈, 날짜 열 고정. 읽음과 발송 시각을 접근 가능한 이름/설명으로 전달한다.
기존 CalendarIcon·MoneyIcon·empty.webp·KakaoStartButton을 재사용한다. 동일한 기존 자산이 없는 소식 아이콘과 빈 상태 일러스트만 shared/assets/images/notifications/news에 보관한다. 출처는 같은 폴더 README.md에 기록한다. fixture 이미지와 화면 스크린샷은 제품 아이콘으로 사용하지 않는다.
Figma 회색 텍스트 대비 개선은 디자인 후속 검토 사항이다.

## Integration / preview

NotificationsPage가 유일한 route 진입점이며 useNotificationNews가 탭 전환 전후 읽음/표시 개수를 소유한다. 별도 HTML·React root·목적지 검수 페이지는 사용하지 않는다.
개발 환경의 `?previewNews=list|read|empty|guest|loading|error|more-error|long&previewUser=member`에서만 소식 fixture를 표시한다. guest 검수는 회원 여부와 관계없이 로그인 유도를 표시한다.
선택 시 개발 검수 토스트로 목적지 이벤트를 확인한다. 가짜 예약으로 실제 API나 이동 경로를 호출하지 않는다. 일반 비회원은 실제 로그인 버튼과 /notifications 복귀 경로를 사용하며, 일반 회원에게는 API 준비 안내를 제공한다.
production에서는 previewNews와 news fixture를 사용하지 않는다. 실제 API·홈 빨간 점·푸시·서버 읽음·보관 만료·예약 경로 연동은 후속 범위다.

## Verification

시간 경계·한국 날짜·14종 목적지·잘못된 날짜 테스트26개, 패널 상태·선택·접근성 테스트11개. 통합 페이지 테스트에서 로그인 복귀·탭 전환·읽음/페이지 보존·오류 재시도를 검증한다.
320/393/430px 검수, 전체 pnpm verify 및 production dist fixture 제외 검사를 수행한다. 기존 별도 preview 기준 검수 기록은 이전 커밋에 보존한다.
