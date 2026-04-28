import type { Decorator, Preview } from '@storybook/nextjs-vite';
// @ts-expect-error - Storybook에서 글로벌 CSS를 불러올 때 발생하는 타입 오류 무시
import '../src/app/globals.css';

const withNavigationBlock: Decorator = (Story) => {
  return (
    <div
      onClick={(e) => {
        const anchor = (e.target as HTMLElement).closest('a[href]');
        if (anchor) e.preventDefault();
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withNavigationBlock],

  parameters: {
    nextjs: {
      appDirectory: true,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
