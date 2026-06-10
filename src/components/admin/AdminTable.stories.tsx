import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminTable } from './AdminTable';

interface SampleRow {
  id: string;
  name: string;
  region: string;
  date: string;
}

const sampleColumns = [
  { key: 'name', header: '가게명', render: (row: SampleRow) => row.name },
  { key: 'region', header: '지역', render: (row: SampleRow) => row.region },
  { key: 'date', header: '신청일', render: (row: SampleRow) => row.date },
];

const sampleData: SampleRow[] = [
  { id: '1', name: '픽마 델리', region: '서울 성동구', date: '2026-04-25' },
  { id: '2', name: '픽마 베이커리', region: '서울 마포구', date: '2026-04-20' },
  { id: '3', name: '픽마 그린', region: '서울 강남구', date: '2026-04-15' },
];

const meta = {
  title: 'admin/AdminTable',
  component: AdminTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    columns: sampleColumns,
    data: sampleData,
    rowKey: (row: SampleRow) => row.id,
  },
} satisfies Meta<typeof AdminTable<SampleRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {};

export const Empty: Story = {
  args: { data: [] },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const WithPagination: Story = {
  args: {
    pagination: {
      currentPage: 1,
      totalPages: 5,
      onPageChange: () => {},
    },
  },
};
