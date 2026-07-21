# Lighthouse CI PR Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Client production build의 Lighthouse 점수를 PR마다 검사하고 상세 Artifact와 점수 표·Mermaid 그래프 코멘트를 제공한다.

**Architecture:** Lighthouse CI는 GitHub Actions Repository Variable로 개발 또는 staging API base URL을 주입하고 공개 read-only API를 먼저 smoke check한다. 이후 Vite의 `apps/client/dist`를 SPA 정적 서버로 제공해 실제 API를 사용하는 `/`를 3회 측정하고 filesystem 리포트를 생성한다. 별도 GitHub Actions workflow가 리포트를 Artifact로 보관하며, 테스트 가능한 CommonJS helper가 대표 실행 JSON을 읽어 하나의 고정 PR 코멘트를 생성하거나 갱신한다.

**Tech Stack:** pnpm, Node.js 22, Lighthouse CI 0.15.1, GitHub Actions, GitHub Script, Node test runner, Mermaid

## Global Constraints

- 패키지 명령은 `pnpm`만 사용한다.
- 외부 dependency version은 `pnpm-workspace.yaml` catalog에서 관리한다.
- Lighthouse는 `apps/client/dist`의 `/`를 모바일 기본 설정으로 3회 실행한다.
- GitHub Actions Repository Variable 이름은 `VITE_API_BASE_URL`이다.
- smoke check는 공개 read-only `GET /api/v1/restaurants?type=sns-hot&size=1`만 호출한다.
- Performance 80, Accessibility·Best Practices·SEO 90은 모두 warning 기준으로 사용한다.
- 리포트는 외부 공개 저장소가 아니라 filesystem과 GitHub Artifact에 저장한다.
- Artifact retention은 14일이다.
- PR 코멘트는 marker를 사용해 하나만 유지한다.
- `pull_request_target`은 사용하지 않는다.
- 기존 미추적 React Router 생성물과 PDF는 수정하거나 stage하지 않는다.

---

## File Structure

- Create: `lighthouserc.cjs`
  - Client 정적 빌드 수집, category assertion, filesystem upload를 정의한다.
- Create: `.github/workflows/lighthouse.yml`
  - install, test, build, collect, assert, upload, Artifact, PR comment lifecycle을 정의한다.
- Create: `.github/scripts/lighthouse-comment.cjs`
  - 대표 실행 선택, 점수 변환, Markdown 생성, sticky comment upsert를 담당한다.
- Create: `.github/scripts/lighthouse-comment.test.cjs`
  - comment helper의 정상·오류 경로를 Node test runner로 검증한다.
- Create: `.github/scripts/lighthouse-api-smoke.cjs`
  - API base URL 검증, 공개 endpoint 조합, timeout과 HTTP 상태 검사를 담당한다.
- Create: `.github/scripts/lighthouse-api-smoke.test.cjs`
  - API smoke helper의 정상·오류 경로를 Node test runner로 검증한다.
- Modify: `package.json`
  - `@lhci/cli` catalog dependency와 Lighthouse helper test·smoke script를 추가한다.
- Modify: `pnpm-workspace.yaml`
  - `@lhci/cli@^0.15.1`을 catalog에 추가한다.
- Modify: `pnpm-lock.yaml`
  - Lighthouse CI dependency graph를 고정한다.
- Modify: `.gitignore`
  - `.lighthouseci/`, `lighthouse-reports/`를 제외한다.
- Modify: `docs/architecture/tech-stack.md`
  - Lighthouse CI를 Current 도구로 기록한다.
- Modify: `docs/architecture/data-layer.md`
  - Lighthouse CI의 API base URL 주입과 smoke check 운영 기준을 기록한다.
- Modify: `docs/workflows/pr-checklist.md`
  - Lighthouse workflow와 PR 결과 확인 방법을 기록한다.

---

### Task 1: Build and test the Lighthouse PR comment formatter

**Files:**

- Create: `.github/scripts/lighthouse-comment.test.cjs`
- Create: `.github/scripts/lighthouse-comment.cjs`
- Modify: `package.json`

**Interfaces:**

- Produces: `selectRepresentativeResult(manifest)`
- Produces: `getCategoryScore(report, categoryId)`
- Produces: `getScoreStatus(score)`
- Produces: `createLighthouseComment({ report, runUrl, generatedAt })`
- Produces: `commentLighthouseResults({ github, context, core, manifestPath, generatedAt })`

- [ ] **Step 1: Add a root test script and failing formatter tests**

`package.json`에 다음 script를 추가한다.

```json
"test:lighthouse-comment": "node --test .github/scripts/lighthouse-comment.test.cjs"
```

테스트는 대표 실행 선택, 점수 반올림과 색상 경계, table/Mermaid/run URL 생성, 기존 marker 코멘트 update, 코멘트가 없을 때 create, manifest 누락 warning을 실제 export API 기준으로 검증한다.

- [ ] **Step 2: Run the formatter tests and confirm RED**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: `.github/scripts/lighthouse-comment.cjs`가 없어 module-not-found로 FAIL.

- [ ] **Step 3: Implement the minimal CommonJS formatter**

helper는 `<!-- lighthouse-ci-report -->` marker, 네 category 점수, Mermaid `xychart`, workflow run 링크를 생성한다. `github.paginate`와 `github.rest.issues`를 통해 이전 bot 코멘트를 update하거나 새 코멘트를 create한다. manifest가 없으면 `core.warning` 후 `{ status: 'skipped' }`를 반환한다.

- [ ] **Step 4: Run the formatter tests and confirm GREEN**

Run:

```bash
pnpm test:lighthouse-comment
```

Expected: 모든 Node 테스트 PASS.

---

### Task 2: Add Lighthouse CI dependency and runtime configuration

**Files:**

- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`
- Create: `lighthouserc.cjs`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: `pnpm build:client`의 `apps/client/dist`
- Produces: `.lighthouseci/` 수집 결과
- Produces: `lighthouse-reports/manifest.json`, HTML, JSON

- [ ] **Step 1: Register the dependency and ignored outputs**

`pnpm-workspace.yaml` catalog에 `'@lhci/cli': ^0.15.1`, 루트 devDependencies에 `"@lhci/cli": "catalog:"`를 추가한다. `.gitignore`에는 다음을 추가한다.

```gitignore
.lighthouseci/
lighthouse-reports/
```

- [ ] **Step 2: Add `lighthouserc.cjs`**

config는 `staticDistDir: './apps/client/dist'`, `isSinglePageApplication: true`, `url: ['http://localhost/']`, `numberOfRuns: 3`을 사용한다. category assertions는 승인된 80/90 warning 기준과 `median-run`을 사용하고 upload target은 `filesystem`, output directory는 `./lighthouse-reports`로 설정한다.

- [ ] **Step 3: Update the lockfile**

Run:

```bash
pnpm install
```

Expected: install 성공, `pnpm-lock.yaml`에 `@lhci/cli@0.15.1` 반영.

- [ ] **Step 4: Validate config and generate a local report**

Run:

```bash
pnpm build:client
pnpm exec lhci healthcheck --fatal
pnpm exec lhci collect
pnpm exec lhci assert
pnpm exec lhci upload
```

Expected: build와 healthcheck 성공, 3회 collect, 기준 미달은 warning으로 기록되지만 assert는 exit 0, `lighthouse-reports/manifest.json`과 HTML/JSON 생성. 현재 앱 점수가 승인 기준보다 낮아도 threshold를 임의로 낮추지 않는다.

---

### Task 3: Add the GitHub Actions workflow and documentation

**Files:**

- Create: `.github/workflows/lighthouse.yml`
- Modify: `docs/architecture/tech-stack.md`
- Modify: `docs/workflows/pr-checklist.md`

**Interfaces:**

- Consumes: `commentLighthouseResults({ github, context, core })`
- Produces: `lighthouse-reports` GitHub Artifact with 14-day retention
- Produces: Lighthouse score PR comment

- [ ] **Step 1: Add the standalone workflow**

workflow는 `develop` 대상 `pull_request`와 `workflow_dispatch`에서 실행한다. Node 22와 pnpm setup 후 frozen install, formatter test, Client build, LHCI collect/assert/upload를 수행한다. upload, Artifact, comment 단계에는 `if: always()`를 적용하고 comment 단계는 PR 이벤트에서만 실행한다.

`actions/github-script@v7`에서는 다음처럼 helper를 호출한다.

```js
const {
  commentLighthouseResults,
} = require('./.github/scripts/lighthouse-comment.cjs')

await commentLighthouseResults({ github, context, core })
```

- [ ] **Step 2: Document the Current tool and workflow role**

`docs/architecture/tech-stack.md`에 Lighthouse CI 0.15.1을 Current로 추가하고 공식 문서 링크를 기록한다. `docs/workflows/pr-checklist.md`에 `lighthouse.yml`의 측정 대상, category 기준, Artifact와 PR 코멘트 역할을 추가한다.

- [ ] **Step 3: Validate workflow YAML and repository formatting**

Run:

```bash
pnpm exec prettier .github/workflows/lighthouse.yml .github/scripts/lighthouse-comment.cjs .github/scripts/lighthouse-comment.test.cjs lighthouserc.cjs docs/architecture/tech-stack.md docs/workflows/pr-checklist.md docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/plans/2026-07-21-lighthouse-ci-pr-report.md --check
pnpm exec yaml valid < .github/workflows/lighthouse.yml
```

Expected: Prettier와 YAML parse 성공.

- [ ] **Step 4: Run repository verification**

Run:

```bash
pnpm install --frozen-lockfile
pnpm test:lighthouse-comment
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: 모든 명령 exit 0. 기존 저장소 오류가 있으면 변경과의 관련 여부를 분리해 보고한다.

- [ ] **Step 5: Review final scope**

Run:

```bash
git status --short --branch --untracked-files=all
git diff --check
git diff -- package.json pnpm-workspace.yaml pnpm-lock.yaml .gitignore lighthouserc.cjs .github/scripts/lighthouse-comment.cjs .github/scripts/lighthouse-comment.test.cjs .github/workflows/lighthouse.yml docs/architecture/tech-stack.md docs/workflows/pr-checklist.md docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/plans/2026-07-21-lighthouse-ci-pr-report.md
```

Expected: 계획한 파일만 변경되고 기존 미추적 파일은 그대로 유지되며 whitespace 오류가 없다.

---

### Task 4: Make every Lighthouse category warning-only

**Files:**

- Modify: `lighthouserc.cjs`
- Modify: `docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md`
- Modify: `docs/superpowers/plans/2026-07-21-lighthouse-ci-pr-report.md`
- Modify: `docs/workflows/pr-checklist.md`

**Interfaces:**

- Preserves: Performance 80, Accessibility·Best Practices·SEO 90 minimum scores
- Changes: every category assertion level to `warn`
- Produces: score regressions remain visible without failing the workflow

- [ ] **Step 1: Confirm the current error-level assertion is RED**

Run:

```bash
pnpm exec lhci assert
```

Expected: 현재 Accessibility 88이 error 기준 90 미만이므로 exit 1.

- [ ] **Step 2: Change all category levels to warning**

`lighthouserc.cjs`에서 Accessibility, Best Practices, SEO assertion level을 `error`에서 `warn`으로 변경한다. Performance의 `warn`과 모든 80/90 `minScore`, `median-run` 설정은 유지한다.

- [ ] **Step 3: Synchronize the documentation**

설계 문서와 PR checklist에서 네 category가 모두 warning이며 점수 미달만으로 workflow가 실패하지 않는다고 기록한다. Client build, Lighthouse collect 같은 실행 오류는 계속 workflow 실패로 유지한다.

- [ ] **Step 4: Confirm the warning-only assertion is GREEN**

Run:

```bash
pnpm exec lhci assert
```

Expected: Accessibility 88 warning을 출력하고 exit 0. error assertion은 없어야 한다.

- [ ] **Step 5: Verify formatting and scope**

Run:

```bash
pnpm exec prettier lighthouserc.cjs docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/plans/2026-07-21-lighthouse-ci-pr-report.md docs/workflows/pr-checklist.md --check
git diff --check
```

Expected: 두 명령 모두 exit 0이고 기존 미추적 React Router·SEO 생성물과 PDF는 변경되지 않는다.

---

### Task 5: Inject the CI API base URL and add a real API smoke check

**Files:**

- Create: `.github/scripts/lighthouse-api-smoke.test.cjs`
- Create: `.github/scripts/lighthouse-api-smoke.cjs`
- Modify: `package.json`
- Modify: `.github/workflows/lighthouse.yml`
- Modify: `docs/architecture/data-layer.md`
- Modify: `docs/workflows/pr-checklist.md`

**Interfaces:**

- Consumes: `process.env.VITE_API_BASE_URL`
- Produces: `validateApiBaseUrl(value)` returning a normalized `URL`
- Produces: `createSmokeUrl(baseUrl)` returning the public endpoint URL string
- Produces: `runApiSmokeCheck({ baseUrl, fetchImpl, timeoutMs })` returning `{ status }`
- Produces: `pnpm test:lighthouse-api-smoke`
- Produces: `pnpm smoke:lighthouse-api`

- [x] **Step 1: Add the failing API smoke helper tests**

`.github/scripts/lighthouse-api-smoke.test.cjs`는 Node 내장 test runner와 `node:assert/strict`를 사용해 다음 동작을 각각 검증한다.

```js
test('rejects a missing API base URL', () => {
  assert.throws(() => validateApiBaseUrl(''), /VITE_API_BASE_URL/)
})

test('rejects a non-HTTP API base URL', () => {
  assert.throws(() => validateApiBaseUrl('ftp://example.com'), /HTTP\(S\)/)
})

test('builds the public restaurant smoke URL from the API origin', () => {
  assert.equal(
    createSmokeUrl('https://api.example.com/base/'),
    'https://api.example.com/api/v1/restaurants?type=sns-hot&size=1',
  )
})

test('accepts a successful API response', async () => {
  const result = await runApiSmokeCheck({
    baseUrl: 'https://api.example.com',
    fetchImpl: async () => ({ ok: true, status: 200 }),
  })

  assert.deepEqual(result, { status: 200 })
})

test('rejects a non-2xx API response', async () => {
  await assert.rejects(
    runApiSmokeCheck({
      baseUrl: 'https://api.example.com',
      fetchImpl: async () => ({ ok: false, status: 503 }),
    }),
    /HTTP 503/,
  )
})

test('reports a network failure without exposing the base URL', async () => {
  await assert.rejects(
    runApiSmokeCheck({
      baseUrl: 'https://private-api.example.com',
      fetchImpl: async () => {
        throw new Error('socket closed')
      },
    }),
    (error) =>
      /네트워크 요청에 실패/.test(error.message) &&
      !error.message.includes('private-api.example.com'),
  )
})

test('reports an aborted request as a timeout', async () => {
  const abortError = Object.assign(new Error('aborted'), {
    name: 'AbortError',
  })

  await assert.rejects(
    runApiSmokeCheck({
      baseUrl: 'https://api.example.com',
      fetchImpl: async () => {
        throw abortError
      },
      timeoutMs: 50,
    }),
    /50ms.*시간을 초과/,
  )
})
```

`package.json`에는 다음 script를 추가한다.

```json
"test:lighthouse-api-smoke": "node --test .github/scripts/lighthouse-api-smoke.test.cjs",
"test:lighthouse": "pnpm test:lighthouse-comment && pnpm test:lighthouse-api-smoke",
"smoke:lighthouse-api": "node .github/scripts/lighthouse-api-smoke.cjs"
```

- [x] **Step 2: Run the helper tests and confirm RED**

Run:

```bash
pnpm test:lighthouse-api-smoke
```

Expected: `.github/scripts/lighthouse-api-smoke.cjs`가 없어 module-not-found로 FAIL.

- [x] **Step 3: Implement the minimal API smoke helper**

`.github/scripts/lighthouse-api-smoke.cjs`는 `new URL()`로 값을 파싱하고 `http:` 또는 `https:`만 허용한다. `createSmokeUrl`은 origin 기준 `/api/v1/restaurants?type=sns-hot&size=1`을 반환한다. `runApiSmokeCheck`는 `AbortSignal.timeout(timeoutMs)`을 전달해 GET 요청을 실행하고, non-2xx·네트워크·timeout 오류를 서로 구분하되 base URL과 응답 body를 오류에 포함하지 않는다.

CLI entrypoint는 다음 형태로 실행한다.

```js
if (require.main === module) {
  runApiSmokeCheck({ baseUrl: process.env.VITE_API_BASE_URL })
    .then(({ status }) => {
      console.log(`Lighthouse API smoke check passed (HTTP ${status}).`)
    })
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
```

- [x] **Step 4: Run the helper tests and confirm GREEN**

Run:

```bash
pnpm test:lighthouse-api-smoke
pnpm test:lighthouse
```

Expected: API smoke helper 테스트와 기존 comment formatter 테스트가 모두 PASS.

- [x] **Step 5: Inject the Repository Variable in the workflow**

`.github/workflows/lighthouse.yml`의 Lighthouse job에 다음 환경변수를 추가한다.

```yaml
env:
  VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
```

dependency 설치 후 helper 테스트와 실제 smoke check를 build보다 먼저 실행한다.

```yaml
- name: Test Lighthouse Helpers
  run: pnpm test:lighthouse

- name: Check Lighthouse API
  run: pnpm smoke:lighthouse-api
```

누락·잘못된 변수, API timeout·네트워크·non-2xx는 이 단계에서 workflow를 실패시킨다. Lighthouse category 기준은 모두 `warn`을 유지한다.

- [x] **Step 6: Synchronize data-layer and PR workflow documentation**

`docs/architecture/data-layer.md`에는 Lighthouse CI가 Actions Repository Variable `VITE_API_BASE_URL`을 Client build와 공개 API smoke check에 공통으로 사용한다고 기록한다. `docs/workflows/pr-checklist.md`에는 variable 누락과 API 연결 실패는 workflow 오류이며 category 점수 미달은 warning이라는 차이를 기록한다.

- [x] **Step 7: Validate the workflow and live API connection**

Run:

```bash
pnpm exec prettier .github/scripts/lighthouse-api-smoke.cjs .github/scripts/lighthouse-api-smoke.test.cjs .github/workflows/lighthouse.yml package.json docs/architecture/data-layer.md docs/workflows/pr-checklist.md docs/superpowers/specs/2026-07-21-lighthouse-ci-pr-report-design.md docs/superpowers/plans/2026-07-21-lighthouse-ci-pr-report.md --check
pnpm exec yaml valid < .github/workflows/lighthouse.yml
node --env-file=apps/client/.env .github/scripts/lighthouse-api-smoke.cjs
```

Expected: Prettier와 YAML parse 성공, 로컬 개발 API smoke check가 HTTP 2xx로 성공. URL 값과 응답 body는 출력되지 않는다.

- [x] **Step 8: Reproduce the CI build and Lighthouse run**

Run:

```bash
pnpm build:client
pnpm exec lhci healthcheck --fatal
pnpm exec lhci collect
pnpm exec lhci assert
pnpm exec lhci upload
```

Expected: build와 healthcheck 성공, 실제 API를 사용하는 `/` 3회 collect 성공, category 미달은 warning으로만 기록되어 assert exit 0, filesystem HTML/JSON 생성.

- [x] **Step 9: Run repository verification and review scope**

Run:

```bash
pnpm install --frozen-lockfile
pnpm test:lighthouse
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch --untracked-files=all
```

Expected: 변경 범위의 검사와 저장소 테스트·typecheck·build가 성공한다. 전체 format/lint에 기존 미추적 React Router·SEO 생성물 오류가 남으면 이번 변경 파일과 분리해 보고하고 해당 생성물과 PDF는 수정하지 않는다.
