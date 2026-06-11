# Public 이미지 자산 구조 가이드

## 디렉터리 구조

```
public/images/
├── badges/          # 앱스토어 배지 등 브랜드 자산
├── banners/         # 서비스 배너 이미지
├── fallback/        # 이미지 로드 실패 시 사용하는 기본 이미지
└── mock/            # 개발/테스트 전용 fixture 이미지
    ├── documents/   # mock 서류 이미지
    ├── menus/       # mock 메뉴 이미지
    ├── products/    # mock 상품 이미지
    └── stores/      # mock 가게 이미지
```

## 분류 기준

| 디렉터리    | 용도                                          | 비고                      |
| ----------- | --------------------------------------------- | ------------------------- |
| `badges/`   | 앱스토어/구글플레이 배지 등 외부 브랜드 자산  | 브랜드 가이드라인 준수    |
| `banners/`  | 서비스 소개 배너, README 등 브랜드 자산       | -                         |
| `fallback/` | 이미지 없음/로드 실패 시 표시하는 기본 이미지 | 코드에서 직접 참조        |
| `mock/`     | 개발 및 테스트 환경 전용 fixture 이미지       | 프로덕션 UI에서 노출 금지 |

## 규칙

- `fallback/` 이미지는 `src/` 코드에서 직접 경로 참조 가능하다. 단, `fallback/` 경로는 프로덕션 서버 응답에 포함되지 않으며 `getSafeProfileImage`와 같은 fallback 함수 내에서만 사용한다.
- `mock/` 이미지는 `src/mocks/**`, `*.test.*`, `*.stories.*` 파일에서만 참조한다.
- `badges/` SVG는 브랜드 가이드라인의 지정 height(40px)와 원본 viewBox 비율을 함께 고려한 크기로 렌더링한다.
  - height를 40px로 고정하고 width는 원본 비율에 따라 자동 계산한다.
- 로컬 전용 파일(`.DS_Store` 등)은 `.gitignore`에 전역 등록되어 있으므로 별도 처리 불필요.

## 참고

- T39. public 이미지 자산 구조 및 Footer badge 크기 정리
- T18. mock import 금지 기준 정리
