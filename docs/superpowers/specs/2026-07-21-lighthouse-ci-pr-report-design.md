# Lighthouse CI PR Report Design

## Context

HASHI Client는 GitHub Actions에서 format, lint, typecheck, test, build를 검증하지만 웹 품질 점수와 성능 회귀를 PR에서 확인하는 절차는 없다. Client는 Vite 정적 빌드 결과를 `apps/client/dist`에 생성하므로 Lighthouse CI가 별도 Vercel 배포 없이 이 산출물을 로컬 서버로 제공해 검사할 수 있다.

Client API 모듈은 빌드 시 주입된 `VITE_API_BASE_URL`을 브라우저에서 사용한다. 개발자 로컬의 `apps/client/.env`는 Git에 포함되지 않으므로 GitHub Actions에는 Repository Variable을 명시적으로 전달해야 한다. Lighthouse가 실제 서버 통신을 포함한 홈 화면을 측정하도록, workflow는 빌드 전에 공개 API 연결도 별도로 확인한다.

상세 Lighthouse HTML/JSON 결과는 GitHub Actions Artifact로 보관한다. 리뷰어가 PR 화면을 벗어나지 않고 핵심 결과를 확인할 수 있도록 PR 코멘트에는 category 점수·상태 표, 핵심 성능 지표 표, 개선 audit 최대 3개를 표시한다.

## Goal

- Client production build를 Lighthouse CI로 PR마다 검사한다.
- 성능 변동을 줄이기 위해 모바일 기본 설정으로 3회 실행하고 대표 실행 결과를 사용한다.
- Performance, Accessibility, Best Practices, SEO 점수를 임계값과 비교한다.
- GitHub Actions Repository Variable의 API base URL로 공개 API 연결을 먼저 확인한다.
- Lighthouse가 실제 API를 사용하는 Client production build를 측정한다.
- HTML/JSON 리포트를 GitHub Actions Artifact로 14일 보관한다.
- PR에는 대표 실행의 category 점수·상태, 핵심 성능 지표, 개선 audit 최대 3개를 하나의 고정 코멘트로 생성하거나 갱신한다.
- 외부 리포트 저장소와 별도 GitHub App token 없이 동작한다.

## Architecture

### Lighthouse configuration

루트 `lighthouserc.cjs`가 `apps/client/dist`를 SPA 정적 서버로 제공한다. `/` 공개 경로를 3회 측정하고 다음 기준을 적용한다.

| Category       | Level   | Minimum |
| -------------- | ------- | ------: |
| Performance    | warning |      80 |
| Accessibility  | warning |      90 |
| Best Practices | warning |      90 |
| SEO            | warning |      90 |

네 범주는 모두 기준 미달 시 warning만 기록하고 workflow를 실패시키지 않는다. 점수 기준은 Performance 80, Accessibility·Best Practices·SEO 90을 유지하며 대표 실행은 `median-run` 집계 방식을 사용한다.

리포트 upload target은 `filesystem`이며 `lighthouse-reports`에 `manifest.json`, HTML, JSON을 생성한다. 임시 공개 저장소는 사용하지 않는다.

### PR workflow

독립된 `.github/workflows/lighthouse.yml`이 `develop` 대상 PR과 수동 실행에서 동작한다. 필수 status check로 지정해도 경로 필터 때문에 pending 상태가 되지 않도록 PR path filter를 두지 않는다. Repository Variable `VITE_API_BASE_URL`을 같은 이름의 job 환경변수로 전달한다.

workflow는 다음 순서로 실행한다.

1. pnpm과 Node.js 22 환경을 구성한다.
2. lockfile 기준으로 dependency를 설치한다.
3. PR 코멘트 formatter와 API smoke helper의 Node 테스트를 실행한다.
4. `VITE_API_BASE_URL`을 검증하고 공개 API smoke check를 실행한다.
5. 같은 환경변수로 Client production build를 생성한다.
6. Lighthouse 결과를 수집하고 임계값을 검사한다.
7. 임계값 warning 여부와 관계없이 filesystem 리포트를 export한다.
8. 리포트를 14일 보관 Artifact로 업로드한다.
9. PR 이벤트이면 대표 실행 결과로 기존 Lighthouse 코멘트를 갱신하거나 새로 생성한다.

workflow 권한은 `contents: read`, `pull-requests: write`로 제한한다.

### API environment and smoke check

GitHub 저장소의 Actions Variables에 다음 값을 등록한다.

| Variable            | Value                                    | Secret 여부 |
| ------------------- | ---------------------------------------- | ----------- |
| `VITE_API_BASE_URL` | 개발 또는 staging API의 절대 HTTP(S) URL | 비밀 아님   |

workflow는 `${{ vars.VITE_API_BASE_URL }}`을 `VITE_API_BASE_URL` 환경변수로 매핑한다. production API 대신 CI용 개발 또는 staging API를 사용하고, 인증 토큰이 필요한 endpoint나 데이터를 변경하는 endpoint는 호출하지 않는다.

`.github/scripts/lighthouse-api-smoke.cjs`는 다음 책임을 갖는다.

- 값이 비어 있지 않은지 확인한다.
- `http:` 또는 `https:` 절대 URL인지 확인한다.
- 공개 read-only endpoint인 `GET /api/v1/restaurants?type=sns-hot&size=1`을 제한 시간 내 호출한다.
- HTTP 2xx가 아니거나 timeout 또는 네트워크 오류가 발생하면 명확한 오류로 종료한다.
- 로그에 base URL 전체나 응답 본문을 출력하지 않는다.

이 helper를 별도 Node 테스트로 검증해 URL 결합, 누락·잘못된 환경변수, 성공 응답, non-2xx, timeout 동작을 workflow 외부에서도 재현할 수 있게 한다. inline `curl` 또는 긴 YAML script는 파일 수는 적지만 URL 처리와 실패 조건을 테스트하기 어려워 사용하지 않는다. mock API만 사용하는 방식은 Lighthouse 측정의 안정성은 높지만 실제 서버 통신을 확인하지 못하므로 이번 범위에서 선택하지 않는다.

smoke check는 서버 연결 실패 원인을 Lighthouse의 `NO_FCP` 같은 렌더링 오류와 분리해 보여준다. 이후 Lighthouse 3회 측정도 같은 개발 또는 staging API를 실제로 사용하므로 백엔드와 네트워크 변동이 Performance 점수에 포함된다. 대표 실행 선택으로 변동을 줄이되 완전히 제거하지는 않는다.

### Comment formatter

`.github/scripts/lighthouse-comment.cjs`는 GitHub Actions orchestration과 점수 표시 로직을 YAML에서 분리한다. 다음 책임을 갖는다.

- filesystem manifest에서 대표 실행 결과를 찾는다.
- Lighthouse JSON에서 네 category 점수를 0~100 정수로 변환한다.
- 90 이상은 녹색, 70 이상은 노란색, 그 미만은 빨간색 상태로 표시한다.
- FCP, LCP, CLS, TBT, Script, Image 값을 단위가 정규화된 Markdown 표로 생성한다.
- 실행 가능한 실패 audit을 절감 시간과 byte 기준으로 정렬해 개선점 최대 3개를 표시한다.
- Mermaid, workflow run 링크, 대표 실행 시각은 PR 코멘트에 표시하지 않는다.
- `<!-- lighthouse-ci-report -->` marker로 이전 bot 코멘트를 찾아 update하고, 없으면 create한다.

manifest 또는 대표 리포트가 없으면 workflow 전체를 새 오류로 덮지 않고 warning을 남긴 뒤 코멘트 생성을 건너뛴다. Lighthouse collect/assert 자체의 실패 상태는 그대로 유지한다.

## Data Flow

1. GitHub Actions가 Repository Variable을 `VITE_API_BASE_URL`로 주입한다.
2. API smoke helper가 공개 read-only endpoint의 HTTP 2xx 응답을 확인한다.
3. `pnpm build:client`가 같은 환경변수로 `apps/client/dist`를 생성한다.
4. Lighthouse CI가 실제 API를 사용하는 로컬 SPA 서버의 `/`를 3회 측정한다.
5. assert 단계가 category 임계값을 평가한다.
6. upload 단계가 `lighthouse-reports/manifest.json`과 HTML/JSON을 생성한다.
7. comment formatter가 `isRepresentativeRun`인 manifest entry의 JSON을 읽는다.
8. GitHub Actions Artifact에는 상세 리포트를 업로드한다.
9. PR 코멘트에는 대표 category 점수·상태 표, 핵심 성능 지표 표, 개선 audit 최대 3개를 표시한다.

## Error Handling

- `VITE_API_BASE_URL`이 누락되었거나 유효한 HTTP(S) 절대 URL이 아니면 build 전에 workflow를 실패시킨다.
- 공개 API가 timeout, 네트워크 오류, non-2xx 응답을 반환하면 smoke check에서 workflow를 실패시킨다.
- Client build 또는 Lighthouse collect 실패는 workflow 실패로 처리한다.
- category 임계값 미달은 warning으로 기록하고 workflow를 실패시키지 않는다.
- 리포트 export와 Artifact 업로드는 이전 단계 실패 시에도 가능한 범위에서 실행한다.
- manifest가 없거나 JSON 경로를 읽을 수 없으면 warning을 남기고 PR 코멘트만 생략한다.
- 외부 fork PR은 read-only `GITHUB_TOKEN`을 사용하므로 코멘트 단계를 명시적으로 건너뛴다. 검증되지 않은 코드를 높은 권한으로 실행하는 `pull_request_target`은 사용하지 않는다.
- 같은 PR에서 재실행해도 marker가 있는 기존 bot 코멘트를 갱신해 코멘트가 누적되지 않게 한다.

## Testing And Verification

- Node 내장 test runner로 점수 반올림, 상태 색상, representative run 선택, 핵심 지표 단위 변환, 개선점 우선순위와 제한, Markdown 생성, 기존 코멘트 update와 신규 create를 검증한다.
- Node 내장 test runner로 API URL 검증과 결합, HTTP 성공, non-2xx, 네트워크 오류, timeout을 검증한다. 테스트에서는 실제 서버 대신 주입한 fetch 대역을 사용한다.
- 실제 개발 또는 staging API를 대상으로 smoke 명령을 실행해 Repository Variable과 같은 조건의 연결을 확인한다.
- `pnpm exec lhci healthcheck --fatal`로 Lighthouse 구성과 Chrome 실행 환경을 확인한다.
- `pnpm build:client` 후 collect, assert, upload를 로컬에서 실행해 실제 manifest와 HTML/JSON 생성을 확인한다.
- YAML parser로 workflow 문법을 검증한다.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`로 저장소 회귀를 확인한다.

## Documentation

- `docs/architecture/tech-stack.md`에 Lighthouse CI를 Current 도구로 추가한다.
- `docs/architecture/data-layer.md`에 Lighthouse workflow가 GitHub Actions Repository Variable `VITE_API_BASE_URL`을 사용한다는 운영 기준을 추가한다.
- `docs/workflows/pr-checklist.md`에 `lighthouse.yml`의 역할과 결과 확인 방법을 추가한다.
- `.gitignore`에 로컬 `.lighthouseci`와 `lighthouse-reports` 산출물을 추가한다.

## Out Of Scope

- `develop` 또는 이전 PR 결과와의 점수 delta 및 추세 그래프
- 인증이 필요한 페이지의 Lighthouse 측정
- production API 또는 데이터를 변경하는 endpoint를 대상으로 한 smoke check
- API 응답 schema 전체를 검증하는 contract test
- Vercel Preview URL 측정
- 자체 호스팅 Lighthouse CI 서버
- temporary public storage 업로드
- fork PR에 write token을 제공하기 위한 `pull_request_target` 사용

## Acceptance Criteria

1. `develop` 대상 PR에서 Lighthouse workflow가 실행된다.
2. Repository Variable `VITE_API_BASE_URL`이 누락되거나 잘못되면 build 전에 이해할 수 있는 오류로 실패한다.
3. 공개 read-only API smoke check가 2xx 응답을 확인하고 timeout, 네트워크 오류, non-2xx에서는 실패한다.
4. 주입된 API base URL을 사용하는 Client production build의 `/` 경로를 모바일 기본 설정으로 3회 측정한다.
5. Performance가 80 미만이거나 Accessibility, Best Practices, SEO가 90 미만이면 warning으로 표시되며 점수만으로 workflow를 실패시키지 않는다.
6. 대표 실행의 HTML/JSON 상세 리포트가 14일 Artifact로 남는다.
7. PR 코멘트에 네 category 점수·상태, FCP/LCP/CLS/TBT/Script/Image, 개선 audit 최대 3개가 표시된다.
8. 같은 PR의 재실행은 기존 Lighthouse 코멘트를 갱신한다.
9. comment formatter, API smoke helper 테스트와 저장소 검증 명령이 통과한다.
