# 소식 알림 Figma 자산

파일: UHaom01PvoRx2wRCYa1kS1. get_design_context의 원본 자산과 download_assets의 컴포넌트 export를 사용한다. 전체 화면 스크린샷을 UI 자산으로 사용하지 않는다.

| 로컬 파일               | Figma node / slot                                       | 렌더링                               |
| ----------------------- | ------------------------------------------------------- | ------------------------------------ |
| new-time.png            | 11954:53282 / 새 시간 요청 아이콘                       | 24 × 24                              |
| checking.png            | 11954:53273 / 예약 확인 중 아이콘                       | 24 × 24                              |
| confirmed.png           | 12105:53127 / 예약 확정 아이콘                          | 24 × 24                              |
| unavailable.png         | 11954:53300 / 예약 진행 불가 아이콘                     | 24 × 24                              |
| visit.png               | 11954:53291 / 방문 알림 아이콘                          | 24 × 24                              |
| canceled.png            | 11954:53404 / 세 취소 유형 아이콘                       | 24 × 24 슬롯                         |
| payment.svg             | 11954:53239 / 수수료 입금                               | SVG 원본24 × 24                      |
| payment-reminder.svg    | 11954:53240 / 입금 임박                                 | SVG 원본24 × 24                      |
| review.svg              | 11954:53248 / 리뷰 안내                                 | SVG 원본20 × 20, 24px 슬롯 우측 정렬 |
| points.svg              | 11954:53249 / 포인트 지급                               | SVG 원본20 × 20, 24px 슬롯 우측 정렬 |
| empty-notifications.png | 11954:53458 / 화면에 배치된 empty_notification 인스턴스 | 133 × 120                            |

예약 요청은 HDS CalendarIcon, 환불은 HDS MoneyIcon을 재사용한다. 비로그인 이미지는 기존 shared/assets/images/empty.webp, 카카오 버튼은 KakaoStartButton을 재사용한다. 모든 아이콘은 34px 원형 배경 안에 배치하고 읽음 상태에는 grayscale·opacity를 적용한다.

기존 shared/assets와 HDS 원본을 비교해 동일 파일이 없음을 확인했다. CalendarIcon·MoneyIcon과 기존 empty.webp는 추가 복사 없이 재사용한다. 이 폴더의 PNG는 상태 아이콘·일러스트이며 목업 목록 데이터가 아니다.
