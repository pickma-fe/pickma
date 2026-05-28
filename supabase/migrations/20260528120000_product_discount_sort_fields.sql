-- 1. original_price 컬럼 추가 (nullable → backfill → NOT NULL)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS original_price int;

UPDATE products p
SET original_price = mi.original_price
FROM menu_items mi
WHERE mi.id = p.menu_item_id
  AND p.original_price IS NULL;

ALTER TABLE products
  ALTER COLUMN original_price SET NOT NULL,
  ALTER COLUMN original_price SET DEFAULT 0;

-- 2. INSERT 시 original_price 자동 채우기 트리거
CREATE OR REPLACE FUNCTION set_product_original_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.original_price IS NULL OR NEW.original_price = 0 THEN
    SELECT original_price INTO NEW.original_price
    FROM menu_items WHERE id = NEW.menu_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_original_price ON products;
CREATE TRIGGER products_set_original_price
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION set_product_original_price();

-- 3. available_stock generated column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS available_stock int
  GENERATED ALWAYS AS (stock - reserved_stock) STORED;

-- 4. discount_rate generated column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount_rate int
  GENERATED ALWAYS AS (
    CASE WHEN original_price > 0
      THEN ROUND((1.0 - discount_price::float / original_price) * 100)::int
      ELSE 0
    END
  ) STORED;

-- 5. 인덱스
CREATE INDEX IF NOT EXISTS idx_products_discount_rate
  ON products(discount_rate) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_products_available_stock
  ON products(available_stock) WHERE status = 'active';
