import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/**/*.{ts,tsx}'],
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
)
