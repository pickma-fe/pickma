-- Haversine 거리 계산 함수 + 거리 기반 상품 목록 RPC (T21)

-- 두 위경도 사이의 거리를 km 단위로 반환하는 Haversine 함수
CREATE OR REPLACE FUNCTION haversine_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 6371.0 * 2 * ASIN(
    SQRT(
      POWER(SIN(RADIANS(lat2 - lat1) / 2), 2)
      + COS(RADIANS(lat1)) * COS(RADIANS(lat2))
        * POWER(SIN(RADIANS(lng2 - lng1) / 2), 2)
    )
  )
$$;

-- 사용자 위치 기반 상품 목록 조회 RPC
-- bounding box pre-filter 로 인덱스를 활용한 뒤 Haversine 으로 정확한 거리 필터링 및 정렬
-- 좌표가 없는 가게(latitude IS NULL)의 상품은 결과에서 제외
CREATE OR REPLACE FUNCTION get_products_near(
  p_user_lat    double precision,
  p_user_lng    double precision,
  p_radius_km   double precision DEFAULT 3.0,
  p_page        int              DEFAULT 1,
  p_page_size   int              DEFAULT 10,
  p_category_id uuid             DEFAULT NULL,
  p_keyword     text             DEFAULT NULL,
  p_min_price         int              DEFAULT NULL,
  p_max_price         int              DEFAULT NULL,
  p_available_only    boolean          DEFAULT true,
  p_min_discount_rate int              DEFAULT NULL,
  p_max_discount_rate int              DEFAULT NULL
)
RETURNS TABLE(
  -- products 기본 필드
  id               uuid,
  store_id         uuid,
  menu_item_id     uuid,
  category_id      uuid,
  discount_price   int,
  original_price   int,
  discount_rate    int,
  available_stock  int,
  stock            int,
  reserved_stock   int,
  end_at           timestamptz,
  pickup_start_time time,
  pickup_end_time  time,
  status           product_status,
  updated_at       timestamptz,
  -- menu_items 필드
  menu_item_name        text,
  menu_item_description text,
  menu_item_image       text,
  -- categories 필드
  cat_id   uuid,
  cat_name text,
  -- stores 필드 (지도 핀 배치용 포함)
  store_name        text,
  store_description text,
  store_phone       text,
  store_address     text,
  store_address_detail text,
  store_region      text,
  store_image       text,
  store_lat         double precision,
  store_lng         double precision,
  -- 거리
  distance_km       double precision,
  -- 페이지네이션
  total_count       bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  -- 위도 1도 ≈ 111km → bounding box delta
  v_lat_delta double precision := p_radius_km / 111.0;
  -- 경도 1도 ≈ 111km * cos(lat)
  v_lng_delta double precision := p_radius_km / (111.0 * COS(RADIANS(p_user_lat)));
  v_now       timestamptz := NOW();
BEGIN
  RETURN QUERY
  WITH nearby AS (
    SELECT
      p.id,
      p.store_id,
      p.menu_item_id,
      p.category_id,
      p.discount_price,
      p.original_price,
      p.discount_rate,
      p.available_stock,
      p.stock,
      p.reserved_stock,
      p.end_at,
      p.pickup_start_time,
      p.pickup_end_time,
      p.status,
      p.updated_at,
      mi.name::text        AS menu_item_name,
      mi.description::text AS menu_item_description,
      mi.image::text       AS menu_item_image,
      c.id                 AS cat_id,
      c.name::text         AS cat_name,
      s.name::text         AS store_name,
      s.description::text  AS store_description,
      s.phone::text        AS store_phone,
      s.address::text      AS store_address,
      s.address_detail::text AS store_address_detail,
      s.region::text       AS store_region,
      s.image::text        AS store_image,
      s.latitude           AS store_lat,
      s.longitude          AS store_lng,
      haversine_km(p_user_lat, p_user_lng, s.latitude, s.longitude) AS dist_km
    FROM products p
    JOIN stores     s  ON s.id = p.store_id
    JOIN menu_items mi ON mi.id = p.menu_item_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE
      -- 좌표 없는 가게 제외
      s.latitude  IS NOT NULL
      AND s.longitude IS NOT NULL
      -- bounding box pre-filter (인덱스 활용)
      AND s.latitude  BETWEEN (p_user_lat - v_lat_delta) AND (p_user_lat + v_lat_delta)
      AND s.longitude BETWEEN (p_user_lng - v_lng_delta) AND (p_user_lng + v_lng_delta)
      -- 가게 상태: active 가게만
      AND s.status = 'active'
      -- 상품 상태: active 상품만
      AND p.status = 'active'
      -- 판매 마감 미경과 상품만
      AND p.end_at > v_now
      -- 재고 필터 (optional)
      AND (NOT p_available_only OR p.available_stock > 0)
      -- 카테고리 필터 (optional)
      AND (p_category_id IS NULL OR p.category_id = p_category_id)
      -- 키워드 필터 (optional)
      AND (p_keyword IS NULL OR mi.name ILIKE '%' || p_keyword || '%')
      -- 최소 가격 필터 (optional)
      AND (p_min_price IS NULL OR p.discount_price >= p_min_price)
      -- 최대 가격 필터 (optional)
      AND (p_max_price IS NULL OR p.discount_price <= p_max_price)
      -- 최소 할인율 필터 (optional)
      AND (p_min_discount_rate IS NULL OR p.discount_rate >= p_min_discount_rate)
      -- 최대 할인율 필터 (optional)
      AND (p_max_discount_rate IS NULL OR p.discount_rate < p_max_discount_rate)
  ),
  radius_filtered AS (
    SELECT *
    FROM nearby
    -- 정확한 Haversine 반경 필터
    WHERE dist_km <= p_radius_km
  ),
  counted AS (
    SELECT COUNT(*) AS total_count FROM radius_filtered
  )
  SELECT
    rf.id,
    rf.store_id,
    rf.menu_item_id,
    rf.category_id,
    rf.discount_price,
    rf.original_price,
    rf.discount_rate,
    rf.available_stock,
    rf.stock,
    rf.reserved_stock,
    rf.end_at,
    rf.pickup_start_time,
    rf.pickup_end_time,
    rf.status,
    rf.updated_at,
    rf.menu_item_name,
    rf.menu_item_description,
    rf.menu_item_image,
    rf.cat_id,
    rf.cat_name,
    rf.store_name,
    rf.store_description,
    rf.store_phone,
    rf.store_address,
    rf.store_address_detail,
    rf.store_region,
    rf.store_image,
    rf.store_lat,
    rf.store_lng,
    rf.dist_km,
    counted.total_count
  FROM radius_filtered rf, counted
  ORDER BY rf.dist_km ASC
  LIMIT  p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$;
