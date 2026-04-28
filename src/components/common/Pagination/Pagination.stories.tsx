import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Pagination } from './Pagination';

const meta = {
  title: 'common/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    totalPages: 5,
    currentPage: 1,
    onPageChange: () => {},
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function PaginationWithState({ totalPages }: { totalPages: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <Pagination
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  );
}

export const Default: Story = {
  render: (args) => <PaginationWithState totalPages={args.totalPages} />,
};

export const ManyPages: Story = {
  args: { totalPages: 10 },
  render: (args) => <PaginationWithState totalPages={args.totalPages} />,
};

export const SinglePage: Story = {
  args: { totalPages: 1 },
  render: (args) => <PaginationWithState totalPages={args.totalPages} />,
};
