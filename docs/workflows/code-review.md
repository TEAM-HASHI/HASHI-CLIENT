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

## Assignment Rule

`.github/workflows/auto-assign-reviewers.yml`은 다음 순서로 리뷰어를 배정합니다.

1. PR 작성자와 `enabled`가 `false`인 reviewer를 후보에서 제외합니다.
2. 최근 30일 동안 GitHub API가 반환한 reviewer 요청과 제출 review를 집계합니다.
3. `(요청 횟수 + review 횟수) / weight`가 낮은 후보를 우선합니다.
4. 점수가 같으면 PR 번호와 GitHub login을 사용한 결정적 순서로 정렬합니다.
5. 정렬 결과에서 2명을 선택해 reviewer로 요청합니다.

reviewer roster, 조회 기간, 배정 인원, 활성화 여부, 가중치는 `.github/reviewer-assignment.json`에서 관리합니다.

## Review Quality

- PR 하나당 5개 이상의 의미 있는 리뷰 코멘트를 남기는 것을 권장합니다. 이는 merge 조건이 아니라 충분히 코드를 읽고 대화하기 위한 목표입니다.
- 오류 지적 외에도 구조 질문, 구현 의도 확인, 네이밍, 예외 케이스, 테스트 필요 여부, 대안, 좋은 점을 남길 수 있습니다.
- 짧거나 저위험인 PR에는 억지 코멘트 대신 최소 한 개의 review summary와 필요한 질문·확인 결과를 남깁니다.
- blocking issue는 이유와 기대 수정 방향을 명확히 적고, suggestion은 blocking 여부를 구분합니다.

## Review Priority

리뷰 코멘트에 우선순위가 필요하면 `[P1]`부터 `[P5]`까지 다음 기준으로 표시합니다.

| 우선순위 | 의미                 | 사용 기준                                                         |
| -------- | -------------------- | ----------------------------------------------------------------- |
| P1       | 반드시 수정 필요     | 버그, 장애 가능성, 보안 문제처럼 merge 전에 꼭 반영해야 하는 내용 |
| P2       | 적극적으로 반영 고려 | 구조나 유지보수성에 영향이 있어 수정하는 것이 좋은 내용           |
| P3       | 가능하면 반영        | 더 나은 방식이나 후속 개선 제안                                   |
| P4       | 선택 반영            | 반영해도 좋지만 현재 PR에서 꼭 필요하지는 않은 의견               |
| P5       | 참고 의견            | 사소한 코멘트나 개인적인 선호                                     |

P1은 merge를 막는 blocking issue입니다. P2부터 P5는 우선순위만으로 merge를 막지 않으며, 별도 논의가 필요하면 이유와 기대하는 결정 사항을 함께 적습니다.

## Review Checklist

- PR이 Jira·spec·요구사항 범위와 맞는지
- loading, empty, error, disabled, success 등 관련 상태가 빠지지 않았는지
- API contract, query key, cache synchronization, navigation side effect가 안전한지
- 테스트 필요 여부와 실행 결과·수동 확인 근거가 충분한지
- public API, route, hook return shape, design token 변경이 있다면 spec·호출부가 함께 갱신됐는지
- 접근성, 긴 텍스트, overflow, responsive 상태가 필요한 만큼 확인됐는지

## Automation Scope

`.github/workflows/auto-assign-author.yml`은 PR 작성자를 assignee로 등록하고, `.github/workflows/auto-assign-reviewers.yml`은 draft가 아닌 PR에 리뷰어 2명을 자동 요청합니다.

- reviewer 자동 요청은 PR이 `opened`, `ready_for_review`, `reopened` 상태가 될 때 실행합니다.
- 연속 배정 회피, 개인 일정, 변경 영역별 전문성은 자동으로 판단하지 않습니다.
- 일시적 제외나 배정 가중치 변경은 reviewer config에 반영합니다.
- 전문 리뷰가 더 필요하면 자동 배정 후 reviewer를 추가합니다.
