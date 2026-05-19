import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminCard } from './AdminCard';

const meta = {
  title: 'admin/AdminCard',
  component: AdminCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    title: '카드 제목',
    children: (
      <p className="text-sm text-gray-600">카드 내용이 여기에 들어갑니다.</p>
    ),
  },
} satisfies Meta<typeof AdminCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
        전체 보기
      </a>
    ),
  },
};

export const WithLongContent: Story = {
  args: {
    title: '승인 대기 목록',
    children: (
      <ul className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span className="text-gray-800">가게 {i + 1}</span>
            <span className="text-gray-500">서울 강남구</span>
          </li>
        ))}
      </ul>
    ),
  },
};

export const WithCustomContentPadding: Story = {
  args: {
    title: '패딩 없는 콘텐츠',
    contentClassName: 'p-0',
    children: (
      <div className="divide-y divide-gray-100">
        {['항목 1', '항목 2', '항목 3'].map((item) => (
          <div key={item} className="px-5 py-3 text-sm text-gray-700">
            {item}
          </div>
        ))}
      </div>
    ),
  },
};
