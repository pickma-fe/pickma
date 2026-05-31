# T53. 판매자 가게 정보 수정 화면 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

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
  - `/seller/store/edit` 페이지 구현
  - 가게 정보 수정 폼 (이름, 소개, 전화, 주소, 지역, 이미지, 영업시간)
  - `PATCH /api/stores/me` 연결
  - 이미지 업로드 연동
  - 판매자+가게 권한 guard 적용

- 관련 파일/영역:
  - `src/app/(seller)/seller/store/edit/`
  - `src/api/stores/` (`PATCH /api/stores/me`)
  - `src/hooks/stores/`

- 예상 난이도:
  보통

- 완료 기준:
  - `/seller/store/edit` 화면에서 가게 정보를 수정하고 저장할 수 있다.
  - `businessNumber` 필드는 수정 불가로 표시된다.

- 확인 필요 사항:
  - 이미지 업로드 처리 방식 (Storage orphan 정책 T06 참고)
  - 가게 정보 수정 후 리다이렉트 목적지
