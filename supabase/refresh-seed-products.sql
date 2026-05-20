-- Reset seed state: clear all orders/payments and restore products to seed defaults.
-- Run when seed products have expired or test data has accumulated:
--   supabase db query --linked --file supabase/refresh-seed-products.sql
--   npx supabase db query --linked --file supabase/refresh-seed-products.sql

BEGIN;

-- 1. Clear test data (payments first due to RESTRICT FK, order_items cascade with orders)
DELETE FROM public.payments;
DELETE FROM public.orders;

-- 2. Restore seed products to original values
UPDATE public.products AS p
SET
  store_id       = v.store_id,
  menu_item_id   = v.menu_item_id,
  category_id    = v.category_id,
  end_at         = (
    (
      (now() AT TIME ZONE 'Asia/Seoul')::date
      + v.end_day_offset
      + v.pickup_end_time
    ) AT TIME ZONE 'Asia/Seoul'
  ),
  stock          = v.stock,
  reserved_stock = v.reserved_stock,
  status         = v.status::product_status
FROM (
  VALUES
    ('00000000-0000-4000-8000-000000000051'::uuid, '00000000-0000-4000-8000-000000000031'::uuid, '00000000-0000-4000-8000-000000000041'::uuid, '00000000-0000-4000-8000-000000000011'::uuid,  0, TIME '13:30:00',  8, 2, 'active'),
    ('00000000-0000-4000-8000-000000000052'::uuid, '00000000-0000-4000-8000-000000000031'::uuid, '00000000-0000-4000-8000-000000000042'::uuid, '00000000-0000-4000-8000-000000000011'::uuid,  0, TIME '15:00:00',  5, 1, 'active'),
    ('00000000-0000-4000-8000-000000000053'::uuid, '00000000-0000-4000-8000-000000000031'::uuid, '00000000-0000-4000-8000-00000000004c'::uuid, '00000000-0000-4000-8000-000000000011'::uuid,  0, TIME '12:00:00', 10, 0, 'closed'),
    ('00000000-0000-4000-8000-000000000054'::uuid, '00000000-0000-4000-8000-000000000032'::uuid, '00000000-0000-4000-8000-00000000004d'::uuid, '00000000-0000-4000-8000-000000000012'::uuid,  0, TIME '16:00:00', 10, 0, 'active'),
    ('00000000-0000-4000-8000-000000000055'::uuid, '00000000-0000-4000-8000-000000000033'::uuid, '00000000-0000-4000-8000-000000000044'::uuid, '00000000-0000-4000-8000-000000000017'::uuid,  0, TIME '18:00:00', 12, 3, 'active'),
    ('00000000-0000-4000-8000-000000000056'::uuid, '00000000-0000-4000-8000-000000000033'::uuid, '00000000-0000-4000-8000-000000000045'::uuid, '00000000-0000-4000-8000-000000000014'::uuid,  0, TIME '19:00:00',  6, 0, 'active'),
    ('00000000-0000-4000-8000-000000000057'::uuid, '00000000-0000-4000-8000-000000000034'::uuid, '00000000-0000-4000-8000-000000000046'::uuid, '00000000-0000-4000-8000-000000000013'::uuid,  0, TIME '14:30:00',  9, 4, 'active'),
    ('00000000-0000-4000-8000-000000000058'::uuid, '00000000-0000-4000-8000-000000000034'::uuid, '00000000-0000-4000-8000-000000000047'::uuid, '00000000-0000-4000-8000-000000000015'::uuid,  0, TIME '20:00:00', 15, 5, 'active'),
    ('00000000-0000-4000-8000-000000000059'::uuid, '00000000-0000-4000-8000-000000000035'::uuid, '00000000-0000-4000-8000-000000000048'::uuid, '00000000-0000-4000-8000-000000000014'::uuid,  0, TIME '17:00:00',  7, 1, 'active'),
    ('00000000-0000-4000-8000-00000000005a'::uuid, '00000000-0000-4000-8000-000000000035'::uuid, '00000000-0000-4000-8000-000000000049'::uuid, '00000000-0000-4000-8000-000000000012'::uuid,  0, TIME '15:30:00',  4, 4, 'active'),
    ('00000000-0000-4000-8000-00000000005b'::uuid, '00000000-0000-4000-8000-000000000036'::uuid, '00000000-0000-4000-8000-00000000004a'::uuid, '00000000-0000-4000-8000-000000000016'::uuid,  0, TIME '21:00:00',  5, 2, 'active'),
    ('00000000-0000-4000-8000-00000000005c'::uuid, '00000000-0000-4000-8000-000000000036'::uuid, '00000000-0000-4000-8000-00000000004b'::uuid, '00000000-0000-4000-8000-000000000016'::uuid,  0, TIME '19:00:00',  0, 0, 'active'),
    ('00000000-0000-4000-8000-00000000005d'::uuid, '00000000-0000-4000-8000-000000000034'::uuid, '00000000-0000-4000-8000-00000000004e'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, -1, TIME '13:00:00',  6, 0, 'active'),
    ('00000000-0000-4000-8000-00000000005e'::uuid, '00000000-0000-4000-8000-000000000036'::uuid, '00000000-0000-4000-8000-00000000004f'::uuid, '00000000-0000-4000-8000-000000000016'::uuid,  0, TIME '18:00:00',  8, 0, 'closed'),
    ('00000000-0000-4000-8000-00000000005f'::uuid, '00000000-0000-4000-8000-000000000032'::uuid, '00000000-0000-4000-8000-000000000050'::uuid, '00000000-0000-4000-8000-000000000012'::uuid,  0, TIME '17:00:00', 12, 0, 'active')
) AS v(id, store_id, menu_item_id, category_id, end_day_offset, pickup_end_time, stock, reserved_stock, status)
WHERE p.id = v.id;

UPDATE public.products AS p
SET
  store_id       = seed.store_id::uuid,
  menu_item_id   = ('00000000-0000-4000-8000-' || lpad((seed.product_number + 1000)::text, 12, '0'))::uuid,
  category_id    = seed.category_id::uuid,
  end_at         = (
    (
      (now() AT TIME ZONE 'Asia/Seoul')::date
      + seed.pickup_end_time
    ) AT TIME ZONE 'Asia/Seoul'
  ),
  stock          = 6 + (seed.offset_number % 8),
  reserved_stock = seed.offset_number % 4,
  status         = 'active'::product_status
FROM (
  SELECT
    ('00000000-0000-4000-8000-' || lpad(product_number::text, 12, '0'))::uuid AS id,
    store_id,
    product_number,
    product_number - start_number AS offset_number,
    (TIME '18:00:00' + ((product_number - start_number) % 6) * INTERVAL '1 hour')::time AS pickup_end_time,
    CASE
      WHEN product_number % 2 = 0 THEN primary_category_id
      ELSE secondary_category_id
    END AS category_id
  FROM (
    VALUES
      (60, 77, '00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000011'),
      (80, 97, '00000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000000014'),
      (100, 117, '00000000-0000-4000-8000-000000000034', '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000015'),
      (120, 137, '00000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000012'),
      (140, 157, '00000000-0000-4000-8000-000000000036', '00000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-000000000016')
  ) AS seed_range(start_number, end_number, store_id, primary_category_id, secondary_category_id)
  CROSS JOIN LATERAL generate_series(seed_range.start_number, seed_range.end_number) AS product_series(product_number)
) AS seed
WHERE p.id = seed.id;

COMMIT;
