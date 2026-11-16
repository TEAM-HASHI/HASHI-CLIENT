const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  chmodSync,
  rmSync,
} = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { parse } = require('yaml')

const workflow = parse(
  readFileSync(path.join(__dirname, '../workflows/vercel-preview.yml'), 'utf8'),
)
const steps = workflow.jobs['deploy-preview'].steps

function runStep(name, overrides = {}) {
  const directory = mkdtempSync(path.join(tmpdir(), 'hashi-preview-test-'))
  try {
    const output = path.join(directory, 'output')
    const log = path.join(directory, 'log')
    writeFileSync(output, '')
    writeFileSync(log, '')
    // Vercel is the external boundary. Run the real workflow shell unchanged.
    const executable = path.join(directory, 'pnpm')
    writeFileSync(
      executable,
      `#!${process.execPath}
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_LOG, JSON.stringify({ args, redirect: process.env.VITE_KAKAO_REDIRECT_URI }) + '\\n');
if (args.includes('deploy')) {
  if (process.env.FAIL_DEPLOY) process.exit(1);
  console.log('https://hashi-client-abc123-gyeongbinmins-projects.vercel.app');
}
if (args.includes('alias') && process.env.FAIL_ALIAS) process.exit(1);
`,
    )
    chmodSync(executable, 0o755)
    const step = steps.find((item) => item.name === name)
    assert.ok(step, `Missing workflow step: ${name}`)
    const script = step.run.replaceAll(
      '${{ secrets.VERCEL_TOKEN }}',
      'test-token',
    )
    const result = spawnSync(
      'bash',
      ['--noprofile', '--norc', '-e', '-o', 'pipefail', '-c', script],
      {
        cwd: directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          ...workflow.env,
          ...workflow.jobs['deploy-preview'].env,
          ...step.env,
          PATH: `${directory}${path.delimiter}${process.env.PATH}`,
          GITHUB_OUTPUT: output,
          TEST_LOG: log,
          ...overrides,
        },
      },
    )
    return {
      ...result,
      output: readFileSync(output, 'utf8'),
      calls: readFileSync(log, 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(JSON.parse),
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('preview build uses the fixed callback rather than a changing deployment origin', () => {
  const result = runStep('Build Vercel Output')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(
    result.calls[0].redirect,
    'https://hashi-client-qa-gyeongbinmins-projects.vercel.app/oauth/callback/kakao',
  )
})

test('publishes a shared alias while retaining the immutable URL for Lighthouse', () => {
  const result = runStep('Deploy Preview')
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(
    result.calls.map(({ args }) => args.slice(0, 3)),
    [
      ['exec', 'vercel', 'deploy'],
      ['exec', 'vercel', 'alias'],
    ],
  )
  assert.ok(
    result.calls[1].args.includes(
      'https://hashi-client-abc123-gyeongbinmins-projects.vercel.app',
    ),
  )
  assert.ok(
    result.calls[1].args.includes(
      'hashi-client-qa-gyeongbinmins-projects.vercel.app',
    ),
  )
  assert.equal(
    result.output,
    'url=https://hashi-client-abc123-gyeongbinmins-projects.vercel.app\npreview_url=https://hashi-client-qa-gyeongbinmins-projects.vercel.app\n',
  )
})

test('failed deployment never updates the shared alias or publishes success outputs', () => {
  const result = runStep('Deploy Preview', { FAIL_DEPLOY: '1' })
  assert.notEqual(result.status, 0)
  assert.equal(result.calls.length, 1)
  assert.equal(result.output, '')
})

test('failed alias assignment fails the deployment step without advertising success', () => {
  const result = runStep('Deploy Preview', { FAIL_ALIAS: '1' })
  assert.notEqual(result.status, 0)
  assert.equal(result.calls.length, 2)
  assert.equal(result.output, '')
})
