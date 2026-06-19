# Jira Ticket Guide

이 문서는 SIKSA Client 팀에서 Jira 이슈를 만들고 작업 흐름에 연결하는 기준을 정리합니다.
Codex에게 Jira 티켓 초안을 요청할 때도 이 문서를 기준으로 제목, 설명, 라벨, 브랜치명, PR 정보를 맞춥니다.

## 기본 원칙

- Jira 보드는 `작업 상태`를 기준으로 관리합니다.
- 이슈는 작고 검증 가능한 작업 단위로 나눕니다.
- 이슈 제목의 `[Type]`과 Jira 레이블은 같은 의미로 사용합니다.
- 설명에는 작업 범위와 완료 기준을 명확히 적습니다.
- 개별 이슈는 가능한 한 관련 에픽을 `상위 항목`으로 연결합니다.

Codex 공식 문서의 작업 방식과 맞추면, 요청은 작은 단위로 나누고 검증 기준을 함께 전달할수록 결과 품질이 좋아집니다. 따라서 Jira 티켓도 구현 범위, 완료 조건, 확인 방법이 드러나게 작성합니다.

참고한 Codex 공식 문서는 다음과 같습니다.

- [Prompting Codex](https://developers.openai.com/codex/prompting)
- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)

## Jira 보드 상태

| 상태        | 의미                                |
| ----------- | ----------------------------------- |
| TODO        | 아직 시작하지 않은 작업             |
| IN PROGRESS | 작업 진행 중                        |
| CODE REVIEW | PR 생성 후 코드 리뷰 중             |
| QA          | 리뷰 이후 확인/테스트가 필요한 상태 |
| DONE        | 작업 완료                           |

작업 흐름은 다음 기준을 따릅니다.

1. 작업을 시작하면 이슈를 `IN PROGRESS`로 이동합니다.
2. PR을 생성하면 자동으로 `CODE REVIEW`로 이동합니다.
3. PR이 병합되면 자동으로 `DONE`으로 이동합니다.
4. 리뷰 이후 별도 확인이나 테스트가 필요하면 `QA` 상태로 관리합니다.

## 이슈 제목

이슈 제목은 다음 형식을 사용합니다.

```markdown
[Type] 작업 내용
```

예시는 다음과 같습니다.

```markdown
[INIT] Tailwind CSS 초기 세팅
[FEAT] 로그인 페이지 구현
[FIX] 버튼 클릭 이벤트 오류 수정
[REFACTOR] 인증 로직 분리
[STYLE] Input 컴포넌트 스타일 수정
```

## Type 기준

| Type     | 사용 기준                          |
| -------- | ---------------------------------- |
| INIT     | 프로젝트 초기 설정, 구조 세팅      |
| FEAT     | 새로운 기능 추가                   |
| FIX      | 버그 수정, 오류 해결               |
| REFACTOR | 기능 변화 없는 코드 구조 개선      |
| STYLE    | CSS, UI 스타일, 포맷팅 수정        |
| DOCS     | 문서 작성, README 수정, 주석 보강  |
| TEST     | 테스트 코드 작성, 테스트 환경 수정 |
| DEPLOY   | 배포 설정, 배포 관련 작업          |
| CHORE    | 빌드 설정, 패키지 관리, 기타 잡무  |

애매한 경우에는 사용자가 실제로 검수할 변화가 있는지부터 판단합니다.

- 사용자에게 새 동작이 생기면 `FEAT`
- 기존 동작 오류를 고치면 `FIX`
- 동작 변화 없이 구조만 정리하면 `REFACTOR`
- UI 스타일, CSS, 포맷만 바꾸면 `STYLE`
- 설정, 패키지, 생성기, 단순 정리는 `CHORE`

## 필수 입력 항목

이슈 상세 화면에서는 다음 항목을 확인합니다.

| 항목      | 작성 기준                         |
| --------- | --------------------------------- |
| 제목      | `[Type] 작업 내용` 형식           |
| 설명      | 작업 범위와 완료 기준 작성        |
| 담당자    | 실제 작업자 지정                  |
| 레이블    | INIT, FEAT, FIX 등 작업 타입 지정 |
| 시작 날짜 | 작업 시작일                       |
| 기한      | 작업 완료 목표일                  |
| 상위 항목 | 연결할 에픽 선택                  |
| 우선순위  | 기본은 Medium, 필요 시 조정       |

## 설명 작성 형식

설명은 작업자가 바로 범위를 이해할 수 있도록 항목형으로 작성합니다.

```markdown
## 작업 범위

- Tailwind CSS 설치 및 기본 설정
- tailwind-merge 설정 및 유틸 함수 구성
- prettier-plugin-tailwindcss 설정

## 완료 기준

- 로컬 개발 서버에서 Tailwind 클래스가 정상 적용된다.
- 공통 유틸 함수로 클래스 병합이 가능하다.
- 포맷 실행 시 Tailwind 클래스 정렬이 적용된다.

## 확인 방법

- pnpm lint
- pnpm typecheck
- pnpm dev
```

작업이 작고 단순하면 `## 작업 범위`만 작성해도 됩니다. 다만 구현 티켓은 가능한 한 `완료 기준`과 `확인 방법`까지 적습니다.

## 에픽과 상위 항목

에픽은 큰 작업 단위입니다. 개별 이슈는 관련된 에픽을 `상위 항목`으로 연결합니다.

```markdown
SIKSA-18 프로젝트 초기 세팅
└ SIKSA-17 [INIT] Tailwind CSS 초기 세팅
```

상위 항목을 연결하면 보드 카드에서 어떤 큰 작업에 속하는지 확인할 수 있습니다.

## 브랜치 이름

브랜치는 다음 형식을 사용합니다.

```markdown
type/SIKSA-번호-작업-요약
```

기준은 다음과 같습니다.

- `type`은 이슈 Type을 소문자로 작성합니다.
- 이슈 키는 `SIKSA-번호` 형식을 유지합니다.
- 작업 요약은 영어 소문자와 하이픈을 사용합니다.

예시는 다음과 같습니다.

```markdown
init/SIKSA-17-tailwind-setting
feat/SIKSA-24-login-page
fix/SIKSA-31-button-click-event
refactor/SIKSA-42-auth-logic
style/SIKSA-55-input-component
```

## PR 연결

PR 제목은 다음 형식을 사용합니다.

```markdown
Type(scope): 작업 내용
```

예시는 다음과 같습니다.

```markdown
Init(project): Tailwind CSS 초기 세팅
Feat(auth): 로그인 페이지 구현
Fix(button): 버튼 클릭 이벤트 오류 수정
Refactor(auth): 인증 로직 분리
Style(input): Input 컴포넌트 스타일 수정
```

PR 설명에는 Jira 이슈 키 또는 링크를 포함합니다.

```markdown
## 📌 Summary

Tailwind CSS 초기 세팅을 진행했습니다.

Jira: SIKSA-17

## 📚 Tasks

- Tailwind CSS 설치 및 기본 설정
- tailwind-merge 설정 및 유틸 함수 구성
- prettier-plugin-tailwindcss 설정
```

## 전체 작업 흐름

1. Jira에서 이슈 생성
2. 제목 작성: `[Type] 작업 내용`
3. 설명 작성
4. 레이블 지정
5. 담당자 지정
6. 상위 항목 연결
7. 브랜치 생성
8. 작업 진행
9. PR 생성
10. 코드 리뷰
11. 필요 시 QA
12. PR 병합
13. Jira 이슈 자동 완료 확인

## 예시 흐름

```markdown
Jira 이슈
[INIT] Tailwind CSS 초기 세팅

이슈 키
SIKSA-17

상위 항목
SIKSA-18 프로젝트 초기 세팅

브랜치
init/SIKSA-17-tailwind-setting

PR 제목
Init(project): Tailwind CSS 초기 세팅

PR 설명

## 📌 Summary

Tailwind CSS 초기 세팅을 진행했습니다.

Jira: SIKSA-17

## 📚 Tasks

- Tailwind CSS 설치 및 기본 설정
- tailwind-merge 설정 및 유틸 함수 구성
- prettier-plugin-tailwindcss 설정
```

## Codex에 티켓 초안 요청하기

Codex에게 Jira 티켓 초안을 만들게 할 때는 최소한 다음 정보를 전달합니다.

- 작업 목표
- 예상 Type
- 관련 에픽 또는 상위 항목
- 담당자
- 시작 날짜와 기한
- 우선순위
- 완료 기준
- 확인 방법

요청 예시는 다음과 같습니다.

```markdown
다음 작업으로 Jira 티켓 초안을 만들어줘.

- 작업 목표: Tailwind CSS 초기 세팅
- Type: INIT
- 상위 항목: SIKSA-18 프로젝트 초기 세팅
- 담당자: 홍길동
- 시작 날짜: 2026-06-19
- 기한: 2026-06-21
- 우선순위: Medium
- 완료 기준: Tailwind 클래스 적용, 클래스 병합 유틸 구성, 포맷터 설정 완료
- 확인 방법: pnpm lint, pnpm typecheck, pnpm dev
```

Codex의 출력은 다음 형식으로 맞춥니다.

```markdown
## Jira 이슈 초안

제목: [INIT] Tailwind CSS 초기 세팅
레이블: INIT
담당자: 홍길동
시작 날짜: 2026-06-19
기한: 2026-06-21
상위 항목: SIKSA-18 프로젝트 초기 세팅
우선순위: Medium

설명:

## 작업 범위

- Tailwind CSS 설치 및 기본 설정
- tailwind-merge 설정 및 유틸 함수 구성
- prettier-plugin-tailwindcss 설정

## 완료 기준

- 로컬 개발 서버에서 Tailwind 클래스가 정상 적용된다.
- 공통 유틸 함수로 클래스 병합이 가능하다.
- 포맷 실행 시 Tailwind 클래스 정렬이 적용된다.

## 확인 방법

- pnpm lint
- pnpm typecheck
- pnpm dev

브랜치: init/SIKSA-17-tailwind-setting
PR 제목: Init(project): Tailwind CSS 초기 세팅
```

## 작성 체크리스트

- [ ] 제목이 `[Type] 작업 내용` 형식인가?
- [ ] Type과 레이블이 일치하는가?
- [ ] 설명에 작업 범위가 충분히 드러나는가?
- [ ] 완료 기준이 확인 가능한 문장인가?
- [ ] 담당자, 시작 날짜, 기한이 지정되었는가?
- [ ] 상위 항목이 필요한 경우 연결되었는가?
- [ ] 브랜치명이 이슈 키와 Type을 포함하는가?
- [ ] PR 설명에 Jira 이슈 키 또는 링크가 포함되었는가?
