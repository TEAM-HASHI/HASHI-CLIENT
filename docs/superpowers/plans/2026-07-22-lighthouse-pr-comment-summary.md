# Lighthouse PR Comment Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lighthouse PR 코멘트를 category 결과 표, 핵심 성능 지표 표, 자동 개선점 최대 3개로 간소화한다.

**Architecture:** 기존 CommonJS formatter가 대표 Lighthouse JSON을 읽고 sticky comment를 생성하는 경계는 유지한다. Formatter 내부에 핵심 지표 정규화와 개선 audit 선별 helper를 추가하고, Artifact workflow는 변경하지 않는다.

**Tech Stack:** pnpm, Node.js 22, CommonJS, Node test runner, Lighthouse JSON, GitHub Script

## Global Constraints

- 패키지 명령은 `pnpm`만 사용한다.
- 모바일 Lighthouse 3회 측정과 대표 실행 선택을 유지한다.
- Performance 80, Accessibility·Best Practices·SEO 90 warning-only 기준을 유지한다.
- HTML/JSON Artifact 업로드와 14일 보관을 유지한다.
- PR 코멘트에서 Mermaid, Actions 실행 링크, 대표 실행 시각만 제거한다.
- 기존 `<!-- lighthouse-ci-report -->` marker와 comment create/update 동작을 유지한다.
- 기존 미추적 PDF는 수정하거나 stage하지 않는다.

---

## File Structure

- Modify: `.github/scripts/lighthouse-comment.test.cjs`
  - 핵심 지표 표, 개선점 정렬·제한·fallback, 제거 대상 문자열을 검증한다.
- Modify: `.github/scripts/lighthouse-comment.cjs`
  - 핵심 지표를 정규화하고 개선 audit을 선별해 Markdown 코멘트를 생성한다.
- Modify: `docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md`
  - 최초 설계의 Mermaid 중심 코멘트 설명을 최종 구조로 갱신한다.
- Modify: `docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md`
  - 구현과 동일한 개선 후보 선별 기준을 기록한다.
- Create: `docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-summary.md`
  - 이번 변경의 TDD 실행 단계를 기록한다.
- Modify: `docs/workflows/pr-checklist.md`
  - PR에서 두 표와 개선점 요약을 확인하도록 운영 안내를 갱신한다.

---

### Task 1: Render category and core metric tables

**Files:**

- Modify: `.github/scripts/lighthouse-comment.test.cjs`
- Modify: `.github/scripts/lighthouse-comment.cjs`

**Interfaces:**

- Produces: `getCoreMetrics(report)` returning `{ fcp, lcp, cls, tbt, script, image }`
- Changes: `createLighthouseComment({ report })` no longer consumes `runUrl` or `generatedAt`
- Preserves: `commentLighthouseResults({ github, context, core, manifestPath })`

- [ ] **Step 1: Write the failing core metric and layout tests**

`createReport()`에 다음 audit fixture를 추가한다.

```js
audits: {
  'cumulative-layout-shift': { numericValue: 0.045, score: 1 },
  'first-contentful-paint': { numericValue: 2052.6, score: 0.8 },
  'largest-contentful-paint': { numericValue: 2313.4, score: 0.8 },
  'resource-summary': {
    details: {
      items: [
        { resourceType: 'script', transferSize: 247808 },
        { resourceType: 'image', transferSize: 8192 },
      ],
    },
    score: 1,
  },
  'total-blocking-time': { numericValue: 0.4, score: 1 },
}
```

다음 assertion으로 단위 변환과 제거 대상을 검증한다.

```js
assert.deepEqual(getCoreMetrics(report), {
  cls: '0.045',
  fcp: '2053ms',
  image: '8KB',
  lcp: '2313ms',
  script: '242KB',
  tbt: '0ms',
})
assert.match(comment, /\| FCP \| LCP \| CLS \| TBT \| Script \| Image \|/)
assert.match(comment, /\| 2053ms \| 2313ms \| 0\.045 \| 0ms \| 242KB \| 8KB \|/)
assert.doesNotMatch(comment, /mermaid|xychart|actions\/runs|대표 실행 결과/)
```

- [ ] **Step 2: Run the formatter test and verify RED**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: `getCoreMetrics is not a function` 또는 핵심 지표 표 누락으로 FAIL.

- [ ] **Step 3: Implement metric normalization and the two-table layout**

`.github/scripts/lighthouse-comment.cjs`에 다음 경계를 구현한다.

```js
const getAuditNumericValue = (report, auditId) => {
  const value = report?.audits?.[auditId]?.numericValue
  return Number.isFinite(value) ? value : undefined
}

const formatMilliseconds = (value) =>
  Number.isFinite(value) ? `${Math.round(value)}ms` : 'N/A'

const formatCls = (value) => (Number.isFinite(value) ? value.toFixed(3) : 'N/A')

const formatKilobytes = (value) =>
  Number.isFinite(value) ? `${Math.round(value / 1024)}KB` : 'N/A'

const getResourceTransferSize = (report, resourceType) => {
  const items = report?.audits?.['resource-summary']?.details?.items
  const item = Array.isArray(items)
    ? items.find((entry) => entry.resourceType === resourceType)
    : undefined

  return Number.isFinite(item?.transferSize) ? item.transferSize : undefined
}

const getCoreMetrics = (report) => ({
  cls: formatCls(getAuditNumericValue(report, 'cumulative-layout-shift')),
  fcp: formatMilliseconds(
    getAuditNumericValue(report, 'first-contentful-paint'),
  ),
  image: formatKilobytes(getResourceTransferSize(report, 'image')),
  lcp: formatMilliseconds(
    getAuditNumericValue(report, 'largest-contentful-paint'),
  ),
  script: formatKilobytes(getResourceTransferSize(report, 'script')),
  tbt: formatMilliseconds(getAuditNumericValue(report, 'total-blocking-time')),
})
```

`createLighthouseComment({ report })`는 category 표 뒤에 다음 표를 추가하고 Mermaid, run URL, timestamp 생성을 제거한다.

```js
'| FCP | LCP | CLS | TBT | Script | Image |',
'| ---: | ---: | ---: | ---: | ---: | ---: |',
`| ${fcp} | ${lcp} | ${cls} | ${tbt} | ${script} | ${image} |`,
```

- [ ] **Step 4: Run the formatter test and verify GREEN**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: core metric와 기존 comment lifecycle 테스트 PASS.

---

### Task 2: Add the automatic improvement summary

**Files:**

- Modify: `.github/scripts/lighthouse-comment.test.cjs`
- Modify: `.github/scripts/lighthouse-comment.cjs`

**Interfaces:**

- Produces: `getImprovementSuggestions(report, limit = 3)` returning `string[]`
- Consumes: Lighthouse audit `score`, `scoreDisplayMode`, `title`, `details.overallSavingsMs`, `details.overallSavingsBytes`, `details.type`

- [ ] **Step 1: Write failing prioritization, limit, and fallback tests**

fixture에 시간·byte 절감 항목, 일반 binary 실패, 네 번째 후보를 추가하고 다음을 검증한다.

```js
assert.deepEqual(getImprovementSuggestions(report), [
  'Reduce unused JavaScript — 약 450ms, 84KB 절감 가능',
  'Preconnect to required origins — 약 313ms 단축 가능',
  'Improve image delivery — 약 20KB 절감 가능',
])
assert.equal(getImprovementSuggestions(report).length, 3)
assert.match(comment, /### 개선점 요약/)
assert.match(comment, /- Reduce unused JavaScript/)
assert.doesNotMatch(comment, /Browser errors were logged/)
```

모든 audit 점수가 1인 별도 report에서는 다음 fallback을 검증한다.

```js
assert.match(
  createLighthouseComment({ report: perfectReport }),
  /- 감지된 주요 개선점이 없습니다\./,
)
```

- [ ] **Step 2: Run the formatter test and verify RED**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: `getImprovementSuggestions is not a function` 또는 개선점 section 누락으로 FAIL.

- [ ] **Step 3: Implement actionable audit filtering and deterministic ranking**

다음 규칙을 구현한다.

```js
const CORE_METRIC_AUDIT_IDS = new Set([
  'cumulative-layout-shift',
  'first-contentful-paint',
  'largest-contentful-paint',
  'max-potential-fid',
  'speed-index',
  'total-blocking-time',
  'interactive',
])
const EXCLUDED_SCORE_DISPLAY_MODES = new Set([
  'informative',
  'manual',
  'notApplicable',
])

const formatImprovementSuggestion = ({ audit, savingsBytes, savingsMs }) => {
  const formattedMilliseconds =
    savingsMs > 0 ? `${Math.round(savingsMs)}ms` : undefined
  const formattedKilobytes =
    savingsBytes > 0 ? `${Math.round(savingsBytes / 1024)}KB` : undefined

  if (formattedMilliseconds && formattedKilobytes) {
    return `${audit.title} — 약 ${formattedMilliseconds}, ${formattedKilobytes} 절감 가능`
  }

  if (formattedMilliseconds) {
    return `${audit.title} — 약 ${formattedMilliseconds} 단축 가능`
  }

  if (formattedKilobytes) {
    return `${audit.title} — 약 ${formattedKilobytes} 절감 가능`
  }

  return audit.title
}

const getImprovementSuggestions = (report, limit = 3) =>
  Object.values(report?.audits ?? {})
    .filter(
      (audit) =>
        Number.isFinite(audit?.score) &&
        audit.score < 1 &&
        typeof audit.title === 'string' &&
        audit.title.trim().length > 0 &&
        !CORE_METRIC_AUDIT_IDS.has(audit.id) &&
        !EXCLUDED_SCORE_DISPLAY_MODES.has(audit.scoreDisplayMode) &&
        (audit.scoreDisplayMode === 'binary' ||
          audit.scoreDisplayMode === 'metricSavings' ||
          audit.details?.type === 'opportunity'),
    )
    .map((audit) => ({
      audit,
      savingsBytes: Number.isFinite(audit.details?.overallSavingsBytes)
        ? audit.details.overallSavingsBytes
        : 0,
      savingsMs: Number.isFinite(audit.details?.overallSavingsMs)
        ? audit.details.overallSavingsMs
        : 0,
    }))
    .sort(
      (left, right) =>
        right.savingsMs - left.savingsMs ||
        right.savingsBytes - left.savingsBytes ||
        Number(right.audit.scoreDisplayMode === 'metricSavings') -
          Number(left.audit.scoreDisplayMode === 'metricSavings') ||
        left.audit.score - right.audit.score ||
        left.audit.title.localeCompare(right.audit.title),
    )
    .slice(0, limit)
    .map(({ audit, savingsBytes, savingsMs }) =>
      formatImprovementSuggestion({ audit, savingsBytes, savingsMs }),
    )
```

`createLighthouseComment`는 최대 3개의 `- ` 목록 또는 fallback 한 줄을 출력한다.

- [ ] **Step 4: Run Lighthouse helper tests and verify GREEN**

Run:

```bash
pnpm test:lighthouse
```

Expected: formatter와 API smoke helper 테스트 전체 PASS.

- [ ] **Step 5: Validate the formatter against the representative local report**

Run:

```bash
node -e "const fs=require('node:fs'); const formatter=require('./.github/scripts/lighthouse-comment.cjs'); const manifest=JSON.parse(fs.readFileSync('./lighthouse-reports/manifest.json','utf8')); const representative=formatter.selectRepresentativeResult(manifest); const report=JSON.parse(fs.readFileSync(representative.jsonPath,'utf8')); console.log(formatter.createLighthouseComment({report}));"
```

Expected: 두 표와 개선점 최대 3개만 출력되고 Mermaid, 링크, 시각은 없음.

---

### Task 3: Synchronize Lighthouse documentation

**Files:**

- Modify: `docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md`
- Modify: `docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md`
- Create: `docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-summary.md`
- Modify: `docs/workflows/pr-checklist.md`

**Interfaces:**

- Documents: two-table PR comment, top-three improvement summary, retained Artifact policy

- [ ] **Step 1: Replace stale comment descriptions**

최초 설계 문서의 Mermaid와 run 링크 설명을 다음 기준으로 바꾼다.

```text
PR 코멘트는 category 점수·상태 표, FCP/LCP/CLS/TBT/Script/Image 표,
개선 audit 최대 3개만 표시한다. 상세 HTML/JSON은 14일 Artifact에만 보관한다.
```

- [ ] **Step 2: Update the PR checklist**

`docs/workflows/pr-checklist.md`의 Lighthouse 항목에서 `대표 실행 점수와 차트`를 `category 점수·상태, 핵심 성능 지표, 개선점 최대 3개`로 바꾼다. Artifact 확인 안내는 유지한다.

- [ ] **Step 3: Verify document consistency and formatting**

Run:

```bash
rg -n "Mermaid|xychart|대표 실행 점수와 차트|workflow run 링크" docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md docs/workflows/pr-checklist.md
pnpm exec prettier .github/scripts/lighthouse-comment.cjs .github/scripts/lighthouse-comment.test.cjs docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-summary.md docs/workflows/pr-checklist.md --check
```

Expected: 첫 명령은 현재 동작을 설명하는 stale 문구가 없고, Prettier는 PASS.

---

### Task 4: Verify, commit, push, and update PR #133

**Files:**

- Verify: all changed formatter and documentation files
- Preserve: `output/pdf/soongsil_tuition_payment_confirmation_english_translation.pdf`

**Interfaces:**

- Produces: updated branch `chore/HASHI-138-lighthouse-setting`
- Produces: updated PR `#133` targeting `develop`

- [ ] **Step 1: Run focused and repository verification**

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

- [ ] **Step 2: Review and stage only scoped files**

Run:

```bash
git status --short --branch --untracked-files=all
git diff -- .github/scripts/lighthouse-comment.cjs .github/scripts/lighthouse-comment.test.cjs docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-summary.md docs/workflows/pr-checklist.md
git add .github/scripts/lighthouse-comment.cjs .github/scripts/lighthouse-comment.test.cjs docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/specs/2026-07-22-lighthouse-pr-comment-summary-design.md docs/superpowers/plans/2026-07-22-lighthouse-pr-comment-summary.md docs/workflows/pr-checklist.md
```

Expected: PDF는 untracked로 남고 formatter와 관련 문서만 staged.

- [ ] **Step 3: Commit and push**

Run:

```bash
git commit -m "feat(github): HASHI-138 Lighthouse PR 코멘트 요약 개선"
git push origin chore/HASHI-138-lighthouse-setting
```

Expected: commit과 push 성공.

- [ ] **Step 4: Update and verify PR**

Run:

```bash
gh pr edit 133 --body '## 📌 Summary

Client production build의 Lighthouse 품질 측정과 PR 리포트 자동화를 추가했습니다. PR 코멘트는 category 결과, 핵심 성능 지표, 자동 개선점 최대 3개로 간소화했습니다.

Jira: HASHI-138

## 📚 Tasks

- 모바일 기준 Lighthouse 3회 측정 및 warning-only 임계값 설정
- GitHub Actions Repository Variable `VITE_API_BASE_URL` 주입 및 dev API smoke check 추가
- 상세 HTML/JSON 리포트 14일 Artifact 보관
- category 점수·상태, FCP/LCP/CLS/TBT/Script/Image, 개선점 최대 3개를 기존 PR 코멘트에 갱신
- Mermaid 그래프와 상세 리포트 링크·실행 시각 제거
- fork PR의 코멘트 권한 제한 처리

## ✅ Verification

- [x] `pnpm format:check`
- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm test`
- [x] `pnpm build`
- [x] `pnpm test:lighthouse`'
gh pr view 133 --json number,title,url,state,baseRefName,headRefName,commits,statusCheckRollup
```

Expected: PR 설명이 두 표·개선점 요약과 Artifact 유지 정책을 설명하고 새 commit이 포함됨.
