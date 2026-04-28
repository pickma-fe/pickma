import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Common/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const SELECT_ITEMS = [
  { label: '사과', value: 'apple' },
  { label: '바나나', value: 'banana' },
  { label: '포도', value: 'grape', disabled: true },
];

const ACTION_ITEMS = [
  { id: 'edit', label: '수정', onClick: () => {} },
  { id: 'delete', label: '삭제', onClick: () => {} },
  { id: 'share', label: '공유', onClick: () => {}, disabled: true },
];

export const SelectDefault: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <Dropdown
        type="select"
        placeholder="선택하세요"
        items={SELECT_ITEMS}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const SelectWithValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('apple');
    return (
      <Dropdown
        type="select"
        placeholder="선택하세요"
        items={SELECT_ITEMS}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const SelectDisabled: Story = {
  render: () => (
    <Dropdown
      type="select"
      placeholder="선택하세요"
      items={SELECT_ITEMS}
      value={undefined}
      onChange={() => {}}
      disabled
    />
  ),
};

export const ActionDefault: Story = {
  render: () => <Dropdown type="action" label="더보기" items={ACTION_ITEMS} />,
};

export const ActionDisabled: Story = {
  render: () => (
    <Dropdown type="action" label="더보기" items={ACTION_ITEMS} disabled />
  ),
};

export const AllVariants: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="flex flex-wrap gap-4 p-4">
        <Dropdown
          type="select"
          placeholder="선택 (기본)"
          items={SELECT_ITEMS}
          value={value}
          onChange={setValue}
        />
        <Dropdown
          type="select"
          placeholder="선택 (비활성)"
          items={SELECT_ITEMS}
          value={undefined}
          onChange={() => {}}
          disabled
        />
        <Dropdown type="action" label="액션 (기본)" items={ACTION_ITEMS} />
        <Dropdown
          type="action"
          label="액션 (비활성)"
          items={ACTION_ITEMS}
          disabled
        />
      </div>
    );
  },
};
