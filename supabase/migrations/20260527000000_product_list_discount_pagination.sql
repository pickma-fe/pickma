-- ============================================================
-- Public product list RPC
-- Role: keep DB-level filtering/sorting/pagination for computed discount rate
-- ============================================================

CREATE OR REPLACE FUNCTION list_public_products(
  p_page int DEFAULT 1,
  p_page_size int DEFAULT 20,
  p_region text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_keyword text DEFAULT NULL,
  p_discount_option text DEFAULT NULL,
  p_sort text DEFAULT 'endAt',
  p_order text DEFAULT 'asc',
  p_available_only boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH filtered AS (
  SELECT
    p.id,
    p.store_id,
    p.menu_item_id,
    p.category_id,
    c.name AS category_name,
    p.discount_price,
    p.stock,
    p.reserved_stock,
    p.end_at,
    p.pickup_start_time,
    p.pickup_end_time,
    p.status,
    p.updated_at,
    mi.name,
    mi.image,
    mi.original_price,
    s.name AS store_name,
    ROUND((1 - (p.discount_price::numeric / NULLIF(mi.original_price, 0))) * 100)::int AS discount_rate,
    (p.stock - p.reserved_stock) AS available_stock,
    ((p.stock - p.reserved_stock) <= 0) AS is_sold_out,
    (p.end_at <= now()) AS is_expired
  FROM products p
  JOIN menu_items mi ON mi.id = p.menu_item_id
  LEFT JOIN categories c ON c.id = p.category_id
  JOIN stores s ON s.id = p.store_id
  WHERE p.status = 'active'
    AND s.status = 'approved'
    AND (p_region IS NULL OR s.region = p_region)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_keyword IS NULL OR mi.name ILIKE '%' || replace(replace(p_keyword, '%', '\%'), '_', '\_') || '%' ESCAPE '\')
    AND (NOT p_available_only OR p.end_at > now())
),
discount_filtered AS (
  SELECT *
  FROM filtered
  WHERE COALESCE(p_discount_option, 'all') = 'all'
     OR (p_discount_option = 'over-40' AND discount_rate >= 40)
     OR (p_discount_option = '30-to-40' AND discount_rate >= 30 AND discount_rate < 40)
     OR (p_discount_option = '20-to-30' AND discount_rate >= 20 AND discount_rate < 30)
     OR (p_discount_option = 'under-20' AND discount_rate < 20)
),
counted AS (
  SELECT COUNT(*)::int AS total_count
  FROM discount_filtered
),
paged AS (
  SELECT *
  FROM discount_filtered
  ORDER BY
    CASE WHEN p_sort = 'discountRate' AND p_order = 'asc' THEN discount_rate END ASC NULLS LAST,
    CASE WHEN p_sort = 'discountRate' AND p_order = 'desc' THEN discount_rate END DESC NULLS LAST,
    CASE WHEN p_sort = 'discountPrice' AND p_order = 'asc' THEN discount_price END ASC NULLS LAST,
    CASE WHEN p_sort = 'discountPrice' AND p_order = 'desc' THEN discount_price END DESC NULLS LAST,
    CASE WHEN COALESCE(p_sort, 'endAt') = 'endAt' AND p_order = 'desc' THEN end_at END DESC NULLS LAST,
    CASE WHEN COALESCE(p_sort, 'endAt') = 'endAt' AND COALESCE(p_order, 'asc') = 'asc' THEN end_at END ASC NULLS LAST,
    id ASC
  LIMIT GREATEST(p_page_size, 1)
  OFFSET (GREATEST(p_page, 1) - 1) * GREATEST(p_page_size, 1)
)
SELECT jsonb_build_object(
  'items',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_strip_nulls(jsonb_build_object(
          'id', id,
          'storeId', store_id,
          'storeName', store_name,
          'categoryId', category_id,
          'categoryName', category_name,
          'menuItemId', menu_item_id,
          'name', name,
          'image', image,
          'originalPrice', original_price,
          'discountPrice', discount_price,
          'discountRate', discount_rate,
          'stock', stock,
          'reservedStock', reserved_stock,
          'availableStock', available_stock,
          'isSoldOut', is_sold_out,
          'isExpired', is_expired,
          'displayStatus',
            CASE
              WHEN status = 'closed' THEN 'closed'
              WHEN is_expired THEN 'expired'
              WHEN is_sold_out THEN 'soldOut'
              ELSE 'available'
            END,
          'endAt', end_at,
          'pickupStartTime', pickup_start_time,
          'pickupEndTime', pickup_end_time,
          'status', status,
          'updatedAt', updated_at
        ))
        ORDER BY
          CASE WHEN p_sort = 'discountRate' AND p_order = 'asc' THEN discount_rate END ASC NULLS LAST,
          CASE WHEN p_sort = 'discountRate' AND p_order = 'desc' THEN discount_rate END DESC NULLS LAST,
          CASE WHEN p_sort = 'discountPrice' AND p_order = 'asc' THEN discount_price END ASC NULLS LAST,
          CASE WHEN p_sort = 'discountPrice' AND p_order = 'desc' THEN discount_price END DESC NULLS LAST,
          CASE WHEN COALESCE(p_sort, 'endAt') = 'endAt' AND p_order = 'desc' THEN end_at END DESC NULLS LAST,
          CASE WHEN COALESCE(p_sort, 'endAt') = 'endAt' AND COALESCE(p_order, 'asc') = 'asc' THEN end_at END ASC NULLS LAST,
          id ASC
      )
      FROM paged
    ),
    '[]'::jsonb
  ),
  'page', GREATEST(p_page, 1),
  'pageSize', GREATEST(p_page_size, 1),
  'totalCount', (SELECT total_count FROM counted),
  'totalPages', CEIL((SELECT total_count FROM counted)::numeric / GREATEST(p_page_size, 1))::int
);
$$;

REVOKE EXECUTE ON FUNCTION list_public_products(int, int, text, uuid, text, text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION list_public_products(int, int, text, uuid, text, text, text, text, boolean) TO anon, authenticated, service_role;
