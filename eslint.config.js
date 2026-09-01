import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginQuery from '@tanstack/eslint-plugin-query'

const appSourceRelativeImportPattern = {
  group: ['./*', '../*'],
  message:
    'apps/*/src 내부 모듈은 상대 경로 대신 @/ alias import를 사용하세요. 같은 폴더 public barrel인 index.ts만 예외입니다.',
}

const sharedFeatureImportPattern = {
  group: ['@/features', '@/features/*', '@/features/**'],
  message:
    'shared 레이어는 features를 import할 수 없습니다. 공통 기반으로 이동하거나 상위 레이어에서 조립하세요.',
}

const sharedIndexParentRelativeImportPattern = {
  regex: '^\\.\\./',
  message:
    'shared index.ts는 같은 폴더의 public barrel export(./*)만 허용합니다. 상위 폴더를 참조하지 마세요.',
}

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
    files: [
      'apps/client/**/*.{ts,tsx}',
      'apps/admin/**/*.{ts,tsx}',
      'packages/hds-icons/src/**/*.{ts,tsx}',
      'packages/hds-ui/src/**/*.{ts,tsx}',
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
  {
    files: ['apps/client/**/*.{ts,tsx}', 'apps/admin/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  {
    files: [
      '.agents/scripts/**/*.{js,mjs}',
      '.github/scripts/**/*.{js,cjs,mjs}',
      'apps/admin/scripts/**/*.{js,mjs}',
      'apps/client/scripts/**/*.{js,mjs}',
      'scripts/**/*.{js,mjs}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        fetch: 'readonly',
      },
    },
  },
  {
    files: ['apps/client/src/**/*.{ts,tsx}', 'apps/admin/src/**/*.{ts,tsx}'],
    ignores: ['apps/client/src/**/index.ts', 'apps/admin/src/**/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [appSourceRelativeImportPattern],
        },
      ],
    },
  },
  {
    files: ['apps/client/src/shared/**/*.{ts,tsx}'],
    ignores: ['apps/client/src/shared/**/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            appSourceRelativeImportPattern,
            sharedFeatureImportPattern,
          ],
        },
      ],
    },
  },
  {
    files: ['apps/client/src/shared/**/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            sharedFeatureImportPattern,
            sharedIndexParentRelativeImportPattern,
          ],
        },
      ],
    },
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
