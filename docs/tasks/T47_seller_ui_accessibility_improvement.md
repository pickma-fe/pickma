# T47. Seller UI/UX 및 접근성 개선

- 상태:
  완료

- GitHub Issue:
  287

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립, T64. 공통 컴포넌트 접근성 baseline 적용, T65. 도메인 컴포넌트 폴더 구조 통일, T28. 판매자 상품 수정 진입점 결정 및 구현, T29. 판매자 제출 문서 확인 UX 개선, T38. 판매자 랜딩/온보딩 CTA 정리, T52. 판매자 주문 상세 화면 구현 (미결 UX 항목 인수)

- 분류:
  UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Seller-FE

- 보조 역할:
  Shared-FE, QA

- 배경:
  Seller 흐름은 판매자 등록, 가게 관리, 상품/메뉴 관리, 주문 관리를 포함한다. 운영 도구 성격이 강하므로 반복 업무에 적합한 밀도, 상태 표시, form 접근성, table/list 탐색성이 중요하다.

- 문제:
  판매자 화면의 form, table/list, 상태 badge, CTA, error/empty 상태가 일관되지 않으면 입점과 운영 업무가 어렵고, 심사/주문 처리 같은 핵심 작업에서 실수가 발생하기 쉽다.

- 작업 내용:
  - 판매자 홈, 상품/메뉴/가게/주문/등록 화면을 `docs/ui_accessibility_baseline.md` 기준으로 점검한다(컴포넌트 접근성, UI 상태, 반응형, 시각 품질, UX 완성도, 기존 UI 보완 포함).
  - form label, validation message, file upload, disabled state, focus 이동을 점검한다.
  - table/list의 정렬, 필터, 빈 상태, 행 action, 모바일 표시를 점검한다.
  - T29 판매자 제출 문서 확인 UX와 T38 판매자 랜딩/온보딩 CTA 흐름과 충돌하지 않게 개선 범위를 조정한다.
  - 주문 처리 버튼(수락/완료) 확인 모달 노출 여부를 결정하고 구현한다 (T52 미결 UX 항목).
  - 픽업번호 확인 방식(QR코드 스캔 vs 수동 입력)을 결정하고 구현한다 (T52 미결 UX 항목).
  - `OrderManageContent.tsx`의 `case 'cancelled'` 빈 핸들러를 T31 API와 연결한다 (판매자 측 주문 취소 액션 처리).
  - 필요한 Storybook 상태 또는 Playwright 시나리오 보강 범위를 정리한다.

- 관련 파일/영역:
  - `src/app/(seller)/seller/page.tsx`
  - `src/app/(seller)/seller/products/page.tsx`
  - `src/app/(seller)/seller/menu/page.tsx`
  - `src/app/(seller)/seller/store/page.tsx`
  - `src/app/(seller)/seller/orders/page.tsx`
  - `src/app/(seller)/seller/register/page.tsx`
  - `src/components/seller/**`

- 예상 난이도:
  중간

- 완료 기준:
  - Seller 주요 화면이 `docs/ui_accessibility_baseline.md` 기준으로 점검되고 개선된다.
  - 등록/운영 form의 label, validation, focus, error 상태가 접근성 기준을 만족한다.
  - 주문/상품/메뉴/가게 관리 화면의 list/table 상태가 일관된다.
  - desktop/tablet(768–1024px)/mobile(375–430px) viewport에서 주요 화면을 수동 검증한다.
  - 주문 처리 버튼(수락/완료) 확인 모달 노출 여부가 결정되고 구현 완료된다.
  - 픽업번호 확인 방식(QR코드 스캔 또는 수동 입력)이 선택되고 구현 완료된다.
  - `OrderManageContent.tsx`의 `case 'cancelled'` 핸들러가 T31 API와 연동되어 동작 확인된다.
  - 필요한 후속 개선이 별도 task 또는 확인 필요 항목으로 분리된다.

## 구현 결과

### 주문 화면 (Step 2)

- **판매자 주문 취소 API 구현** (`PATCH /api/seller/orders/[orderId]/cancel`): `reserved`/`accepted` 상태에서만 허용. cancelling claim → Toss 결제 취소 → cancel_order RPC → 실패 시 보상 로그.
- **`OrderCancelModal`** (신규): 취소 사유 입력 textarea, 500자 제한, 에러 알림.
- **`OrderCompleteConfirmModal`** (신규): 픽업번호 시각 확인 모달 (QR 스캔 제외, 수동 확인만).
- **`OrderManageContent`**: 픽업 완료 시 확인 모달 표시, 취소 버튼 활성화 및 취소 모달 연결, `case 'cancelled'` 핸들러 제거.
- **`OrderDetailContent`**: 취소/완료 모달 추가, reserved/accepted 취소 버튼 활성화.
- **`OrderFilter`**: 검색 Input에 `aria-label="주문번호 검색"` 추가.
- `SellerOrderActionStatus`에서 `'cancelled'` 제거.
- API/아키텍처 문서 (`api_spec.md`, `system_architecture.md`) 갱신.

### 상품 관리 화면 (Step 3)

- `ProductFilter`: 검색 Input `aria-label="상품명 검색"` 추가.

### 메뉴 관리 화면 (Step 4)

- `MenuFilter`: 검색 Input `aria-label="메뉴명 검색"` 추가.
- `MenuTable`: 전체 선택 checkbox `aria-label="전체 메뉴 선택"`, 개별 `aria-label="${menu.name} 선택"` 추가.

### 가게 정보·등록 화면 (Step 5)

- `StoreEditForm`: 가게 주소 `<span>` → Input `label` prop으로 교체, 전화번호 `autoComplete="tel"`, 주소 `autoComplete="street-address"`.
- `StoreInfoStep`: 동일 패턴 적용 (주소 label 연결, `autoComplete` 보완).
- `BusinessInfoStep`: 대표자명 `autoComplete="name"`, 사업장 주소 `autoComplete="street-address"` 추가.

### 홈·대시보드·대기 화면 (Step 6)

- 점검 완료, 변경 없음. 모든 화면이 적절한 heading, role, ARIA 구조를 갖추고 있음.

### 검증

- `npx vitest run src/app/api/seller/orders src/api/seller/orders src/hooks/seller/orders`: 83개 테스트 통과
- `npm run lint`: 전체 통과
- `npx tsc --noEmit`: 타입 오류 없음 (기존 `@storybook/test` 관련 오류는 pre-existing)

### 시각 리뷰 추가 개선

#### `/seller/products`

- `ProductTable`: 이미지 로드 실패 시 폴백 처리 (`ProductImageCell` 컴포넌트, `onError` → 아이콘 fallback)
- `ProductManageContent` / `ProductFilter`: 필터 레이아웃 개선, Input 흰색 배경, 가로 overflow 방지, 관리 컬럼 액션 메뉴로 교체

#### `/seller/products/[id]/edit`

- `TimePicker` 컴포넌트 신규: HH/MM select dropdown, `appearance-none` + 커스텀 chevron, `onBlur` 연결, 에러 상태 focus 스타일 분리
- `ProductEditForm`: `endAt` 필드 제거, 픽업 시작/종료 시간 cross-field validation (`superRefine`), `mode: 'onTouched'`, 판매 정보 그리드 모바일 반응형 (`grid-cols-1 sm:grid-cols-2`)
- `page.tsx`: `endAt` 제출 시 `오늘 날짜 + pickupEndTime`으로 자동 계산
- API `schemas.ts`: `superRefine` 픽업 시간 순서 체크 추가 (create/update 모두)

#### `/seller/menu`

- `MenuTable`: 이미지 로드 실패 시 폴백 처리 (`MenuImageCell` 컴포넌트)

#### `/seller/menu/new` · `/seller/menu/[id]/edit`

- `MenuForm`: 2열 레이아웃 기준 `lg` → `xl`로 변경 (1024px 공간 부족 해소)

#### `/seller/store`

- `StoreInfoContent`: "가게 정보 수정" 버튼 클릭 시 모달 대신 `/seller/store/edit`으로 이동, `editStore` 모달 및 관련 핸들러 제거

#### `/seller/store/edit`

- `StoreEditForm`: 필수 필드(가게 이름, 전화번호, 주소, 오픈/마감 시간) `required` 표시 추가, 오픈/마감 시간 `<input type="time">` → `TimePicker`로 교체
