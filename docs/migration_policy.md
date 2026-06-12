# Migration 운영 정책

## 1. 초기 Migration 수정 정책

`supabase/migrations/20260430000000_initial_schema.sql`은 원격 Supabase에 이미 적용된 파일이다.

**원칙: 초기 migration 직접 수정 금지**

원격 DB에 적용된 이후에는 초기 migration 파일을 직접 수정하지 않는다.

**예외: 팀 합의 + 원격 DB reset이 명확히 결정된 경우**

원격 DB를 완전히 reset(재생성)하기로 팀이 합의한 경우에 한해 초기 migration 수정이 허용된다. 이 경우 해당 reset의 이유와 합의 여부를 commit message 또는 PR에 명시해야 한다.

---

## 2. Incremental Migration 원칙

원격 DB에 초기 migration이 적용된 이후의 모든 스키마 변경은 독립적인 incremental migration 파일로 작성한다.

**파일명 규칙**

```text
YYYYMMDDHHMMSS_<snake_case_name>.sql
```

- timestamp는 migration 파일을 작성하는 시점의 날짜/시각을 사용한다.
- timestamp는 초기 migration(`20260430000000`) 이후여야 한다.
- 예시: `20260601120000_store_operation_status.sql`

**작성 원칙**

- 각 migration은 단일 주제 변경을 담는다.
- 멱등성을 고려한다 — 컬럼 추가 시 `IF NOT EXISTS`, enum 값 추가 시 존재 확인 등 idempotent guard를 사용한다.
- `db reset`은 **로컬 개발 전용**이다. 원격 DB에는 `supabase db push`와 incremental migration만 사용한다.
- `GENERATED ALWAYS AS ... STORED` 컬럼은 앱 코드(Route Handler, service)에서 직접 insert/update하지 않는다. Supabase typegen이 `Insert`/`Update` 타입에 해당 컬럼을 optional로 포함하지만, DB에서 쓰기를 거부한다. 현재 해당 컬럼: `products.available_stock`, `products.discount_rate`.

---

## 3. 예정 Migration / 스키마 전략 후보

후속 task에서 스키마 변경이 필요한 항목의 주제와 목적을 사전 정리한다. 세부 내용(컬럼명, 타입, 방식)은 각 task 계획 시점에 확정한다.

| 후보 주제                      | 관련 Task | 변경 내용 요약                                                                                                                                                                                                                                                                               |
| ------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store_operation_status`       | T10       | **완료.** `store_status` enum rename (`approved`→`active`), `store_operation_status` enum (`open`\|`closed`) 신규 생성, `stores.operation_status` 컬럼 추가. 관련 RLS/index/RPC 갱신 포함. (`20260602112417_store_operation_status.sql`)                                                     |
| `product_discount_sort_fields` | T05       | 결정: generated column + `original_price` 역정규화 (T05 완료). `products.original_price` snapshot 컬럼 추가 (INSERT 트리거로 `menu_items.original_price` 복사), `available_stock`/`discount_rate` STORED generated column 추가. `displayStatus`는 현재 시각 의존이므로 mapper에서 계속 계산. |
| `store_location_strategy`      | T21       | `stores` 테이블에 위치 데이터 추가 및 거리 계산 전략 결정. `latitude`/`longitude` 컬럼, 외부 거리 API, PostGIS/RPC 등 방식은 T21에서 결정.                                                                                                                                                   |

### 비차단 후보 (T11 이후 결정)

| 후보 주제   | 관련 Task | 비고                                                                                                                                                                                           |
| ----------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 알림 스키마 | T22       | **완료.** `notifications` 테이블 미생성. Realtime 채널 직접 구독 방식 채택. `payment_events` RLS/GRANT + `orders` REPLICA IDENTITY FULL 추가. (`20260611100000_realtime_notification_rls.sql`) |
