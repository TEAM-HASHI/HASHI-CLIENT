const fs = require('node:fs')
const path = require('node:path')

const LIGHTHOUSE_COMMENT_MARKER = '<!-- lighthouse-ci-report -->'

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

const getScoreStatus = (score) => {
  if (score >= 90) {
    return '🟢'
  }

  if (score >= 70) {
    return '🟡'
  }

  return '🔴'
}

const createLighthouseComment = ({
  generatedAt = new Date(),
  report,
  runUrl,
}) => {
  const performance = getCategoryScore(report, 'performance')
  const accessibility = getCategoryScore(report, 'accessibility')
  const bestPractices = getCategoryScore(report, 'best-practices')
  const seo = getCategoryScore(report, 'seo')

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
    '```mermaid',
    'xychart',
    '    title "Lighthouse Scores"',
    '    x-axis ["Performance", "Accessibility", "Best Practices", "SEO"]',
    '    y-axis "Score" 0 --> 100',
    `    bar [${performance}, ${accessibility}, ${bestPractices}, ${seo}]`,
    '```',
    '',
    `[상세 HTML 리포트 다운로드](${runUrl})`,
    '',
    `_대표 실행 결과 · ${generatedAt.toISOString()}_`,
  ].join('\n')
}

const commentLighthouseResults = async ({
  context,
  core,
  generatedAt = new Date(),
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
  const runUrl = `https://github.com/${owner}/${repo}/actions/runs/${context.runId}`
  const body = createLighthouseComment({ generatedAt, report, runUrl })
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
  getScoreStatus,
  selectRepresentativeResult,
}
