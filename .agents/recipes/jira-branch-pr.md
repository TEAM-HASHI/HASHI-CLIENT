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
6. PR 본문에는 Jira key와 검증 결과를 포함합니다.

## Done Criteria

- 브랜치명, 커밋 메시지, PR 본문에 같은 Jira key가 사용됩니다.
- PR 대상 브랜치는 `develop`입니다.
- unrelated 변경이 섞이지 않습니다.
