import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import type { ModalSize } from './Modal';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

const meta: Meta<typeof Modal> = {
  title: 'common/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    isOpen: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

function ModalWithButton({
  size,
  title,
  children,
}: {
  size?: ModalSize;
  title: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        size={size}
      >
        {children}
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <ModalWithButton title="기본 모달">
      <p className="text-sm text-gray-600">모달 내용입니다.</p>
    </ModalWithButton>
  ),
};

export const Small: Story = {
  render: () => (
    <ModalWithButton title="작은 모달" size="sm">
      <p className="text-sm text-gray-600">작은 사이즈 모달입니다.</p>
    </ModalWithButton>
  ),
};

export const Medium: Story = {
  render: () => (
    <ModalWithButton title="중간 모달" size="md">
      <p className="text-sm text-gray-600">중간 사이즈 모달입니다.</p>
    </ModalWithButton>
  ),
};

export const Large: Story = {
  render: () => (
    <ModalWithButton title="큰 모달" size="lg">
      <p className="text-sm text-gray-600">큰 사이즈 모달입니다.</p>
    </ModalWithButton>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <ModalWithButton title="아주 큰 모달" size="xl">
      <p className="text-sm text-gray-600">아주 큰 사이즈 모달입니다.</p>
    </ModalWithButton>
  ),
};

export const WithForm: Story = {
  render: () => (
    <ModalWithButton title="정보 수정">
      <form className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            이름
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            이메일
          </label>
          <input
            type="email"
            id="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="이메일을 입력하세요"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" color="gray">
            취소
          </Button>
          <Button type="submit">저장</Button>
        </div>
      </form>
    </ModalWithButton>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <ModalWithButton title="긴 내용 모달">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i} className="text-sm text-gray-600">
            이것은 {i + 1}번째 문단입니다. 스크롤이 필요한 긴 내용을
            테스트합니다.
          </p>
        ))}
      </div>
    </ModalWithButton>
  ),
};
