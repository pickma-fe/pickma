-- T22: Realtime 알림 구독을 위한 RLS 권한 및 publication 설정
--
-- payment_events: authenticated SELECT GRANT + 판매자 RLS 정책
-- orders: REPLICA IDENTITY FULL (UPDATE payload에 old 레코드 포함)
-- supabase_realtime publication에 양 테이블 추가

-- 1. payment_events: authenticated 사용자 SELECT 권한 부여
GRANT SELECT ON TABLE payment_events TO authenticated;

-- 2. payment_events: 판매자 SELECT RLS 정책 (자기 가게 이벤트만 조회 가능)
CREATE POLICY "seller_own_store_events"
  ON payment_events FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores
      WHERE user_id = auth.uid()
    )
  );

-- 3. orders: REPLICA IDENTITY FULL 설정
--    UPDATE payload에 old 레코드가 포함되어야 old.status → new.status 전이를 감지할 수 있다
ALTER TABLE orders REPLICA IDENTITY FULL;

-- 4. supabase_realtime publication에 payment_events, orders 추가 (멱등성 보장)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'payment_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE payment_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;
