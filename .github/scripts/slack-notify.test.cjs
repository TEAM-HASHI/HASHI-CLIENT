const assert = require('node:assert/strict')
const { test } = require('node:test')
const { notifySlack } = require('./slack-notify.cjs')

const pr = {
  number: 213,
  title: 'test <!channel> & <@UOTHER>',
  html_url: 'https://github.com/TEAM-HASHI/HASHI-CLIENT/pull/213',
  user: { login: 'jyeon03', type: 'User' },
  draft: false,
  head: { ref: 'feat/test' },
  base: { ref: 'develop' },
  requested_reviewers: [{ login: 'gyeongbibin' }],
  requested_teams: [],
}
const harness = (payload, eventName = 'pull_request_target') => {
  const sent = [],
    warnings = []
  return {
    sent,
    warnings,
    args: {
      context: {
        payload,
        eventName,
        repo: { owner: 'TEAM-HASHI', repo: 'HASHI-CLIENT' },
        actor: 'jyeon03',
        serverUrl: 'https://github.com',
        runId: 1,
        ref: 'refs/heads/main',
        sha: 'abcdef123',
      },
      core: {
        setSecret() {},
        info() {},
        warning: (value) => warnings.push(value),
      },
      github: {
        paginate: async (method, params) => {
          const { data } = await method(params)
          return data.jobs ?? data
        },
        rest: {
          pulls: {
            get: async () => ({ data: pr }),
            listReviews: async () => ({ data: [] }),
          },
          actions: {
            listJobsForWorkflowRunAttempt: async () => ({
              data: {
                jobs: [
                  {
                    name: 'Tests',
                    conclusion: 'failure',
                    html_url: 'https://github.com/log',
                  },
                ],
              },
            }),
            listJobsForWorkflowRun: async () => ({
              data: {
                jobs: [
                  {
                    name: 'Tests',
                    conclusion: 'failure',
                    html_url: 'https://github.com/log',
                  },
                ],
              },
            }),
          },
        },
      },
      webhookUrl: 'https://hooks.slack.com/services/test/secret',
      fetchImpl: async (_, options) => {
        const payload = JSON.parse(options.body)
        sent.push({ ...payload, text: payload.attachments[0].text })
        return { ok: true, text: async () => 'ok' }
      },
    },
  }
}

test('creation reads assigned reviewers and escapes PR-controlled mentions', async () => {
  const h = harness({
    action: 'opened',
    pull_request: { ...pr, requested_reviewers: [] },
  })
  await notifySlack({ ...h.args, mode: 'created' })
  assert.equal(h.sent.length, 1)
  assert.match(h.sent[0].text, /<@U0BUYLZ0F0V>/)
  assert.match(h.sent[0].text, /&lt;!channel&gt; &amp; &lt;@UOTHER&gt;/)
})

test('assignment failure reports PR information without requiring another GitHub lookup', async () => {
  const h = harness({ action: 'opened', pull_request: pr })
  h.args.github.rest.pulls.get = async () => {
    throw new Error('GitHub unavailable')
  }
  await notifySlack({ ...h.args, mode: 'created', assignmentResult: 'failure' })
  assert.equal(h.sent.length, 1)
  assert.match(h.sent[0].text, /리뷰어 자동 지정 실패/)
  assert.match(h.sent[0].text, /<@U0BUMN7L1L7>/)
})

test('assignment recovery notifies unless a prior attempt recorded successful creation delivery', async () => {
  for (const delivered of [false, true]) {
    const h = harness({ action: 'opened', pull_request: pr })
    h.args.github.rest.actions.listJobsForWorkflowRun = async () => ({
      data: {
        jobs: [
          {
            steps: [
              {
                name: 'Record successful PR notification',
                conclusion: delivered ? 'success' : 'skipped',
              },
            ],
          },
        ],
      },
    })
    const result = await notifySlack({
      ...h.args,
      mode: 'created',
      assignmentResult: 'success',
      attempt: 2,
    })
    assert.equal(h.sent.length, delivered ? 0 : 1)
    assert.equal(result, !delivered)
  }
})

test('delayed CI notification queries its own attempt and identifies the checked commit', async () => {
  const h = harness(
    {
      workflow_run: {
        id: 9,
        name: 'CI',
        event: 'pull_request',
        conclusion: 'failure',
        run_attempt: 1,
        head_sha: 'old-head',
        pull_requests: [{ number: 213 }],
        html_url: 'https://github.com/run/9',
      },
    },
    'workflow_run',
  )
  h.args.github.rest.actions.listJobsForWorkflowRun = async () => {
    throw new Error('must not query latest attempt')
  }
  h.args.github.rest.actions.listJobsForWorkflowRunAttempt = async (params) => {
    assert.equal(params.attempt_number, 1)
    return {
      data: {
        jobs: [
          {
            name: 'First attempt test failure',
            conclusion: 'failure',
            html_url: 'https://github.com/job',
          },
        ],
      },
    }
  }
  await notifySlack({ ...h.args, mode: 'ci' })
  assert.equal(h.sent.length, 1)
  assert.match(h.sent[0].text, /First attempt test failure/)
  assert.match(h.sent[0].text, /대상: old-hea · 1회차/)
})

test('draft, bot PRs and automatic review requests do not notify', async () => {
  for (const payload of [
    { action: 'review_requested', pull_request: { ...pr, draft: true } },
    {
      action: 'closed',
      pull_request: {
        ...pr,
        merged: true,
        user: { login: 'dependabot[bot]', type: 'Bot' },
      },
    },
    {
      action: 'review_requested',
      pull_request: pr,
      sender: { login: 'github-actions[bot]', type: 'Bot' },
      requested_reviewer: { login: 'chungyo' },
    },
  ]) {
    const h = harness(payload)
    await notifySlack({ ...h.args, mode: 'pr' })
    assert.equal(h.sent.length, 0)
  }
})

test('manual review re-request identifies reviewer with prior review', async () => {
  const h = harness({
    action: 'review_requested',
    pull_request: pr,
    sender: { login: 'jyeon03' },
    requested_reviewer: { login: 'chungyo' },
  })
  h.args.github.rest.pulls.listReviews = async () => ({
    data: [{ user: { login: 'chungyo' } }],
  })
  await notifySlack({ ...h.args, mode: 'pr' })
  assert.match(h.sent[0].text, /리뷰 재요청/)
  assert.match(h.sent[0].text, /<@U0BV51BH48Z>/)
})

test('review decisions mention author but ordinary comments do not notify', async () => {
  for (const state of ['approved', 'changes_requested', 'commented']) {
    const h = harness(
      {
        action: 'submitted',
        pull_request: pr,
        review: {
          state,
          user: { login: 'chungyo' },
          html_url: 'https://github.com/review',
        },
      },
      'pull_request_review',
    )
    await notifySlack({ ...h.args, mode: 'pr' })
    assert.equal(h.sent.length, state === 'commented' ? 0 : 1)
    if (h.sent.length) assert.match(h.sent[0].text, /<@U0BUMN7L1L7>/)
    if (h.sent.length)
      assert.doesNotMatch(h.sent[0].text, /리뷰: https:\/\/github.com\/review/)
  }
})

test('unregistered accounts cannot resolve inherited object properties as Slack IDs', async () => {
  const h = harness(
    {
      action: 'submitted',
      pull_request: { ...pr, user: { login: 'constructor', type: 'User' } },
      review: {
        state: 'approved',
        user: { login: 'chungyo' },
        html_url: 'https://github.com/review',
      },
    },
    'pull_request_review',
  )
  await notifySlack({ ...h.args, mode: 'pr' })
  assert.equal(h.sent.length, 1)
  assert.match(h.sent[0].text, /작성자: constructor\n/)
  assert.doesNotMatch(h.sent[0].text, /<@/)
})

test('failed CI notifies once with failed jobs; success and cancellation are skipped', async () => {
  for (const conclusion of ['failure', 'success', 'cancelled', 'skipped']) {
    const h = harness(
      {
        workflow_run: {
          id: 9,
          name: 'CI',
          event: 'pull_request',
          conclusion,
          pull_requests: [{ number: 213 }],
          html_url: 'https://github.com/run',
        },
      },
      'workflow_run',
    )
    await notifySlack({ ...h.args, mode: 'ci' })
    assert.equal(h.sent.length, conclusion === 'failure' ? 1 : 0)
    if (h.sent.length) {
      assert.match(h.sent[0].text, /Tests/)
      assert.match(h.sent[0].text, /<@U0BUMN7L1L7>/)
    }
  }
})

test('push CI uses triggering actor, not commit author, and ignores other branches', async () => {
  for (const branch of ['develop', 'main', 'feature']) {
    const h = harness(
      {
        workflow_run: {
          id: 9,
          name: 'CI',
          event: 'push',
          conclusion: 'failure',
          head_branch: branch,
          head_sha: 'abc123',
          triggering_actor: { login: 'yurimidaH' },
          html_url: 'https://github.com/run',
        },
      },
      'workflow_run',
    )
    await notifySlack({ ...h.args, mode: 'ci' })
    assert.equal(h.sent.length, branch === 'feature' ? 0 : 1)
    if (h.sent.length) assert.match(h.sent[0].text, /<@U0C0HEK3R88>/)
  }
})

test('CI with missing PR references resolves only matching open head commits', async () => {
  const h = harness(
    {
      workflow_run: {
        id: 9,
        name: 'CI',
        event: 'pull_request',
        conclusion: 'failure',
        pull_requests: [],
        head_sha: 'head123',
        html_url: 'https://github.com/run',
      },
    },
    'workflow_run',
  )
  h.args.github.rest.repos = {
    listPullRequestsAssociatedWithCommit: async () => ({
      data: [
        { ...pr, state: 'closed', head: { sha: 'head123' } },
        { ...pr, number: 214, state: 'open', head: { sha: 'different' } },
        { ...pr, state: 'open', head: { sha: 'head123' } },
      ],
    }),
  }
  await notifySlack({ ...h.args, mode: 'ci' })
  assert.equal(h.sent.length, 1)
  assert.match(h.sent[0].text, /pull\/213/)
})

test('deployment failure mentions actor; success includes URL; cancellation is skipped', async () => {
  for (const result of ['failure', 'success', 'cancelled']) {
    const h = harness({})
    await notifySlack({
      ...h.args,
      mode: 'deploy',
      deployment: {
        service: 'Admin',
        result,
        url: 'https://admin.example.com',
      },
    })
    assert.equal(h.sent.length, result === 'cancelled' ? 0 : 1)
    if (result === 'failure') assert.match(h.sent[0].text, /<@U0BUMN7L1L7>/)
    if (result === 'success')
      assert.match(h.sent[0].text, /https:\/\/admin.example.com/)
  }
})

test('failures expose safe stage diagnostics without leaking secrets or retrying', async () => {
  for (const [failure, diagnostic] of [
    ['github', /GitHub message lookup/],
    ['missing', /webhook configuration: missing secret/],
    ['invalid', /webhook configuration: invalid URL/],
    ['http', /Slack HTTP response: HTTP 403/],
    ['body', /Slack response body: unexpected response/],
    ['network', /Slack request: network error/],
    ['timeout', /Slack request: timed out/],
  ]) {
    const h = harness({ action: 'opened', pull_request: pr })
    let calls = 0
    h.args.webhookUrl =
      failure === 'missing'
        ? ''
        : failure === 'invalid'
          ? 'https://evil.example.com'
          : h.args.webhookUrl
    h.args.fetchImpl = async () => {
      calls++
      if (failure === 'network') throw new Error(h.args.webhookUrl)
      if (failure === 'timeout') {
        const error = new Error(h.args.webhookUrl)
        error.name = 'TimeoutError'
        throw error
      }
      if (failure === 'body')
        return { ok: true, text: async () => h.args.webhookUrl }
      return { ok: false, status: 403 }
    }
    if (failure === 'github')
      h.args.github.rest.pulls.get = async () => {
        throw new Error(h.args.webhookUrl)
      }
    await notifySlack({ ...h.args, mode: 'created' })
    assert.equal(
      calls,
      ['github', 'missing', 'invalid'].includes(failure) ? 0 : 1,
    )
    assert.equal(h.warnings.length, 1)
    assert.ok(h.warnings.every((value) => !value.includes('https://')))
    assert.match(h.warnings[0], diagnostic)
  }
})
