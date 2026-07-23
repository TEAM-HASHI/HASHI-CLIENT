const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  validateLighthouseReport,
  validateLighthouseReports,
  validatePreviewUrl,
} = require('./lighthouse-preview-validation.cjs')

const PREVIEW_URL = 'https://hashi-client-git-example.vercel.app/'

function createReport(overrides = {}) {
  return {
    audits: {
      'errors-in-console': {
        details: { items: [] },
      },
      'network-requests': {
        details: {
          items: [
            {
              statusCode: 200,
              url: 'https://dev-api.hashi.kr/api/v1/magazines/banners',
            },
            {
              statusCode: 200,
              url: 'https://dev-api.hashi.kr/api/v1/restaurants?size=5&type=sns-hot',
            },
          ],
        },
      },
    },
    finalUrl: PREVIEW_URL,
    ...overrides,
  }
}

test('validatePreviewUrl accepts an HTTP(S) absolute URL', () => {
  assert.equal(validatePreviewUrl(PREVIEW_URL).toString(), PREVIEW_URL)
  assert.throws(() => validatePreviewUrl(''), /Preview URL/)
  assert.throws(() => validatePreviewUrl('ftp://example.com'), /HTTP\(S\)/)
})

test('validateLighthouseReport accepts the deployed preview and required home APIs', () => {
  assert.deepEqual(
    validateLighthouseReport({
      previewUrl: PREVIEW_URL,
      report: createReport(),
      source: 'run-1.json',
    }),
    { requiredApiCount: 2, source: 'run-1.json' },
  )
})

test('validateLighthouseReport rejects a report collected from another URL', () => {
  assert.throws(
    () =>
      validateLighthouseReport({
        previewUrl: PREVIEW_URL,
        report: createReport({ finalUrl: 'https://example.com/' }),
        source: 'run-1.json',
      }),
    /Preview URL과 일치하지 않습니다/,
  )
})

test('validateLighthouseReport rejects a Lighthouse runtime error', () => {
  assert.throws(
    () =>
      validateLighthouseReport({
        previewUrl: PREVIEW_URL,
        report: createReport({
          runtimeError: { code: 'ERRORED_DOCUMENT_REQUEST', message: 'failed' },
        }),
        source: 'run-1.json',
      }),
    /runtime error.*ERRORED_DOCUMENT_REQUEST/i,
  )
})

test('validateLighthouseReport rejects browser CORS errors', () => {
  const report = createReport()
  report.audits['errors-in-console'].details.items.push({
    description:
      "Access to fetch at 'https://dev-api.hashi.kr/api/v1/magazines/banners' from origin 'https://hashi-client-git-example.vercel.app' has been blocked by CORS policy",
  })

  assert.throws(
    () =>
      validateLighthouseReport({
        previewUrl: PREVIEW_URL,
        report,
        source: 'run-1.json',
      }),
    /CORS/i,
  )
})

test('validateLighthouseReport rejects a missing required home API', () => {
  const report = createReport()
  report.audits['network-requests'].details.items.pop()

  assert.throws(
    () =>
      validateLighthouseReport({
        previewUrl: PREVIEW_URL,
        report,
        source: 'run-1.json',
      }),
    /restaurants.*요청을 찾지 못했습니다/,
  )
})

test('validateLighthouseReport rejects a non-2xx required home API', () => {
  const report = createReport()
  report.audits['network-requests'].details.items[0].statusCode = 503

  assert.throws(
    () =>
      validateLighthouseReport({
        previewUrl: PREVIEW_URL,
        report,
        source: 'run-1.json',
      }),
    /magazines\/banners.*HTTP 503/,
  )
})

test('validateLighthouseReports validates every collected LHR file', (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'hashi-lighthouse-preview-'),
  )
  t.after(() => fs.rmSync(directory, { force: true, recursive: true }))

  fs.writeFileSync(
    path.join(directory, 'lhr-1.json'),
    JSON.stringify(createReport()),
  )
  fs.writeFileSync(
    path.join(directory, 'lhr-2.json'),
    JSON.stringify(createReport()),
  )

  assert.deepEqual(
    validateLighthouseReports({ directory, previewUrl: PREVIEW_URL }),
    {
      reportCount: 2,
      requiredApiCount: 4,
    },
  )
})

test('validateLighthouseReports rejects an empty collection directory', (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'hashi-lighthouse-preview-empty-'),
  )
  t.after(() => fs.rmSync(directory, { force: true, recursive: true }))

  assert.throws(
    () => validateLighthouseReports({ directory, previewUrl: PREVIEW_URL }),
    /Lighthouse JSON.*찾지 못했습니다/,
  )
})
