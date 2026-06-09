import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchIcon } from 'lucide-react';
import { fn } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'common/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    variant: { control: 'select', options: ['filled', 'outline', 'ghost'] },
    color: { control: 'select', options: ['primary', 'danger', 'gray'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilledPrimary: Story = {
  args: { children: '버튼', variant: 'filled', color: 'primary' },
};

export const FilledDanger: Story = {
  args: { children: '버튼', variant: 'filled', color: 'danger' },
};

export const FilledGray: Story = {
  args: { children: '버튼', variant: 'filled', color: 'gray' },
};

export const OutlinePrimary: Story = {
  args: { children: '버튼', variant: 'outline', color: 'primary' },
};

export const OutlineDanger: Story = {
  args: { children: '버튼', variant: 'outline', color: 'danger' },
};

export const OutlineGray: Story = {
  args: { children: '버튼', variant: 'outline', color: 'gray' },
};

export const GhostPrimary: Story = {
  args: { children: '버튼', variant: 'ghost', color: 'primary' },
};

export const GhostDanger: Story = {
  args: { children: '버튼', variant: 'ghost', color: 'danger' },
};

export const GhostGray: Story = {
  args: { children: '버튼', variant: 'ghost', color: 'gray' },
};

export const Disabled: Story = {
  args: {
    children: '버튼',
    variant: 'filled',
    color: 'primary',
    disabled: true,
  },
};

// 아이콘 전용 버튼은 반드시 aria-label로 accessible name을 제공해야 한다.
export const IconOnly: Story = {
  args: {
    children: <SearchIcon size={16} />,
    variant: 'ghost',
    color: 'primary',
    'aria-label': '검색',
  },
};

// 액션 진행 중 중복 클릭 방지 패턴: disabled + 진행 중 텍스트
export const LoadingInProgress: Story = {
  args: {
    children: '저장 중...',
    variant: 'filled',
    color: 'primary',
    disabled: true,
  },
};
