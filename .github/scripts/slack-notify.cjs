const members = {
  gyeongbibin: 'U0BUYLZ0F0V',
  jyeon03: 'U0BUMN7L1L7',
  yurimidah: 'U0C0HEK3R88',
  chungyo: 'U0BV51BH48Z',
}

const escape = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
const mention = (login = '') =>
  Object.hasOwn(members, login.toLowerCase())
    ? `<@${members[login.toLowerCase()]}>`
    : escape(login)
const isBot = (user) =>
  user?.type === 'Bot' || /\[bot\]$/i.test(user?.login ?? '')
const skipPr = (pr) => !pr || pr.draft || isBot(pr.user)
const prLines = (pr, mentionAuthor = false) => [
  `제목: ${escape(pr.title)}`,
  `작성자: ${mentionAuthor ? mention(pr.user.login) : escape(pr.user.login)}`,
  `PR: ${pr.html_url}`,
]

const getMessageColor = ({ mode, context, assignmentResult, deployment }) => {
  if (mode === 'created')
    return assignmentResult === 'failure' ? '#DC2626' : '#2563EB'
  if (mode === 'ci') return '#DC2626'
  if (mode === 'deploy')
    return deployment.result === 'success' ? '#16A34A' : '#DC2626'
  if (mode === 'pr') {
    if (context.payload.action === 'review_requested') return '#7C3AED'
    if (
      context.payload.action === 'closed' ||
      context.payload.review?.state === 'approved'
    )
      return '#16A34A'
    return '#EA580C'
  }
  return '#6B7280'
}

const buildMessage = async ({
  mode,
  context,
  github,
  deployment,
  assignmentResult,
  attempt = 1,
}) => {
  const payload = context.payload
  const params = { ...context.repo, pull_number: payload.pull_request?.number }
  if (mode === 'created') {
    const failed = assignmentResult === 'failure'
    if (!failed && attempt > 1) {
      const jobs = await github.paginate(
        github.rest.actions.listJobsForWorkflowRun,
        {
          ...context.repo,
          run_id: context.runId,
          filter: 'all',
          per_page: 100,
        },
      )
      if (
        jobs.some((job) =>
          job.steps?.some(
            (step) =>
              step.name === 'Record successful PR notification' &&
              step.conclusion === 'success',
          ),
        )
      )
        return
    }
    const pr = failed
      ? payload.pull_request
      : (await github.rest.pulls.get(params)).data
    if (skipPr(pr) || pr.state === 'closed') return
    if (failed) {
      return [
        '[HASHI] 리뷰어 자동 지정 실패',
        ...prLines(pr, true),
        '리뷰어 수동 지정 또는 자동 지정 재실행이 필요합니다.',
      ].join('\n')
    }
    const label = {
      opened: '새 PR 리뷰 요청',
      ready_for_review: 'PR 리뷰 준비 완료',
      reopened: 'PR 다시 열림',
    }[payload.action]
    if (!label) return
    const reviewers = [
      ...(pr.requested_reviewers ?? []).map((user) => mention(user.login)),
      ...(pr.requested_teams ?? []).map((team) => escape(team.name)),
    ]
    return [
      `[HASHI] ${label}`,
      ...prLines(pr),
      `리뷰어: ${reviewers.join(' ') || '요청된 리뷰어 없음'}`,
    ].join('\n')
  }
  if (mode === 'pr') {
    const pr = payload.pull_request
    if (skipPr(pr)) return
    if (payload.action === 'closed' && pr.merged) {
      return [
        '[HASHI] PR 병합',
        ...prLines(pr),
        `병합한 사람: ${escape(pr.merged_by?.login ?? context.actor)}`,
      ].join('\n')
    }
    if (payload.action === 'review_requested') {
      // GITHUB_TOKEN 자동 지정은 생성 알림에서만 다룹니다.
      if (isBot(payload.sender)) return
      const reviewer = payload.requested_reviewer
      if (isBot(reviewer)) return
      let repeated = false
      if (reviewer) {
        const reviews = await github.paginate(github.rest.pulls.listReviews, {
          ...params,
          per_page: 100,
        })
        repeated = reviews.some(
          (review) =>
            review.user?.login?.toLowerCase() === reviewer.login.toLowerCase(),
        )
      }
      return [
        `[HASHI] 리뷰 ${repeated ? '재요청' : '요청'}`,
        ...prLines(pr),
        `리뷰어: ${reviewer ? mention(reviewer.login) : escape(payload.requested_team?.name ?? '팀')}`,
      ].join('\n')
    }
    const review = payload.review
    if (
      payload.action === 'submitted' &&
      !isBot(review?.user) &&
      ['approved', 'changes_requested'].includes(review?.state)
    ) {
      return [
        `[HASHI] ${review.state === 'approved' ? '리뷰 승인' : '변경 요청'}`,
        ...prLines(pr, true),
        `리뷰어: ${escape(review.user.login)}`,
      ].join('\n')
    }
    return
  }
  if (mode === 'ci') {
    const run = payload.workflow_run
    if (
      run?.name !== 'CI' ||
      !['failure', 'timed_out', 'action_required'].includes(run.conclusion)
    )
      return
    let lines
    if (run.event === 'pull_request') {
      let reference = run.pull_requests?.[0]
      if (!reference) {
        const prs = await github.paginate(
          github.rest.repos.listPullRequestsAssociatedWithCommit,
          {
            ...context.repo,
            commit_sha: run.head_sha,
            per_page: 100,
          },
        )
        reference = prs.find(
          (pr) =>
            pr.state === 'open' && pr.head.sha === run.head_sha && !skipPr(pr),
        )
      }
      if (!reference) return
      const { data: pr } = await github.rest.pulls.get({
        ...context.repo,
        pull_number: reference.number,
      })
      if (skipPr(pr) || pr.state === 'closed') return
      lines = prLines(pr, true)
    } else if (
      run.event === 'push' &&
      ['develop', 'main'].includes(run.head_branch)
    ) {
      const actor = run.triggering_actor ?? run.actor
      if (isBot(actor)) return
      lines = [`실행자: ${mention(actor?.login)}`]
    } else return
    const jobs = await github.paginate(
      github.rest.actions.listJobsForWorkflowRunAttempt,
      {
        ...context.repo,
        run_id: run.id,
        attempt_number: run.run_attempt ?? 1,
        per_page: 100,
      },
    )
    const failedJobs = jobs.filter((job) =>
      ['failure', 'timed_out', 'action_required'].includes(job.conclusion),
    )
    return [
      '[HASHI] CI 실패',
      ...lines,
      `대상: ${escape((run.head_sha ?? '').slice(0, 7))} · ${run.run_attempt ?? 1}회차`,
      ...(failedJobs.length
        ? [
            `실패한 작업: ${failedJobs.map((job) => escape(job.name)).join(', ')}`,
          ]
        : []),
    ].join('\n')
  }
  if (
    mode === 'deploy' &&
    ['success', 'failure'].includes(deployment?.result)
  ) {
    const failed = deployment.result === 'failure'
    return [
      `[HASHI] ${escape(deployment.service)} 운영 배포 ${failed ? '실패' : '성공'}`,
      ...(failed
        ? [`실행자: ${mention(deployment.actor ?? context.actor)}`]
        : []),
      ...(!failed && deployment.url
        ? [`배포 주소: ${escape(deployment.url)}`]
        : []),
    ].join('\n')
  }
}

const notifySlack = async ({
  core,
  webhookUrl = process.env.SLACK_WEBHOOK_URL,
  fetchImpl = fetch,
  ...options
}) => {
  let stage = 'GitHub message lookup'
  let detail = 'API lookup failed'
  try {
    const text = await buildMessage(options)
    if (!text) return false
    stage = 'webhook configuration'
    detail = 'missing secret'
    if (!webhookUrl) throw new Error()
    core.setSecret(webhookUrl)
    detail = 'invalid URL'
    const url = new URL(webhookUrl)
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'hooks.slack.com' ||
      !url.pathname.startsWith('/services/')
    )
      throw new Error()
    stage = 'Slack request'
    detail = 'network error'
    let response
    try {
      response = await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [
            {
              color: getMessageColor(options),
              text,
              fallback: text,
              mrkdwn_in: ['text'],
            },
          ],
          unfurl_links: false,
          unfurl_media: false,
        }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) {
        stage = 'Slack HTTP response'
        detail = `HTTP ${Number(response.status)}`
        throw new Error()
      }
      const body = await response.text()
      stage = 'Slack response body'
      detail = 'unexpected response'
      if (body.trim() !== 'ok') throw new Error()
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        stage = 'Slack request'
        detail = 'timed out'
      }
      throw error
    }
    core.info('Slack notification sent.')
    return true
  } catch (error) {
    if (
      stage === 'GitHub message lookup' &&
      Number.isInteger(error?.status) &&
      error.status >= 100 &&
      error.status <= 599
    ) {
      detail = `HTTP ${error.status}`
    }
    // 외부 API 오류에 webhook URL이 포함될 수 있어 원본 오류를 기록하지 않습니다.
    core.warning(
      `Slack notification failed (${stage}: ${detail}). No automatic retry was attempted.`,
    )
    return false
  }
}

module.exports = { notifySlack }
