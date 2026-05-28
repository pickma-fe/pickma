-- available_stock, discount_rate generated column에 NOT NULL 제약 추가
-- 입력 컬럼(stock, reserved_stock, original_price, discount_price)이 모두 NOT NULL이므로
-- generated column도 항상 계산 가능하다.

ALTER TABLE products ALTER COLUMN available_stock SET NOT NULL;
ALTER TABLE products ALTER COLUMN discount_rate SET NOT NULL;
