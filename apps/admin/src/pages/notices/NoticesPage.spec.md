# Admin Notices

- 인증된 관리자만 `/admin/notices`, `/admin/notices/new`, `/admin/notices/:noticeId`에 접근한다.
- 목록은 관리자 API의 0-based page, size=20을 사용한다. 작성·수정은 독립 페이지이고 게시·삭제·미저장 이탈 확인만 모달이다.
- 목록·상세·초안 작성·전체 수정(PUT)·게시·삭제 API를 연결한다. 수정 시 기존 본문의 span 서식·개행·이미지 ID와 순서를 보존한다.
- 제목은 공백만으로 작성할 수 없고 100자 이하, 본문은 서버의 문단/글머리표/번호 목록과 text/bold/href 구조를 사용한다. 전체 텍스트는 10000자 이하이다. HTML을 실행하거나 입력을 임의로 잘라내지 않는다.
- 링크는 서버 기준의 http(s) 또는 `/` 내부 경로만 허용하며 프로토콜 상대 URL, 사용자 정보, 역슬래시, 제어 문자·공백을 차단한다.
- NOTICE 이미지 asset 생성 → 지정 헤더로 storage PUT → complete → READY 확인 순으로 처리한다. 최대 10장, JPG/PNG/WebP, 장당 10MB를 기획 및 서버 `MediaAssetService`의 NOTICE 전용 한도에 맞춰 검증한다. 파일 공통 Swagger의 5MB 설명과 NOTICE 전용 한도는 구분한다.
- 선택 순서에 슬롯을 먼저 만들고 결과를 해당 슬롯에 반영한다. 업로드·처리 중 또는 실패 이미지가 남아 있으면 저장을 막는다. 실패 항목은 재시도·제거할 수 있고, 제거·페이지 이탈 시 요청과 polling을 중단하고 object URL을 해제한다. 기존 이미지 제거는 다음 저장의 ID 목록에서 제외하는 방식이며 서버가 binding을 해제한다.
- 생성 성공 후 동일 초안을 중복 생성하지 않도록 상세 URL로 replace 이동한다. 저장된 초안에 미저장 변경이 없을 때만 게시할 수 있다. 게시된 공지는 수정 저장하면 사용자 화면에 반영되며 다시 게시하지 않는다.
- 저장·게시·삭제는 낙관적으로 반영하지 않는다. 실패 시 입력·기존 데이터·게시 상태를 유지한다. 중복 제출은 ref와 pending 상태로 차단한다.
- 저장·게시 성공 시 상세 캐시 갱신 및 목록 prefix 무효화, 삭제 성공 시 상세 캐시 제거 및 목록 무효화를 수행한다. 삭제로 마지막 페이지가 사라지면 유효한 페이지로 복귀한다.
- 미저장 변경이 있는 SPA 이동·뒤로가기는 확인 후 수행한다. 브라우저 새로고침·닫기는 beforeunload 확인을 사용한다. 업로드 중 이탈은 취소할 수 있다.

## Generated Contract

`shared/api/generated/notice-openapi.ts`는 관리자 공지사항 6개 operation 및 user OpenAPI의 media asset 3개 operation과 그 참조 schema만 포함한다. 기존 식당·매거진 계약을 이번 작업에서 갱신하지 않는다.

`apps/admin/.env.openapi.local`의 `ADMIN_OPENAPI_SCHEMA_URL`, `USER_OPENAPI_SCHEMA_URL`을 설정한 뒤 `pnpm --filter @hashi/admin gen:notice-api-types`로 재생성한다. 계약의 출처는 개발 서버 OpenAPI이며 서버 코드는 본문 검증·이미지 binding 정책을 확인하는 데 사용했다.

## Verification

중요 회귀 검증: 저장 실패 시 기존 서식·첨부 순서·입력 유지, 중복 생성 방지, 게시 실패 후 동일 초안 재시도, 뒤로가기 취소, 안전하지 않은 링크 차단, storage 실패 및 업로드 처리 중 이탈 취소. 단순 CSS·아이콘 테스트는 추가하지 않는다.
