# T79 — seed 상품 image_url 경로 수정

## 상태

진행 전

## GitHub Issue

확인 필요

## 직접 선행 task

T39

## 배경

seed 상품 데이터의 `image_url` 값이 `/images/products/` 경로를 참조하고 있으나,
해당 디렉터리는 `public/`에 존재하지 않아 Next.js Image 최적화 요청 시 400 에러 발생.

실제 fallback 이미지는 `public/images/fallback/`에 위치한다 (`bread.jpg`, `noimage.png`).

## 범위

- 원격 개발 DB의 seed 상품 레코드(`products` 테이블) `image_url` 값을 실제 존재하는 경로로 수정
- `supabase/refresh-seed-products.sql`에도 image_url 복원 항목 반영

## 구현 방안 (후보)

| 방안                    | 설명                                                                 | 비고      |
| ----------------------- | -------------------------------------------------------------------- | --------- |
| A. DB 경로 수정         | seed 상품의 `image_url`을 `/images/fallback/bread.jpg` 등으로 UPDATE | 근본 수정 |
| B. public 디렉터리 추가 | `public/images/products/`에 이미지 복사                              | 경로 유지 |

방안 A를 권장한다. seed 상품은 Storage를 사용하지 않으므로 `fallback/` 경로가 의미상으로도 맞다.

## 확인 필요 사항

- seed 상품 레코드의 `image_url` 현황 (bread.jpg 외 다른 경로도 있는지)
- `refresh-seed-products.sql`에서 image_url을 함께 리셋할지 여부

## 검증

- `supabase db query --linked --file supabase/refresh-seed-products.sql` 실행 후 `/search` 또는 홈에서 콘솔 400 에러 없음 확인
