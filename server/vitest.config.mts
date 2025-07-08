import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths({ root: './' })],
  test: {
    testTimeout: 20000,
    hookTimeout: 20000,
    setupFiles: './src/tests/setup.ts',
    environment: 'node',
    environmentMatchGlobs: [
      ['src/pages/**', 'jsdom'],
    ],
    coverage: {
      reporter: ['json', 'text'],
      include: ['src'],
      exclude: [
        'src/tests',
        'src/**/__tests__',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/adapters',
        'src/node.tsx',
        'src/scripts',
        'src/configs/type.ts',
      ],
    },
  },
})
