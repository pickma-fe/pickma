import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const meta = {
  title: 'common/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['solid', 'soft'] },
    color: {
      control: 'select',
      options: [
        'primary',
        'success',
        'warning',
        'info',
        'danger',
        'gray',
        'dark',
      ],
    },
    rounded: { control: 'select', options: ['full', 'md'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SolidPrimary: Story = {
  args: { children: '브랜드', variant: 'solid', color: 'primary' },
};

export const SolidSuccess: Story = {
  args: { children: '완료', variant: 'solid', color: 'success' },
};

export const SolidWarning: Story = {
  args: { children: '대기', variant: 'solid', color: 'warning' },
};

export const SolidInfo: Story = {
  args: { children: '진행 중', variant: 'solid', color: 'info' },
};

export const SolidDanger: Story = {
  args: { children: '취소', variant: 'solid', color: 'danger' },
};

export const SolidGray: Story = {
  args: { children: '비활성', variant: 'solid', color: 'gray' },
};

export const SolidDark: Story = {
  args: { children: '마감 임박', variant: 'solid', color: 'dark' },
};

export const SoftPrimary: Story = {
  args: { children: '브랜드', variant: 'soft', color: 'primary' },
};

export const SoftSuccess: Story = {
  args: { children: '완료', variant: 'soft', color: 'success' },
};

export const SoftWarning: Story = {
  args: { children: '대기', variant: 'soft', color: 'warning' },
};

export const SoftInfo: Story = {
  args: { children: '진행 중', variant: 'soft', color: 'info' },
};

export const SoftDanger: Story = {
  args: { children: '취소', variant: 'soft', color: 'danger' },
};

export const SoftGray: Story = {
  args: { children: '비활성', variant: 'soft', color: 'gray' },
};

export const SoftDark: Story = {
  args: { children: '마감 임박', variant: 'soft', color: 'dark' },
};

export const RoundedMd: Story = {
  args: { children: '30%', variant: 'solid', color: 'danger', rounded: 'md' },
};

export const StatusBadge: Story = {
  args: {
    children: '준비 완료',
    variant: 'soft',
    color: 'success',
    role: 'status',
  },
};

export const DecorationBadge: Story = {
  args: {
    children: '30%',
    variant: 'solid',
    color: 'danger',
    role: 'img',
    'aria-label': '30% 할인',
  },
};
