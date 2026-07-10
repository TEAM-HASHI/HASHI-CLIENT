import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const appRoot = resolve(import.meta.dirname, '..')
const outputPath = 'src/shared/api/generated/openapi.ts'

function readLocalEnvSchemaUrl() {
  const envPath = join(appRoot, '.env.openapi.local')

  try {
    const envText = readFileSync(envPath, 'utf8')
    const line = envText
      .split('\n')
      .map((value) => value.trim())
      .find((value) => value.startsWith('OPENAPI_SCHEMA_URL='))

    if (!line) {
      return undefined
    }

    return line
      .slice('OPENAPI_SCHEMA_URL='.length)
      .trim()
      .replace(/^['"]|['"]$/g, '')
  } catch {
    return undefined
  }
}

function resolveSchemaUrl() {
  return process.env.OPENAPI_SCHEMA_URL?.trim() || readLocalEnvSchemaUrl()
}

function printMissingSchemaUrlGuide() {
  console.error(
    [
      'OpenAPI schema URL이 설정되지 않았습니다.',
      '',
      '다음 중 하나로 raw OpenAPI JSON/YAML URL을 설정하세요.',
      '- OPENAPI_SCHEMA_URL=<schema-url> pnpm gen:api-types',
      '- apps/client/.env.openapi.local 파일에 OPENAPI_SCHEMA_URL=<schema-url> 작성',
      '',
      'Swagger UI HTML URL이 아니라 /v3/api-docs 같은 raw schema URL이어야 합니다.',
    ].join('\n'),
  )
}

async function prepareSchemaInput(schemaUrl) {
  if (!/^https?:\/\//.test(schemaUrl)) {
    return { input: schemaUrl, cleanup: () => {} }
  }

  const response = await fetch(schemaUrl)

  if (!response.ok) {
    throw new Error(
      `OpenAPI schema 요청 실패: ${response.status} ${response.statusText}`,
    )
  }

  const tempDir = mkdtempSync(join(tmpdir(), 'hashi-openapi-'))
  const schemaPath = join(tempDir, 'schema.json')
  const schemaText = await response.text()

  writeFileSync(schemaPath, schemaText)

  return {
    input: schemaPath,
    cleanup: () => rmSync(tempDir, { force: true, recursive: true }),
  }
}

const schemaUrl = resolveSchemaUrl()

if (!schemaUrl) {
  printMissingSchemaUrlGuide()
  process.exit(1)
}

const { input, cleanup } = await prepareSchemaInput(schemaUrl)

try {
  const result = spawnSync('openapi-typescript', [input, '-o', outputPath], {
    cwd: appRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.error) {
    throw result.error
  }

  process.exit(result.status ?? 1)
} finally {
  cleanup()
}
