// src/components/common/Input/Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eye, EyeOff, SearchIcon } from 'lucide-react';
import { useState } from 'react';

import { Input } from './Input';

const meta = {
  title: 'common/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    placeholder: '입력해주세요.',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: '이메일 주소',
    placeholder: '이메일을 입력하세요.',
  },
};

export const WithDescription: Story = {
  args: {
    label: '이메일 주소',
    description: '이메일 형식으로 입력해주세요.',
    placeholder: '이메일을 입력하세요.',
  },
};

export const WithError: Story = {
  args: {
    label: '이메일',
    placeholder: '이메일을 입력하세요.',
    error: '이메일 형식이 올바르지 않습니다.',
  },
};

export const WithStartIcon: Story = {
  args: {
    placeholder: '원하는 상품을 검색해보세요.',
    startIcon: <SearchIcon className="h-4 w-4" />,
  },
};

export const WithPasswordToggle: Story = {
  render: (args) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <Input
        {...args}
        type={showPassword ? 'text' : 'password'}
        endIcon={
          showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )
        }
        endIconLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
        onEndIconClick={() => setShowPassword(!showPassword)}
      />
    );
  },
  args: {
    placeholder: '비밀번호를 입력하세요.',
  },
};

export const Disabled: Story = {
  args: {
    label: '이메일 주소',
    placeholder: '입력 불가',
    disabled: true,
  },
};
