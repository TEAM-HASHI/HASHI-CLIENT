# Jira Branch PR Recipe

Jira 티켓에서 브랜치, 커밋, PR까지 이어지는 작업 흐름입니다.

## Read First

- `docs/conventions/jira-ticket.md`
- `docs/conventions/git.md`
- `docs/workflows/pr-checklist.md`

## Workflow

1. Jira key, Type, title, label을 확인합니다.
2. `develop`을 최신화합니다.

```bash
git checkout develop
git pull origin develop
```

3. Jira key 기준으로 브랜치를 생성합니다.

```bash
git checkout -b type/HASHI-00-work-summary
```

4. 커밋 메시지는 다음 형식을 따릅니다.

```text
type(scope): HASHI-00 작업 내용
```

5. PR은 `develop`을 대상으로 생성하고 `.github/pull_request_template.md`를 채웁니다.
6. PR 본문에는 Jira key, 작업 내용, 설계 판단, 테스트 또는 수동 확인 결과를 포함합니다.
7. `apps/client/**` PR은 `docs/workflows/code-review.md`에 따라 작성자를 제외한 리뷰어 2명을 지정합니다. 현재 공정 분배 자동 배정은 구현돼 있지 않으므로, roster와 월간 기록을 기준으로 수동 배정합니다.

## Done Criteria

- 브랜치명, 커밋 메시지, PR 본문에 같은 Jira key가 사용됩니다.
- PR 대상 브랜치는 `develop`입니다.
- unrelated 변경이 섞이지 않습니다.
- 필요한 테스트·수동 확인 근거와 리뷰어 2명 지정이 PR에 반영됩니다.
