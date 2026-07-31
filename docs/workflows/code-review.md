# Client Code Review Policy

`apps/client/**` PR의 리뷰어 배정과 리뷰 문화 기준입니다.

## Scope

- 이 정책은 이번 스프린트의 web client PR에 적용합니다.
- `apps/admin/**`, `packages/**`, 서버 저장소에 자동 확장하지 않습니다.
- GitHub Actions가 실제로 자동 배정하는지 여부와, 팀이 합의한 운영 정책은 구분해서 기록합니다.

## Reviewers

- 모든 client PR에는 작성자를 제외한 리뷰어 2명을 지정합니다.
- 기본 승인 기준은 2명 이상의 approve입니다. 추가 전문 리뷰가 필요하면 리뷰어를 더 지정할 수 있습니다.
- 리뷰어는 단순 approve를 위한 역할이 아니라, 구현 의도·상태·구조를 이해하고 피드백하는 책임을 가집니다.
- 작성자는 PR의 `상세 설명`, `고민한 부분`, `리뷰어에게`를 통해 리뷰 시작에 필요한 맥락을 제공합니다.

## First-Month Assignment Rule

초기 한 달은 아래 우선순위로 가능한 균등하게 배정합니다.

1. PR 작성자를 제외합니다.
2. 직전 PR의 리뷰어가 연속으로 배정되지 않도록 합니다.
3. 당월 리뷰어 배정 횟수가 적은 사람을 우선합니다.
4. 이미 알린 시험·회사·개인 일정에는 배정 가중치를 낮춥니다.
5. 고위험·복잡한 PR은 필요한 전문성을 가진 추가 리뷰어를 지정할 수 있습니다.

배정 담당자는 월간 reviewer assignment count와 실제 리뷰 참여 횟수를 구분해 기록합니다. `배정`만 받고 리뷰하지 못한 경우는 다음 달 가중치 판단에서 실제 참여로 계산하지 않습니다.

## After First Month

- 월말에 팀원별 배정 횟수와 실제 리뷰 참여 횟수를 함께 확인합니다.
- 참여 횟수가 낮은 사람에게 다음 달 배정 가중치를 높입니다.
- 장기 부재나 일시적인 과부하는 다음 배정 전에 반영합니다.
- 숫자만 맞추기 위해 특정 사람에게 고난도 PR을 몰아주지 않습니다.

## Review Quality

- PR 하나당 5개 이상의 의미 있는 리뷰 코멘트를 남기는 것을 권장합니다. 이는 merge 조건이 아니라 충분히 코드를 읽고 대화하기 위한 목표입니다.
- 오류 지적 외에도 구조 질문, 구현 의도 확인, 네이밍, 예외 케이스, 테스트 필요 여부, 대안, 좋은 점을 남길 수 있습니다.
- 짧거나 저위험인 PR에는 억지 코멘트 대신 최소 한 개의 review summary와 필요한 질문·확인 결과를 남깁니다.
- blocking issue는 이유와 기대 수정 방향을 명확히 적고, suggestion은 blocking 여부를 구분합니다.

## Review Checklist

- PR이 Jira·spec·요구사항 범위와 맞는지
- loading, empty, error, disabled, success 등 관련 상태가 빠지지 않았는지
- API contract, query key, cache synchronization, navigation side effect가 안전한지
- 테스트 필요 여부와 실행 결과·수동 확인 근거가 충분한지
- public API, route, hook return shape, design token 변경이 있다면 spec·호출부가 함께 갱신됐는지
- 접근성, 긴 텍스트, overflow, responsive 상태가 필요한 만큼 확인됐는지

## Automation Status And Prerequisites

현재 `.github/workflows/auto-assign-author.yml`은 PR 작성자만 assignee로 등록합니다. 공정 분배 기반의 리뷰어 자동 배정은 아직 구현돼 있지 않습니다.

자동 배정을 구현하려면 먼저 다음 source of truth가 필요합니다.

- 팀원 이름과 GitHub username의 확정 매핑
- reviewer roster와 일시적 제외 기간
- 월별 배정·실제 참여 횟수를 신뢰할 수 있게 저장할 위치
- GitHub Actions의 권한·동시성·fork PR 보안 정책

이 전제 없이 GitHub handle이나 배정 통계를 추측해서 workflow를 만들지 않습니다. 전제가 확정되기 전에는 위 회전 규칙으로 수동 배정하고, 기록을 남깁니다.
