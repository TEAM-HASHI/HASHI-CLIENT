// @vitest-environment node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

interface CiWorkflow {
  jobs?: {
    build?: {
      env?: Record<string, string>
    }
  }
}

describe('client SEO build environment', () => {
  it('injects the public API base URL into the generic CI build job', async () => {
    const workflow = parse(
      await readFile(
        resolve(process.cwd(), '../../.github/workflows/ci.yml'),
        'utf8',
      ),
    ) as CiWorkflow

    expect(workflow.jobs?.build?.env?.VITE_API_BASE_URL).toBe(
      '${{ vars.VITE_API_BASE_URL }}',
    )
  })
})
