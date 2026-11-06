import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const FRONTEND_FILES = [
  'admin-site/src/**/*.{ts,tsx}',
  'public-site/src/**/*.{ts,tsx}',
  'packages/ui/src/**/*.{ts,tsx}',
];

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/*.tsbuildinfo'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: FRONTEND_FILES,
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    files: ['server/**/*.ts', 'packages/**/*.js', 'scripts/**/*.mjs', '*.js', '*/vite.config.ts', '*/vitest.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
  {
    // Context and test files export hooks and helpers beside components. Only Fast Refresh notices.
    files: [
      '**/*.test.{ts,tsx}',
      '**/src/test/**',
      'admin-site/src/context/**',
      'packages/ui/src/auth/AuthProvider.tsx',
      'packages/ui/src/components/toast/ToastContext.tsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  prettier,
);
