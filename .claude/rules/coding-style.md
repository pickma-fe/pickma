---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
---

# 코드 스타일 규칙

## TypeScript

- strict mode 필수
- `any` 타입 금지 (`@typescript-eslint/no-explicit-any: error`)
- 명시적 타입 선언 권장
- Domain 타입은 `src/types/`에 도메인별로 분리
- API request/response DTO와 공통 API contract는 `src/contracts/`에 정의
- Contract DTO의 날짜는 ISO string, Domain 타입의 날짜는 client mapper 이후 `Date` 사용 가능
- 유틸 함수는 명시적 반환 타입 선언

## React

- 함수형 컴포넌트 + Hooks만 사용
- Props 인터페이스는 컴포넌트 파일 상단에 정의
- 컴포넌트당 하나의 파일
- `export function` 사용 (default export 지양)

## 스타일링

- Tailwind CSS 유틸리티 클래스만 사용
- 커스텀 CSS 최소화
- 인라인 스타일 금지

## Migration

- 스키마 변경은 `docs/migration_policy.md`를 확인하고 incremental migration으로 작성한다.
- 원격 적용 이후의 초기 migration 직접 수정은 정책 예외에 해당하는 경우로 제한한다.

## Import Layer 규칙

```
types/ ← 아무것도 import 안 함
contracts/ ← 필요 시 types/ 만
mocks/ ← contracts/와 mocks 내부 파일만
lib/ ← types/와 lib 내부 파일만
api/ ← types/, contracts/, lib/ 만
stores/ ← types/, lib/, api/ 만 필요 시
hooks/ ← types/, lib/, api/, stores/ 만 (hooks 내 단방향 composition 허용, 아래 규칙 참고)
components/ ← types/, lib/, stores/, hooks/ 만
app/api/    ← contracts/, lib/, mocks/ (+ app/api/_lib/, app/api/{resource}/_lib/)
app/        ← 전부 가능 (app/api/_lib/, app/api/{resource}/_lib/ 제외)
```

### mocks/ import 정책

- 허용: `app/api/**` Route Handler, `*.test.ts`, `*.test.tsx`, `*.stories.ts`, `*.stories.tsx`
- 금지: `components/`, `hooks/`, `stores/`, `api/` (클라이언트 레이어), `app/` 페이지/레이아웃
- ESLint `no-restricted-imports` + `import/no-restricted-paths` rule로 자동 감지

### hooks 내 단방향 composition

한 hook이 다른 hook을 내부에서 호출하는 hook composition은 다음 조건을 모두 충족할 때만 허용한다.

- **단방향**: A → B 호출이면 B → A 호출은 없어야 한다 (circular dependency 금지).
- **중복 구현 금지**: 피호출 hook의 queryKey, retry 정책, API 호출 로직을 호출 측에서 다시 구현하지 않는다. 상태 파생만 한다.
- **ESLint `import/no-cycle`**: 기존 rule이 circular dependency를 자동 감지한다.

예: `useRoleGuard` → `useMe` (단방향 composition, `useMe`의 queryKey/retry/API를 재구현하지 않음)

- Domain 로직이 들어가는 layer에서는 `contracts/`를 직접 import하지 않는다.
- Contract DTO는 API 경계, mapper, mock fixture에서만 사용한다.
- `src/lib`에는 framework/backend와 분리 가능한 domain/shared library만 둔다.
- Route Handler 전용 backend helper는 `src/app/api/_lib` 또는 `src/app/api/{resource}/_lib` 아래에 둔다.

## Import 순서

path alias: `@/` = `src/`

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 외부 라이브러리
import { create } from 'zustand';

// 3. 내부 모듈 (types/contracts → mocks/lib → api → stores → hooks → components)
import type { User } from '@/types/user';
import type { UserResponse } from '@/contracts/user';
import { formatDate } from '@/lib/utils';
import { userApi } from '@/api/users/userApi';
import { useAuthStore } from '@/stores/auth-store';
import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';

// 4. 상대 경로
import { ProductCard } from './ProductCard';
```

## Naming 규칙

| 대상            | 규칙                | 예시                               |
| --------------- | ------------------- | ---------------------------------- |
| 파일/폴더       | kebab-case          | `user-profile/`, `auth-utils.ts`   |
| 컴포넌트 파일   | PascalCase          | `ProductCard.tsx`                  |
| 컴포넌트        | PascalCase          | `ProductCard`                      |
| 함수/변수       | camelCase           | `getUserData`, `isLoading`         |
| 상수            | UPPER_SNAKE_CASE    | `API_URL`, `MAX_COUNT`             |
| 타입/인터페이스 | PascalCase          | `User`, `ProductProps`             |
| Boolean         | `is/has/can` 접두어 | `isLoading`, `hasError`, `canEdit` |
| 이벤트 핸들러   | `handle` 접두어     | `handleClick`, `handleSubmit`      |
| Props 콜백      | `on` 접두어         | `onClick`, `onSubmit`              |

---

## Next.js App Router 규칙

| 파일            | 용도                                |
| --------------- | ----------------------------------- |
| `page.tsx`      | 페이지 컴포넌트                     |
| `layout.tsx`    | 레이아웃                            |
| `loading.tsx`   | 로딩 UI                             |
| `error.tsx`     | 에러 바운더리 (`'use client'` 필수) |
| `not-found.tsx` | 404 페이지                          |
| `route.ts`      | API Route 핸들러                    |
| `proxy.ts`      | 세션 refresh와 보호 라우트 처리     |

---

## 에러 처리 규칙

- `fetch` 응답의 `response.json()` 파싱은 `try/catch`로 감싸서 파싱 실패를 제어
- API Route는 `docs/api_spec.md`의 공통 response envelope을 사용
- API Route에서 적절한 HTTP 상태 코드 반환, body `statusCode`와 일치
- 에러 응답에 민감 정보 포함 금지
- Zod 검증 실패는 `VALIDATION_ERROR`와 field-level details로 변환
