import eslintJs from '@eslint/js'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsEslintParser from '@typescript-eslint/parser'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginJSXA11y from 'eslint-plugin-jsx-a11y'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['.react-router/'],
  },
  eslintJs.configs.recommended,
  {
    rules: {
      "no-empty-pattern": "warn",
    }
  },
  // React configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es6,
        ...globals.jest,
        React: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      react: eslintPluginReact,
      'jsx-a11y': eslintPluginJSXA11y,
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      ...eslintPluginJSXA11y.configs.recommended.rules,
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      formComponents: ['Form', 'ValidatedForm'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'import/ignore': ['.(css)$'],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    languageOptions: {
      sourceType: 'module',
      parser: tsEslintParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2024,
      },
    },
    rules: {
      ...tsEslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  eslintConfigPrettier,
]