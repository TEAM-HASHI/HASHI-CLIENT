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
  getScoreStatus,
  selectRepresentativeResult,
} = require('./lighthouse-comment.cjs')

const createReport = () => ({
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

test('createLighthouseComment renders the score table, chart, and run link', () => {
  const comment = createLighthouseComment({
    generatedAt: new Date('2026-07-21T12:34:56.000Z'),
    report: createReport(),
    runUrl: 'https://github.com/TEAM-HASHI/SIKSA-CLIENT/actions/runs/123',
  })

  assert.match(comment, new RegExp(LIGHTHOUSE_COMMENT_MARKER))
  assert.match(comment, /\| Performance \| 82 \| 🟡 \|/)
  assert.match(comment, /\| Accessibility \| 94 \| 🟢 \|/)
  assert.match(comment, /xychart/)
  assert.match(comment, /bar \[82, 94, 96, 90\]/)
  assert.match(comment, /actions\/runs\/123/)
  assert.match(comment, /2026-07-21T12:34:56\.000Z/)
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
