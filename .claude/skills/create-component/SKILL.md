---
name: create-component
description: PickMa React 컴포넌트를 생성하거나 수정한다. category 위치, Server/Client Component 경계, props/callback 규칙, Tailwind, 접근성, story/test 필요 여부를 다룬다.
argument-hint: 'ComponentName [common|consumer|seller|admin] 또는 파일 경로'
---

# Component 생성

PickMa React 컴포넌트를 만들거나 보강할 때 사용한다. 입력은 `ComponentName [common|consumer|seller|admin]` 또는 파일 경로를 받을 수 있다. 카테고리가 없으면 `common`으로 본다.

대상: $ARGUMENTS

## 위치

- `common` -> `src/components/common/`
- `consumer` -> `src/components/consumer/`
- `seller` -> `src/components/seller/`
- `admin` -> `src/components/admin/`

## 규칙

- 기본은 Server Component로 작성한다. hook, event handler, browser API, Headless UI interaction이 필요할 때만 `'use client'`를 추가한다.
- Props interface는 파일 상단에 `ComponentNameProps`로 둔다.
- `export function`을 사용하고 default export를 쓰지 않는다.
- callback props는 `on*`, 내부 event handler는 `handle*`로 이름 짓는다.
- boolean props/state는 `is*`, `has*`, `can*` 접두어를 사용한다.
- semantic HTML과 접근 가능한 label/name/role을 우선한다.
- Tailwind CSS utility만 사용하고 inline style을 쓰지 않는다.
- 컴포넌트는 Supabase/API client를 직접 호출하지 않는다. 서버 상태는 hook에서 받고, UI 상태는 local state 또는 Zustand로 분리한다.
- 한 파일에는 하나의 주요 컴포넌트만 둔다. 작은 render helper는 필요할 때만 파일 내부에 둔다.
- 새 reusable component는 `create-story` 기준으로 Storybook story 필요 여부를 판단한다.
- Vitest 컴포넌트 테스트는 `create-test` 기준에 해당할 때만 권장한다.

## 템플릿

```tsx
interface ComponentNameProps {
  children?: React.ReactNode;
}

export function ComponentName({ children }: ComponentNameProps) {
  return <div>{children}</div>;
}
```
