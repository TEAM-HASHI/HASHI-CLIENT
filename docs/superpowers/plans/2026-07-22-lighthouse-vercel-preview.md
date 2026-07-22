# Lighthouse Vercel Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vercel Preview 배포 URL을 Lighthouse로 측정하고 브라우저 CORS와 필수 홈 API 성공을 검증한다.

**Architecture:** `vercel-preview.yml`이 배포 URL을 job output으로 전달하고 후속 `Lighthouse CI` job이 URL을 3회 측정한다. 별도 LHR validator가 모든 실행의 URL, runtime, CORS, 필수 API 2xx를 확인하며 category 점수는 기존처럼 warning으로만 평가한다.

**Tech Stack:** GitHub Actions, Vercel CLI, Lighthouse CI, Node.js 22 test runner, pnpm

## Global Constraints

- Package manager는 `pnpm`을 사용한다.
- Performance 80, Accessibility·Best Practices·SEO 90 기준은 모두 warning이다.
- Preview 신뢰성 오류는 workflow 실패로 처리한다.
- 모바일 기본 설정으로 3회 측정한다.
- 상세 HTML/JSON Artifact는 14일 보관한다.
- `pull_request_target`은 사용하지 않는다.

---

### Task 1: Preview LHR validity helper

**Files:**

- Create: `.github/scripts/lighthouse-preview-validation.test.cjs`
- Create: `.github/scripts/lighthouse-preview-validation.cjs`
- Modify: `package.json`
- Delete: `.github/scripts/lighthouse-api-smoke.test.cjs`
- Delete: `.github/scripts/lighthouse-api-smoke.cjs`

**Interfaces:**

- Consumes: `previewUrl: string`, Lighthouse JSON의 `finalUrl`, `runtimeError`, `audits.errors-in-console`, `audits.network-requests`
- Produces: `validatePreviewUrl(value)`, `validateLighthouseReport({ report, previewUrl, source })`, `validateLighthouseReports({ directory, previewUrl })`

- [ ] **Step 1: Write failing tests**

  정상 Preview LHR 통과, URL 불일치, CORS 메시지, 필수 endpoint 누락·non-2xx, 빈 report directory를 각각 검증한다.

- [ ] **Step 2: Verify RED**

  Run: `node --test .github/scripts/lighthouse-preview-validation.test.cjs`

  Expected: FAIL because `lighthouse-preview-validation.cjs` does not exist.

- [ ] **Step 3: Implement the minimal validator**

  모든 `lhr-*.json`을 읽어 각 실행을 검증하고 CLI에서는 `process.argv[2]`의 Preview URL을 사용한다. 성공 시 실행 수를 출력하고 실패 시 non-zero exit code를 설정한다.

- [ ] **Step 4: Verify GREEN**

  Run: `node --test .github/scripts/lighthouse-preview-validation.test.cjs`

  Expected: all tests PASS.

- [ ] **Step 5: Replace package scripts and old smoke helper**

  `test:lighthouse-preview-validation`을 추가하고 `test:lighthouse`에 포함한다. `test:lighthouse-api-smoke`, `smoke:lighthouse-api`와 기존 helper 두 파일은 제거한다.

### Task 2: Preview deployment and Lighthouse job integration

**Files:**

- Modify: `.github/workflows/vercel-preview.yml`
- Delete: `.github/workflows/lighthouse.yml`
- Modify: `lighthouserc.cjs`

**Interfaces:**

- Consumes: `${{ needs.deploy-preview.outputs.url }}`
- Produces: `Lighthouse CI` check, `lighthouse-reports` Artifact, sticky PR comment

- [ ] **Step 1: Export the Vercel deployment URL**

  `deploy-preview` job의 `steps.deploy.outputs.url`을 job output `url`로 노출한다.

- [ ] **Step 2: Add the dependent Lighthouse job**

  checkout, pnpm/Node setup, install, helper tests, collect, Preview LHR validation, assert, upload, 14일 Artifact, PR comment 순서로 구성한다.

- [ ] **Step 3: Remove the local static-server path**

  `lighthouserc.cjs`에서 `staticDistDir`, `isSinglePageApplication`, localhost `url`을 제거하고 `numberOfRuns: 3`은 유지한다.

- [ ] **Step 4: Remove the standalone workflow**

  `.github/workflows/lighthouse.yml`을 삭제하고 PR path filter를 제거해 배포와 측정 check가 항상 함께 생성되게 한다.

- [ ] **Step 5: Validate configuration**

  Run: `pnpm exec lhci healthcheck --fatal`

  Expected: Lighthouse configuration and Chrome checks PASS.

### Task 3: Documentation synchronization

**Files:**

- Modify: `docs/architecture/data-layer.md`
- Modify: `docs/workflows/pr-checklist.md`
- Modify: `docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md`

**Interfaces:**

- Consumes: implemented workflow and validator behavior
- Produces: current operational source of truth

- [ ] **Step 1: Update runtime boundaries**

  Vercel Preview 환경의 `VITE_API_BASE_URL`, 서버 CORS allowlist, LHR 필수 API 검증 관계를 기록한다.

- [ ] **Step 2: Update PR check ownership**

  `vercel-preview.yml`이 배포 후 Lighthouse를 실행하며 점수 warning과 신뢰성 failure를 구분한다고 기록한다.

- [ ] **Step 3: Record Preview SEO caveat**

  Vercel Preview의 `X-Robots-Tag: noindex`가 SEO 점수에 영향을 주므로 production SEO 최종 검증이 아니라고 기록한다.

### Task 4: Verification and PR update

**Files:**

- Verify all changed files
- Update: PR #133 body

**Interfaces:**

- Produces: reviewed commit, pushed branch, current PR description

- [ ] **Step 1: Run focused verification**

  Run: `pnpm test:lighthouse`

  Expected: formatter and Preview validator tests PASS.

- [ ] **Step 2: Run repository verification**

  Run: `pnpm typecheck && pnpm test && pnpm build`

  Expected: all commands PASS or pre-existing unrelated failures are recorded with evidence.

- [ ] **Step 3: Validate formatting and workflow syntax**

  Run scoped Prettier, YAML parse, and `git diff --check`.

  Expected: all changed files are valid.

- [ ] **Step 4: Commit and push**

  Commit the scoped files on `chore/HASHI-138-lighthouse-setting`, push to origin, and observe the new Preview/Lighthouse jobs.

- [ ] **Step 5: Update PR #133**

  Explain that Lighthouse now measures the deployed Preview URL, validates browser CORS and required home API calls, preserves warning-only score thresholds, and note the Preview SEO limitation.
