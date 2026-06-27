import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default tseslint.config(
  {
    ignores: [
      '**/.turbo/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/storybook-static/**',
      '**/test-results/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['apps/client/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/e2e/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  ...pluginQuery.configs['flat/recommended'],
  prettier,
)
