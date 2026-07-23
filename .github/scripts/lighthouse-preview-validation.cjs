const fs = require('node:fs')
const path = require('node:path')

// Lighthouse가 홈(`/`)의 실제 화면을 측정했는지 검증하는 현재 필수 데이터 요청입니다.
// 홈 API 의존성이 바뀌면 이 목록과 관련 테스트를 함께 갱신합니다.
const REQUIRED_HOME_APIS = [
  {
    label: '/api/v1/magazines/banners',
    matches: (url) => url.pathname === '/api/v1/magazines/banners',
  },
  {
    label: '/api/v1/restaurants?type=sns-hot&size=5',
    matches: (url) =>
      url.pathname === '/api/v1/restaurants' &&
      url.searchParams.get('type') === 'sns-hot' &&
      url.searchParams.get('size') === '5',
  },
]

function validatePreviewUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Lighthouse Preview validation: Preview URL이 필요합니다.')
  }

  let url

  try {
    url = new URL(value.trim())
  } catch {
    throw new Error(
      'Lighthouse Preview validation: Preview URL은 유효한 HTTP(S) 절대 URL이어야 합니다.',
    )
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(
      'Lighthouse Preview validation: Preview URL은 유효한 HTTP(S) 절대 URL이어야 합니다.',
    )
  }

  return url
}

function createComparableUrl(url) {
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  return `${url.origin}${pathname}${url.search}`
}

function getAuditItems(report, auditId) {
  const items = report?.audits?.[auditId]?.details?.items

  return Array.isArray(items) ? items : []
}

function validateLighthouseReport({ previewUrl, report, source = 'LHR' }) {
  const expectedUrl = validatePreviewUrl(previewUrl)
  const finalUrl = validatePreviewUrl(report?.finalUrl)

  if (createComparableUrl(finalUrl) !== createComparableUrl(expectedUrl)) {
    throw new Error(
      `Lighthouse Preview validation (${source}): 측정 URL이 Preview URL과 일치하지 않습니다.`,
    )
  }

  if (report.runtimeError) {
    const runtimeCode = report.runtimeError.code || 'UNKNOWN'
    throw new Error(
      `Lighthouse Preview validation (${source}): Lighthouse runtime error (${runtimeCode})가 발생했습니다.`,
    )
  }

  const consoleItems = getAuditItems(report, 'errors-in-console')
  const corsError = consoleItems.find((item) =>
    /\bCORS\b|Cross-Origin Request Blocked|Access-Control-Allow-Origin/i.test(
      item?.description || '',
    ),
  )

  if (corsError) {
    throw new Error(
      `Lighthouse Preview validation (${source}): 브라우저 CORS 오류가 감지되었습니다.`,
    )
  }

  const networkItems = getAuditItems(report, 'network-requests')

  for (const requiredApi of REQUIRED_HOME_APIS) {
    const matchingRequests = networkItems.filter((item) => {
      try {
        return requiredApi.matches(new URL(item.url))
      } catch {
        return false
      }
    })

    if (matchingRequests.length === 0) {
      throw new Error(
        `Lighthouse Preview validation (${source}): ${requiredApi.label} 요청을 찾지 못했습니다.`,
      )
    }

    const succeeded = matchingRequests.some(
      (item) => item.statusCode >= 200 && item.statusCode < 300,
    )

    if (!succeeded) {
      const statuses = [
        ...new Set(
          matchingRequests.map((item) => item.statusCode ?? 'unknown'),
        ),
      ].join(', ')
      throw new Error(
        `Lighthouse Preview validation (${source}): ${requiredApi.label} 요청이 HTTP ${statuses} 응답으로 실패했습니다.`,
      )
    }
  }

  return { requiredApiCount: REQUIRED_HOME_APIS.length, source }
}

function validateLighthouseReports({
  directory = '.lighthouseci',
  previewUrl,
}) {
  const reportPaths = fs
    .readdirSync(directory)
    .filter((fileName) => /^lhr-\d+\.json$/.test(fileName))
    .sort()
    .map((fileName) => path.join(directory, fileName))

  if (reportPaths.length === 0) {
    throw new Error(
      'Lighthouse Preview validation: 수집된 Lighthouse JSON 파일을 찾지 못했습니다.',
    )
  }

  const results = reportPaths.map((reportPath) =>
    validateLighthouseReport({
      previewUrl,
      report: JSON.parse(fs.readFileSync(reportPath, 'utf8')),
      source: path.basename(reportPath),
    }),
  )

  return {
    reportCount: results.length,
    requiredApiCount: results.reduce(
      (total, result) => total + result.requiredApiCount,
      0,
    ),
  }
}

if (require.main === module) {
  try {
    const result = validateLighthouseReports({ previewUrl: process.argv[2] })
    console.log(
      `Lighthouse Preview validation passed (${result.reportCount} runs, ${result.requiredApiCount} required API checks).`,
    )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {
  validateLighthouseReport,
  validateLighthouseReports,
  validatePreviewUrl,
}
