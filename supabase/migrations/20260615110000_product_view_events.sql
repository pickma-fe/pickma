CREATE TABLE product_view_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_view_events_user_viewed_at
  ON product_view_events(user_id, viewed_at DESC);

CREATE INDEX idx_product_view_events_user_product_viewed_at
  ON product_view_events(user_id, product_id, viewed_at DESC);

CREATE OR REPLACE FUNCTION record_product_view(
  p_user_id uuid,
  p_product_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id uuid;
  v_category_id uuid;
  v_latest_viewed_at timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text), hashtext(p_product_id::text));

  SELECT p.store_id, p.category_id
    INTO v_store_id, v_category_id
  FROM products p
  JOIN stores s ON s.id = p.store_id
  WHERE p.id = p_product_id
    AND p.status = 'active'
    AND s.status = 'active'
    AND s.operation_status = 'open';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
  END IF;

  SELECT viewed_at
    INTO v_latest_viewed_at
  FROM product_view_events
  WHERE user_id = p_user_id
    AND product_id = p_product_id
  ORDER BY viewed_at DESC
  LIMIT 1;

  IF v_latest_viewed_at IS NOT NULL
     AND v_latest_viewed_at >= now() - interval '30 minutes' THEN
    RETURN false;
  END IF;

  INSERT INTO product_view_events (
    user_id,
    product_id,
    store_id,
    category_id
  ) VALUES (
    p_user_id,
    p_product_id,
    v_store_id,
    v_category_id
  );

  RETURN true;
END;
$$;

GRANT ALL ON public.product_view_events TO service_role;
REVOKE EXECUTE ON FUNCTION record_product_view(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_product_view(uuid, uuid) TO service_role;

ALTER TABLE product_view_events ENABLE ROW LEVEL SECURITY;
