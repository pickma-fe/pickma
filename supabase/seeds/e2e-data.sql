-- E2E data seed — local Supabase Docker stack 전용
-- production / remote dev DB에는 절대 실행하지 않는다.
-- 실행: npx supabase db query --local --file supabase/seeds/e2e-data.sql
-- idempotent: cleanup → upsert 순서로 반복 실행 안전

-- ──────────────────────────────────────────────────────────────────
-- 1. consumer-order 전용 product 기준 동적 주문 cleanup
-- ──────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_consumer_product_id uuid := '00000000-0000-4000-8000-000000000e01';
BEGIN
  DELETE FROM payment_events
   WHERE order_id IN (
     SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE oi.product_id = v_consumer_product_id
   );

  DELETE FROM payments
   WHERE order_id IN (
     SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE oi.product_id = v_consumer_product_id
   );

  DELETE FROM orders
   WHERE id IN (
     SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE oi.product_id = v_consumer_product_id
   );
END $$;

-- ──────────────────────────────────────────────────────────────────
-- 2. E2E 전용 product upsert
-- ──────────────────────────────────────────────────────────────────

-- consumer-order 전용 product (pickup 00:30-23:30, end_at seed 시점 +2년)
INSERT INTO public.products (
  id, store_id, menu_item_id, category_id,
  original_price, discount_price,
  stock, reserved_stock,
  end_at, pickup_start_time, pickup_end_time,
  status
) VALUES (
  '00000000-0000-4000-8000-000000000e01',
  '00000000-0000-4000-8000-000000000031',
  '00000000-0000-4000-8000-000000000041',
  '00000000-0000-4000-8000-000000000011',
  12000, 7200,
  99, 0,
  NOW() + INTERVAL '2 years',
  '00:30:00', '23:30:00',
  'active'
)
ON CONFLICT (id) DO UPDATE
  SET stock          = 99,
      reserved_stock = 0,
      end_at         = NOW() + INTERVAL '2 years',
      pickup_start_time = '00:30:00',
      pickup_end_time   = '23:30:00',
      status            = 'active',
      updated_at        = now();

-- seller-orders 전용 product (consumer-order와 별도 product)
INSERT INTO public.products (
  id, store_id, menu_item_id, category_id,
  original_price, discount_price,
  stock, reserved_stock,
  end_at, pickup_start_time, pickup_end_time,
  status
) VALUES (
  '00000000-0000-4000-8000-000000000e02',
  '00000000-0000-4000-8000-000000000031',
  '00000000-0000-4000-8000-000000000042',
  '00000000-0000-4000-8000-000000000011',
  9000, 5400,
  10, 1,
  ('2099-12-31 22:00:00+09'),
  '10:00:00', '22:00:00',
  'active'
)
ON CONFLICT (id) DO UPDATE
  SET updated_at = now();

-- ──────────────────────────────────────────────────────────────────
-- 3. seller-orders 전용 deterministic reserved 주문 seed
-- ──────────────────────────────────────────────────────────────────

-- store_order_sequences: 2099-12-31, sequence 1
INSERT INTO public.store_order_sequences (store_id, pickup_service_date, last_sequence)
VALUES (
  '00000000-0000-4000-8000-000000000031',
  '2099-12-31',
  1
)
ON CONFLICT (store_id, pickup_service_date) DO UPDATE
  SET last_sequence = GREATEST(store_order_sequences.last_sequence, 1),
      updated_at    = now();

-- order
INSERT INTO public.orders (
  id, order_number,
  user_id, store_id,
  total_amount, discount_amount, payment_amount,
  status,
  pickup_at, pickup_service_date,
  store_order_sequence, store_order_number, pickup_number
) VALUES (
  '00000000-0000-4000-8000-000000000f01',
  'PM20991231E2E0000001',
  '00000000-0000-4000-8000-000000000024',
  '00000000-0000-4000-8000-000000000031',
  9000, 3600, 5400,
  'reserved',
  '2099-12-31 14:00:00+09', '2099-12-31',
  1, '20991231-0000001', 'A-01'
)
ON CONFLICT (id) DO NOTHING;

-- order_items
INSERT INTO public.order_items (
  id, order_id, product_id,
  product_name, original_price, discount_price,
  quantity, subtotal
) VALUES (
  '00000000-0000-4000-8000-000000000f02',
  '00000000-0000-4000-8000-000000000f01',
  '00000000-0000-4000-8000-000000000e02',
  'E2E 판매자 주문 테스트 상품',
  9000, 5400,
  1, 5400
)
ON CONFLICT (id) DO NOTHING;

-- payment
INSERT INTO public.payments (
  id, order_id,
  payment_key, provider_order_id,
  method, amount, status, paid_at
) VALUES (
  '00000000-0000-4000-8000-000000000f03',
  '00000000-0000-4000-8000-000000000f01',
  'mock_pk_e2e_seller_001', 'mock_po_e2e_seller_001',
  'card', 5400, 'paid', now()
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- 4. admin-approval 전용 pending 신청자 seed
-- ──────────────────────────────────────────────────────────────────

-- 신청자 auth.users (로그인 불가 — encrypted_password 비워둠)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000030',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'e2e-pending-seller@pickma-seed.local', '',
  now(),
  '{"provider":"email","providers":["email"]}', '{}',
  now(), now()
)
ON CONFLICT (id) DO NOTHING;

-- 신청자 public.users
INSERT INTO public.users (id, email, name, role, status)
VALUES (
  '00000000-0000-4000-8000-000000000030',
  'e2e-pending-seller@pickma-seed.local',
  'E2E 신청자',
  'customer', 'active'
)
ON CONFLICT (id) DO NOTHING;

-- seller_application
INSERT INTO public.seller_applications (
  id, user_id, status,
  business_number, company_name, representative_name,
  business_address, business_type, business_category
) VALUES (
  '00000000-0000-4000-8000-000000000a01',
  '00000000-0000-4000-8000-000000000030',
  'pending',
  '9999999999', 'E2E 테스트 매장', 'E2E 대표자',
  '서울시 마포구 테스트로 1', '일반', '식품'
)
ON CONFLICT (id) DO NOTHING;

-- seller_application_documents
INSERT INTO public.seller_application_documents (
  id, application_id, type,
  storage_path, original_file_name, content_type, size
) VALUES
  (
    '00000000-0000-4000-8000-000000000b01',
    '00000000-0000-4000-8000-000000000a01',
    'business_license',
    'e2e/test-business-license.pdf', 'business_license.pdf', 'application/pdf', 1024
  ),
  (
    '00000000-0000-4000-8000-000000000b02',
    '00000000-0000-4000-8000-000000000a01',
    'food_service_permit',
    'e2e/test-food-service-permit.pdf', 'food_service_permit.pdf', 'application/pdf', 1024
  ),
  (
    '00000000-0000-4000-8000-000000000b03',
    '00000000-0000-4000-8000-000000000a01',
    'bank_account',
    'e2e/test-bank-account.pdf', 'bank_account.pdf', 'application/pdf', 1024
  )
ON CONFLICT (id) DO NOTHING;
