#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const localEnvPath = resolve(appRoot, '.env.openapi.local')
const cliArgs = process.argv.slice(2)
const args = new Map()

for (let index = 0; index < cliArgs.length; index += 2) {
  const key = cliArgs[index]
  const value = cliArgs[index + 1]

  if (!key?.startsWith('--') || !value) {
    console.error('인자는 --key value 형식이어야 합니다.')
    process.exit(1)
  }

  args.set(key, value)
}

const schemaEnvName = args.get('--schema-env') ?? 'OPENAPI_SCHEMA_URL'
const outputPath = args.get('--output') ?? 'src/shared/api/generated/openapi.ts'

function stripOptionalQuotes(value) {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

function readSchemaUrlFromLocalEnv(envName) {
  if (!existsSync(localEnvPath)) {
    return undefined
  }

  const lines = readFileSync(localEnvPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = new RegExp(`^${envName}\\s*=\\s*(.*)$`).exec(trimmed)

    if (match) {
      return stripOptionalQuotes(match[1])
    }
  }

  return undefined
}

const schemaUrl =
  process.env[schemaEnvName] || readSchemaUrlFromLocalEnv(schemaEnvName)

if (!schemaUrl) {
  console.error(`${schemaEnvName}이 필요합니다.

실제 dev/staging schema URL은 repository에 커밋하지 않습니다.

일회성 실행:
  ${schemaEnvName}=<raw-openapi-schema-url> pnpm --filter @hashi/admin gen:all-api-types

로컬 파일 사용:
  apps/admin/.env.openapi.local 파일에 아래 값을 추가하세요.
  ${schemaEnvName}=<raw-openapi-schema-url>

주의:
  Swagger UI HTML이 아니라 raw OpenAPI JSON/YAML URL을 넣어야 합니다.`)
  process.exit(1)
}

const isRemoteSchema = /^https?:\/\//.test(schemaUrl)
let schemaInput = schemaUrl
let tempDir
let exitCode = 1

try {
  if (isRemoteSchema) {
    tempDir = mkdtempSync(resolve(tmpdir(), 'hashi-admin-openapi-'))
    schemaInput = resolve(tempDir, 'schema.json')

    const response = await fetch(schemaUrl, {
      headers: {
        accept: 'application/json, application/yaml, text/yaml, */*',
      },
    })

    if (!response.ok) {
      console.error(
        `OpenAPI schema 요청에 실패했습니다. status=${response.status}`,
      )
    } else {
      writeFileSync(schemaInput, await response.text())
    }
  }

  if (!isRemoteSchema || existsSync(schemaInput)) {
    if (args.get('--scope') === 'notices') {
      const admin = JSON.parse(readFileSync(schemaInput, 'utf8'))
      const userSchemaUrl =
        process.env.USER_OPENAPI_SCHEMA_URL ||
        readSchemaUrlFromLocalEnv('USER_OPENAPI_SCHEMA_URL')
      if (!userSchemaUrl)
        throw new Error('USER_OPENAPI_SCHEMA_URL이 필요합니다.')
      const userResponse = await fetch(userSchemaUrl)
      if (!userResponse.ok)
        throw new Error(`User schema 요청 실패: ${userResponse.status}`)
      const user = await userResponse.json()
      const paths = Object.fromEntries([
        ...Object.entries(admin.paths).filter(([path]) =>
          path.startsWith('/api/v1/admin/notices'),
        ),
        ...Object.entries(user.paths).filter(([path]) =>
          ['/api/v1/media/assets', '/api/v1/media/assets/complete'].includes(
            path,
          ),
        ),
      ])
      const available = {
        ...user.components.schemas,
        ...admin.components.schemas,
      }
      const schemas = {}
      const includeReferences = (value) => {
        if (!value || typeof value !== 'object') return
        if (value.$ref?.startsWith('#/components/schemas/')) {
          const name = value.$ref.split('/').at(-1)
          if (!(name in schemas)) {
            if (!available[name]) throw new Error(`Schema가 없습니다: ${name}`)
            schemas[name] = available[name]
            includeReferences(available[name])
          }
        }
        Object.values(value).forEach(includeReferences)
      }
      includeReferences(paths)
      tempDir ??= mkdtempSync(resolve(tmpdir(), 'hashi-admin-openapi-'))
      schemaInput = resolve(tempDir, 'notice-schema.json')
      writeFileSync(
        schemaInput,
        JSON.stringify({
          openapi: admin.openapi,
          info: admin.info,
          paths,
          components: {
            schemas,
            securitySchemes: admin.components.securitySchemes,
          },
        }),
      )
    }
    const result = spawnSync(
      'openapi-typescript',
      [schemaInput, '-o', outputPath],
      {
        cwd: appRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      },
    )

    exitCode = result.status ?? 1

    if (exitCode === 0) {
      const formatResult = spawnSync('prettier', ['--write', outputPath], {
        cwd: appRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      })

      exitCode = formatResult.status ?? 1
    }
  }
} finally {
  if (tempDir) {
    rmSync(tempDir, { force: true, recursive: true })
  }
}

process.exitCode = exitCode
