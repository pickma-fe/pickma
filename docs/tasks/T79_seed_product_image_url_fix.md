# T79 — seed 상품 이미지 경로 수정

## 상태

완료

## GitHub Issue

없음

## 직접 선행 task

T39

## 배경

seed 상품 데이터의 `menu_items.image` 값이 `/images/products/` 경로를 참조하고 있으나,
해당 디렉터리는 `public/`에 존재하지 않아 Next.js Image 최적화 요청 시 400 에러가 발생했다.

실제 seed fixture 이미지는 `public/images/mock/products/`에 위치한다.

## 범위

- `supabase/seed.sql`의 `menu_items.image` 경로를 실제 존재하는 mock 상품 이미지 경로로 수정
- linked 개발 DB의 기존 잘못된 `menu_items.image` 값은 단일 UPDATE로 수정
- `supabase/refresh-seed-products.sql`는 상품 날짜·재고 refresh 용도로 유지하고 이미지 경로 복원은 포함하지 않음

## 구현 방안 (후보)

| 방안                    | 설명                                                                              | 비고   |
| ----------------------- | --------------------------------------------------------------------------------- | ------ |
| A. DB 경로 수정         | seed 메뉴의 `image`를 `/images/mock/products/product-croissant.jpg` 등으로 UPDATE | 적용   |
| B. public 디렉터리 추가 | `public/images/products/`에 이미지 복사                                           | 미적용 |

방안 A를 적용했다. seed 상품은 개발/테스트 fixture이므로 `public/images/mock/products/`의 실제 존재하는 이미지를 참조한다.

## 확인 필요 사항

없음

## 검증

- `rg -n "/images/products/bread\.jpg|/images/products/" supabase docs src public --glob '*.{sql,md,ts,tsx,json}'`
- `npm run typecheck`
- `supabase db query --linked "UPDATE public.menu_items SET image = '/images/mock/products/product-croissant.jpg' WHERE image = '/images/products/bread.jpg' RETURNING id, name, image;"`
