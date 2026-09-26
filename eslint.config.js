// eslint.config.js
import tseslint from 'typescript-eslint';
import promisePlugin from 'eslint-plugin-promise';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      // type information is required by "@typescript-eslint/no-floating-promises"
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      // type-aware versions of "require-await" & "no-return-await" (base rules give false positives...
      // ... for functions that implement async interfaces or return promises)
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': 'error',
    },
  },

  {
    // mocks in tests implement async contracts (e.g. "getUserAttributes") without "await"
    files: ['**/*.test.ts', '**/*.mtest.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },

  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      promise: promisePlugin.default ?? promisePlugin,
    },
    rules: {
      'promise/catch-or-return': 'error',
    },
  },
];
