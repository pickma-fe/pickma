-- ============================================================
-- T62: payment_events 테이블 생성 + confirm_payment RPC 갱신
-- ============================================================

-- 1. payment_events 테이블 생성
CREATE TABLE payment_events (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid        NOT NULL REFERENCES orders(id),
  order_number        text        NOT NULL,
  store_id            uuid        REFERENCES stores(id),
  payment_id          uuid        REFERENCES payments(id),
  event_type          text        NOT NULL,
  provider            text,
  provider_key        text,
  provider_event_type text,
  provider_event_id   text,
  payload             jsonb,
  status              text        NOT NULL DEFAULT 'pending',
  error_message       text,
  processed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- 2. webhook 중복 수신 방지 unique index
CREATE UNIQUE INDEX payment_events_provider_event_uniq
  ON payment_events (provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

-- 3. RLS 활성화 (별도 정책 없이 service_role bypass)
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. confirm_payment RPC 갱신 (7-arg → 8-arg + payment_events atomic INSERT)
-- ============================================================

-- 기존 7개 인자 함수 제거
DROP FUNCTION IF EXISTS confirm_payment(
  varchar, payment_provider, varchar, varchar, payment_method, text, int
);

CREATE OR REPLACE FUNCTION confirm_payment(
  p_order_number         varchar,
  p_provider             payment_provider,
  p_provider_payment_key varchar,
  p_provider_order_id    varchar,
  p_method               payment_method,
  p_method_detail        text,
  p_amount               int,
  p_pg_response          jsonb
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
  v_payment_id         uuid;
BEGIN
  SELECT * INTO v_order
    FROM orders
   WHERE order_number = p_order_number
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF v_order.status != 'processing' THEN
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

  INSERT INTO payments (
    order_id, provider, provider_payment_key, provider_order_id,
    method, method_detail, amount, status, paid_at, pg_response
  ) VALUES (
    v_order.id, p_provider, p_provider_payment_key, p_provider_order_id,
    p_method, p_method_detail, p_amount, 'paid', now(), p_pg_response
  )
  RETURNING id INTO v_payment_id;

  UPDATE orders
     SET status               = 'reserved',
         store_order_sequence = v_sequence,
         store_order_number   = v_store_order_number,
         pickup_number        = v_pickup_number
   WHERE id = v_order.id;

  INSERT INTO payment_events (
    order_id, order_number, store_id, payment_id,
    event_type, provider, provider_key, status, processed_at
  ) VALUES (
    v_order.id, p_order_number, v_order.store_id, v_payment_id,
    'payment_confirmed', p_provider::text, p_provider_payment_key,
    'processed', now()
  );

  RETURN QUERY SELECT true;
END;
$$;

REVOKE EXECUTE ON FUNCTION confirm_payment(
  varchar, payment_provider, varchar, varchar, payment_method, text, int, jsonb
) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION confirm_payment(
  varchar, payment_provider, varchar, varchar, payment_method, text, int, jsonb
) TO service_role;
