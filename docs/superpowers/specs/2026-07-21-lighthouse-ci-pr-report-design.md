# Lighthouse CI PR Report Design

## Context

HASHI Client는 PR마다 Vercel Preview를 배포한다. Lighthouse가 별도로 로컬 정적 서버를 띄우면 실제 Preview의 CDN, response header, 배포 환경변수, API CORS 동작이 측정에서 빠진다. 따라서 Vercel Preview 배포가 끝난 뒤 그 배포 URL을 모바일 기본 설정으로 3회 측정한다.

리뷰어가 PR 화면에서 핵심 결과를 확인할 수 있도록 대표 실행의 category, metric, resource를 단일 세로 요약표로 표시하고 개선 audit 최대 3개를 보여준다. 상세 HTML/JSON은 GitHub Actions Artifact에 14일 보관한다.

## Goal

- Vercel Preview에 실제 배포된 Client 홈을 Lighthouse로 검사한다.
- Preview가 사용하는 API와 브라우저 CORS 동작을 측정에 포함한다.
- 모바일 기본 설정으로 3회 실행하고 대표 실행 결과를 사용한다.
- 점수 미달은 warning으로만 기록하고 PR 작업을 막지 않는다.
- 잘못된 URL, CORS, 필수 홈 API 실패처럼 측정을 신뢰할 수 없는 경우는 workflow를 실패시킨다.
- PR 코멘트와 14일 Artifact 동작을 유지한다.

## Architecture

### Workflow ownership

`.github/workflows/vercel-preview.yml`이 Preview 배포와 Lighthouse 측정을 함께 소유한다.

1. `deploy-preview` job이 Vercel Preview를 배포하고 URL을 job output으로 내보낸다.
2. `lighthouse` job은 `deploy-preview`를 `needs`로 기다린다.
3. 배포 URL을 `lhci collect --url=...`에 전달해 홈을 3회 측정한다.
4. 수집된 LHR이 실제 Preview URL과 필수 홈 API 성공을 증명하는지 검사한다.
5. category 임계값을 warning으로 평가한다.
6. HTML/JSON 리포트를 export하고 14일 Artifact로 업로드한다.
7. 같은 저장소 PR이면 기존 Lighthouse 코멘트를 갱신한다.

독립된 `.github/workflows/lighthouse.yml`은 제거한다. PR 이벤트의 path filter도 제거해 필수 check로 지정했을 때 변경 경로 때문에 대기 상태가 남지 않게 한다. `develop` push의 Preview 배포 경로 필터는 유지하며 Lighthouse job은 PR에서만 실행한다.

### Lighthouse configuration

루트 `lighthouserc.cjs`는 배포 URL이나 로컬 산출물 경로를 소유하지 않는다. URL은 workflow가 CLI 인자로 전달하고 설정은 다음만 관리한다.

- 모바일 기본 설정 3회 수집
- Performance 80 warning
- Accessibility 90 warning
- Best Practices 90 warning
- SEO 90 warning
- `median-run` 집계
- filesystem 리포트 export

Vercel Preview는 검색 엔진 색인을 막기 위한 `X-Robots-Tag: noindex`를 자동으로 붙이므로 SEO 점수에는 Preview 환경 영향이 포함된다. SEO 점수는 production 색인 가능 여부의 최종 검증으로 해석하지 않는다.

### Preview validity check

`.github/scripts/lighthouse-preview-validation.cjs`는 `.lighthouseci/lhr-*.json`의 모든 실행을 검사한다.

- 입력 Preview URL이 HTTP(S) 절대 URL인지 확인한다.
- LHR의 `finalUrl`이 입력 Preview URL의 origin과 pathname에 해당하는지 확인한다.
- Lighthouse runtime error가 없어야 한다.
- `errors-in-console` audit에 CORS 차단 메시지가 없어야 한다.
- 홈의 공개 데이터에 필요한 `GET /api/v1/magazines/banners`가 HTTP 2xx여야 한다.
- 홈의 공개 데이터에 필요한 `GET /api/v1/restaurants?type=sns-hot&size=5`가 HTTP 2xx여야 한다. query parameter 순서는 구분하지 않는다.

category 점수는 제품 품질 신호이므로 기준 미달이어도 warning이다. 반면 위 검증 실패는 API 데이터가 없는 오류 화면이나 다른 배포를 정상 홈 결과로 게시하는 문제이므로 workflow 오류다.

기존 Node API smoke helper는 Actions Node 런타임에서 API에 직접 요청하므로 브라우저 Origin 기반 CORS를 검증하지 못한다. Preview LHR 검증으로 대체한다.

### PR report

`.github/scripts/lighthouse-comment.cjs`는 filesystem manifest의 대표 실행을 선택한다.

- 네 category 점수와 상태
- FCP, LCP, CLS, TBT
- Script, Image 전송량
- 절감 효과 기준 개선 audit 최대 3개
- `<!-- lighthouse-ci-report -->` marker를 이용한 기존 bot 코멘트 update

점수 표시는 90 이상 녹색, 70 이상 노란색, 70 미만 빨간색이다. 이 색상은 workflow 성공·실패와 독립적이다.

## Error Handling

- Vercel 배포 실패 또는 URL 누락은 workflow 실패다.
- Lighthouse collect 실패는 workflow 실패다.
- Preview URL 불일치, runtime error, CORS 차단, 필수 홈 API 누락·non-2xx는 workflow 실패다.
- category 임계값 미달은 warning으로만 기록한다.
- export와 Artifact 업로드, PR 코멘트는 이전 단계 실패 시에도 가능한 범위에서 실행한다.
- manifest나 대표 실행이 없으면 warning을 남기고 코멘트를 건너뛴다.
- 외부 fork PR에는 배포 secret과 write token을 제공하지 않으며 `pull_request_target`을 사용하지 않는다.

## Testing And Verification

- Node 내장 test runner로 Preview URL 검증, LHR URL 일치, CORS 탐지, 필수 API 2xx, 모든 실행 검사를 확인한다.
- 기존 formatter 테스트로 대표 실행, 점수, metric, resource, 개선점, 코멘트 update/create를 확인한다.
- `lhci healthcheck --fatal`로 Lighthouse 환경을 확인한다.
- 실제 Vercel Preview URL을 3회 collect하고 Preview validity check, assert, upload를 순서대로 확인한다.
- YAML parser, Prettier, `git diff --check`와 저장소 회귀 검증을 실행한다.

## Documentation

- `docs/architecture/data-layer.md`에 Vercel Preview 환경변수와 브라우저 CORS 검증 경계를 기록한다.
- `docs/workflows/pr-checklist.md`에 Preview 배포 후 Lighthouse가 실행되는 순서와 실패 기준을 기록한다.

## Out Of Scope

- 인증이 필요한 페이지 측정
- production URL 측정
- production SEO 색인 가능 여부 검증
- API response schema 전체 contract test
- 자체 호스팅 Lighthouse CI 서버
- 외부 공개 리포트 저장소
- fork PR에 write 권한을 주기 위한 `pull_request_target`

## Acceptance Criteria

1. `develop` 대상 PR에서 Vercel Preview 배포가 먼저 완료된다.
2. Lighthouse가 그 job output URL의 홈을 모바일 기본 설정으로 3회 측정한다.
3. 모든 LHR에서 실제 Preview URL과 필수 홈 API 2xx 응답을 확인한다.
4. CORS 또는 필수 API 실패가 있으면 결과를 정상 홈 점수로 게시하지 않고 workflow를 실패시킨다.
5. 네 category 기준 미달은 warning이며 점수만으로 workflow가 실패하지 않는다.
6. 대표 실행의 결과가 기존 PR 코멘트에 갱신된다.
7. 상세 HTML/JSON은 14일 Artifact로 남는다.
8. helper 테스트와 저장소 검증 명령이 통과한다.
