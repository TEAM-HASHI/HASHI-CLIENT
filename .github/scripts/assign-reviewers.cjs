const fs = require('node:fs')
const path = require('node:path')

const DEFAULT_CONFIG_PATH = path.join(
  process.cwd(),
  '.github',
  'reviewer-assignment.json',
)

const normalizeLogin = (login) => login.trim().toLowerCase()

const readReviewerConfig = (configPath = DEFAULT_CONFIG_PATH) => {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

const validateReviewerConfig = (config) => {
  if (!Number.isInteger(config.requiredReviewerCount)) {
    throw new Error('requiredReviewerCount must be an integer.')
  }

  if (config.requiredReviewerCount !== 2) {
    throw new Error('requiredReviewerCount must be 2.')
  }

  if (!Number.isInteger(config.lookbackDays) || config.lookbackDays <= 0) {
    throw new Error('lookbackDays must be a positive integer.')
  }

  if (!Array.isArray(config.reviewers)) {
    throw new Error('reviewers must be an array.')
  }

  const reviewerLogins = new Set()

  for (const reviewer of config.reviewers) {
    if (typeof reviewer.login !== 'string' || !reviewer.login.trim()) {
      throw new Error('reviewer login must not be empty.')
    }

    const login = normalizeLogin(reviewer.login)

    if (reviewerLogins.has(login)) {
      throw new Error(`Duplicate reviewer login found: ${reviewer.login}`)
    }

    reviewerLogins.add(login)

    if (
      reviewer.weight !== undefined &&
      (typeof reviewer.weight !== 'number' || reviewer.weight <= 0)
    ) {
      throw new Error(
        `Reviewer weight must be a positive number: ${reviewer.login}`,
      )
    }
  }

  const enabledReviewers = config.reviewers.filter(
    (reviewer) => reviewer.enabled !== false,
  )

  if (enabledReviewers.length < config.requiredReviewerCount + 1) {
    throw new Error(
      'At least 3 enabled reviewers are required to assign 2 reviewers while excluding the PR author.',
    )
  }
}

const createTieBreaker = (pullNumber, login) => {
  const source = `${pullNumber}:${normalizeLogin(login)}`
  let hash = 0

  for (const character of source) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash
}

const createInitialReviewStats = (reviewers) => {
  return new Map(
    reviewers.map((reviewer) => [
      normalizeLogin(reviewer.login),
      {
        assignments: 0,
        reviews: 0,
      },
    ]),
  )
}

const addAssignment = (reviewStats, login) => {
  const stats = reviewStats.get(normalizeLogin(login))

  if (stats) {
    stats.assignments += 1
  }
}

const addReview = (reviewStats, login) => {
  const stats = reviewStats.get(normalizeLogin(login))

  if (stats) {
    stats.reviews += 1
  }
}

const getAssignmentPressureScore = (reviewer, reviewStats) => {
  const stats = reviewStats.get(normalizeLogin(reviewer.login)) ?? {
    assignments: 0,
    reviews: 0,
  }
  const weight =
    typeof reviewer.weight === 'number' && reviewer.weight > 0
      ? reviewer.weight
      : 1

  return (stats.assignments + stats.reviews) / weight
}

const selectReviewers = ({ author, config, pullNumber, reviewStats }) => {
  validateReviewerConfig(config)

  const authorLogin = normalizeLogin(author)
  const candidates = config.reviewers.filter(
    (reviewer) =>
      reviewer.enabled !== false &&
      normalizeLogin(reviewer.login) !== authorLogin,
  )

  if (candidates.length < config.requiredReviewerCount) {
    throw new Error(
      `At least ${config.requiredReviewerCount} eligible reviewers are required after excluding the PR author.`,
    )
  }

  return candidates
    .toSorted((left, right) => {
      const scoreDifference =
        getAssignmentPressureScore(left, reviewStats) -
        getAssignmentPressureScore(right, reviewStats)

      if (scoreDifference !== 0) {
        return scoreDifference
      }

      return (
        createTieBreaker(pullNumber, left.login) -
        createTieBreaker(pullNumber, right.login)
      )
    })
    .slice(0, config.requiredReviewerCount)
    .map((reviewer) => reviewer.login)
}

const getConfiguredReviewerLogins = (config) => {
  return new Set(
    config.reviewers.map((reviewer) => normalizeLogin(reviewer.login)),
  )
}

const getReviewersToRemove = ({
  config,
  currentRequestedReviewers,
  selectedReviewers,
}) => {
  const configuredReviewerLogins = getConfiguredReviewerLogins(config)
  const selectedReviewerLogins = new Set(selectedReviewers.map(normalizeLogin))

  return currentRequestedReviewers
    .filter((reviewer) =>
      configuredReviewerLogins.has(normalizeLogin(reviewer.login)),
    )
    .filter(
      (reviewer) => !selectedReviewerLogins.has(normalizeLogin(reviewer.login)),
    )
    .map((reviewer) => reviewer.login)
}

const getReviewersToRequest = ({
  currentRequestedReviewers,
  selectedReviewers,
}) => {
  const currentRequestedReviewerLogins = new Set(
    currentRequestedReviewers.map((reviewer) => normalizeLogin(reviewer.login)),
  )

  return selectedReviewers.filter(
    (reviewer) => !currentRequestedReviewerLogins.has(normalizeLogin(reviewer)),
  )
}

const getLookbackIsoDate = (lookbackDays, now = new Date()) => {
  const startDate = new Date(now)

  startDate.setUTCDate(startDate.getUTCDate() - lookbackDays)

  return startDate.toISOString()
}

const collectReviewStats = async ({
  github,
  owner,
  repo,
  config,
  currentPullNumber,
  now,
}) => {
  const reviewStats = createInitialReviewStats(config.reviewers)
  const since = getLookbackIsoDate(config.lookbackDays, now)
  const pullRequests = await github.paginate(github.rest.pulls.list, {
    owner,
    repo,
    state: 'all',
    sort: 'created',
    direction: 'desc',
    per_page: 100,
  })

  const recentPullRequests = pullRequests.filter((pullRequest) => {
    return (
      pullRequest.number !== currentPullNumber &&
      new Date(pullRequest.created_at).toISOString() >= since
    )
  })

  for (const pullRequest of recentPullRequests) {
    for (const reviewer of pullRequest.requested_reviewers ?? []) {
      addAssignment(reviewStats, reviewer.login)
    }

    const reviews = await github.paginate(github.rest.pulls.listReviews, {
      owner,
      repo,
      pull_number: pullRequest.number,
      per_page: 100,
    })
    const reviewedLogins = new Set()

    const recentReviews = reviews.filter((review) => {
      return (
        review.submitted_at &&
        new Date(review.submitted_at).toISOString() >= since
      )
    })

    for (const review of recentReviews) {
      const login = review.user?.login

      if (login && !reviewedLogins.has(normalizeLogin(login))) {
        addReview(reviewStats, login)
        reviewedLogins.add(normalizeLogin(login))
      }
    }
  }

  return reviewStats
}

const assignReviewers = async ({ core, context, github }) => {
  const pullRequest = context.payload.pull_request

  if (!pullRequest) {
    core.info('No pull request found in the event payload.')
    return
  }

  const config = readReviewerConfig()
  validateReviewerConfig(config)

  const owner = context.repo.owner
  const repo = context.repo.repo
  const reviewStats = await collectReviewStats({
    github,
    owner,
    repo,
    config,
    currentPullNumber: pullRequest.number,
  })
  const reviewers = selectReviewers({
    author: pullRequest.user.login,
    config,
    pullNumber: pullRequest.number,
    reviewStats,
  })
  const reviewersToRemove = getReviewersToRemove({
    config,
    currentRequestedReviewers: pullRequest.requested_reviewers ?? [],
    selectedReviewers: reviewers,
  })
  const reviewersToRequest = getReviewersToRequest({
    currentRequestedReviewers: pullRequest.requested_reviewers ?? [],
    selectedReviewers: reviewers,
  })

  if (reviewersToRemove.length > 0) {
    await github.rest.pulls.removeRequestedReviewers({
      owner,
      repo,
      pull_number: pullRequest.number,
      reviewers: reviewersToRemove,
    })
  }

  if (reviewersToRequest.length > 0) {
    await github.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number: pullRequest.number,
      reviewers: reviewersToRequest,
    })
  }

  core.info(`Requested reviewers: ${reviewers.join(', ')}`)
}

module.exports = {
  addAssignment,
  addReview,
  assignReviewers,
  collectReviewStats,
  createInitialReviewStats,
  getLookbackIsoDate,
  getReviewersToRequest,
  getReviewersToRemove,
  getAssignmentPressureScore,
  readReviewerConfig,
  selectReviewers,
  validateReviewerConfig,
}
