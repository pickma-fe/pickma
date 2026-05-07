import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

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
  closeOnOverlayClick,
  closeOnEscape,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
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
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEscape={closeOnEscape}
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
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
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

const LONG_CONTENT_ITEMS = Array.from({ length: 20 }, (_, i) => ({
  id: `item-${i + 1}`,
  text: `이것은 ${i + 1}번째 문단입니다. 스크롤이 필요한 긴 내용을 테스트합니다.`,
}));

export const WithLongContent: Story = {
  render: () => (
    <ModalWithButton title="긴 내용 모달">
      <div className="flex flex-col gap-4">
        {LONG_CONTENT_ITEMS.map((item) => (
          <p key={item.id} className="text-sm text-gray-600">
            {item.text}
          </p>
        ))}
      </div>
    </ModalWithButton>
  ),
};

export const PreventClose: Story = {
  render: () => (
    <ModalWithButton
      title="닫기 방지 모달"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <p className="text-sm text-gray-600">
        외부 클릭이나 ESC 키로 닫히지 않습니다. X 버튼으로만 닫을 수 있습니다.
      </p>
    </ModalWithButton>
  ),
};
