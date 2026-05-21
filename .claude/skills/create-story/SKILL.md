---
name: create-story
description: PickMa React 컴포넌트의 Storybook story를 생성하거나 수정한다. 시각 상태, 기본 UI interaction, play function, autodocs, controls를 다룬다.
argument-hint: 'ComponentName 또는 파일 경로'
---

# Story 생성

PickMa 컴포넌트의 Storybook story를 만들거나 보강할 때 사용한다. 컴포넌트 파일을 먼저 읽고 public props, 상태, interaction을 기준으로 story를 구성한다.

대상: $ARGUMENTS

컴포넌트의 시각 상태와 기본 UI interaction은 Storybook story/play function으로 우선 다룬다. Storybook으로 표현하기 어렵거나 hook/store/API mocking이 많거나 로직 회귀 방지가 더 중요한 경우에만 Vitest 컴포넌트 테스트를 권장한다.

## 권장 패턴

- 새 story는 `@storybook/nextjs-vite`를 사용한다.
- `satisfies Meta<typeof Component>`와 `type Story = StoryObj<typeof meta>` 패턴을 사용한다.
- callback props는 `storybook/test`의 `fn()`으로 기본 args를 만든다.
- 기존 story를 참고하되, 새 story는 이 권장 기준을 우선한다.
- 기존 파일의 작은 수정은 해당 파일의 import/style 패턴을 따른다.

## Title 규칙

- `src/components/common/` -> `common/{ComponentName}`
- `src/components/consumer/` -> `consumer/{ComponentName}`
- `src/components/seller/` -> `seller/{ComponentName}`
- `src/components/admin/` -> `admin/{ComponentName}`

## 포함할 Story

- 기본: `Default`
- 상태: `Loading`, `Error`, `Empty`, `Disabled`, `Pending` 중 component API가 지원하는 것
- 데이터: `WithData`, `LongContent`, `ManyItems`처럼 실제 UI 위험을 드러내는 상태
- 변형: variant/size/color가 있으면 주요 조합 또는 `AllVariants`
- interaction: click, input, toggle, select, modal open/close, dropdown open/select, form validation 표시가 있으면 `play` function

## 규칙

- story 파일은 컴포넌트와 같은 폴더의 `{Component}.stories.tsx`에 둔다.
- `tags: ['autodocs']`를 포함한다.
- controls가 유용한 props는 `argTypes`를 설정한다.
- 한국어 UI copy를 사용하고 구현되지 않은 동작을 story가 약속하지 않게 한다.
- mobile/desktop overflow, 긴 텍스트, disabled/pending 상태처럼 UI 회귀 위험이 있는 상태를 story로 드러낸다.
- story 내부 state wrapper는 필요할 때만 작게 만든다.

## 템플릿

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ComponentName } from './ComponentName';

const meta = {
  title: 'common/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  argTypes: {},
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('button')).toBeVisible();
  },
};
```
