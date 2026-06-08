# T65. 도메인 컴포넌트 폴더 구조 통일

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T64. 공통 컴포넌트 접근성 baseline 적용

- 분류:
  Refactor

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Seller-FE, Admin-FE, QA

- 배경:
  `docs/ui_accessibility_baseline.md` 10절에서 컴포넌트 위치 규칙을 정했다: domain 컴포넌트는 `src/components/{domain}/`에 중앙화한다(consumer/seller/admin/auth/payment). 현재 일부 seller·admin 컴포넌트가 `src/app/(seller)/`나 `src/app/(admin)/` 근처에 분산되어 있어 도메인 경계와 import 방향이 흐릿하다.

- 문제:
  컴포넌트가 `src/app/` 근처에 흩어져 있으면 도메인 간 import 방향이 깨지기 쉽고, T46~T49에서 화면별 접근성 개선 시 파일 위치를 일일이 추적해야 한다. T64 완료 후 이동하면 접근성 기준이 적용된 상태로 중앙화할 수 있다.

- 작업 내용:
  - 현재 `src/app/(seller)/`나 `src/app/(admin)/` 근처에 있는 컴포넌트를 `src/components/seller/`, `src/components/admin/`으로 이동한다.
  - 이동 후 영향받는 모든 import path를 수정한다.
  - `src/components/consumer/`, `src/components/auth/`, `src/components/payment/`도 현황을 확인하고 위치 규칙에 맞지 않으면 동일하게 이동한다.
  - TypeScript 검사(`tsc --noEmit`)와 lint로 import 오류가 없음을 검증한다.
  - desktop/tablet(768–1024px)/mobile(375–430px) viewport에서 이동 대상 화면을 수동으로 렌더링 확인한다.

- 관련 파일/영역:
  - `src/app/(seller)/**` 내 컴포넌트 → `src/components/seller/`
  - `src/app/(admin)/**` 내 컴포넌트 → `src/components/admin/`
  - import path가 변경되는 모든 파일

- 예상 난이도:
  중간

- 완료 기준:
  - 도메인 컴포넌트가 `src/components/{domain}/` 아래에 위치한다.
  - 이동 후 TypeScript 검사와 lint가 통과한다.
  - 이동 대상 화면이 desktop/tablet/mobile에서 정상 렌더링됨을 수동 확인한다.
  - T46~T49 task가 이 task를 선행 조건으로 참조한다.
