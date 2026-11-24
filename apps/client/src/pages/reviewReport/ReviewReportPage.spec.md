# 리뷰 신고

- HASHI-263. 회원이 다른 사람의 리뷰를 사유와 함께 신고한다.
- 화면 경로는 `/reviews/:reviewId/report`다. `AuthOnlyRoute` 아래에 lazy 등록하며 하단 네비게이션을 표시하지 않는다.
- [Figma 신고 폼](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=11874-76965), [입력 한도](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=11874-76999), [확인 모달](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=11874-77033), [접수 안내](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=12054-23197)
- 사유 일곱 개 중 하나를 선택해야 제출할 수 있다. 상세 내용은 선택이며 1,000자 한도와 글자 수를 표시한다. 최신 기획 문구 `신고 사유를 자세히 작성해 주세요.`를 사용한다.
- 상세 입력창은 빈 상태에서 Figma의 한 줄 높이를 유지한다. 줄바꿈에 맞춰 최대 세 줄까지 커지고, 그 이상은 입력창 안에서 스크롤한다. 입력을 비우면 한 줄 높이로 돌아온다.
- 확인 모달에서 돌아가면 입력을 유지한다. 실패하면 재시도할 수 있다. 성공하면 목록에 리뷰를 유지한 채 돌아간다. 이미 신고한 리뷰는 메뉴를 유지하고 선택 시 토스트를 표시한다.
- `ReviewModerationContext`가 대상 상태와 신고 요청을 제공한다. 개발 Swagger 계약 확인 전에는 운영 앱에서 제공자가 연결되지 않는다. 테스트에서는 성공, 일반 실패, 중복 상태를 주입한다. 직접 진입하거나 대상 조회가 불가능하면 상태를 안내하고 돌아가기 버튼을 제공한다.
- 기존 HDS 헤더, 버튼, Textarea, Dialog, Toast를 사용한다. 폼의 선택에는 네이티브 라디오와 Figma 아이콘을 사용한다.
- 확인은 `pnpm --filter @hashi/client test src/pages/reviewReport/ReviewReportPage.test.tsx`로 수행한다.
