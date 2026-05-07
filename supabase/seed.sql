-- ===========================================
-- PickMa Seed Data
-- For local development and testing
-- ===========================================

-- Categories
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000011', '베이커리',  'bread',  1),
  ('00000000-0000-0000-0000-000000000012', '카페/음료', 'coffee', 2),
  ('00000000-0000-0000-0000-000000000013', '도시락',    'box',    3),
  ('00000000-0000-0000-0000-000000000014', '샐러드',    'salad',  4),
  ('00000000-0000-0000-0000-000000000015', '분식',      'food',   5);

-- Store owner accounts
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000021',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'seller1@pickma-seed.local', '',
   now(), '{"provider":"email","providers":["email"]}', '{}',
   now(), now()),
  ('00000000-0000-0000-0000-000000000022',
   '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'seller2@pickma-seed.local', '',
   now(), '{"provider":"email","providers":["email"]}', '{}',
   now(), now());

INSERT INTO public.users (id, email, name, role, status) VALUES
  ('00000000-0000-0000-0000-000000000021', 'seller1@pickma-seed.local', '씨드 판매자1', 'seller', 'active'),
  ('00000000-0000-0000-0000-000000000022', 'seller2@pickma-seed.local', '씨드 판매자2', 'seller', 'active');

-- Stores: 1 approved, 1 inactive (RLS 검증용)
INSERT INTO public.stores (id, user_id, name, description, business_number, phone, address, address_detail, region, status) VALUES
  ('00000000-0000-0000-0000-000000000031',
   '00000000-0000-0000-0000-000000000021',
   '픽마 베이커리', '매일 아침 굽는 동네 베이커리입니다.',
   '1234567890', '02-1234-5678',
   '서울시 마포구 월드컵북로 12', '1층',
   '서울 마포구', 'approved'),
  ('00000000-0000-0000-0000-000000000032',
   '00000000-0000-0000-0000-000000000022',
   '비활성 카페', '비활성 상태의 테스트 카페입니다.',
   '0987654321', '02-9876-5432',
   '서울시 서초구 강남대로 100', NULL,
   '서울 서초구', 'inactive');

-- Menu items
INSERT INTO public.menu_items (id, store_id, category_id, name, description, original_price) VALUES
  ('00000000-0000-0000-0000-000000000041',
   '00000000-0000-0000-0000-000000000031',
   '00000000-0000-0000-0000-000000000011',
   '마감 할인 크루아상 세트',
   '당일 생산 후 남은 크루아상과 페이스트리를 담은 세트입니다.',
   12000),
  ('00000000-0000-0000-0000-000000000042',
   '00000000-0000-0000-0000-000000000031',
   '00000000-0000-0000-0000-000000000011',
   '페이스트리 박스',
   '갓 구운 페이스트리 모음 박스입니다.',
   9000),
  ('00000000-0000-0000-0000-000000000043',
   '00000000-0000-0000-0000-000000000032',
   '00000000-0000-0000-0000-000000000012',
   '아메리카노 세트',
   '아메리카노 2잔 세트입니다.',
   8000);

-- Products
-- 공개 조건 충족: active + approved store → GET /api/products 에 노출
INSERT INTO public.products (id, store_id, menu_item_id, category_id, discount_price, stock, reserved_stock, end_at, pickup_start_time, pickup_end_time, status) VALUES
  ('00000000-0000-0000-0000-000000000051',
   '00000000-0000-0000-0000-000000000031',
   '00000000-0000-0000-0000-000000000041',
   '00000000-0000-0000-0000-000000000011',
   7200, 8, 2,
   NOW() + INTERVAL '3 hours',
   '10:00:00', '13:30:00',
   'active'),
  ('00000000-0000-0000-0000-000000000052',
   '00000000-0000-0000-0000-000000000031',
   '00000000-0000-0000-0000-000000000042',
   '00000000-0000-0000-0000-000000000011',
   5400, 5, 1,
   NOW() + INTERVAL '5 hours',
   '11:00:00', '15:00:00',
   'active'),
  -- closed 상품 (approved store) — 공개 목록 미노출 검증
  ('00000000-0000-0000-0000-000000000053',
   '00000000-0000-0000-0000-000000000031',
   '00000000-0000-0000-0000-000000000041',
   '00000000-0000-0000-0000-000000000011',
   6000, 10, 0,
   NOW() + INTERVAL '2 hours',
   '09:00:00', '12:00:00',
   'closed'),
  -- active 상품 (inactive store) — 공개 목록 미노출 검증
  ('00000000-0000-0000-0000-000000000054',
   '00000000-0000-0000-0000-000000000032',
   '00000000-0000-0000-0000-000000000043',
   '00000000-0000-0000-0000-000000000012',
   4800, 10, 0,
   NOW() + INTERVAL '4 hours',
   '12:00:00', '16:00:00',
   'active');
