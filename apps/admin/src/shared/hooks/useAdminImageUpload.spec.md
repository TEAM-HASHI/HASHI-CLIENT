# useAdminImageUpload Spec

## Behavior

- JPEG·PNG·WebP, 5MB 이하의 이미지를 최대 3개씩 업로드한다.
- `remove(id)`는 화면에서 항목을 제거하고 해당 업로드 결과를 즉시 무효화한다. 진행 중인 전송 자체를 취소하지는 않지만, 늦은 성공·실패 응답이 폼이나 업로드 목록에 다시 반영되지 않는다.
- 대기 중 제거한 항목은 전송하지 않는다. 화면을 벗어나 unmount되면 남은 결과도 반영하지 않는다.
- 실패한 항목은 재시도할 수 있고 성공 시 `onUploaded`를 한 번 호출한다.
- 성공·제거·unmount 시 사용한 미리보기 URL을 해제한다.

## Verification

- `useAdminImageUpload.test.tsx`: 파일 검증, 정상 업로드, 업로드 중 제거·unmount 후 지연 응답 무시, 실패 후 재시도.
- `AdminImageUploader.test.tsx`: 파일 선택, 미리보기 비율, 이미지 순서·삭제 조작.
