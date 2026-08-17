import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    setupFiles: './vitest.setup.tsx',
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['next-intl'],
      },
    },
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
