-- create_order RPC: products.original_price snapshot 기준으로 교체
-- T05에서 products.original_price(상품 등록 시점 고정값)가 추가되었으므로
-- menu_items.original_price(변경 가능) 대신 p.original_price를 사용한다.

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
           mi.name AS product_name, p.original_price
      INTO v_product
      FROM products p
      JOIN menu_items mi ON mi.id = p.menu_item_id
      JOIN stores s ON s.id = p.store_id AND s.status = 'approved'
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

    IF (p_pickup_at AT TIME ZONE 'Asia/Seoul')::time < v_product.pickup_start_time OR
       (p_pickup_at AT TIME ZONE 'Asia/Seoul')::time > v_product.pickup_end_time THEN
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
    p.original_price,
    p.discount_price,
    (elem->>'quantity')::int,
    p.discount_price * (elem->>'quantity')::int
  FROM jsonb_array_elements(p_items) AS elem
  JOIN products   p  ON p.id  = (elem->>'product_id')::uuid
  JOIN menu_items mi ON mi.id = p.menu_item_id;

  RETURN QUERY SELECT v_order_id, v_order_number, v_payment_amount;
END;
$$;
