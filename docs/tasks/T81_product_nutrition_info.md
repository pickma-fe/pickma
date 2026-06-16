# T81 — 상품 영양 정보 필드 추가

## 상태

진행 전

## GitHub Issue

확인 필요

## 직접 선행 task

없음

## 배경

상품 상세 탭의 "영양 정보" 섹션이 현재 "상품별 영양 정보는 준비 중입니다." 플레이스홀더만 표시한다.
`products` 테이블과 `Product` Domain 타입에 영양 정보 필드가 없어 데이터를 표시할 수 없다.

## 범위

- `products` 테이블에 영양 정보 컬럼 추가 (마이그레이션)
- `ProductResponse` contract DTO에 영양 정보 필드 추가
- `ProductDetail` Domain 타입 및 mapper 업데이트
- `ProductDetailTabs`의 영양 정보 섹션에 실제 데이터 표시

## 확인 필요 사항

- 영양 정보 항목 정의 (칼로리, 탄수화물, 단백질, 지방 등 필요 항목)
- 판매자가 상품 등록/수정 시 영양 정보를 입력할 UI 범위 (T47 또는 별도 task)
- 영양 정보 미입력 상품 처리 방식 (null 허용 vs 기본값)
