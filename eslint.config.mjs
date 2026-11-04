import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginCypress from 'eslint-plugin-cypress'
import pluginJest from 'eslint-plugin-jest'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

// Helper to create no-op rule stubs so old inline disable comments don't throw errors
const createStubPlugin = (ruleNames) => ({
  rules: Object.fromEntries(
    ruleNames.map((name) => [name, { create: () => ({}) }])
  ),
})

export default tseslint.config(
  // 1. Files & directories to ignore completely
  {
    ignores: [
      'dist/**',
      'public/**',
      'coverage/**',
      'node_modules/**',
      'scripts/**',
    ],
  },

  // 2. Base recommended configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Register dummy plugins to satisfy leftover comments without editing code
  {
    plugins: {
      import: createStubPlugin(['first']),
      n: createStubPlugin(['no-callback-literal']),
    },
  },

  // 4. Global project overrides
  {
    linterOptions: {
      // Silences all "Unused eslint-disable directive" warnings
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      // Permit use of 'any' types across TypeScript files
      '@typescript-eslint/no-explicit-any': 'off',

      // Permit double negations (e.g., !!val) in JavaScript files
      'no-extra-boolean-cast': 'off',

      // TypeScript (tsc) handles undefined checks; turning this off fixes signon-mock and configs
      'no-undef': 'off',

      // Turn off brand-new ESLint 9 rule flagging reassignments
      'no-useless-assignment': 'off',

      // Allow require() statements used by Webpack, HMR, and dynamic imports
      '@typescript-eslint/no-require-imports': 'off',

      // Allow @ts-ignore comments without forcing @ts-expect-error
      '@typescript-eslint/ban-ts-comment': 'off',

      // Allow standalone expressions and short-circuited logic
      '@typescript-eslint/no-unused-expressions': 'off',

      // Suppress unused variable errors across existing files
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },

  // 5. Jest tests configuration
  {
    files: ['**/*.test.{ts,js}', 'test/**/*.{ts,js}'],
    ...pluginJest.configs['flat/recommended'],
    rules: {
      'jest/expect-expect': 'off',
    },
  },

  // 6. Cypress E2E tests configuration (native v7)
  {
    files: ['cypress/**/*.{ts,js}', '**/*.cy.{ts,js}'],
    ...pluginCypress.configs.recommended,
  },

  // 7. Prettier (must stay last to turn off formatting rules)
  eslintConfigPrettier
)
