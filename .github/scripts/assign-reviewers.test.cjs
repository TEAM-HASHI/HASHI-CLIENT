const assert = require('node:assert/strict')
const test = require('node:test')

const {
  addAssignment,
  addReview,
  collectReviewStats,
  createInitialReviewStats,
  getAssignmentPressureScore,
  getLookbackIsoDate,
  getReviewersToRequest,
  getReviewersToRemove,
  selectReviewers,
  validateReviewerConfig,
} = require('./assign-reviewers.cjs')

const createConfig = () => ({
  lookbackDays: 30,
  requiredReviewerCount: 2,
  reviewers: [
    { enabled: true, login: 'jyeon03', weight: 1 },
    { enabled: true, login: 'chungyo', weight: 1 },
    { enabled: true, login: 'gyeongbibin', weight: 1 },
    { enabled: true, login: 'yurimidaH', weight: 1 },
  ],
})

test('validateReviewerConfig requires exactly 2 reviewers', () => {
  const config = createConfig()

  assert.doesNotThrow(() => validateReviewerConfig(config))

  assert.throws(
    () => validateReviewerConfig({ ...config, requiredReviewerCount: 3 }),
    /requiredReviewerCount must be 2/,
  )
})

test('validateReviewerConfig rejects duplicate reviewer logins', () => {
  const config = createConfig()

  config.reviewers.push({ enabled: true, login: 'JYEON03', weight: 1 })

  assert.throws(
    () => validateReviewerConfig(config),
    /Duplicate reviewer login found: JYEON03/,
  )
})

test('validateReviewerConfig rejects empty reviewer logins', () => {
  const config = createConfig()

  config.reviewers[0].login = ''

  assert.throws(
    () => validateReviewerConfig(config),
    /reviewer login must not be empty/,
  )
})

test('validateReviewerConfig rejects invalid reviewer weights', () => {
  const config = createConfig()

  config.reviewers[0].weight = 0

  assert.throws(
    () => validateReviewerConfig(config),
    /Reviewer weight must be a positive number: jyeon03/,
  )
})

test('collectReviewStats counts only reviews submitted within the lookback window', async () => {
  const config = createConfig()
  const github = {
    rest: {
      pulls: {
        list: 'pulls.list',
        listReviews: 'pulls.listReviews',
      },
    },
    paginate: async (method, params) => {
      if (method === 'pulls.list') {
        return [
          {
            created_at: '2026-07-20T00:00:00.000Z',
            number: 10,
            requested_reviewers: [{ login: 'chungyo' }],
          },
        ]
      }

      if (method === 'pulls.listReviews') {
        assert.equal(params.pull_number, 10)

        return [
          {
            submitted_at: '2026-08-01T00:00:00.000Z',
            user: { login: 'gyeongbibin' },
          },
          {
            submitted_at: '2026-06-01T00:00:00.000Z',
            user: { login: 'external-reviewer' },
          },
        ]
      }

      return []
    },
  }

  const reviewStats = await collectReviewStats({
    github,
    owner: 'TEAM-HASHI',
    repo: 'HASHI-CLIENT',
    config,
    currentPullNumber: 11,
    now: new Date('2026-08-06T00:00:00.000Z'),
  })

  assert.deepEqual(reviewStats.get('chungyo'), {
    assignments: 1,
    reviews: 0,
  })
  assert.deepEqual(reviewStats.get('gyeongbibin'), {
    assignments: 0,
    reviews: 1,
  })
  assert.equal(reviewStats.has('external-reviewer'), false)
})

test('selectReviewers excludes the PR author and always returns 2 reviewers', () => {
  const config = createConfig()
  const reviewStats = createInitialReviewStats(config.reviewers)

  const reviewers = selectReviewers({
    author: 'jyeon03',
    config,
    pullNumber: 12,
    reviewStats,
  })

  assert.equal(reviewers.length, 2)
  assert.ok(!reviewers.includes('jyeon03'))
})

test('selectReviewers prefers reviewers with fewer recent reviews and assignments', () => {
  const config = createConfig()
  const reviewStats = createInitialReviewStats(config.reviewers)

  addAssignment(reviewStats, 'chungyo')
  addReview(reviewStats, 'gyeongbibin')
  addReview(reviewStats, 'yurimidaH')
  addAssignment(reviewStats, 'yurimidaH')

  const reviewers = selectReviewers({
    author: 'jyeon03',
    config,
    pullNumber: 21,
    reviewStats,
  })

  assert.deepEqual(new Set(reviewers), new Set(['chungyo', 'gyeongbibin']))
})

test('selectReviewers ignores disabled reviewers', () => {
  const config = createConfig()
  const reviewStats = createInitialReviewStats(config.reviewers)

  config.reviewers = config.reviewers.map((reviewer) =>
    reviewer.login === 'yurimidaH' ? { ...reviewer, enabled: false } : reviewer,
  )

  const reviewers = selectReviewers({
    author: 'jyeon03',
    config,
    pullNumber: 24,
    reviewStats,
  })

  assert.equal(reviewers.length, 2)
  assert.ok(!reviewers.includes('yurimidaH'))
})

test('getReviewersToRemove removes configured reviewers that were not selected', () => {
  const config = createConfig()

  assert.deepEqual(
    getReviewersToRemove({
      config,
      currentRequestedReviewers: [
        { login: 'chungyo' },
        { login: 'gyeongbibin' },
        { login: 'external-reviewer' },
      ],
      selectedReviewers: ['jyeon03', 'gyeongbibin'],
    }),
    ['chungyo'],
  )
})

test('getReviewersToRequest skips reviewers that are already requested', () => {
  assert.deepEqual(
    getReviewersToRequest({
      currentRequestedReviewers: [{ login: 'chungyo' }],
      selectedReviewers: ['chungyo', 'gyeongbibin'],
    }),
    ['gyeongbibin'],
  )
})

test('getAssignmentPressureScore applies weight to reduce assignment pressure for busy reviewers', () => {
  const config = createConfig()
  const reviewStats = createInitialReviewStats(config.reviewers)
  const reviewer = { enabled: true, login: 'chungyo', weight: 0.5 }

  addReview(reviewStats, 'chungyo')

  assert.equal(getAssignmentPressureScore(reviewer, reviewStats), 2)
})

test('getLookbackIsoDate subtracts lookback days in UTC', () => {
  assert.equal(
    getLookbackIsoDate(30, new Date('2026-08-06T00:00:00.000Z')),
    '2026-07-07T00:00:00.000Z',
  )
})
