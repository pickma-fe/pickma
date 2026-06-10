-- stores 테이블에 위치 컬럼 추가 (T21)
-- 기존 가게 데이터는 좌표 없이 유지되고, 판매자가 주소를 다시 저장할 때 자동 입력된다.
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS latitude  double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

COMMENT ON COLUMN stores.latitude  IS '가게 위도 (WGS84, Daum Postcode y 값)';
COMMENT ON COLUMN stores.longitude IS '가게 경도 (WGS84, Daum Postcode x 값)';
