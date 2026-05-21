---
name: create-test
description: PickMa 코드의 Vitest 테스트를 생성하거나 수정한다. API service/mapper/Route Handler helper, client mapper/API, hook, store, utility 테스트가 필요할 때 사용한다.
argument-hint: '파일 경로, task ID, 또는 테스트 대상 이름'
---

# Test 생성

PickMa 테스트를 만들거나 보강할 때 사용한다. 대상 파일 또는 task 문맥을 먼저 읽고, 주변 테스트 패턴과 프로젝트 지침에 맞춰 작성한다.

컴포넌트의 시각 상태와 단순 UI interaction은 Storybook story/play function을 우선한다. Vitest 컴포넌트 테스트는 Storybook으로 표현하기 어렵거나 hook/store/API mocking이 많거나 로직 회귀 방지가 더 중요한 경우에만 작성한다.

## 작업 흐름

1. 대상 파일과 인접 테스트를 먼저 읽는다. task ID가 있으면 `docs/tasks/Txx_*.md`와 `temp/Txx-plan.md`도 확인한다.
2. 테스트가 필요한 공개 동작과 edge case를 정한다.
3. 대상에 맞는 기준만 적용한다.
4. `{target}.test.ts` 또는 `{target}.test.tsx`를 대상 파일 가까이에 만든다.
5. targeted test를 우선 실행하고, 필요하면 `npm run test` 또는 `npm run lint`를 제안한다.

## 공통 규칙

- `describe`/`it`은 한국어 행동 설명을 사용한다.
- 구현 세부보다 observable behavior를 검증한다.
- mock은 `vi.fn()`과 기존 테스트의 mock 패턴을 따른다.
- 테스트 데이터는 contract/domain 경계를 드러내도록 명확히 만든다.
- 과도한 snapshot, brittle selector, 내부 함수 호출 검증을 피한다.

## Backend/API 테스트

- service: 성공, 비즈니스 `AppError`, Supabase error, 권한/소유권/중복/상태 edge case를 검증한다.
- server mapper: snake_case -> camelCase, `null` -> `undefined`, status/derived field, ISO date/time contract를 검증한다.
- Route Handler/helper: response envelope, HTTP status/body `statusCode`, Zod `VALIDATION_ERROR`, `API_MOCK_ENABLED` mock/real 분기를 검증한다.
- Supabase client mock은 인접 service test 패턴을 따른다. 실제 네트워크/DB에 의존하지 않는다.

## Client/Domain 테스트

- client mapper: ISO string -> `Date`, 계산 필드, optional/null 처리, contract -> domain 변환을 검증한다.
- client API: `apiClient` 호출 경로, request DTO 변환, query params, error propagation을 검증한다.
- TanStack Query hook: test `QueryClientProvider`로 감싸고 query/mutation state, invalidate/update 동작을 검증한다.
- Zustand store: 초기 상태, action, reset, 파생 상태를 검증한다.
- utility: boundary value, invalid input, formatting/parsing 결과를 검증한다.

## Component 테스트

Vitest 컴포넌트 테스트는 form validation, submit, role/status/permission 조건부 렌더링, callback 계약, hook/store/API mocking, 회귀 방지에 필요할 때만 작성한다.

단순 variant, loading/error/empty/disabled 시각 상태, 기본 interaction은 `create-story` 기준으로 Storybook에서 다룬다.
