# Slack 알림

GitHub Actions에서 PR·리뷰·CI 실패는 `웹-pr`, Client·Admin 운영 배포 결과는 `웹-deploy`로 전송합니다.

## 설정

| Repository Secret          | 대상 채널   |
| -------------------------- | ----------- |
| `SLACK_REVIEW_WEBHOOK_URL` | `웹-pr`     |
| `SLACK_DEPLOY_WEBHOOK_URL` | `웹-deploy` |

웹훅 URL은 코드·로그·PR에 노출하지 않습니다. 팀원 변경 시 `.github/scripts/slack-notify.cjs`의 `members`를 갱신합니다.

## 알림 조건

| 상황                          | 담당 workflow                 | 멘션 대상          |
| ----------------------------- | ----------------------------- | ------------------ |
| PR 생성·Draft 해제·다시 열기  | `auto-assign-reviewers.yml`   | 현재 요청된 리뷰어 |
| 리뷰어 자동 지정 실패         | `auto-assign-reviewers.yml`   | PR 작성자          |
| 수동 리뷰 요청·재요청         | `slack-pr-notify.yml`         | 해당 리뷰어        |
| 리뷰 승인·변경 요청           | `slack-pr-notify.yml`         | PR 작성자          |
| PR 병합                       | `slack-pr-notify.yml`         | 없음               |
| PR CI 실패                    | `slack-ci-notify.yml`         | PR 작성자          |
| `develop`·`main` push CI 실패 | `slack-ci-notify.yml`         | 실행자             |
| Client 운영 배포 성공·실패    | `vercel-production.yml`       | 실패 시 실행자     |
| Admin 운영 배포 성공·실패     | `vercel-admin-production.yml` | 실패 시 실행자     |

## 운영 참고

- Draft·봇 PR, 일반 댓글, CI 성공, 병합 없이 닫은 PR, 취소·스킵, Preview·Chromatic 배포는 제외합니다.
- 자동 리뷰 요청은 생성 알림에 포함합니다. 자동 지정 재실행은 정상 알림의 전송 기록이 없을 때만 복구 전송하며, 나머지 PR·CI 알림 전용 workflow의 수동 재실행은 전송하지 않습니다.
- 재요청은 기존 리뷰 이력으로 구분합니다. 아직 리뷰하지 않은 사람에게 다시 요청하면 일반 요청으로 표시합니다.
- 전송 실패는 Actions warning에서 확인합니다. 자동 재시도하지 않으며 CI·배포 결과에는 영향을 주지 않습니다.
- 외부 fork의 리뷰 이벤트는 Secret 제한으로 알림이 전달되지 않습니다.

## 활성화·검증

기본 브랜치 `develop`에 병합 후 PR·리뷰·CI 알림이 활성화됩니다. 운영 배포 알림은 변경이 `main`에 반영된 뒤 활성화됩니다. 실제 Slack 도착과 개인 멘션은 병합 후 확인해야 합니다.

1. 기본 브랜치에 workflow가 병합된 뒤 Actions에서 `Slack Notification Test`를 엽니다.
2. `Run workflow`에서 `channel`을 `both`, `review`, `deploy` 중 선택합니다.
3. 실행 성공과 실제 채널의 메시지 도착을 함께 확인합니다.

로컬 검증은 `pnpm test:slack-notify`로 실행합니다. 실제 Slack 요청은 보내지 않습니다.
