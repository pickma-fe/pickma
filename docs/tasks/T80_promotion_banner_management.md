# T80 — 프로모션 배너 DB/Storage 기반 관리 구조 전환

## 상태

진행 전

## GitHub Issue

확인 필요

## 우선순위

P5

## 직접 선행 task

T46, T41

## 배경

현재 `PromotionCarousel`은 `public/images/banners/`의 정적 PNG 파일을 코드에 하드코딩해 사용한다.
배너 이미지·문구·링크 변경 시 코드 수정 + 배포가 필요하며, 운영 중 관리자가 직접 변경할 수 없다.

## 범위

### 백엔드

- `banners` 테이블 신규 migration
  - `id`, `image_url` (Storage 경로), `title`, `cta_label`, `cta_href`, `sort_order`, `active`, `created_at`
- `GET /api/banners` — 활성 배너 목록 반환 (public, 인증 불필요)
- `POST/PATCH/DELETE /api/admin/banners` — 관리자 배너 CRUD
- Storage bucket `banners` 설정 (public read, service role write)

### 프론트엔드

- `PromotionCarousel` — 하드코딩 제거, API fetch로 전환
- 관리자 배너 관리 화면 (`/admin/banners`) — 목록, 업로드, 순서 변경, 활성/비활성

### 마이그레이션

- 기존 `public/images/banners/` 이미지를 Storage에 업로드하고 초기 seed 레코드 삽입
- 이미지 교체(T46에서 수령 예정)와 함께 진행 가능

## 확인 필요 사항

- 배너 이미지 권장 사이즈·비율 확정
- 관리자 배너 화면을 T48(Admin UI 개선)과 함께 진행할지 여부

## 검증

- 관리자가 배너 추가/수정/순서 변경 후 홈 화면에 즉시 반영
- 배포 없이 배너 변경 가능
- Storage orphan cleanup 정책(T41) 적용 대상 확인
