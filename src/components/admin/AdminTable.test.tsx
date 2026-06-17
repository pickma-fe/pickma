import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminTable } from './AdminTable';

describe('AdminTable', () => {
  it('로딩 상태를 상태 메시지로 노출한다', () => {
    render(
      <AdminTable
        ariaLabel="테스트 테이블"
        columns={[
          {
            key: 'name',
            header: '이름',
            render: (item: { name: string }) => item.name,
          },
        ]}
        data={[]}
        rowKey={(item) => item.name}
        isLoading
      />
    );

    expect(
      screen.getByRole('table', { name: '테스트 테이블' })
    ).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(
      '관리자 데이터를 불러오는 중입니다.'
    );
  });

  it('빈 상태 메시지와 안내 문구를 함께 보여준다', () => {
    render(
      <AdminTable
        columns={[
          {
            key: 'name',
            header: '이름',
            render: (item: { name: string }) => item.name,
          },
        ]}
        data={[]}
        rowKey={(item) => item.name}
        emptyMessage="조건에 맞는 데이터가 없습니다."
      />
    );

    expect(
      screen.getByText('조건에 맞는 데이터가 없습니다.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('검색 조건을 조정하거나 다른 페이지를 확인해보세요.')
    ).toBeInTheDocument();
  });

  it('모바일 스크롤 안내 문구를 표시한다', () => {
    render(
      <AdminTable
        columns={[
          {
            key: 'name',
            header: '이름',
            render: (item: { name: string }) => item.name,
          },
        ]}
        data={[{ name: '픽마' }]}
        rowKey={(item) => item.name}
      />
    );

    expect(
      screen.getByText('표가 길면 좌우로 스크롤해서 내용을 확인할 수 있습니다.')
    ).toBeInTheDocument();
  });
});
