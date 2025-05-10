import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths({ root: './' })],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  test: {
    globals: true,
    setupFiles: './vitest.setup.tsx',
    environment: 'jsdom',
    coverage: {
      exclude: [
        'node_modules/**',
        '.next/**',
        '.open-next/**',
        'scripts/**',
        'tests/**',
        'app/api/**',
        'services/**',
        '*.d.ts',
        '*.config.*',
        '**/*.test.*',
        'middleware.ts',
        'i18n.ts',
      ],
      provider: 'v8',
    },
  },
})
