import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import vitest from '@vitest/eslint-plugin'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'eslint.config.mjs', 'vitest.config.ts']
  },

  js.configs.recommended,

  {
    plugins: { '@eslint-community/eslint-comments': eslintComments },
    rules: eslintComments.configs.recommended.rules
  },

  ...tsPlugin.configs['flat/recommended-type-checked'],
  ...tsPlugin.configs['flat/stylistic-type-checked'],

  {
    files: ['**/*.ts'],
    plugins: {
      'no-only-tests': noOnlyTests
    },
    languageOptions: {
      ecmaVersion: 2023,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.test.json', './.github/linters/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      camelcase: 'off',
      'no-console': 'off',

      'no-implicit-globals': 'error',
      'no-only-tests/no-only-tests': 'error',

      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' }
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true }
      ],
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error'
    }
  },

  {
    files: ['**/*.test.ts', '__tests__/**/*.ts'],
    ...vitest.configs.recommended,
    languageOptions: {
      globals: vitest.environments.env.globals
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  },

  prettierRecommended
]
