# Lighthouse PR Comment Vertical Layout Design

## Context

현재 Lighthouse PR 코멘트는 category 점수 표와 핵심 성능 지표 표를 별도로 표시한다. Category 표는 세 열로 좁고 성능 지표 표는 여섯 열로 넓어, 두 표 사이의 폭과 시각적 무게가 맞지 않는다. 섹션 제목 없이 표가 연속되어 같은 결과가 임의로 나뉜 것처럼 보이는 문제도 있다.

GitHub PR 코멘트는 사용자 정의 CSS를 지원하지 않으므로 Markdown 자체의 구조와 정렬만으로 균형을 개선해야 한다. 비교한 세 가지 시안 중 단일 세로 요약표인 C안을 최종 선택한다.

## Goal

- 모든 Lighthouse 결과를 폭이 일정한 단일 표에서 읽게 한다.
- category 점수, 핵심 성능 지표, resource 크기의 성격을 `영역` 열로 구분한다.
- 긴 가로 표와 서로 다른 폭의 복수 표를 제거한다.
- 개선점은 표 아래의 순서가 있는 우선순위 목록으로 표시한다.

## Comment Structure

PR 코멘트는 다음 구조를 사용한다.

```md
<!-- lighthouse-ci-report -->

## 🔦 Lighthouse 결과

| 영역     | 항목                           |            결과 |
| :------- | :----------------------------- | --------------: |
| Score    | Performance                    |       🟡 **89** |
| Score    | Accessibility                  |       🟡 **88** |
| Score    | Best Practices                 |       🟢 **96** |
| Score    | SEO                            |       🟢 **91** |
| Metric   | First Contentful Paint (FCP)   |        `2284ms` |
| Metric   | Largest Contentful Paint (LCP) |        `3364ms` |
| Metric   | Cumulative Layout Shift (CLS)  |         `0.000` |
| Metric   | Total Blocking Time (TBT)      |          `10ms` |
| Resource | Script / Image                 | `201KB` / `0KB` |

### 💡 개선 우선순위

1. Reduce unused JavaScript — 약 450ms, 76KB 절감 가능
2. Largest Contentful Paint element
3. Render blocking requests
```

`영역`과 `항목`은 왼쪽 정렬하고 `결과`는 오른쪽 정렬한다. Score 결과는 상태 emoji와 굵은 점수를 함께 표시하고, Metric과 Resource 결과는 inline code로 표시해 숫자 단위를 빠르게 구분한다.

## Data Mapping

기존 대표 Lighthouse JSON과 formatter helper를 그대로 사용한다.

| 영역     | 항목                           | Source                                  |
| -------- | ------------------------------ | --------------------------------------- |
| Score    | Performance                    | `categories.performance.score`          |
| Score    | Accessibility                  | `categories.accessibility.score`        |
| Score    | Best Practices                 | `categories.best-practices.score`       |
| Score    | SEO                            | `categories.seo.score`                  |
| Metric   | First Contentful Paint (FCP)   | `first-contentful-paint.numericValue`   |
| Metric   | Largest Contentful Paint (LCP) | `largest-contentful-paint.numericValue` |
| Metric   | Cumulative Layout Shift (CLS)  | `cumulative-layout-shift.numericValue`  |
| Metric   | Total Blocking Time (TBT)      | `total-blocking-time.numericValue`      |
| Resource | Script / Image                 | `resource-summary` transfer sizes       |

값 정규화, 결측값의 `N/A`, category 상태 구간, 개선 audit 우선순위와 최대 3개 제한은 변경하지 않는다.

## Existing Behavior Preserved

- 모바일 Lighthouse 3회 측정과 대표 실행 선택
- Performance 80, 나머지 category 90 warning-only 기준
- HTML/JSON Artifact 업로드와 14일 보관
- sticky bot comment create/update
- fork PR comment skip과 `pull_request_target` 미사용
- manifest 또는 대표 결과 누락 시 warning 후 skip

## Testing

formatter 테스트는 다음을 검증한다.

- 하나의 `영역 | 항목 | 결과` 표만 생성한다.
- 네 category를 `Score` 행으로 표시하고 상태 emoji와 점수를 결합한다.
- FCP, LCP, CLS, TBT를 `Metric` 행으로 표시한다.
- Script와 Image를 하나의 `Resource` 행으로 표시한다.
- 기존의 `Category | Score | Status` 표와 가로 핵심 지표 표를 생성하지 않는다.
- 개선점을 `### 💡 개선 우선순위` 아래의 순서 있는 목록으로 표시한다.
- 개선 후보가 없을 때 기존 fallback 문구를 순서 있는 한 항목으로 표시한다.
- 기존 sticky comment lifecycle과 오류 처리 테스트를 유지한다.

## Documentation Impact

Lighthouse CI 설계 문서, 이전 summary 설계 문서, PR checklist의 두 표 설명을 단일 세로 요약표와 개선 우선순위 목록으로 갱신한다. Workflow, Artifact, API smoke check, warning 정책에는 변경이 없다.

## Acceptance Criteria

1. PR 코멘트 제목이 `## 🔦 Lighthouse 결과`로 표시된다.
2. category, metric, resource 결과가 하나의 세로 표에 표시된다.
3. 표는 `영역`, `항목`, `결과` 세 열만 사용한다.
4. 개선 audit 최대 3개가 순서 있는 목록으로 표시된다.
5. 기존 두 개의 결과 표는 더 이상 표시되지 않는다.
6. Artifact 업로드와 Lighthouse 측정 동작은 변경되지 않는다.
7. formatter 테스트와 전체 저장소 검증이 통과한다.
