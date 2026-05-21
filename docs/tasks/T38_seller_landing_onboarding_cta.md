# T38. 판매자 랜딩/온보딩 CTA 정리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T10. 판매자 운영 상태 정책 및 구현

- 분류:
  UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Seller-FE

- 보조 역할:
  Domain

- 배경:
  `/seller` 페이지는 임시 페이지 성격이 남아 있고, 로그인 전/후와 신청 상태별 CTA가 약하다.

- 문제:
  판매자 온보딩 진입점이 명확하지 않으면 신청, 승인 대기, 가게 등록, 운영 화면 이동 흐름이 끊긴다.

- 작업 내용:
  - `useSellerOnboardingStatus` 또는 server preload 기반 상태별 CTA를 설계한다.
  - 비로그인, 신청 전, pending, rejected, approved+store 없음, approved+store 있음 상태별 이동 경로를 정한다.
  - `/seller/reviews`, `/seller/notice` 같은 미구현 링크 노출 정책과 함께 정리한다.

- 관련 파일/영역:
  - `src/app/(seller)/seller/page.tsx`
  - `src/hooks/seller/onboarding/useSellerOnboardingStatus.ts`
  - `src/app/(seller)/seller/_components/sellerSidebarSections.ts`
  - `docs/ia.md`

- 예상 난이도:
  중간

- 완료 기준:
  - 판매자 상태별 CTA와 안내가 명확하다.
  - 임시 문구가 제거된다.
  - 미구현 판매자 링크 노출 정책이 정리된다.
