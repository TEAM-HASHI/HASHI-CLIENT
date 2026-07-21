const fs = require('node:fs')
const path = require('node:path')

const LIGHTHOUSE_COMMENT_MARKER = '<!-- lighthouse-ci-report -->'
const CORE_METRIC_AUDIT_IDS = new Set([
  'cumulative-layout-shift',
  'first-contentful-paint',
  'interactive',
  'largest-contentful-paint',
  'max-potential-fid',
  'speed-index',
  'total-blocking-time',
])
const EXCLUDED_SCORE_DISPLAY_MODES = new Set([
  'informative',
  'manual',
  'notApplicable',
])

const selectRepresentativeResult = (manifest) => {
  if (!Array.isArray(manifest) || manifest.length === 0) {
    return undefined
  }

  return manifest.find((result) => result.isRepresentativeRun)
}

const getCategoryScore = (report, categoryId) => {
  const score = report?.categories?.[categoryId]?.score

  return typeof score === 'number' ? Math.round(score * 100) : 0
}

const isNonNegativeNumber = (value) => Number.isFinite(value) && value >= 0

const getScoreStatus = (score) => {
  if (score >= 90) {
    return '🟢'
  }

  if (score >= 70) {
    return '🟡'
  }

  return '🔴'
}

const getAuditNumericValue = (report, auditId) => {
  const value = report?.audits?.[auditId]?.numericValue

  return isNonNegativeNumber(value) ? value : undefined
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

  return isNonNegativeNumber(item?.transferSize) ? item.transferSize : undefined
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

const createLighthouseComment = ({ report }) => {
  const performance = getCategoryScore(report, 'performance')
  const accessibility = getCategoryScore(report, 'accessibility')
  const bestPractices = getCategoryScore(report, 'best-practices')
  const seo = getCategoryScore(report, 'seo')
  const { cls, fcp, image, lcp, script, tbt } = getCoreMetrics(report)
  const improvementSuggestions = getImprovementSuggestions(report)
  const improvementItems = improvementSuggestions.length
    ? improvementSuggestions.map((suggestion) => `- ${suggestion}`)
    : ['- 감지된 주요 개선점이 없습니다.']

  return [
    LIGHTHOUSE_COMMENT_MARKER,
    '## Lighthouse 결과',
    '',
    '| Category | Score | Status |',
    '| --- | ---: | :---: |',
    `| Performance | ${performance} | ${getScoreStatus(performance)} |`,
    `| Accessibility | ${accessibility} | ${getScoreStatus(accessibility)} |`,
    `| Best Practices | ${bestPractices} | ${getScoreStatus(bestPractices)} |`,
    `| SEO | ${seo} | ${getScoreStatus(seo)} |`,
    '',
    '| FCP | LCP | CLS | TBT | Script | Image |',
    '| ---: | ---: | ---: | ---: | ---: | ---: |',
    `| ${fcp} | ${lcp} | ${cls} | ${tbt} | ${script} | ${image} |`,
    '',
    '### 개선점 요약',
    '',
    ...improvementItems,
  ].join('\n')
}

const commentLighthouseResults = async ({
  context,
  core,
  github,
  manifestPath = './lighthouse-reports/manifest.json',
}) => {
  if (!fs.existsSync(manifestPath)) {
    core.warning(`Lighthouse manifest was not found: ${manifestPath}`)
    return { status: 'skipped' }
  }

  let manifest

  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    core.warning(`Lighthouse manifest could not be read: ${error.message}`)
    return { status: 'skipped' }
  }

  const representative = selectRepresentativeResult(manifest)

  if (!representative?.jsonPath) {
    core.warning('A representative Lighthouse report was not found.')
    return { status: 'skipped' }
  }

  const reportPath = path.resolve(representative.jsonPath)

  if (!fs.existsSync(reportPath)) {
    core.warning(`Lighthouse report was not found: ${reportPath}`)
    return { status: 'skipped' }
  }

  let report

  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch (error) {
    core.warning(`Lighthouse report could not be read: ${error.message}`)
    return { status: 'skipped' }
  }

  const { owner, repo } = context.repo
  const issueNumber = context.issue.number
  const body = createLighthouseComment({ report })
  const comments = await github.paginate(github.rest.issues.listComments, {
    issue_number: issueNumber,
    owner,
    per_page: 100,
    repo,
  })
  const previousComment = comments.find(
    (comment) =>
      comment.user?.type === 'Bot' &&
      comment.body?.includes(LIGHTHOUSE_COMMENT_MARKER),
  )

  if (previousComment) {
    await github.rest.issues.updateComment({
      body,
      comment_id: previousComment.id,
      owner,
      repo,
    })

    return { commentId: previousComment.id, status: 'updated' }
  }

  const createdComment = await github.rest.issues.createComment({
    body,
    issue_number: issueNumber,
    owner,
    repo,
  })

  return { commentId: createdComment.data.id, status: 'created' }
}

module.exports = {
  LIGHTHOUSE_COMMENT_MARKER,
  commentLighthouseResults,
  createLighthouseComment,
  getCategoryScore,
  getCoreMetrics,
  getImprovementSuggestions,
  getScoreStatus,
  selectRepresentativeResult,
}
