# T53. 판매자 가게 정보 수정 화면 구현

- 상태:
  완료

- GitHub Issue:
  219

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T15 (TanStack Query key 및 invalidation factory 도입), T16 (upload URL purpose별 권한 정책 강화)

- 분류:
  화면/UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  IA 정합성 확인 중 `/seller/store/edit` 경로가 미구현 상태임을 확인했다. `PATCH /api/stores/me` 엔드포인트는 구현되어 있으나 해당 화면이 없다.

- 문제:
  판매자가 가게 정보(영업시간, 주소, 이미지 등)를 수정할 화면이 없다.

- 작업 내용:
  - `/seller/store` 페이지 내 모달 방식으로 구현 (별도 `/seller/store/edit` 경로 없음)
  - 가게 기본 정보 수정 폼 모달 (이름, 전화, 주소, 지역, 소개, 영업시간)
  - 대표 이미지 변경 모달
  - 인증서류 조회 모달 (제출/갱신 UI 포함, API 연결은 후속 task)
  - `PATCH /api/stores/me` 연결 (`useUpdateStore`)
  - 이미지 업로드 `fileApi.uploadFile` 연동
  - `operationStatus` 토글 (영업 시작/종료)

- 관련 파일/영역:
  - `src/app/(seller)/seller/store/_components/` (StoreInfoContent, StoreEditForm, StoreImageEditForm, CertificationDetailModal 등)
  - `src/api/stores/storeApi.ts` (`PATCH /api/stores/me`)
  - `src/hooks/stores/useUpdateStore.ts`
  - `src/hooks/stores/useMyStore.ts`

- 예상 난이도:
  보통

- 완료 기준:
  - `/seller/store` 페이지 내 모달에서 가게 정보를 수정하고 저장할 수 있다.
  - `businessNumber` 필드는 수정 불가로 표시된다.
  - 이미지 변경 모달에서 파일 선택 후 저장할 수 있다.
  - 영업 시작/종료 토글이 동작한다.
  - 수정 성공/실패 시 토스트 메시지가 표시된다.

- 확인 필요 사항:
  - 인증서류 데이터 API 연결 미완료 (현재 mock 하드코딩) → 후속 task에서 처리
  - IA 문서의 `/seller/store/edit` URL은 실제 구현과 불일치 → ia.md 업데이트 필요
