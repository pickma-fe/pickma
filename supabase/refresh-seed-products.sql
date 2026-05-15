-- Reset seed state: clear all orders/payments and restore products to seed defaults.
-- Run when seed products have expired or test data has accumulated:
--   supabase db query --linked --file supabase/refresh-seed-products.sql
--   npx supabase db query --linked --file supabase/refresh-seed-products.sql

-- 1. Clear test data (payments first due to RESTRICT FK, order_items cascade with orders)
DELETE FROM public.payments;
DELETE FROM public.orders;

-- 2. Restore seed products to original values
UPDATE public.products SET
  end_at         = NOW() + INTERVAL '3 hours',
  stock          = 8,
  reserved_stock = 2,
  status         = 'active'
WHERE id = '00000000-0000-4000-8000-000000000051';

UPDATE public.products SET
  end_at         = NOW() + INTERVAL '5 hours',
  stock          = 5,
  reserved_stock = 1,
  status         = 'active'
WHERE id = '00000000-0000-4000-8000-000000000052';

UPDATE public.products SET
  end_at         = NOW() + INTERVAL '2 hours',
  stock          = 10,
  reserved_stock = 0,
  status         = 'closed'
WHERE id = '00000000-0000-4000-8000-000000000053';

UPDATE public.products SET
  end_at         = NOW() + INTERVAL '4 hours',
  stock          = 10,
  reserved_stock = 0,
  status         = 'active'
WHERE id = '00000000-0000-4000-8000-000000000054';
