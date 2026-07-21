const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  LIGHTHOUSE_COMMENT_MARKER,
  commentLighthouseResults,
  createLighthouseComment,
  getCategoryScore,
  getCoreMetrics,
  getImprovementSuggestions,
  getScoreStatus,
  selectRepresentativeResult,
} = require('./lighthouse-comment.cjs')

const createReport = () => ({
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
    'errors-in-console': {
      details: { type: 'table' },
      id: 'errors-in-console',
      score: 0,
      scoreDisplayMode: 'binary',
      title: 'Browser errors were logged to the console',
    },
    'image-delivery-insight': {
      details: { overallSavingsBytes: 20480, type: 'table' },
      id: 'image-delivery-insight',
      score: 0,
      scoreDisplayMode: 'metricSavings',
      title: 'Improve image delivery',
    },
    'unused-javascript': {
      details: {
        overallSavingsBytes: 86016,
        overallSavingsMs: 450,
        type: 'opportunity',
      },
      id: 'unused-javascript',
      score: 0,
      scoreDisplayMode: 'metricSavings',
      title: 'Reduce unused JavaScript',
    },
    'uses-rel-preconnect': {
      details: { overallSavingsMs: 313.3935, type: 'opportunity' },
      id: 'uses-rel-preconnect',
      score: 0,
      scoreDisplayMode: 'metricSavings',
      title: 'Preconnect to required origins',
    },
  },
  categories: {
    accessibility: { score: 0.944 },
    'best-practices': { score: 0.96 },
    performance: { score: 0.816 },
    seo: { score: 0.9 },
  },
})

const createLighthouseFiles = () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'hashi-lighthouse-comment-'),
  )
  const reportPath = path.join(directory, 'report.json')
  const manifestPath = path.join(directory, 'manifest.json')

  fs.writeFileSync(reportPath, JSON.stringify(createReport()))
  fs.writeFileSync(
    manifestPath,
    JSON.stringify([
      {
        isRepresentativeRun: true,
        jsonPath: reportPath,
        url: 'http://localhost/',
      },
    ]),
  )

  return { directory, manifestPath }
}

test('selectRepresentativeResult prefers the representative run', () => {
  const firstRun = { isRepresentativeRun: false, jsonPath: 'first.json' }
  const representativeRun = {
    isRepresentativeRun: true,
    jsonPath: 'representative.json',
  }

  assert.equal(
    selectRepresentativeResult([firstRun, representativeRun]),
    representativeRun,
  )
  assert.equal(selectRepresentativeResult([]), undefined)
})

test('selectRepresentativeResult returns undefined without a representative run', () => {
  const nonRepresentativeRun = {
    isRepresentativeRun: false,
    jsonPath: 'first.json',
  }

  assert.equal(selectRepresentativeResult([nonRepresentativeRun]), undefined)
})

test('category scores are rounded to integers and mapped to statuses', () => {
  const report = createReport()

  assert.equal(getCategoryScore(report, 'performance'), 82)
  assert.equal(getCategoryScore(report, 'accessibility'), 94)
  assert.equal(getCategoryScore(report, 'missing'), 0)
  assert.equal(getScoreStatus(90), '🟢')
  assert.equal(getScoreStatus(70), '🟡')
  assert.equal(getScoreStatus(69), '🔴')
})

test('core metrics are normalized for the summary table', () => {
  assert.deepEqual(getCoreMetrics(createReport()), {
    cls: '0.045',
    fcp: '2053ms',
    image: '8KB',
    lcp: '2313ms',
    script: '242KB',
    tbt: '0ms',
  })
})

test('core metrics use N/A for missing or invalid values', () => {
  assert.deepEqual(
    getCoreMetrics({
      audits: {
        'cumulative-layout-shift': { numericValue: -0.1 },
        'first-contentful-paint': { numericValue: -1 },
        'largest-contentful-paint': {},
        'resource-summary': {
          details: {
            items: [{ resourceType: 'script', transferSize: -1 }],
          },
        },
        'total-blocking-time': { numericValue: Number.NaN },
      },
    }),
    {
      cls: 'N/A',
      fcp: 'N/A',
      image: 'N/A',
      lcp: 'N/A',
      script: 'N/A',
      tbt: 'N/A',
    },
  )
})

test('createLighthouseComment renders only the category and core metric tables', () => {
  const comment = createLighthouseComment({
    report: createReport(),
  })

  assert.match(comment, new RegExp(LIGHTHOUSE_COMMENT_MARKER))
  assert.match(comment, /\| Performance \| 82 \| 🟡 \|/)
  assert.match(comment, /\| Accessibility \| 94 \| 🟢 \|/)
  assert.match(comment, /\| FCP \| LCP \| CLS \| TBT \| Script \| Image \|/)
  assert.match(
    comment,
    /\| 2053ms \| 2313ms \| 0\.045 \| 0ms \| 242KB \| 8KB \|/,
  )
  assert.doesNotMatch(comment, /mermaid|xychart|actions\/runs|대표 실행 결과/)
})

test('improvement suggestions prioritize savings and limit the result to three', () => {
  const report = createReport()

  assert.deepEqual(getImprovementSuggestions(report), [
    'Reduce unused JavaScript — 약 450ms, 84KB 절감 가능',
    'Preconnect to required origins — 약 313ms 단축 가능',
    'Improve image delivery — 약 20KB 절감 가능',
  ])

  const comment = createLighthouseComment({ report })

  assert.match(comment, /### 개선점 요약/)
  assert.match(comment, /- Reduce unused JavaScript/)
  assert.doesNotMatch(comment, /Browser errors were logged/)
})

test('createLighthouseComment renders a fallback without improvement candidates', () => {
  const report = createReport()

  for (const audit of Object.values(report.audits)) {
    audit.score = 1
  }

  assert.match(
    createLighthouseComment({ report }),
    /- 감지된 주요 개선점이 없습니다\./,
  )
})

test('commentLighthouseResults updates the existing bot comment', async (t) => {
  const { directory, manifestPath } = createLighthouseFiles()
  t.after(() => fs.rmSync(directory, { force: true, recursive: true }))

  const calls = { create: [], update: [] }
  const github = {
    paginate: async () => [
      {
        body: `${LIGHTHOUSE_COMMENT_MARKER}\nold result`,
        id: 55,
        user: { type: 'Bot' },
      },
    ],
    rest: {
      issues: {
        createComment: async (input) => calls.create.push(input),
        listComments: async () => undefined,
        updateComment: async (input) => calls.update.push(input),
      },
    },
  }

  const result = await commentLighthouseResults({
    context: {
      issue: { number: 138 },
      repo: { owner: 'TEAM-HASHI', repo: 'SIKSA-CLIENT' },
      runId: 123,
    },
    core: { warning: () => undefined },
    generatedAt: new Date('2026-07-21T12:34:56.000Z'),
    github,
    manifestPath,
  })

  assert.deepEqual(result, { commentId: 55, status: 'updated' })
  assert.equal(calls.create.length, 0)
  assert.equal(calls.update.length, 1)
  assert.equal(calls.update[0].comment_id, 55)
  assert.match(calls.update[0].body, /\| Performance \| 82 \| 🟡 \|/)
})

test('commentLighthouseResults creates a comment when no marker exists', async (t) => {
  const { directory, manifestPath } = createLighthouseFiles()
  t.after(() => fs.rmSync(directory, { force: true, recursive: true }))

  const calls = { create: [], update: [] }
  const github = {
    paginate: async () => [],
    rest: {
      issues: {
        createComment: async (input) => {
          calls.create.push(input)
          return { data: { id: 77 } }
        },
        listComments: async () => undefined,
        updateComment: async (input) => calls.update.push(input),
      },
    },
  }

  const result = await commentLighthouseResults({
    context: {
      issue: { number: 138 },
      repo: { owner: 'TEAM-HASHI', repo: 'SIKSA-CLIENT' },
      runId: 123,
    },
    core: { warning: () => undefined },
    github,
    manifestPath,
  })

  assert.deepEqual(result, { commentId: 77, status: 'created' })
  assert.equal(calls.create.length, 1)
  assert.equal(calls.create[0].issue_number, 138)
  assert.equal(calls.update.length, 0)
})

test('commentLighthouseResults warns and skips when the manifest is missing', async () => {
  const warnings = []

  const result = await commentLighthouseResults({
    context: {
      issue: { number: 138 },
      repo: { owner: 'TEAM-HASHI', repo: 'SIKSA-CLIENT' },
      runId: 123,
    },
    core: { warning: (message) => warnings.push(message) },
    github: {},
    manifestPath: '/missing/lighthouse/manifest.json',
  })

  assert.deepEqual(result, { status: 'skipped' })
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /manifest/i)
})

test('commentLighthouseResults warns and skips without a representative run', async (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'hashi-lighthouse-comment-'),
  )
  const reportPath = path.join(directory, 'report.json')
  const manifestPath = path.join(directory, 'manifest.json')
  t.after(() => fs.rmSync(directory, { force: true, recursive: true }))

  fs.writeFileSync(reportPath, JSON.stringify(createReport()))
  fs.writeFileSync(
    manifestPath,
    JSON.stringify([
      {
        isRepresentativeRun: false,
        jsonPath: reportPath,
        url: 'http://localhost/',
      },
    ]),
  )

  const calls = { paginate: 0 }
  const warnings = []
  const github = {
    paginate: async () => {
      calls.paginate += 1
      return []
    },
    rest: {
      issues: {
        createComment: async () => {
          assert.fail('createComment should not be called')
        },
        listComments: async () => undefined,
        updateComment: async () => {
          assert.fail('updateComment should not be called')
        },
      },
    },
  }

  const result = await commentLighthouseResults({
    context: {
      issue: { number: 138 },
      repo: { owner: 'TEAM-HASHI', repo: 'SIKSA-CLIENT' },
      runId: 123,
    },
    core: { warning: (message) => warnings.push(message) },
    github,
    manifestPath,
  })

  assert.deepEqual(result, { status: 'skipped' })
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /representative/i)
  assert.equal(calls.paginate, 0)
})
