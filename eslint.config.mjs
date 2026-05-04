// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';
import sortExports from 'eslint-plugin-sort-exports';
import storybook from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    plugins: {
      import: importPlugin,
      'sort-exports': sortExports,
    },
  },
  {
    rules: {
      // General
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-nested-ternary': 'error',
      'object-shorthand': 'warn',
      'no-shadow': 'off', // @typescript-eslint/no-shadow로 대체

      // TypeScript
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // React
      'react/no-array-index-key': 'warn',
      'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
      'react/self-closing-comp': 'warn',

      // Import
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          pathGroups: [
            { pattern: '@/types/**', group: 'internal', position: 'before' },
            {
              pattern: '@/contracts/**',
              group: 'internal',
              position: 'before',
            },
            { pattern: '@/lib/**', group: 'internal', position: 'before' },
            { pattern: '@/api/**', group: 'internal', position: 'before' },
            { pattern: '@/stores/**', group: 'internal', position: 'before' },
            { pattern: '@/hooks/**', group: 'internal', position: 'before' },
            {
              pattern: '@/components/**',
              group: 'internal',
              position: 'before',
            },
          ],
          distinctGroup: false,
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          basePath: './src',
          zones: [
            {
              target: './types',
              from: [
                './contracts',
                './lib',
                './api',
                './stores',
                './hooks',
                './components',
                './app',
              ],
            },
            {
              target: './contracts',
              from: [
                './lib',
                './api',
                './stores',
                './hooks',
                './components',
                './app',
              ],
            },
            {
              target: './lib',
              from: ['./api', './stores', './hooks', './components', './app'],
            },
            {
              target: './api',
              from: ['./stores', './hooks', './components', './app'],
            },
            { target: './stores', from: ['./hooks', './components', './app'] },
            { target: './hooks', from: ['./components', './app'] },
            { target: './components', from: ['./app'] },
          ],
        },
      ],

      // Export
      'sort-exports/sort-exports': 'off',
    },
  },
  // index.ts barrel 파일만 export 순서 강제
  {
    files: ['**/index.ts', '**/index.tsx'],
    rules: {
      'sort-exports/sort-exports': [
        'warn',
        { sortDir: 'asc', ignoreCase: true },
      ],
    },
  },
  // stories 파일 — export 순서는 Storybook 표시 순서와 직결되므로 정렬 규칙 제외
  {
    files: ['**/*.stories.ts', '**/*.stories.tsx'],
    rules: {
      'sort-exports/sort-exports': 'off',
    },
  },
  // Type-aware rules (TypeScript 파일 전용, .storybook 제외)
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['.storybook/**'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    },
  },
  ...storybook.configs['flat/recommended'],
]);

export default eslintConfig;
