# Lighthouse PR Comment Vertical Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lighthouse PR 코멘트의 두 결과 표를 하나의 `영역 | 항목 | 결과` 세로 요약표로 합치고 개선점을 순서가 있는 우선순위 목록으로 표시한다.

**Architecture:** 기존 대표 Lighthouse JSON 선택, category 점수 계산, 핵심 지표 정규화, 개선 audit 선별 helper는 유지한다. `createLighthouseComment({ report })`의 Markdown 조립만 변경하고 sticky comment와 GitHub Actions workflow는 건드리지 않는다.

**Tech Stack:** pnpm, Node.js 22, CommonJS, Node test runner, GitHub Markdown, GitHub Script

## Global Constraints

- 패키지 명령은 `pnpm`만 사용한다.
- `<!-- lighthouse-ci-report -->` marker와 기존 comment create/update 동작을 유지한다.
- 모바일 Lighthouse 3회 측정과 representative run 선택을 유지한다.
- 네 category의 warning-only 임계값을 유지한다.
- Artifact 업로드와 14일 보관을 유지한다.
- 기존 미추적 PDF는 수정하거나 stage하지 않는다.

---

## File Structure

- Modify: `.github/scripts/lighthouse-comment.test.cjs`
  - 단일 세로 표, 이전 표 제거, 개선 우선순위 번호 목록을 검증한다.
- Modify: `.github/scripts/lighthouse-comment.cjs`
  - 기존 data helper의 결과를 세 열 Markdown 표와 번호 목록으로 조립한다.
- Modify: `docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md`
  - PR 코멘트 설명을 단일 세로 요약표로 갱신한다.
- Modify: `docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md`
  - 이전 두 표 구조를 최종 C안으로 갱신한다.
- Create: `docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-vertical-layout.md`
  - 이번 TDD 변경 계획을 기록한다.
- Modify: `docs/workflows/pr-checklist.md`
  - 리뷰어가 단일 표와 개선 우선순위 목록을 확인하도록 안내한다.

---

### Task 1: Replace the two result tables with one vertical summary table

**Files:**

- Modify: `.github/scripts/lighthouse-comment.test.cjs`
- Modify: `.github/scripts/lighthouse-comment.cjs`

**Interfaces:**

- Preserves: `getCategoryScore(report, categoryId)` returning a rounded integer
- Preserves: `getCoreMetrics(report)` returning `{ fcp, lcp, cls, tbt, script, image }`
- Changes: `createLighthouseComment({ report })` Markdown layout only

- [ ] **Step 1: Write the failing vertical table test**

기존 `createLighthouseComment renders only the category and core metric tables` 테스트를 다음 assertion으로 바꾼다.

```js
test('createLighthouseComment renders a single vertical summary table', () => {
  const comment = createLighthouseComment({ report: createReport() })

  assert.match(comment, new RegExp(LIGHTHOUSE_COMMENT_MARKER))
  assert.match(comment, /## 🔦 Lighthouse 결과/)
  assert.match(comment, /\| 영역 \| 항목 \| 결과 \|/)
  assert.match(comment, /\| Score \| Performance \| 🟡 \*\*82\*\* \|/)
  assert.match(
    comment,
    /\| Metric \| First Contentful Paint \(FCP\) \| `2053ms` \|/,
  )
  assert.match(comment, /\| Resource \| Script \/ Image \| `242KB` \/ `8KB` \|/)
  assert.doesNotMatch(comment, /\| Category \| Score \| Status \|/)
  assert.doesNotMatch(
    comment,
    /\| FCP \| LCP \| CLS \| TBT \| Script \| Image \|/,
  )
})
```

- [ ] **Step 2: Run the formatter test and verify RED**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: `## 🔦 Lighthouse 결과` 또는 `| 영역 | 항목 | 결과 |`가 없어 FAIL.

- [ ] **Step 3: Implement the minimal vertical table layout**

`createLighthouseComment({ report })`의 반환 배열을 다음 구조로 바꾼다. 개선점 제목과 bullet 형식은 Task 2까지 기존 값을 유지한다.

```js
return [
  LIGHTHOUSE_COMMENT_MARKER,
  '',
  '## 🔦 Lighthouse 결과',
  '',
  '| 영역 | 항목 | 결과 |',
  '| :--- | :--- | ---: |',
  `| Score | Performance | ${getScoreStatus(performance)} **${performance}** |`,
  `| Score | Accessibility | ${getScoreStatus(accessibility)} **${accessibility}** |`,
  `| Score | Best Practices | ${getScoreStatus(bestPractices)} **${bestPractices}** |`,
  `| Score | SEO | ${getScoreStatus(seo)} **${seo}** |`,
  `| Metric | First Contentful Paint (FCP) | \`${fcp}\` |`,
  `| Metric | Largest Contentful Paint (LCP) | \`${lcp}\` |`,
  `| Metric | Cumulative Layout Shift (CLS) | \`${cls}\` |`,
  `| Metric | Total Blocking Time (TBT) | \`${tbt}\` |`,
  `| Resource | Script / Image | \`${script}\` / \`${image}\` |`,
  '',
  '### 개선점 요약',
  '',
  ...improvementItems,
].join('\n')
```

- [ ] **Step 4: Run the formatter test and verify GREEN**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: vertical table와 기존 lifecycle 테스트 PASS.

---

### Task 2: Render improvements as a numbered priority list

**Files:**

- Modify: `.github/scripts/lighthouse-comment.test.cjs`
- Modify: `.github/scripts/lighthouse-comment.cjs`

**Interfaces:**

- Preserves: `getImprovementSuggestions(report, limit = 3)` returning `string[]`
- Changes: list presentation from bullets to ordered Markdown

- [ ] **Step 1: Write failing ordered-list and fallback tests**

개선점 테스트의 Markdown assertion을 다음으로 바꾼다.

```js
assert.match(comment, /### 💡 개선 우선순위/)
assert.match(comment, /1\. Reduce unused JavaScript/)
assert.match(comment, /2\. Preconnect to required origins/)
assert.match(comment, /3\. Improve image delivery/)
assert.doesNotMatch(comment, /- Reduce unused JavaScript/)
```

fallback 테스트는 다음 번호 목록을 기대한다.

```js
assert.match(
  createLighthouseComment({ report }),
  /1\. 감지된 주요 개선점이 없습니다\./,
)
```

- [ ] **Step 2: Run the formatter test and verify RED**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: 기존 `### 개선점 요약`과 bullet list가 남아 있어 FAIL.

- [ ] **Step 3: Implement the ordered list**

`createLighthouseComment` 내부의 개선점 조립을 다음으로 바꾼다.

```js
const improvementItems = improvementSuggestions.length
  ? improvementSuggestions.map(
      (suggestion, index) => `${index + 1}. ${suggestion}`,
    )
  : ['1. 감지된 주요 개선점이 없습니다.']
```

반환 배열의 section 제목은 다음 값을 사용한다.

```js
'### 💡 개선 우선순위',
```

- [ ] **Step 4: Run all Lighthouse helper tests and verify GREEN**

Run:

```bash
pnpm test:lighthouse
```

Expected: formatter 12개와 API smoke 7개 테스트 PASS.

- [ ] **Step 5: Render a representative local report**

Run:

```bash
node -e "const fs=require('node:fs'); const formatter=require('./.github/scripts/lighthouse-comment.cjs'); const manifest=JSON.parse(fs.readFileSync('./lighthouse-reports/manifest.json','utf8')); const representative=formatter.selectRepresentativeResult(manifest); const report=JSON.parse(fs.readFileSync(representative.jsonPath,'utf8')); console.log(formatter.createLighthouseComment({report}));"
```

Expected: 하나의 세로 표와 최대 세 개의 번호 목록만 출력됨.

---

### Task 3: Synchronize the Lighthouse documentation

**Files:**

- Modify: `docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md`
- Modify: `docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md`
- Create: `docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-vertical-layout.md`
- Modify: `docs/workflows/pr-checklist.md`

**Interfaces:**

- Documents: one vertical summary table, ordered improvements, unchanged Artifact policy

- [ ] **Step 1: Replace stale two-table descriptions**

세 문서에서 다음 최종 규칙을 사용한다.

```text
PR 코멘트에는 category, metric, resource를 영역으로 구분한
`영역 | 항목 | 결과` 단일 세로 요약표와 개선 audit 최대 3개의
순서 있는 목록을 표시한다. Artifact 업로드와 14일 보관은 유지한다.
```

- [ ] **Step 2: Format and scan the scoped files**

Run:

```bash
pnpm exec prettier .github/scripts/lighthouse-comment.cjs .github/scripts/lighthouse-comment.test.cjs docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-vertical-layout-design.md docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-vertical-layout.md docs/workflows/pr-checklist.md --check
rg -n "두 표|category 결과 표와 핵심 지표 표|Category \| Score \| Status|FCP \| LCP \| CLS \| TBT" docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-vertical-layout-design.md docs/workflows/pr-checklist.md
```

Expected: Prettier PASS. `rg` 결과는 변경 배경이나 제거 조건만 포함하고 현재 구조 설명에는 오래된 두 표가 없음.

---

### Task 4: Verify, commit, push, and update PR #133

**Files:**

- Verify: formatter, tests, design documents, implementation plan, PR checklist
- Preserve: `output/pdf/soongsil_tuition_payment_confirmation_english_translation.pdf`

**Interfaces:**

- Produces: updated branch `chore/HASHI-138-lighthouse-setting`
- Produces: updated open PR `#133`

- [ ] **Step 1: Run complete verification**

Run:

```bash
pnpm test:lighthouse
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Expected: 모든 명령 exit 0.

- [ ] **Step 2: Stage only scoped files**

Run:

```bash
git status --short --branch --untracked-files=all
git add .github/scripts/lighthouse-comment.cjs .github/scripts/lighthouse-comment.test.cjs docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-vertical-layout.md docs/workflows/pr-checklist.md
git diff --cached --check
```

Expected: PDF는 untracked로 남고 계획된 6개 파일만 staged.

- [ ] **Step 3: Commit and push**

Run:

```bash
git commit -m "style(github): HASHI-138 Lighthouse 코멘트 세로 정렬"
git push origin chore/HASHI-138-lighthouse-setting
```

Expected: local HEAD와 원격 branch SHA가 일치함.

- [ ] **Step 4: Update PR body and verify the workflow comment**

PR #133 본문에서 코멘트 구조를 다음 문장으로 갱신한다.

```text
category, metric, resource를 영역으로 구분한 단일 세로 요약표와
개선 audit 최대 3개의 우선순위 목록을 기존 bot 코멘트에 갱신
```

Run:

```bash
gh pr view 133 --json number,title,url,state,baseRefName,headRefName,commits,statusCheckRollup
gh api repos/TEAM-HASHI/HASHI-CLIENT/issues/133/comments --paginate --jq '.[] | select(.body | contains("<!-- lighthouse-ci-report -->")) | {id,updated_at,body}'
```

Expected: Lighthouse CI가 성공하고 bot 코멘트가 단일 세로 표와 번호 목록으로 갱신됨.
