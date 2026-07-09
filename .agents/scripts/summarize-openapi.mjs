#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parse as parseYaml } from 'yaml'

const HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
])

const usage = () => {
  console.error(
    'Usage: node .agents/scripts/summarize-openapi.mjs <path-or-url>',
  )
}

const isUrl = (value) => /^https?:\/\//.test(value)

const readInput = async (input) => {
  if (isUrl(input)) {
    const response = await fetch(input)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${input}: HTTP ${response.status}`)
    }

    return response.text()
  }

  return fs.readFile(path.resolve(input), 'utf8')
}

const parseSpec = (source) => {
  try {
    return JSON.parse(source)
  } catch {
    return parseYaml(source)
  }
}

const ensureObject = (value, label) => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }

  return value
}

const refName = (ref) => ref.split('/').at(-1) ?? ref

const firstContentSchema = (content) => {
  if (!content || typeof content !== 'object') {
    return undefined
  }

  const preferred =
    content['application/json'] ??
    content['application/*+json'] ??
    Object.values(content)[0]

  return preferred?.schema
}

const schemaSummary = (schema) => {
  if (!schema) {
    return '-'
  }

  if (schema.$ref) {
    return refName(schema.$ref)
  }

  if (schema.oneOf) {
    return `oneOf(${schema.oneOf.map(schemaSummary).join(' | ')})`
  }

  if (schema.anyOf) {
    return `anyOf(${schema.anyOf.map(schemaSummary).join(' | ')})`
  }

  if (schema.allOf) {
    return `allOf(${schema.allOf.map(schemaSummary).join(' + ')})`
  }

  if (schema.type === 'array') {
    return `${schemaSummary(schema.items)}[]`
  }

  if (schema.type === 'object' || schema.properties) {
    const properties = Object.keys(schema.properties ?? {})
    if (properties.length === 0) {
      return 'object'
    }

    return `object{${properties.slice(0, 8).join(', ')}${properties.length > 8 ? ', ...' : ''}}`
  }

  return schema.format
    ? `${schema.type ?? 'unknown'}:${schema.format}`
    : (schema.type ?? 'unknown')
}

const parameterSummary = (parameters = []) => {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return '-'
  }

  return parameters
    .map((parameter) => {
      if (parameter.$ref) {
        return refName(parameter.$ref)
      }

      const required = parameter.required ? 'required' : 'optional'
      const type = schemaSummary(parameter.schema)
      return `${parameter.in}.${parameter.name}:${type}:${required}`
    })
    .join('<br>')
}

const requestSummary = (operation) => {
  const requestBody = operation.requestBody

  if (!requestBody) {
    return '-'
  }

  if (requestBody.$ref) {
    return refName(requestBody.$ref)
  }

  return schemaSummary(firstContentSchema(requestBody.content))
}

const responseSummary = (operation) => {
  const responses = operation.responses

  if (!responses || typeof responses !== 'object') {
    return '-'
  }

  return Object.entries(responses)
    .filter(
      ([status]) =>
        status.startsWith('2') ||
        status.startsWith('4') ||
        status === 'default',
    )
    .map(([status, response]) => {
      if (response.$ref) {
        return `${status}: ${refName(response.$ref)}`
      }

      return `${status}: ${schemaSummary(firstContentSchema(response.content))}`
    })
    .join('<br>')
}

const operationRows = (spec) => {
  const paths = ensureObject(spec.paths, 'OpenAPI paths')

  return Object.entries(paths).flatMap(([apiPath, pathItem]) => {
    if (!pathItem || typeof pathItem !== 'object') {
      return []
    }

    const sharedParameters = Array.isArray(pathItem.parameters)
      ? pathItem.parameters
      : []

    return Object.entries(pathItem)
      .filter(([method]) => HTTP_METHODS.has(method))
      .map(([method, operation]) => {
        const operationObject = ensureObject(
          operation,
          `${method.toUpperCase()} ${apiPath}`,
        )
        const parameters = [
          ...sharedParameters,
          ...(Array.isArray(operationObject.parameters)
            ? operationObject.parameters
            : []),
        ]

        return {
          method: method.toUpperCase(),
          path: apiPath,
          operationId: operationObject.operationId ?? '-',
          tags: Array.isArray(operationObject.tags)
            ? operationObject.tags.join(', ')
            : '-',
          parameters: parameterSummary(parameters),
          request: requestSummary(operationObject),
          response: responseSummary(operationObject),
        }
      })
  })
}

const schemaRows = (spec) => {
  const schemas = spec.components?.schemas

  if (!schemas || typeof schemas !== 'object') {
    return []
  }

  return Object.entries(schemas).map(([name, schema]) => ({
    name,
    summary: schemaSummary(schema),
  }))
}

const printMarkdown = (spec, sourceLabel) => {
  const title = spec.info?.title ?? 'OpenAPI Spec'
  const version = spec.info?.version ?? '-'
  const rows = operationRows(spec)
  const schemas = schemaRows(spec)

  console.log(`# ${title}`)
  console.log('')
  console.log(`- Source: ${sourceLabel}`)
  console.log(`- Version: ${version}`)
  console.log(`- Operations: ${rows.length}`)
  console.log('')
  console.log('## Operations')
  console.log('')
  console.log(
    '| Method | Path | Operation | Tags | Params | Request | Responses |',
  )
  console.log('| --- | --- | --- | --- | --- | --- | --- |')

  for (const row of rows) {
    console.log(
      `| ${row.method} | \`${row.path}\` | \`${row.operationId}\` | ${row.tags} | ${row.parameters} | ${row.request} | ${row.response} |`,
    )
  }

  if (schemas.length > 0) {
    console.log('')
    console.log('## Schemas')
    console.log('')
    console.log('| Schema | Shape |')
    console.log('| --- | --- |')

    for (const schema of schemas) {
      console.log(`| \`${schema.name}\` | ${schema.summary} |`)
    }
  }
}

const main = async () => {
  const input = process.argv[2]

  if (!input) {
    usage()
    process.exitCode = 1
    return
  }

  const source = await readInput(input)
  const spec = ensureObject(parseSpec(source), 'OpenAPI document')

  if (!spec.openapi && !spec.swagger) {
    throw new Error('Input does not look like an OpenAPI/Swagger document')
  }

  printMarkdown(spec, input)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
