# 모바일 앱 래핑 가이드 (PWA)

## 래핑 방식 결정

### 결정: PWA (Progressive Web App)

### 근거

- Next.js App Router + Route Handler 구조로 `output: 'export'` 전환 비용이 큼
- Capacitor는 static export 필요 → 기존 API Route 전체 영향
- 현재 목표는 홈 화면 설치 + 푸시 알림
- T33 완료: PWA redirect adapter 방향 확정, Capacitor 재검토는 앱스토어 배포 필요 시로 조건 변경

### Capacitor 재검토 조건

- T33 완료 후 앱스토어 배포가 필요하다고 판단될 때

---

## 적용된 PWA 설정

### 1. manifest.json

- 위치: `public/manifest.json`
- `display: standalone` 모드로 홈 화면 설치 시 앱처럼 동작
- 아이콘: `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`

### 2. 서비스 워커

- 위치: `public/sw.js`
- 등록: `src/components/common/ServiceWorkerRegister.tsx`
- 전략: 네트워크 우선, 실패 시 캐시 fallback
- GET 요청만 캐싱, API 요청(`/api/*`) 및 외부 요청은 캐싱하지 않음
- Push 이벤트 수신 및 알림 표시 처리 포함

### 3. Safe Area

- `src/app/layout.tsx`: `viewportFit: 'cover'` 적용
- `src/app/globals.css`: `@utility pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px) }` 적용
- 노치/홈 인디케이터 영역 safe area 처리 완료

### 4. 상태 바

- `src/app/layout.tsx`: `themeColor: '#ffffff'` 적용
- iOS: `appleWebApp.statusBarStyle: 'default'` 적용

---

## 빌드 및 실행 흐름

```bash
# 개발 서버 (서비스 워커 비활성 - NODE_ENV=development)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start
```

> 서비스 워커는 `NODE_ENV === 'production'` 환경에서만 등록된다.
> 로컬에서 테스트하려면 `npm run build && npm run start` 후 확인한다.
> 개발 서버(`npm run dev`)에서는 서비스 워커가 등록되지 않으므로 이전 캐시가 개발 화면에 개입하지 않는다.

---

## Push Notification 구조

### 클라이언트

- 훅: `src/hooks/usePushNotification.ts`
- 권한 요청 → PushSubscription 생성
- 서비스 워커(`public/sw.js`)가 백그라운드 푸시 수신 처리

### VAPID 키

- 키 생성: `npx web-push generate-vapid-keys`

**클라이언트** (브라우저):

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: 공개 키 (`pushManager.subscribe()` 인자)

**서버** (Route Handler / 발송 API):

- `VAPID_PRIVATE_KEY`: 비공개 키 (푸시 메시지 서명)
- `VAPID_SUBJECT`: 공급자 식별 (예: `mailto:admin@pickma.com`)
- 필수 라이브러리: `npm install web-push`
- 구현 위치: `src/app/api/push/send/route.ts`

### 서버 발송 연결 (후속 처리 필요)

- `push_subscriptions` 테이블 생성 필요 (Supabase 권한 필요)
- T22 알림 인프라 → 서버 발송 로직 연결 필요
- 발송 흐름:

비즈니스 이벤트 발생 (주문 상태 전이 / 신규 주문)
↓
T22 Supabase Realtime 감지
↓
push_subscriptions 테이블에서 user_id로 구독 정보 조회
↓
Web Push API로 푸시 발송
↓
서비스 워커가 백그라운드에서 알림 표시

---

## T33 결제 방식 영향

- T33 완료: Capacitor 대신 PWA 방식 확정, web/mobile adapter 분리 방향 결정됨
- PWA standalone 모드에서 Toss 결제 팝업(`window.open`) 동작 검증은 Vercel 배포 후 실기기 확인 필요
- 팝업이 차단되거나 동작하지 않으면 `useMobilePayment` 적용
  (현재 탭에서 `location.href = redirectUrl`로 리다이렉트
  → `/payment/success` 또는 `/payment/fail` 결과 페이지에서 자체 라우팅)
  - 구체적인 UX 구현 방향은 `docs/tasks/T33_native_app_payment_review.md` 참조
- Capacitor 전환은 앱스토어 배포가 필요하다고 판단될 때 별도 재검토
- → T33 결정 결과 상세는 `docs/tasks/T33_native_app_payment_review.md` 참조

---

## 후속 과제

| 항목                                                      | 관련 Task                             |
| --------------------------------------------------------- | ------------------------------------- |
| `push_subscriptions` DB 테이블 생성 및 T22 서버 발송 연결 | T22 알림 인프라 → 서버 발송 로직 연결 |
| 실기기 PWA 설치 및 standalone safe area 검증              | Vercel 배포 후 확인                   |
| Toss 결제 팝업 standalone 동작 검증                       | Vercel 배포 후 실기기 확인            |
| Capacitor 전환 검토                                       | 앱스토어 배포 필요 시 별도 재검토     |
| 앱스토어 배포                                             | Capacitor 전환 검토 후                |
