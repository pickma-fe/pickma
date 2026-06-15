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
