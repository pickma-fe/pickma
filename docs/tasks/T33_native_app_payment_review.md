# T33. 네이티브 앱 결제 방식 재검토

- 상태:
  완료

- GitHub Issue:
  281

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T01. 결제 confirm 보상 정책 확정

- 분류:
  아키텍처

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Architecture

- 보조 역할:
  Customer-FE, Domain

- 배경:
  장기적으로 Capacitor 네이티브 앱을 고려할 수 있으나 현재 결제는 `window.open` 팝업 방식이다.

- 문제:
  앱 웹뷰에서는 팝업 결제 방식이 안정적으로 동작하지 않을 수 있다.

- 작업 내용:
  - 인앱 웹뷰, 외부 브라우저, 딥링크 기반 결제 옵션을 비교한다.
  - Toss 모바일 결제 권장 플로우를 확인한다.
  - 현재 web 결제 구조와 분리 가능한 adapter 경계를 정한다.

- 관련 파일/영역:
  - `src/hooks/payments/usePayment.ts`
  - `src/app/api/payments/*`
  - `docs/system_architecture.md`

- 예상 난이도:
  중간

- 완료 기준:
  - 네이티브 앱 전환 시 결제 변경 범위가 문서화된다.
  - web 결제 adapter와 mobile 결제 adapter 분리 방향이 정해진다.

- 참고:
  - `docs/mobile_app_build_guide.md` T33 결제 방식 영향 섹션 참조
  - T66에서 Capacitor 적용 불가(Next.js App Router + Route Handler 호환성 문제)로 PWA 방식 확정
  - PWA standalone 모드에서 Toss 결제 팝업 동작 검증은 Vercel 배포 후 실기기 확인 필요 (T66 후속)

## 구현 결과

## 현재 web 결제 구조 분석

- `usePayment.ts`: `window.open` 800×800 팝업 → `postMessage` 결과 수신 → `setInterval` 팝업 닫힘 감지
- `preparePayment` 서비스: `successUrl`을 파라미터로 받아 redirectUrl 생성 (서버 API는 이미 환경 중립적 구조)
- `confirmPayment` 서비스: `paymentKey / orderNumber / amount` 기반 확인 처리 (호출 경로 무관)
- 결제 API 레이어(`prepare / confirm / cancel / webhook`)는 web/mobile 공통 재사용 가능

## 웹뷰 환경에서의 문제점

| 문제                      | 원인                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `window.open()` 차단      | 웹뷰는 팝업을 기본 차단하거나 동일 창으로 열림                       |
| `postMessage` 수신 불안정 | 팝업-부모 창 컨텍스트 분리로 `event.source !== popup` 조건 실패 가능 |
| `popup.closed` 감지 불가  | 웹뷰에서 열린 창 참조 유실 가능                                      |

## 모바일 결제 옵션 비교

| 옵션             | 방식                       | Toss 권장      | 변경 범위                     |
| ---------------- | -------------------------- | -------------- | ----------------------------- |
| 인앱 웹뷰 (현재) | 팝업 + postMessage         | ❌             | 없음(but 미동작)              |
| 외부 브라우저    | location.href 리다이렉트   | ✅ 모바일 웹   | `usePayment.ts` 교체          |
| 딥링크           | 앱 → Toss 앱 → 딥링크 복귀 | ✅ 네이티브 앱 | `usePayment.ts` + 딥링크 설정 |

## 결정된 adapter 분리 방향

- **서버 API 변경 없음**: `prepare / confirm / cancel / webhook` 엔드포인트는 web/mobile 공통 재사용
- **클라이언트 레이어만 교체**:
  - `useWebPayment`: 현재 팝업 방식 유지 (web 전용)
  - `useMobilePayment`: `location.href` 리다이렉트 방식 신규 구현 (mobile 전용)
  - `usePayment` (facade): PWA standalone 모드 감지
    (`window.matchMedia('(display-mode: standalone)')`) 분기로 adapter 선택
    (Vercel 배포 후 실기기 검증 완료 시 활성화)
- **`/payment/success` 페이지 역할 확장 필요**:
  - **현재 (web 팝업 방식)**:
    `PaymentSuccessClient`가 URL params(`paymentKey / orderId / amount`) 수신
    → `useConfirmPayment`로 `POST /api/payments/confirm` 호출
    → `postMessage` + `window.close()` 실행
  - **모바일 전환 시 추가 필요**:
    - **`success/page.tsx` 변경 범위**:
      - `window.opener`가 없는 standalone/PWA redirect 환경에서
        confirm 성공 시 `/order/complete`, 실패 시 `/order/fail`로 자체 라우팅 처리
      - query invalidation: `PaymentSuccessClient` 내 TanStack Query cache invalidation
        (`invalidateTargets.afterPaymentSuccess`) 호출 경로 보장
      - 중복 confirm 처리: 동일 `orderNumber`로 페이지 재진입 시 중복 confirm 요청 방지
        - 1순위: 서버 idempotency 의존 — `PAYMENT_ALREADY_CONFIRMED` 409 응답 시
          `/order/complete`로 리다이렉트 (이미 완료된 결제로 처리)
        - 2순위: TanStack Query cache 확인 —
          `queryClient.getQueryData(['orders', orderNumber])`로
          이미 `reserved` 이상 상태인 경우 confirm 재호출 방지
        - `localStorage` 기반 timestamp guard는 브라우저 간 공유 불가 및
          storage 초기화 시 재호출 위험이 있어 보조 수단으로만 검토
    - **`fail/page.tsx` 변경 범위**:
      - 현재: `window.opener?.postMessage(...)` 후 `window.close()` 만 수행
      - `window.opener`가 없는 standalone/PWA redirect 환경에서
        `/order/fail?reason=payment_cancelled|payment_failed`로 자체 라우팅 처리 필요
      - Toss SDK `failUrl: /payment/fail` 진입 시 opener 유무를 감지해 분기

## PWA standalone 전환 시 결제 변경 범위 (Vercel 배포 후 실기기 검증 기준)

| 파일                                     | 변경 유형 | 내용                                                                                                                              |
| ---------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/payments/usePayment.ts`       | 수정      | PWA standalone 모드 분기 추가 (facade 역할)                                                                                       |
| `src/hooks/payments/useWebPayment.ts`    | 신규      | 현재 팝업 방식 분리                                                                                                               |
| `src/hooks/payments/useMobilePayment.ts` | 신규      | 리다이렉트 방식 구현                                                                                                              |
| `src/app/(payment)/success/page.tsx`     | 수정      | opener 없는 standalone/PWA redirect 환경 자체 라우팅 + TanStack Query invalidation 경로 보장 + 중복 confirm 클라이언트 guard 검토 |
| `src/app/(payment)/fail/page.tsx`        | 수정      | opener 없는 standalone/PWA redirect 환경에서 `/order/fail?reason=...`으로 자체 라우팅 처리                                        |
| `src/app/api/payments/*`                 | 변경 없음 | 공통 재사용                                                                                                                       |
