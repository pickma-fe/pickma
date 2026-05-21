# T39. public 이미지 자산 구조 및 Footer badge 크기 정리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T18. mock import 금지 기준 정리

- 분류:
  UI

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Architecture, Docs

- 배경:
  public 이미지 자산이 실제 fallback/브랜드 자산과 mock fixture 자산으로 섞여 있다. 일부 mock 이미지는 `public/images/mock/` 아래에 있지만, 일부 fallback 이미지는 `public/images/products/`에 있고, mock 데이터는 존재하지 않는 이미지 경로도 참조한다.

- 문제:
  정적 이미지 위치 기준이 불명확하면 real UI, mock UI, story/test fixture가 서로 섞이고, public 자산 이동 시 깨진 이미지가 발생하기 쉽다. Footer의 App Store / Google Play badge도 원본 SVG 비율과 다른 임의 크기로 지정될 수 있어 시각 왜곡이 생길 수 있다.

- 작업 내용:
  - `public/images` 하위 자산을 실제 서비스 fallback/브랜드 자산과 mock fixture 자산으로 분류한다.
  - mock 전용 이미지는 `public/images/mock/**` 기준으로 정리하고, real fallback 이미지는 별도 위치 기준을 문서화한다.
  - `src/mocks/products.ts`, `src/mocks/admin.ts`의 `/images/mock/store-bakery.jpg`, `/images/mock/store-salad.jpg`처럼 존재하지 않는 이미지 참조를 정리한다.
  - Footer에서 사용하는 `public/images/badges/apple.svg`, `public/images/badges/google.svg`의 브랜드 지정 height와 원본 비율을 확인한다.
  - Footer 전체 레이아웃을 브라우저에서 직접 확인하며 badge 크기, 간격, 정렬, 반응형 표시를 함께 수정한다.
  - `public/images/.DS_Store` 같은 로컬 파일이 commit 대상에 포함되지 않는지 확인한다.
  - 자산 위치 기준을 `docs/tasks` 또는 관련 문서에 짧게 남긴다.

- 관련 파일/영역:
  - `public/images/**`
  - `src/mocks/products.ts`
  - `src/mocks/admin.ts`
  - `src/mocks/stores.ts`
  - `src/components/common/Footer/BrandSection.tsx`
  - `src/components/common/Footer/Footer.stories.tsx`
  - `src/lib/image.ts`
  - `src/components/consumer/ProductCard.tsx`
  - `src/components/consumer/ProductImageGallery.tsx`

- 예상 난이도:
  낮음

- 완료 기준:
  - `public/images`의 mock 자산과 real fallback/브랜드 자산 위치 기준이 명확하다.
  - 코드에서 참조하는 public 이미지 경로가 실제 파일과 일치한다.
  - Footer badge가 브랜드 지정 height와 원본 SVG 비율을 함께 고려한 크기로 렌더링된다.
  - Footer 전체가 desktop/mobile viewport에서 직접 확인되었고 badge 왜곡, 간격 깨짐, 줄바꿈 문제가 없다.
  - 관련 story 또는 화면에서 깨진 이미지가 없다.
