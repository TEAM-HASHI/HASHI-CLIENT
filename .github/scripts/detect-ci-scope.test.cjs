const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const SCRIPT_PATH = path.join(__dirname, 'detect-ci-scope.sh')

const writeFile = (root, filePath, content) => {
  const absolutePath = path.join(root, filePath)

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  fs.writeFileSync(absolutePath, content)
}

const runGit = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()

const createDiff = (changedPath) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'hashi-ci-scope-'))

  runGit(cwd, 'init', '--quiet')
  runGit(cwd, 'config', 'user.email', 'ci-scope@example.com')
  runGit(cwd, 'config', 'user.name', 'CI Scope Test')
  writeFile(cwd, 'README.md', 'initial\n')
  runGit(cwd, 'add', '.')
  runGit(cwd, 'commit', '--quiet', '-m', 'initial')

  const base = runGit(cwd, 'rev-parse', 'HEAD')

  writeFile(cwd, changedPath, 'changed\n')
  runGit(cwd, 'add', '.')
  runGit(cwd, 'commit', '--quiet', '-m', 'change')

  return {
    base,
    cwd,
    head: runGit(cwd, 'rev-parse', 'HEAD'),
  }
}

const detectScope = ({ base, cwd, head }) => {
  const output = execFileSync('bash', [SCRIPT_PATH, base, head], {
    cwd,
    encoding: 'utf8',
  })

  return Object.fromEntries(
    output
      .trimEnd()
      .split('\n')
      .map((line) => {
        const separatorIndex = line.indexOf('=')

        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)]
      }),
  )
}

test('uses affected quality checks and skips tests for documentation-only changes', (t) => {
  const diff = createDiff('docs/workflows/example.md')
  t.after(() => fs.rmSync(diff.cwd, { force: true, recursive: true }))

  assert.deepEqual(detectScope(diff), {
    turbo_args: '--affected',
    run_tests: 'false',
  })
})

test('runs affected quality checks and tests for client changes', (t) => {
  const diff = createDiff('apps/client/src/example.ts')
  t.after(() => fs.rmSync(diff.cwd, { force: true, recursive: true }))

  assert.deepEqual(detectScope(diff), {
    turbo_args: '--affected',
    run_tests: 'true',
  })
})

test('uses affected quality checks and skips client tests for admin-only changes', (t) => {
  const diff = createDiff('apps/admin/src/example.ts')
  t.after(() => fs.rmSync(diff.cwd, { force: true, recursive: true }))

  assert.deepEqual(detectScope(diff), {
    turbo_args: '--affected',
    run_tests: 'false',
  })
})

test('falls back to all quality checks and tests for shared configuration changes', (t) => {
  const diff = createDiff('package.json')
  t.after(() => fs.rmSync(diff.cwd, { force: true, recursive: true }))

  assert.deepEqual(detectScope(diff), {
    turbo_args: '',
    run_tests: 'true',
  })
})

test('falls back to all quality checks and tests when a comparison commit is missing', (t) => {
  const diff = createDiff('docs/workflows/example.md')
  t.after(() => fs.rmSync(diff.cwd, { force: true, recursive: true }))

  assert.deepEqual(
    detectScope({ ...diff, base: '0000000000000000000000000000000000000000' }),
    {
      turbo_args: '',
      run_tests: 'true',
    },
  )
})
