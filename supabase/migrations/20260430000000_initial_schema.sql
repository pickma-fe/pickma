-- ============================================================
-- PickMa Initial Schema
-- DO NOT EDIT generated types (src/lib/supabase/database.ts) directly.
-- Re-run: npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.ts
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Enum types
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE store_status AS ENUM ('pending', 'approved', 'rejected', 'inactive');
CREATE TYPE product_status AS ENUM ('active', 'closed');
CREATE TYPE order_status AS ENUM (
  'payment_pending',
  'reserved',
  'ready',
  'completed',
  'cancelled',
  'no_show',
  'expired'
);
CREATE TYPE payment_method AS ENUM ('card', 'virtual_account', 'mobile', 'easy_pay');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');
CREATE TYPE social_provider AS ENUM ('google', 'kakao');

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE categories (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         varchar(50)  UNIQUE NOT NULL,
  icon         varchar(50),
  sort_order   int          NOT NULL DEFAULT 0,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

-- users references auth.users (Supabase Auth)
CREATE TABLE users (
  id              uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           varchar(255) UNIQUE NOT NULL,
  name            varchar(100) NOT NULL,
  phone           varchar(20),
  profile_image   varchar(500),
  role            user_role    NOT NULL DEFAULT 'customer',
  status          user_status  NOT NULL DEFAULT 'active',
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE social_accounts (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider     social_provider NOT NULL,
  provider_id  varchar(255)   NOT NULL,
  created_at   timestamptz    NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_id)
);

CREATE TABLE stores (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid          UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name             varchar(100)  NOT NULL,
  description      text,
  business_number  varchar(20)   UNIQUE NOT NULL,
  phone            varchar(20)   NOT NULL,
  address          varchar(255)  NOT NULL,
  address_detail   varchar(255),
  region           varchar(50)   NOT NULL,
  image            varchar(500),
  open_time        timestamptz,
  close_time       timestamptz,
  status           store_status  NOT NULL DEFAULT 'pending',
  reject_reason    varchar(500),
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE menu_items (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid          NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id     uuid          REFERENCES categories(id) ON DELETE SET NULL,
  name            varchar(100)  NOT NULL,
  description     text,
  image           varchar(500),
  original_price  int           NOT NULL,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id                uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid            NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  menu_item_id      uuid            NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  category_id       uuid            REFERENCES categories(id) ON DELETE SET NULL,
  discount_price    int             NOT NULL,
  stock             int             NOT NULL DEFAULT 0,
  reserved_stock    int             NOT NULL DEFAULT 0,
  end_at            timestamptz     NOT NULL,
  pickup_start_time timestamptz     NOT NULL,
  pickup_end_time   timestamptz     NOT NULL,
  status            product_status  NOT NULL DEFAULT 'active',
  created_at        timestamptz     NOT NULL DEFAULT now(),
  updated_at        timestamptz     NOT NULL DEFAULT now(),
  CONSTRAINT check_stock_non_negative          CHECK (stock >= 0),
  CONSTRAINT check_reserved_stock_non_negative CHECK (reserved_stock >= 0),
  CONSTRAINT check_stock_gte_reserved          CHECK (stock >= reserved_stock)
);

-- order_number: 'PM' + YYYYMMDD(Seoul) + 10-char uppercase HEX, length 20
-- store_order_sequence / store_order_number / pickup_number: NULL until payment confirmed
CREATE TABLE orders (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number          varchar(20)   UNIQUE NOT NULL,
  user_id               uuid          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  store_id              uuid          NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  total_amount          int           NOT NULL,
  discount_amount       int           NOT NULL,
  payment_amount        int           NOT NULL,
  status                order_status  NOT NULL DEFAULT 'payment_pending',
  pickup_at             timestamptz   NOT NULL,
  pickup_service_date   date          NOT NULL,
  store_order_sequence  int,
  store_order_number    varchar(16),
  pickup_number         varchar(4),
  expires_at            timestamptz,
  picked_up_at          timestamptz,
  cancelled_at          timestamptz,
  cancel_reason         varchar(500),
  created_at            timestamptz   NOT NULL DEFAULT now(),
  updated_at            timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      uuid          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name    varchar(100)  NOT NULL,
  original_price  int           NOT NULL,
  discount_price  int           NOT NULL,
  quantity        int           NOT NULL,
  subtotal        int           NOT NULL,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id             uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid            UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  payment_key    varchar(200)    UNIQUE,
  method         payment_method  NOT NULL,
  amount         int             NOT NULL,
  status         payment_status  NOT NULL,
  paid_at        timestamptz,
  refunded_at    timestamptz,
  refund_reason  varchar(500),
  pg_response    jsonb,
  created_at     timestamptz     NOT NULL DEFAULT now(),
  updated_at     timestamptz     NOT NULL DEFAULT now()
);

CREATE TABLE wishlists (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id    uuid         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, store_id)
);

-- Sequence counter per (store, pickup_service_date) for store_order_number / pickup_number
CREATE TABLE store_order_sequences (
  store_id              uuid   NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  pickup_service_date   date   NOT NULL,
  last_sequence         int    NOT NULL DEFAULT 0,
  created_at            timestamptz  NOT NULL DEFAULT now(),
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, pickup_service_date),
  CONSTRAINT check_last_sequence_non_negative CHECK (last_sequence >= 0)
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_users_email
  ON users(email);

CREATE INDEX idx_stores_region_status
  ON stores(region, status);

CREATE INDEX idx_products_store_status_end
  ON products(store_id, status, end_at);

CREATE INDEX idx_orders_user_store_created
  ON orders(user_id, store_id, created_at);

CREATE INDEX idx_orders_store_pickup_sequence
  ON orders(store_id, pickup_service_date, store_order_sequence);

-- Partial unique indexes: sequence/numbers are only unique when assigned
CREATE UNIQUE INDEX idx_orders_unique_store_pickup_seq
  ON orders(store_id, pickup_service_date, store_order_sequence)
  WHERE store_order_sequence IS NOT NULL;

CREATE UNIQUE INDEX idx_orders_unique_store_pickup_order_number
  ON orders(store_id, pickup_service_date, store_order_number)
  WHERE store_order_number IS NOT NULL;

CREATE UNIQUE INDEX idx_orders_unique_store_pickup_number
  ON orders(store_id, pickup_service_date, pickup_number)
  WHERE pickup_number IS NOT NULL;

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_store_order_sequences_updated_at
  BEFORE UPDATE ON store_order_sequences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- categories and menu_items: RLS NOT enabled (always accessed via service_role through Route Handler)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users: self select"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: self update"
  ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores: public read approved"
  ON stores FOR SELECT USING (status = 'approved');
CREATE POLICY "stores: owner read"
  ON stores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stores: owner insert"
  ON stores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stores: owner update"
  ON stores FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products: public read active"
  ON products FOR SELECT USING (status = 'active');
CREATE POLICY "products: owner all"
  ON products USING (
    auth.uid() = (SELECT user_id FROM stores WHERE id = store_id)
  );

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders: buyer read"
  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders: seller read"
  ON orders FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM stores WHERE id = store_id)
  );

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlists: owner all"
  ON wishlists USING (auth.uid() = user_id);

-- ============================================================
-- RPC helpers
-- ============================================================

-- Generates a unique order_number: 'PM' + YYYYMMDD(Seoul) + 10-char uppercase HEX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS varchar
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order_number varchar(20);
  v_exists       boolean;
BEGIN
  LOOP
    v_order_number :=
      'PM'
      || to_char(now() AT TIME ZONE 'Asia/Seoul', 'YYYYMMDD')
      || upper(encode(gen_random_bytes(5), 'hex'));

    SELECT EXISTS (SELECT 1 FROM orders WHERE order_number = v_order_number)
      INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_order_number;
END;
$$;

-- Converts a 1-based sequence (1–2574) into a pickup_number like 'A-01'...'Z-99'
CREATE OR REPLACE FUNCTION sequence_to_pickup_number(seq int)
RETURNS varchar
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_letter_index int;
  v_num          int;
BEGIN
  v_letter_index := (seq - 1) / 99;           -- 0 = A, 1 = B, ..., 25 = Z
  v_num          := ((seq - 1) % 99) + 1;     -- 1–99
  RETURN chr(65 + v_letter_index) || '-' || lpad(v_num::text, 2, '0');
END;
$$;

-- ============================================================
-- RPC 1: create_order
-- Role: atomic order creation + reserved_stock increment
-- Input: p_user_id, p_items [{product_id, quantity}], p_pickup_at, p_expires_at
-- Output: order_id, order_number, payment_amount
-- ============================================================

REVOKE EXECUTE ON FUNCTION generate_order_number() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION sequence_to_pickup_number(int) FROM PUBLIC;

CREATE OR REPLACE FUNCTION create_order(
  p_user_id    uuid,
  p_items      jsonb,
  p_pickup_at  timestamptz,
  p_expires_at timestamptz
)
RETURNS TABLE(order_id uuid, order_number varchar, payment_amount int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item                jsonb;
  v_product_id          uuid;
  v_quantity            int;
  v_product             RECORD;
  v_store_id            uuid;
  v_total_amount        int := 0;
  v_payment_amount      int := 0;
  v_discount_amount     int := 0;
  v_order_id            uuid;
  v_order_number        varchar(20);
  v_pickup_service_date date;
  v_max_retries         int := 5;
  v_retry               int := 0;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ITEMS';
  END IF;

  IF (SELECT COUNT(DISTINCT elem->>'product_id') FROM jsonb_array_elements(p_items) elem)
      != jsonb_array_length(p_items) THEN
    RAISE EXCEPTION 'DUPLICATE_PRODUCT_IN_ORDER';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity   := (v_item->>'quantity')::int;

    IF v_product_id IS NULL OR v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_ITEM_FORMAT';
    END IF;

    SELECT p.id, p.store_id, p.discount_price, p.stock, p.reserved_stock,
           p.status, p.end_at, p.pickup_start_time, p.pickup_end_time,
           mi.name AS product_name, mi.original_price
      INTO v_product
      FROM products p
      JOIN menu_items mi ON mi.id = p.menu_item_id
     WHERE p.id = v_product_id
       FOR UPDATE OF p;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
    END IF;

    IF v_product.status != 'active' THEN
      RAISE EXCEPTION 'PRODUCT_NOT_AVAILABLE';
    END IF;

    IF v_product.end_at <= now() THEN
      RAISE EXCEPTION 'PRODUCT_EXPIRED';
    END IF;

    IF v_product.stock - v_product.reserved_stock < v_quantity THEN
      RAISE EXCEPTION 'OUT_OF_STOCK';
    END IF;

    IF p_pickup_at < v_product.pickup_start_time OR p_pickup_at > v_product.pickup_end_time THEN
      RAISE EXCEPTION 'INVALID_PICKUP_TIME';
    END IF;

    IF v_store_id IS NULL THEN
      v_store_id := v_product.store_id;
    ELSIF v_store_id != v_product.store_id THEN
      RAISE EXCEPTION 'MULTIPLE_STORES_NOT_ALLOWED';
    END IF;

    UPDATE products
       SET reserved_stock = reserved_stock + v_quantity
     WHERE id = v_product_id;

    v_total_amount   := v_total_amount   + (v_product.original_price * v_quantity);
    v_payment_amount := v_payment_amount + (v_product.discount_price  * v_quantity);
  END LOOP;

  v_discount_amount     := v_total_amount - v_payment_amount;
  v_pickup_service_date := (p_pickup_at AT TIME ZONE 'Asia/Seoul')::date;

  LOOP
    v_order_number := generate_order_number();
    BEGIN
      INSERT INTO orders (
        order_number, user_id, store_id,
        total_amount, discount_amount, payment_amount,
        status, pickup_at, pickup_service_date, expires_at
      ) VALUES (
        v_order_number, p_user_id, v_store_id,
        v_total_amount, v_discount_amount, v_payment_amount,
        'payment_pending', p_pickup_at, v_pickup_service_date, p_expires_at
      ) RETURNING id INTO v_order_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      v_retry := v_retry + 1;
      IF v_retry >= v_max_retries THEN
        RAISE EXCEPTION 'ORDER_NUMBER_EXHAUSTED';
      END IF;
    END;
  END LOOP;

  INSERT INTO order_items (
    order_id, product_id, product_name,
    original_price, discount_price, quantity, subtotal
  )
  SELECT
    v_order_id,
    (elem->>'product_id')::uuid,
    mi.name,
    mi.original_price,
    p.discount_price,
    (elem->>'quantity')::int,
    p.discount_price * (elem->>'quantity')::int
  FROM jsonb_array_elements(p_items) AS elem
  JOIN products   p  ON p.id  = (elem->>'product_id')::uuid
  JOIN menu_items mi ON mi.id = p.menu_item_id;

  RETURN QUERY SELECT v_order_id, v_order_number, v_payment_amount;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_order(uuid, jsonb, timestamptz, timestamptz) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION create_order(uuid, jsonb, timestamptz, timestamptz) TO service_role;

-- ============================================================
-- RPC 2: check_pickup_capacity
-- Role: pre-check pickup number availability before PG approval (advisory, not final)
-- Input: p_order_number (= PG orderId)
-- Output: available, remaining_count
-- ============================================================

CREATE OR REPLACE FUNCTION check_pickup_capacity(
  p_order_number varchar
)
RETURNS TABLE(available boolean, remaining_count int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id            uuid;
  v_pickup_service_date date;
  v_last_sequence       int;
BEGIN
  SELECT o.store_id, o.pickup_service_date
    INTO v_store_id, v_pickup_service_date
    FROM orders o
   WHERE o.order_number = p_order_number
     AND o.status = 'payment_pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  SELECT COALESCE(
    (SELECT last_sequence
       FROM store_order_sequences
      WHERE store_id = v_store_id
        AND pickup_service_date = v_pickup_service_date),
    0
  ) INTO v_last_sequence;

  RETURN QUERY SELECT
    (v_last_sequence < 2574),
    GREATEST(2574 - v_last_sequence, 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION check_pickup_capacity(varchar) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION check_pickup_capacity(varchar) TO service_role;

-- ============================================================
-- RPC 3: confirm_payment
-- Role: atomic payment confirmation + stock finalization + sequence/number issuance
-- Input: p_order_number, p_payment_key, p_method, p_amount
-- Output: success
-- Note: p_method must be mapped from PG response by Route Handler service before calling
-- ============================================================

CREATE OR REPLACE FUNCTION confirm_payment(
  p_order_number varchar,
  p_payment_key  varchar,
  p_method       payment_method,
  p_amount       int
)
RETURNS TABLE(success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order              orders%ROWTYPE;
  v_sequence           int;
  v_store_order_number varchar(16);
  v_pickup_number      varchar(4);
BEGIN
  SELECT * INTO v_order
    FROM orders
   WHERE order_number = p_order_number
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF v_order.status != 'payment_pending' THEN
    RAISE EXCEPTION 'INVALID_ORDER_STATUS';
  END IF;

  IF v_order.expires_at IS NOT NULL AND v_order.expires_at <= now() THEN
    RAISE EXCEPTION 'ORDER_EXPIRED';
  END IF;

  IF v_order.payment_amount != p_amount THEN
    RAISE EXCEPTION 'PAYMENT_AMOUNT_MISMATCH';
  END IF;

  -- Atomically increment sequence counter
  INSERT INTO store_order_sequences (store_id, pickup_service_date, last_sequence)
    VALUES (v_order.store_id, v_order.pickup_service_date, 1)
    ON CONFLICT (store_id, pickup_service_date)
    DO UPDATE SET last_sequence = store_order_sequences.last_sequence + 1
    RETURNING last_sequence INTO v_sequence;

  IF v_sequence > 2574 THEN
    RAISE EXCEPTION 'PICKUP_NUMBER_EXHAUSTED';
  END IF;

  v_store_order_number :=
    to_char(v_order.pickup_service_date, 'YYYYMMDD')
    || '-' || lpad(v_sequence::text, 7, '0');

  v_pickup_number := sequence_to_pickup_number(v_sequence);

  -- Finalize stock: stock -= quantity, reserved_stock -= quantity
  UPDATE products p
     SET stock          = p.stock          - oi.quantity,
         reserved_stock = p.reserved_stock - oi.quantity
    FROM order_items oi
   WHERE oi.order_id = v_order.id
     AND p.id = oi.product_id;

  INSERT INTO payments (order_id, payment_key, method, amount, status, paid_at)
    VALUES (v_order.id, p_payment_key, p_method, p_amount, 'paid', now());

  UPDATE orders
     SET status               = 'reserved',
         store_order_sequence = v_sequence,
         store_order_number   = v_store_order_number,
         pickup_number        = v_pickup_number
   WHERE id = v_order.id;

  RETURN QUERY SELECT true;
END;
$$;

REVOKE EXECUTE ON FUNCTION confirm_payment(varchar, varchar, payment_method, int) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION confirm_payment(varchar, varchar, payment_method, int) TO service_role;

-- ============================================================
-- RPC 4: expire_order
-- Role: lazy expiry cleanup — sets status=expired and restores reserved_stock
-- Input: p_order_id (internal orders.id)
-- Output: success
-- ============================================================

CREATE OR REPLACE FUNCTION expire_order(
  p_order_id uuid
)
RETURNS TABLE(success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order
    FROM orders
   WHERE id = p_order_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF v_order.status != 'payment_pending' THEN
    RAISE EXCEPTION 'INVALID_ORDER_STATUS';
  END IF;

  IF v_order.expires_at IS NULL OR v_order.expires_at > now() THEN
    RAISE EXCEPTION 'ORDER_NOT_EXPIRED';
  END IF;

  -- Restore reserved stock
  UPDATE products p
     SET reserved_stock = p.reserved_stock - oi.quantity
    FROM order_items oi
   WHERE oi.order_id = v_order.id
     AND p.id = oi.product_id;

  UPDATE orders SET status = 'expired' WHERE id = v_order.id;

  RETURN QUERY SELECT true;
END;
$$;

REVOKE EXECUTE ON FUNCTION expire_order(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION expire_order(uuid) TO service_role;

-- ============================================================
-- RPC 5: cancel_order (contract only — SQL implementation in Phase 6)
-- Role: user-initiated order cancellation + reserved stock restoration
-- Input: p_order_id, p_reason
-- Output: success
-- Note: Cancellation conditions and refund flow are defined in Phase 6/7.
--       Issued store_order_sequence / store_order_number / pickup_number are NOT reclaimed.
-- ============================================================

CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id uuid,
  p_reason   varchar
)
RETURNS TABLE(success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'NOT_IMPLEMENTED: cancel_order SQL is scheduled for Phase 6';
END;
$$;

REVOKE EXECUTE ON FUNCTION cancel_order(uuid, varchar) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION cancel_order(uuid, varchar) TO service_role;
