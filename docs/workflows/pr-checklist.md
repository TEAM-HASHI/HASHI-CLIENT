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
- `apps/client/**` 코드 변경은 [Client Testing Policy](./testing.md)에 따라 `Test Required`와 `Test Optional`을 구분합니다. `Test Required`는 자동 테스트를 준비하고, 테스트를 생략할 때는 생략 사유와 수동 확인 근거를 함께 준비합니다.
- 문서 영향이 있는 변경이면 `README.md`, `AGENTS.md`, `docs/` 문서 갱신 여부를 확인합니다.
- `apps/client/**` PR은 [Client Code Review Policy](./code-review.md)에 따라 작성자를 제외한 리뷰어 2명을 지정합니다.

## PR Body

`.github/pull_request_template.md`를 채웁니다.

```markdown
## 📌 요약

_작업 내용을 간단히 요약해주세요._

Jira: HASHI-

## 📚 작업 내용

- _해당 PR에 수행한 작업을 설명해주세요._

## 🔎 상세 설명

_구현 방식, 설계 의도, 사용 예시 등 리뷰 전에 알아야 할 맥락을 작성해주세요._

## 💭 고민한 부분

### 고민한 문제

-

### 고려한 선택지

-

### 최종 선택과 이유

-

### 남은 고민

-

## ✅ 검증

<!-- 해당 없는 항목은 삭제하거나 "해당 없음"으로 작성해주세요. -->

- [ ] 자동 테스트:
- [ ] 수동 확인:
- [ ] 테스트 생략 사유:

<!--
## 👀 리뷰어에게

_집중해서 확인해 줄 구조, 정책, 예외 케이스를 작성해주세요._
-->

<!--
## 📸 스크린샷

(기재 내용 없을 경우 섹션 삭제) 작업한 내용에 대한 스크린샷을 첨부해주세요.
-->
```

## 요약

요약에는 무엇을 바꿨는지 한두 문장으로 적습니다.

```markdown
## 📌 요약

로그인 페이지 UI와 입력 상태 처리를 구현했습니다.

Jira: HASHI-12
```

## 작업 내용

작업 내용에는 리뷰어가 diff를 보기 전에 변경 표면을 이해할 수 있게 적습니다.

```markdown
## 📚 작업 내용

- 로그인 페이지 scaffold 추가
- 이메일/비밀번호 입력 상태 처리
- 제출 버튼 disabled 조건 구성
- 주요 loading/error 상태 확인
```

## 고민한 부분과 검증

- `고민한 부분`은 구조·상태·API·UX 판단이 있었을 때 작성합니다. 단순 UI·copy 변경은 해당 섹션을 삭제할 수 있습니다.
- `검증`에는 자동 테스트, 수동 확인, 테스트 생략 사유 중 변경에 해당하는 항목만 남깁니다.
- `Test Required` 변경에서 자동 테스트를 생략했다면 생략 사유와 수동 확인 결과를 모두 남깁니다.
- `apps/client/**` 변경은 [Client Testing Policy](./testing.md)를 따릅니다.

## 리뷰어에게

리뷰어가 집중해서 봐야 할 부분이 있으면 주석을 해제하고 작성합니다.

```markdown
## 👀 리뷰어에게

- 폼 검증 문구는 임시 copy입니다. UX 문구 확정 후 별도 티켓에서 조정할 예정입니다.
```

## 스크린샷

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
- `vercel-preview.yml`: client Preview 배포와 Preview 기반 Lighthouse 측정을 담당합니다.
  - PR에서는 Preview 배포 후 Lighthouse가 배포 URL의 홈(`/`)을 모바일 환경에서 3회 측정합니다.
  - Preview URL 불일치, Lighthouse runtime error, 브라우저 CORS 오류, 홈 필수 API non-2xx는 측정 신뢰성 오류로 보고 workflow를 실패시킵니다.
  - Performance 80, Accessibility·Best Practices·SEO 90 기준은 모두 warning으로 처리하므로 점수 미달만으로 workflow를 실패시키지 않습니다.
  - 대표 결과의 category·metric·resource와 개선 audit 최대 3개는 기존 PR 코멘트에 갱신합니다.
  - 상세 HTML/JSON 리포트는 `lighthouse-reports` Artifact로 14일 보관합니다.
  - Vercel Preview의 자동 `X-Robots-Tag: noindex` header가 SEO 점수에 포함되므로 production SEO 최종 판정으로 사용하지 않습니다.
- `vercel-production.yml`: client production 배포만 담당합니다.
- `vercel-admin-preview.yml`: admin preview 배포만 담당합니다.
- `vercel-admin-production.yml`: admin production 배포만 담당합니다.
- `chromatic.yml`: HDS Storybook/Chromatic 검증만 담당하며, HDS 관련 경로가 바뀐 PR에서 실행됩니다.
- auto-label, auto-assign, Discord workflow는 PR 운영 자동화를 담당합니다.

## Before Merge

- 최소 2명 이상의 approve를 받습니다.
- `apps/client/**` PR은 [Client Code Review Policy](./code-review.md)에 따라 지정된 2명의 리뷰어가 리뷰했는지 확인합니다.
- 필요한 경우 Jira 상태가 `QA` 또는 `CODE REVIEW`에 있는지 확인합니다.
- PR 병합 후 브랜치를 삭제합니다.
