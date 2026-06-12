ALTER TABLE users
  ADD COLUMN IF NOT EXISTS location_lat double precision,
  ADD COLUMN IF NOT EXISTS location_lng double precision,
  ADD COLUMN IF NOT EXISTS location_address varchar(255);

COMMENT ON COLUMN users.location_lat IS '소비자 최근 선택 위치 위도 (WGS84)';
COMMENT ON COLUMN users.location_lng IS '소비자 최근 선택 위치 경도 (WGS84)';
COMMENT ON COLUMN users.location_address IS '소비자 최근 선택 위치 주소';
