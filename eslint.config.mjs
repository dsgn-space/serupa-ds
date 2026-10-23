// npm run lint: ESLint for the TypeScript, the stories and the tools (Stylelint checks the CSS).
import './tools/typescript/api.mjs';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', 'storybook-static/', 'node_modules/', '.test-tmp/', 'tools/test/baseline-api.d.ts', '.claude/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // A leading underscore marks a value that is pulled out on purpose and not used.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      // New in ESLint 10's recommended set; off so the upgrade keeps lint behaving as it did on ESLint 9.
      'no-unassigned-vars': 'off',
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx,js}', 'docs/**/*.tsx', '.storybook/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: globals.browser },
    // The two classic hook rules only. Plugin 7's recommended set also turns on the React Compiler rules
    // (refs, immutability and others), which flag patterns the components use on purpose.
    rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error' },
  },
  {
    // The tests are Node scripts, but much of their code runs in the page (page.evaluate), where React,
    // ReactDOM and the system's own globals exist; TypeScript-style undefined checks don't apply there.
    files: ['tools/**/*.mjs', 'bin/**/*.mjs', '*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { 'no-undef': 'off' },
  },
);
