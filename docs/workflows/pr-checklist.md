# PR Checklist

PR을 열기 전 변경 범위, Jira 연결, 검증 결과를 명확히 남깁니다.

## Before PR

- Jira 이슈가 `HASHI-*` 형식인지 확인합니다.
- 브랜치 이름이 `type/HASHI-번호-작업-요약` 형식인지 확인합니다.
- 커밋 메시지가 `type(scope): HASHI-번호 작업 내용` 형식인지 확인합니다.
- PR 대상 브랜치가 `develop`인지 확인합니다.
- 변경 범위가 하나의 Jira 이슈에 설명 가능한지 확인합니다.
- unrelated 변경이 섞이지 않았는지 `git status`와 diff를 확인합니다.
- dependency 변경이 있으면 `package.json`, workspace `package.json`, `pnpm-lock.yaml` 변경을 함께 확인합니다.
- 구현 기준 spec이 필요한 작업이면 [Spec Writing](./spec-writing.md)에 따라 `*.spec.md`를 작성하거나 갱신합니다.
- 문서 영향이 있는 변경이면 `README.md`, `AGENTS.md`, `docs/` 문서 갱신 여부를 확인합니다.

## PR Body

`.github/pull_request_template.md`를 채웁니다.

```markdown
## 📌 Summary

_작업 내용을 간단히 요약해주세요._

Jira: _관련 Jira 티켓 번호를 작성해주세요._

## 📚 Tasks

- _해당 PR에 수행한 작업을 설명해주세요._

<!--
## 👀 To Reviewer

_리뷰어에게 요청하고 싶은 내용을 작성해주세요._
-->

<!--
## 📸 Screenshot

(기재 내용 없을 경우 섹션 삭제) 작업한 내용에 대한 스크린샷을 첨부해주세요.
-->
```

## Summary

Summary에는 무엇을 바꿨는지 한두 문장으로 적습니다.

```markdown
## 📌 Summary

로그인 페이지 UI와 입력 상태 처리를 구현했습니다.

Jira: HASHI-12
```

## Tasks

Tasks에는 리뷰어가 diff를 보기 전에 변경 표면을 이해할 수 있게 적습니다.

```markdown
## 📚 Tasks

- 로그인 페이지 scaffold 추가
- 이메일/비밀번호 입력 상태 처리
- 제출 버튼 disabled 조건 구성
- 주요 loading/error 상태 확인
```

## To Reviewer

리뷰어가 집중해서 봐야 할 부분이 있으면 주석을 해제하고 작성합니다.

```markdown
## 👀 To Reviewer

- 폼 검증 문구는 임시 copy입니다. UX 문구 확정 후 별도 티켓에서 조정할 예정입니다.
```

## Screenshot

UI 변경이 있으면 screenshot을 첨부합니다.
문서, 설정, generator처럼 화면 변경이 없는 경우 섹션을 삭제합니다.

## Verification Examples

문서 변경:

```text
- [x] pnpm exec prettier README.md AGENTS.md docs/**/*.md .agents/skills/*/SKILL.md --check
- [x] git diff --check
```

앱/패키지 변경:

```text
- [x] pnpm format:check
- [x] pnpm lint
- [x] pnpm typecheck
- [x] pnpm build
```

dependency 변경:

```text
- [x] pnpm install --frozen-lockfile
- [x] pnpm lint
- [x] pnpm typecheck
- [x] pnpm build
```

UI 변경:

```text
- [x] pnpm lint
- [x] pnpm typecheck
- [x] pnpm build
- [x] 주요 viewport에서 수동 확인
- [x] screenshot 첨부
```

## GitHub Actions Roles

- `ci.yml`: format, lint, typecheck, test, build를 병렬 실행하는 코드 품질 gate입니다.
- `vercel-preview.yml`: client preview 배포만 담당합니다.
- `vercel-production.yml`: client production 배포만 담당합니다.
- `vercel-admin-preview.yml`: admin preview 배포만 담당합니다.
- `vercel-admin-production.yml`: admin production 배포만 담당합니다.
- `chromatic.yml`: HDS Storybook/Chromatic 검증만 담당하며, HDS 관련 경로가 바뀐 PR에서 실행됩니다.
- auto-label, auto-assign, Discord workflow는 PR 운영 자동화를 담당합니다.

## Before Merge

- 최소 2명 이상의 approve를 받습니다.
- 필요한 경우 Jira 상태가 `QA` 또는 `CODE REVIEW`에 있는지 확인합니다.
- PR 병합 후 브랜치를 삭제합니다.
