# Lighthouse PR Comment Summary Design

## Context

현재 Lighthouse CI PR 코멘트는 대표 실행의 category 점수 표, Mermaid 막대그래프, GitHub Actions 실행 링크, 측정 시각을 표시한다. 점수 표와 그래프가 같은 정보를 반복하고, 상세 리포트 링크까지 함께 노출되어 PR에서 핵심 결과를 빠르게 훑기 어렵다.

상세 HTML/JSON 리포트는 문제 분석에 필요하므로 GitHub Actions Artifact와 14일 보관 정책은 유지한다. 이번 변경은 Artifact 생성이나 Lighthouse 측정 방식이 아니라 PR 코멘트의 정보 구조만 간소화한다.

## Goal

- PR 코멘트에서 category 결과와 핵심 성능 지표를 즉시 확인할 수 있게 한다.
- 대표 실행에서 개선 여지가 큰 Lighthouse audit을 최대 3개로 요약한다.
- 중복 시각화, 상세 리포트 링크, 실행 시각을 제거한다.
- 기존 sticky comment 갱신과 Artifact 보관 동작은 유지한다.

## Comment Structure

PR 코멘트는 다음 순서만 사용한다.

1. 숨김 marker `<!-- lighthouse-ci-report -->`
2. `## Lighthouse 결과` 제목
3. Category, Score, Status 열을 가진 category 결과 표
4. FCP, LCP, CLS, TBT, Script, Image 열을 가진 핵심 지표 표
5. `### 개선점 요약`과 최대 3개의 audit 권고

Mermaid 그래프, GitHub Actions 실행 링크, 대표 실행 시각은 표시하지 않는다. Category 점수는 category 결과 표에만 두어 핵심 지표 표와 중복하지 않는다.

## Data Extraction

### Category results

대표 Lighthouse JSON의 `performance`, `accessibility`, `best-practices`, `seo` 점수를 0~100 정수로 변환한다. 상태는 기존 Lighthouse 색상 구간을 유지한다.

- 90 이상: 🟢
- 70 이상 90 미만: 🟡
- 70 미만: 🔴

### Core metrics

대표 Lighthouse JSON의 audit에서 다음 값을 읽는다.

| Column | Lighthouse source                           |
| ------ | ------------------------------------------- |
| FCP    | `first-contentful-paint.numericValue`       |
| LCP    | `largest-contentful-paint.numericValue`     |
| CLS    | `cumulative-layout-shift.numericValue`      |
| TBT    | `total-blocking-time.numericValue`          |
| Script | `resource-summary`의 `script` transfer size |
| Image  | `resource-summary`의 `image` transfer size  |

FCP, LCP, TBT는 반올림한 `ms`, CLS는 소수점 셋째 자리, Script와 Image는 반올림한 `KB`로 정규화한다. 값이 없거나 유효한 숫자가 아니면 `N/A`를 표시해 코멘트 생성을 중단하지 않는다.

### Improvement summary

Lighthouse 전체 audit 중 점수가 1 미만인 실행 가능한 항목을 개선 후보로 사용한다. `notApplicable`, `manual`, `informative`처럼 직접적인 실패나 개선 기회가 아닌 표시 모드와 이미 핵심 지표 표에 노출한 metric audit은 제외한다.

후보는 예상 시간 절감, 예상 byte 절감, 개선 기회 여부, 점수 부족 폭 순으로 우선순위를 정하고 상위 3개만 표시한다. 각 항목은 Lighthouse report가 제공하는 audit 제목을 사용하며, 절감 시간 또는 byte 정보가 있으면 함께 표시한다. 후보가 없으면 `감지된 주요 개선점이 없습니다.`를 표시한다.

## Existing Behavior Preserved

- 모바일 기본 설정으로 3회 측정하고 대표 실행을 선택한다.
- category 임계값은 모두 warning-only로 유지한다.
- `<!-- lighthouse-ci-report -->` marker로 기존 bot 코멘트를 갱신한다.
- manifest 또는 대표 리포트가 없으면 warning 후 코멘트를 건너뛴다.
- HTML/JSON 리포트를 GitHub Actions Artifact로 업로드하고 14일 보관한다.
- fork PR에서는 write 권한이 필요한 코멘트 단계를 건너뛴다.

## Testing

formatter 테스트는 다음 동작을 검증한다.

- category 결과 표와 핵심 지표 표를 생성한다.
- 시간, CLS, resource size를 지정된 단위로 변환한다.
- 개선 후보를 우선순위에 따라 최대 3개 표시한다.
- 개선 후보가 없을 때 fallback 문구를 표시한다.
- Mermaid, Actions 실행 링크, 생성 시각을 포함하지 않는다.
- 기존 코멘트 update, 신규 create, 오류 시 skip 동작을 보존한다.

## Documentation Impact

기존 Lighthouse CI 설계 문서와 PR checklist에서 PR 코멘트 설명을 두 표와 개선점 요약으로 갱신한다. Artifact 보관, API smoke check, Lighthouse 측정 및 warning 정책 문서는 변경하지 않는다.

## Acceptance Criteria

1. PR 코멘트에 category 결과 표가 표시된다.
2. PR 코멘트에 FCP, LCP, CLS, TBT, Script, Image 대표 실행 값이 한 행으로 표시된다.
3. 개선 여지가 큰 audit이 최대 3개 표시되며, 후보가 없으면 명시적인 fallback 문구가 표시된다.
4. PR 코멘트에 Mermaid, 상세 리포트 링크, 생성 시각이 표시되지 않는다.
5. HTML/JSON Artifact 업로드와 14일 보관은 유지된다.
6. 기존 sticky comment create/update와 오류 처리 테스트가 계속 통과한다.
