# Page Spec: `WithdrawalPage`

Jira: HASHI-204

## Purpose

- 사용자가 회원 탈퇴 전에 데이터 삭제와 재로그인 제한 안내를 확인할 수 있게 합니다.
- 탈퇴 동의 여부에 따라 탈퇴 버튼의 활성 상태를 제어합니다.
- 서버 API가 구현되기 전까지 실제 탈퇴 처리는 준비중 안내로 대체합니다.

## Route

- path: `/withdrawal`
- path constant: `ROUTES.withdrawal`
- access type: `authOnly`
- bottom navigation: no

## Requirements

- [x] 헤더와 뒤로 가기 버튼을 표시합니다.
- [x] 탈퇴 전 확인 사항을 표시합니다.
- [x] 확인 동의 체크박스를 표시합니다.
- [x] 동의 전에는 탈퇴 버튼을 비활성화합니다.
- [x] 동의 후에는 탈퇴 버튼을 활성화합니다.
- [x] 뒤로 가기와 돌아가기 버튼은 마이페이지로 이동합니다.
- [x] 탈퇴 버튼을 누르면 API 미연동 상태를 안내합니다.

## Follow-up

- 공통 하단 액션바 컴포넌트 병합 후 `WithdrawalBottomBar` 교체
- `DELETE /api/v1/users/me` 연동
- 탈퇴 성공 후 인증 정보 제거 및 이동 처리
- 서버 오류 처리
- 실제 서버 정책에 맞춘 탈퇴 안내 문구 확정
