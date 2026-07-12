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
const outputPath = 'src/shared/api/generated/openapi.ts'

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

function readSchemaUrlFromLocalEnv() {
  if (!existsSync(localEnvPath)) {
    return undefined
  }

  const lines = readFileSync(localEnvPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = /^OPENAPI_SCHEMA_URL\s*=\s*(.*)$/.exec(trimmed)

    if (match) {
      return stripOptionalQuotes(match[1])
    }
  }

  return undefined
}

const schemaUrl = process.env.OPENAPI_SCHEMA_URL || readSchemaUrlFromLocalEnv()

if (!schemaUrl) {
  console.error(`OPENAPI_SCHEMA_URL이 필요합니다.

실제 dev/staging schema URL은 repository에 커밋하지 않습니다.

일회성 실행:
  OPENAPI_SCHEMA_URL=<raw-openapi-schema-url> pnpm gen:api-types

로컬 파일 사용:
  apps/client/.env.openapi.local 파일에 아래 값을 추가하세요.
  OPENAPI_SCHEMA_URL=<raw-openapi-schema-url>

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
    tempDir = mkdtempSync(resolve(tmpdir(), 'hashi-openapi-'))
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
  }
} finally {
  if (tempDir) {
    rmSync(tempDir, { force: true, recursive: true })
  }
}

process.exitCode = exitCode
