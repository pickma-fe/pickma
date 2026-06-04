# 코드 스타일 규칙

적용 범위:

- `src/**/*.ts`
- `src/**/*.tsx`

## TypeScript

- strict mode를 필수로 사용한다.
- `any` 타입을 사용하지 않는다.
- 명시적 타입 선언을 권장한다.
- Domain type은 `src/types/`에 둔다.
- API request/response DTO와 공통 API contract는 `src/contracts/`에 둔다.
- Contract DTO의 날짜는 ISO string을 사용하고, Domain 날짜는 client mapper 이후 `Date`를 사용할 수 있다.
- utility function은 명시적 반환 타입을 선언한다.

## React

- function component와 hook만 사용한다.
- props interface는 component 파일 상단 근처에 정의한다.
- 한 파일에는 하나의 component를 둔다.
- `export function`을 우선 사용하고 default export는 피한다.

## 스타일링

- Tailwind CSS utility를 사용한다.
- custom CSS는 최소화한다.
- inline style은 사용하지 않는다.

## Migration

- 스키마 변경은 `docs/migration_policy.md`를 확인하고 incremental migration으로 작성한다.
- 원격 적용 이후의 초기 migration 직접 수정은 정책 예외에 해당하는 경우로 제한한다.

## Import Layer 규칙

```text
types/ <- 아무것도 import하지 않음
contracts/ <- 필요할 때 types/만
mocks/ <- contracts/와 mocks 내부 파일만
lib/ <- types/와 lib 내부 파일만
api/ <- types/, contracts/, lib/만
stores/ <- 필요할 때 types/, lib/, api/만
hooks/ <- types/, lib/, api/, stores/만
components/ <- types/, lib/, stores/, hooks/ 만
app/api/    <- contracts/, lib/, mocks/ (+ app/api/_lib/, app/api/{resource}/_lib/)
app/        <- 모든 layer (app/api/_lib/, app/api/{resource}/_lib/ 제외)
```

### mocks/ import 정책

- 허용: `app/api/**` Route Handler, `*.test.ts`, `*.test.tsx`, `*.stories.ts`, `*.stories.tsx`
- 금지: `components/`, `hooks/`, `stores/`, `api/` (클라이언트 레이어), `app/` 페이지/레이아웃
- ESLint `no-restricted-imports` + `import/no-restricted-paths` rule로 자동 감지

- Domain 로직이 들어가는 layer에서는 `contracts/`를 직접 import하지 않는다.
- Contract DTO는 API 경계, mapper, mock fixture에서만 사용한다.
- `src/lib`에는 framework/backend와 분리 가능한 domain/shared library만 둔다.
- Route Handler 전용 backend helper는 `src/app/api/_lib` 또는 `src/app/api/{resource}/_lib` 아래에 둔다.

## Import 순서

`src/`에는 `@/` path alias를 사용한다.

```ts
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 외부 라이브러리
import { create } from 'zustand';

// 3. 내부 모듈 (types/contracts -> mocks/lib -> api -> stores -> hooks -> components)
import type { User } from '@/types/user';
import type { UserResponse } from '@/contracts/user';
import { formatDate } from '@/lib/utils';
import { userApi } from '@/api/users/userApi';
import { useAuthStore } from '@/stores/auth-store';
import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';

// 4. 상대 경로 import
import { ProductCard } from './ProductCard';
```

## Naming 규칙

| 대상             | 규칙                      | 예시                             |
| ---------------- | ------------------------- | -------------------------------- |
| 파일과 폴더      | kebab-case                | `user-profile/`, `auth-utils.ts` |
| component 파일   | PascalCase                | `ProductCard.tsx`                |
| component        | PascalCase                | `ProductCard`                    |
| 함수와 변수      | camelCase                 | `getUserData`                    |
| 상수             | UPPER_SNAKE_CASE          | `API_URL`                        |
| type과 interface | PascalCase                | `User`, `ProductProps`           |
| boolean          | `is`, `has`, `can` prefix | `isLoading`                      |
| event handler    | `handle` prefix           | `handleClick`                    |
| callback props   | `on` prefix               | `onSubmit`                       |

## Next.js App Router 규칙

| 파일            | 용도                                              |
| --------------- | ------------------------------------------------- |
| `page.tsx`      | page component                                    |
| `layout.tsx`    | layout                                            |
| `loading.tsx`   | loading UI                                        |
| `error.tsx`     | error boundary, 반드시 `'use client'` 사용        |
| `not-found.tsx` | 404 page                                          |
| `route.ts`      | API Route Handler                                 |
| `proxy.ts`      | session refresh와 보호 route를 위한 request proxy |

## 에러 처리 규칙

- `response.json()` parsing 실패 가능성이 있으면 `try/catch`로 감싼다.
- API route는 `docs/api_spec.md`의 공통 response envelope을 사용한다.
- API route는 적절한 HTTP status code를 반환하고 body의 `statusCode`와 동기화한다.
- error response에는 민감 정보를 포함하지 않는다.
- Zod validation error는 field-level details를 포함한 `VALIDATION_ERROR`로 변환한다.
