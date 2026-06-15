# T66. 모바일 앱 래핑 (Capacitor / PWA)

- 상태:
  진행 중

- GitHub Issue:
  277

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립, T22. 실시간 알림 기반 설계 및 1차 구현

- 분류:
  인프라

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Consumer-FE, QA

- 배경:
  PickMa는 모바일에서 앱에 준하는 경험을 제공할 계획이다. Capacitor를 사용해 Next.js 웹을 Android/iOS 앱으로 래핑하는 것을 우선으로 검토한다. Capacitor 적용이 어려우면 PWA standalone 모드를 대안으로 사용한다. T45에서 `viewport-fit: cover`와 `@utility pb-safe`(safe area inset)를 기반 설정으로 완료했으므로 이 task는 앱 래핑과 플러그인 구성에 집중한다.

- 문제:
  네이티브 앱 래핑 없이는 모바일 홈 화면 설치, 상태 바 제어, 노치/홈 인디케이터 safe area 처리가 웹 브라우저 기본값에 의존하게 된다. Capacitor standalone 빌드는 결제 방식 재검토(T33)와도 연관된다.

- 작업 내용:
  - Capacitor 적용 가능성을 검토하고 Next.js App Router와의 호환성을 확인한다.
  - Capacitor 적용 시:
    - `@capacitor/core`, `@capacitor/cli` 설치 및 `capacitor.config.ts` 초기 설정을 한다.
    - `@capacitor/status-bar` 플러그인을 추가하고 상태 바 스타일을 설정한다.
    - Android/iOS 프로젝트 초기화(`npx cap add android`, `npx cap add ios`)를 수행한다.
    - `pb-safe` 유틸리티(`env(safe-area-inset-bottom)`)가 standalone 모드에서 정상 동작하는지 검증한다.
    - Capacitor 빌드와 배포 흐름을 문서화한다.
  - Capacitor 적용이 어려운 경우 PWA 대안을 적용한다:
    - `next-pwa` 또는 Next.js 내장 서비스 워커로 PWA manifest를 구성한다.
    - `display: standalone` 모드에서 safe area inset이 적용되는지 확인한다.
  - 모바일 결제 방식 영향(T33)을 확인하고, 별도 결정이 필요한 사항은 T33과 연결한다.
  - Push Notification 연동을 구현한다: Capacitor `@capacitor/push-notifications` 또는 PWA Web Push API를 사용해 T22에서 구축한 알림 인프라를 푸시 알림으로 확장한다.

- 관련 파일/영역:
  - `capacitor.config.ts` (신규)
  - `src/app/layout.tsx` (이미 viewport-fit: cover 적용)
  - `src/app/globals.css` (이미 pb-safe 적용)
  - Android: `android/` (신규)
  - iOS: `ios/` (신규)
  - PWA 대안 적용 시: `public/manifest.json`, 서비스 워커 설정

- 예상 난이도:
  높음

- 완료 기준:
  - Capacitor 또는 PWA 중 하나의 래핑 방식이 결정되고 기본 설정이 완료된다.
  - 모바일 standalone 모드에서 `pb-safe` safe area가 정상 동작한다.
  - 상태 바 스타일이 앱 디자인과 일치한다.
  - 빌드 및 실행 흐름이 문서화된다.
  - 결제 방식에 영향이 있으면 T33과 연결해 후속 처리를 남긴다.
  - 푸시 알림 권한 요청 흐름(허용/거부)이 동작한다.
  - 디바이스 토큰 또는 PushSubscription이 정상 등록된다.
  - 실기기 또는 실브라우저에서 푸시 수신 E2E가 확인된다.
  - T22 알림 인프라에서 발생한 실제 비즈니스 이벤트(주문 상태 전이, 신규 주문)가 서버 → FCM/APNs/Web Push → 디바이스까지 전달되는 경로가 문서화된다.
  - 클라이언트 토큰/PushSubscription 저장 위치와 서버 발송 연결 방식이 명시된다.

- 구현 결과:

  ### 래핑 방식
  - Capacitor는 Next.js App Router + Route Handler 구조와 호환성 문제(static export 필요)로 적용 불가
  - PWA 방식으로 확정

  ### 완료된 작업
  - `public/manifest.json`: PWA manifest 구성 (display: standalone, 아이콘, theme_color)
  - `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`: 앱 아이콘 추가 (정사각형 패딩 처리)
  - `public/sw.js`: 서비스 워커 직접 구현 (GET 요청만 캐싱, event.waitUntil 캐시 분리, Push JSON fallback 처리)
  - `src/components/common/ServiceWorkerRegister.tsx`: production 환경에서만 서비스 워커 등록
  - `src/hooks/usePushNotification.ts`: 푸시 알림 권한 요청, PushSubscription 생성, 마운트 시 기존 구독 복원
  - `src/app/layout.tsx`: manifest 링크, themeColor, appleWebApp 설정 추가
  - `docs/mobile_app_build_guide.md`: 빌드/배포 흐름 및 Push Notification 구조 문서화

  ### 검증 결과
  - Chrome DevTools Application → Manifest 탭: manifest 정상 인식 확인
  - Chrome DevTools Application → Service Workers 탭: sw.js 활성화 확인
  - DevTools 푸시 테스트: 브라우저 푸시 알림 수신 E2E 확인
  - 실기기 PWA 설치 및 standalone 모드 검증: 미완료 → Vercel 배포 후 확인 필요
  - standalone safe area(pb-safe) 실기기 검증: 미완료 → Vercel 배포 후 확인 필요
  - Toss 결제 팝업 standalone 동작 검증: 미완료 → T33 연계

  ### 이번 PR 완료 범위
  - PWA 기반 설정 (manifest, 서비스 워커, 푸시 알림 훅)
  - 브라우저 환경 푸시 알림 E2E 확인
  - 빌드 및 배포 흐름 문서화

  ### 후속 처리
  - `push_subscriptions` DB 테이블 생성 및 서버 발송 연결: Supabase 권한 문제로 후속 task 분리
  - T22 알림 인프라 → Web Push 서버 발송 연결: 후속 task 필요
  - 실기기 PWA 설치 및 standalone safe area 검증: Vercel 배포 후 확인
  - Toss 결제 팝업 standalone 동작 검증: T33 연계
  - Capacitor 전환 및 앱스토어 배포: T33 완료 후 재검토
